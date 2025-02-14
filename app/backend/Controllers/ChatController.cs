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
    [HttpPost("channel")]
    [Authorize]
    public async Task<IActionResult> RetrieveChannelMessages([FromBody] int channelId)
    {
        Channel channel = await _context.Channels.FirstOrDefaultAsync(c => c.id == channelId); // Find channel
        if (channel == null) return BadRequest(new { error = "Channel not found." });
        List<ChannelMessage> messages = _context.ChannelMessages.Where(m => m.channel_id == channelId).OrderBy(m => m.sent_at).ToList(); // Find messages
        return Ok(new { messages });
    }
    [HttpPost("channelsend")]
    [Authorize]
    public async Task<IActionResult> SendMessageToChannel([FromBody] SendChannelMessageRequest req)
    {
        User sender = await _context.Users.FirstOrDefaultAsync(u => u.user_id == req.SenderId); // Find sender
        if (sender == null) return BadRequest(new { error = "Sender not found." });
        Channel channel = await _context.Channels.FirstOrDefaultAsync(c => c.id == req.ChannelId); // Find channel
        if (channel == null) return BadRequest(new { error = "Channel not found." });
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            ChannelMessage channelMessage = new ChannelMessage
            { // Create message
                sender_id = req.SenderId,
                channel_id = req.ChannelId,
                sent_at = DateTime.UtcNow,
                message_content = req.Message
            };
            _context.ChannelMessages.Add(channelMessage); // Save message
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return StatusCode(201, new { message = "Message sent to channel." });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = "Failed to send message.", details = ex.Message });
        }
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
            foreach (int messageId in Ids[0]) {_context.ChannelMessages.Remove(messages[messageId]);} // Delete message
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
    [HttpPost("dm")]
    [Authorize]
    public async Task<IActionResult> RetrieveDirectMessages([FromBody] List<int> senderReceiverIds)
    {
        User sender = await _context.Users.FirstOrDefaultAsync(u => u.user_id == senderReceiverIds[0]); // Find sender
        User receiver = await _context.Users.FirstOrDefaultAsync(u => u.user_id == senderReceiverIds[1]); // Find receiver
        if (sender == null) return BadRequest(new { error = "Sender not found." });
        if (receiver == null) return BadRequest(new { error = "Receiver not found." });
        List<DirectMessage> messages = _context.DirectMessages.Where(m => m.sender_id == senderReceiverIds[0] && m.receiver_id == senderReceiverIds[1] || m.sender_id == senderReceiverIds[1] && m.receiver_id == senderReceiverIds[0]).OrderBy(m => m.sent_at).ToList(); // Find messages
        return Ok(new { messages });
    }
    [HttpPost("dmsend")]
    [Authorize]
    public async Task<IActionResult> SendDirectMessage([FromBody] SendDirectMessageRequest req)
    {
        User sender = await _context.Users.FirstOrDefaultAsync(u => u.user_id == req.SenderId); // Find sender
        User receiver = await _context.Users.FirstOrDefaultAsync(u => u.user_id == req.ReceiverId); // Find receiver
        if (sender == null) return BadRequest(new { error = "Sender not found." });
        if (receiver == null) return BadRequest(new { error = "Receiver not found." });
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            DirectMessage directMessage = new DirectMessage
            { // Create message
                sender_id = req.SenderId,
                receiver_id = req.ReceiverId,
                sent_at = DateTime.UtcNow,
                message_content = req.Message
            };
            _context.DirectMessages.Add(directMessage); // Save message
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return StatusCode(201, new { message = "Message sent to receiver." });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = "Failed to send message.", details = ex.Message });
        }
    }
    [HttpPost("dmdelete")]
    [Authorize]
    public async Task<IActionResult> DeleteDirectMessage([FromBody] List<int> messageIds)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            foreach (int messageId in messageIds)
            {
                DirectMessage message = await _context.DirectMessages.FirstOrDefaultAsync(m => m.message_id == messageId); // Find message
                if (message == null) return BadRequest(new { error = "Message not found." });
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
        return Ok(new { error = "An error occurred.", requestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}