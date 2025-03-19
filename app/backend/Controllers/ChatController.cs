using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Data;
using ChatHaven.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

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
    Channel channel = await _context.Channels.FirstOrDefaultAsync(c => c.id == channelId); // Find channel
    if (channel == null) return BadRequest(new { error = "Channel not found." });

    List<ChannelMessage> messages = await _context.ChannelMessages
        .Where(m => m.channel_id == channelId)
        .OrderBy(m => m.sent_at)
        .ToListAsync(); // Find messages

    // Attach sender username to each message and reply information
    var messagesWithUsernames = new List<object>();

    foreach (var message in messages)
    {
        // Fetch the sender's username based on sender_id
        var sender = await _context.Users.FirstOrDefaultAsync(u => u.user_id == message.sender_id);
        string senderUsername = sender?.username ?? "Unknown";

        // Initialize reply information variables
        string replyToUsername = null;
        string replyToMessage = null;

        // If this message is a reply to another message
        if (message.reply_to_id.HasValue)
        {
            // Find the original message that was replied to
            var repliedToMessage = await _context.ChannelMessages
                .FirstOrDefaultAsync(m => m.message_id == message.reply_to_id);

            if (repliedToMessage != null)
            {
                // Get the original message content
                replyToMessage = repliedToMessage.message_content;

                // Get the username of the original message sender
                var repliedToSender = await _context.Users
                    .FirstOrDefaultAsync(u => u.user_id == repliedToMessage.sender_id);
                replyToUsername = repliedToSender?.username ?? "Unknown";
            }
        }

        // Add message with sender username and reply information to the list
        messagesWithUsernames.Add(new
        {
            message.message_id,        // Include the actual message ID
            message.channel_id,
            message.sender_id,
            senderUsername,
            message.message_content,
            message.sent_at,
            reply_to_id = message.reply_to_id,
            reply_to_username = replyToUsername,
            reply_to_message = replyToMessage
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
    public async Task<IActionResult> RetrieveDirectMessages()
    {
        var userId = Convert.ToInt32(User.FindFirst("userId")?.Value);
        if (userId == 0)
            return BadRequest(new { error = "User not found" });

        var dms = await _context.DirectMessageChannels
            .Where(dmc => dmc.user_id1 == userId || dmc.user_id2 == userId)
            .Select(dmc => new
            {
                dmc.dm_id,
                otherUser = _context.Users
                    .Where(u => u.user_id == (dmc.user_id1 == userId ? dmc.user_id2 : dmc.user_id1))
                    .Select(u => new
                    {
                        u.user_id,
                        u.username
                    })
                    .FirstOrDefault(),
                messages = _context.DirectMessages
                    .Where(dm => dm.dm_id == dmc.dm_id)
                    .Select(dm => new
                    {
                        dm.sender_id,
                        dm.receiver_id,
                        dm.message_content,
                        dm.sent_at,
                        dm.message_id
                    }).OrderBy(m => m.sent_at).ToList()
            }).ToListAsync();

        return Ok(new
        {
            dms
        });
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