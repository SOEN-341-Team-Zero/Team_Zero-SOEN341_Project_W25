using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Data;
using ChatHaven.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ChatHaven.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : Controller
{
    private readonly ApplicationDbContext _context;

    public ChatController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("channel")]
    [Authorize]
    public async Task<IActionResult> RetrieveChannelMessages([FromQuery] int channelId) // Read from query
    {

        // Get user information
        var userId = Convert.ToInt32(User.FindFirst("userId")?.Value);
        
        //Get channel from id
        var channel = await _context.Channels.FirstOrDefaultAsync(c => c.id == channelId);

        if (channel == null) return BadRequest(new { error = "Channel not found." });

        //Check user membership if it is a private channel
        if (!channel.is_public)
        {
            var isChannelMember = await _context.ChannelMemberships.FirstOrDefaultAsync(cm => cm.channel_id == channelId && cm.user_id == userId);
            if (isChannelMember == null)
            {
                return StatusCode(403, new { error = "User is not a member of this channel" });
            }
        }


        List<ChannelMessage> messages = await _context.ChannelMessages
            .Where(m => m.channel_id == channelId)
            .OrderBy(m => m.sent_at)
            .ToListAsync(); // Find messages

        var messagesWithUsernames = new List<object>();

        foreach (var message in messages)
        {
            var sender = await _context.Users.FirstOrDefaultAsync(u => u.user_id == message.sender_id);
            string senderUsername = sender?.username ?? "Unknown";
            string audioURL = message.audioURL ?? null; 
            string replyToUsername = null;
            string replyToMessage = null;

            if (message.reply_to_id.HasValue)
            {
                var repliedToMessage = await _context.ChannelMessages
                    .FirstOrDefaultAsync(m => m.message_id == message.reply_to_id);

                if (repliedToMessage != null)
                {
                    replyToMessage = repliedToMessage.message_content;

                    var repliedToSender = await _context.Users
                        .FirstOrDefaultAsync(u => u.user_id == repliedToMessage.sender_id);
                    replyToUsername = repliedToSender?.username ?? "Unknown";
                }
            }

            messagesWithUsernames.Add(new
            {
                message.message_id,
                message.channel_id,
                message.sender_id,
                senderUsername,
                message.message_content,
                message.sent_at,
                reply_to_id = message.reply_to_id,
                reply_to_username = replyToUsername,
                reply_to_message = replyToMessage,
                message.reactions,
                message.reaction_users,
                audioURL
            });
        }

        return Ok(new { messages = messagesWithUsernames });
    }

    [HttpPost("channeldelete")]
    [Authorize]
    public async Task<IActionResult> DeleteMessageFromChannel([FromBody] List<List<int>> Ids)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            int channelId = Ids[1][0];
            List<ChannelMessage> messages = _context.ChannelMessages.Where(m => m.channel_id == channelId).OrderBy(m => m.sent_at).ToList(); // Find messages
            if (messages == null || messages.Count == 0) return BadRequest(new { error = "Messages not found." });
            foreach (int messageId in Ids[0]) { _context.ChannelMessages.Remove(messages[messageId]); } // Delete message
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return StatusCode(201, new { message = "Messages deleted from channel." });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = "Failed to delete messages.", details = ex.Message });
        }
    }

    [HttpGet("dm")]
    [Authorize]
    public async Task<IActionResult> RetrieveDirectMessages([FromQuery] int dm_id)
    {
        var userId = Convert.ToInt32(User.FindFirst("userId")?.Value);
        if (userId == 0)
            return BadRequest(new { error = "User not found" });

        var dm = await _context.DirectMessageChannels.FirstOrDefaultAsync(dmc => dmc.dm_id == dm_id);
        if (dm == null)
            return BadRequest(new { error = "Direct message channel not found" });

        // Get the other user details
        var otherUserId = dm.user_id1 == userId ? dm.user_id2 : dm.user_id1;
        var otherUser = await _context.Users
            .Where(u => u.user_id == otherUserId)
            .Select(u => new { u.user_id, u.username, u.Activity }) // bit of a hack})
            .FirstOrDefaultAsync();

        // Get messages for this DM
        var messages = await _context.DirectMessages
            .Where(msg => msg.dm_id == dm.dm_id)
            .OrderBy(m => m.sent_at)
            .ToListAsync();

        var processedMessages = new List<object>();

        foreach (var message in messages)
        {
            // Get sender username,
            var sender = await _context.Users
                .FirstOrDefaultAsync(u => u.user_id == message.sender_id);
            string senderUsername = sender?.username ?? "Unknown";
            string audioURL = message.audioURL ?? null; 
            // Handle reply information
            string replyToUsername = null;
            string replyToMessage = null;

            if (message.reply_to_id.HasValue)
            {
                var repliedToMessage = await _context.DirectMessages
                    .FirstOrDefaultAsync(m => m.message_id == message.reply_to_id);

                if (repliedToMessage != null)
                {
                    replyToMessage = repliedToMessage.message_content;

                    var repliedToSender = await _context.Users
                        .FirstOrDefaultAsync(u => u.user_id == repliedToMessage.sender_id);
                    replyToUsername = repliedToSender?.username ?? "Unknown";
                }
            }

            processedMessages.Add(new
            {
                message.message_id,
                message.dm_id,
                message.sender_id,
                senderUsername,
                message.receiver_id,
                message.message_content,
                message.sent_at,
                reply_to_id = message.reply_to_id,
                reply_to_username = replyToUsername,
                reply_to_message = replyToMessage,
                message.audioURL
            });
        }


        return Ok(new { messages = processedMessages });
    }

    [HttpPost("dmdelete")]
    [Authorize]
    public async Task<IActionResult> DeleteDirectMessage([FromBody] List<int> messageIds)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        var userId = Convert.ToInt32(User.FindFirst("userId")?.Value);
        try
        {
            foreach (int messageId in messageIds)
            {
                DirectMessage message = await _context.DirectMessages.FirstOrDefaultAsync(m => m.message_id == messageId); // Find message
                if (message == null) return BadRequest(new { error = "Message not found." });
                if (message.sender_id != userId) return BadRequest(new { error = "No permissions to delete this message" });
                _context.DirectMessages.Remove(message); // Delete message
            }
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return StatusCode(201, new { message = "Direct messages deleted." });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = "Failed to delete messages.", details = ex.Message });
        }
    }

    [HttpPost("privacy")]
    public IActionResult Privacy()
    {
        return Ok(new { message = "Privacy endpoint reached." });
    }

    [HttpPost("error")]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return Ok(new { error = "An error occurred.", requestId = System.Diagnostics.Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}