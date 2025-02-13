using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Data;
using ChatHaven.Models;
using Microsoft.EntityFrameworkCore;


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
    public async Task<IActionResult> RetrieveChannelMessages([FromBody] int channelId)
    {
        Channel channel = await _context.Channels.FirstOrDefaultAsync(c => c.id == channelId); // Find channel
        if (channel == null) return BadRequest(new { error = "Channel not found." });
        List<ChannelMessage> messages = _context.ChannelMessages.Where(m => m.channel_id == channelId).OrderBy(m => m.sent_at).ToList(); // Find messages
        return Ok(new {messages});
    }
    [HttpGet("channelsend")]
    public async Task<IActionResult> SendMessageToChannel([FromBody] string message, [FromBody] int senderId, [FromBody] int channelId)
    {
        User sender = await _context.Users.FirstOrDefaultAsync(u => u.user_id == senderId); // Find sender
        if (sender == null) return BadRequest(new { error = "Sender not found." });
        Channel channel = await _context.Channels.FirstOrDefaultAsync(c => c.id == channelId); // Find channel
        if (channel == null) return BadRequest(new { error = "Channel not found." });
        using var transaction = await _context.Database.BeginTransactionAsync();
        try {
            ChannelMessage channelMessage = new ChannelMessage { // Create message
                sender_id = senderId,
                channel_id = channelId,
                sent_at = DateTime.UtcNow,
                message_content = message
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
    [HttpGet("channeldelete")]
    public async Task<IActionResult> DeleteMessageFromChannel ([FromBody] int messageId)
    {
        ChannelMessage message = await _context.ChannelMessages.FirstOrDefaultAsync(m => m.message_id == messageId); // Find message
        if (message == null) return BadRequest(new { error = "Message not found." });
        using var transaction = await _context.Database.BeginTransactionAsync();
        try {
            _context.ChannelMessages.Remove(message); // Delete message
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return StatusCode(201, new { message = "Message deleted from channel." });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = "Failed to delete message.", details = ex.Message });
        }
    }
    [HttpGet("dm")]
    public async Task<IActionResult> RetrieveDirectMessages([FromBody] int senderId, [FromBody] int receiverId)
    {
        User sender = await _context.Users.FirstOrDefaultAsync(u => u.user_id == senderId); // Find sender
        User receiver = await _context.Users.FirstOrDefaultAsync(u => u.user_id == receiverId); // Find receiver
        if (sender == null) return BadRequest(new { error = "Sender not found." });
        if (receiver == null) return BadRequest(new { error = "Receiver not found." });
        List<DirectMessage> messages = _context.DirectMessages.Where(m => m.sender_id == senderId && m.receiver_id == receiverId).OrderBy(m => m.sent_at).ToList(); // Find messages
        return Ok(new {messages});
    }
    [HttpGet("dmsend")]
    public async Task<IActionResult> SendDirectMessage([FromBody] string message, [FromBody] int senderId, [FromBody] int receiverId)
    {
        User sender = await _context.Users.FirstOrDefaultAsync(u => u.user_id == senderId); // Find sender
        User receiver = await _context.Users.FirstOrDefaultAsync(u => u.user_id == receiverId); // Find receiver
        if (sender == null) return BadRequest(new { error = "Sender not found." });
        if (receiver == null) return BadRequest(new { error = "Receiver not found." });
        using var transaction = await _context.Database.BeginTransactionAsync();
        try {
            DirectMessage directMessage = new DirectMessage { // Create message
                sender_id = senderId,
                receiver_id = receiverId,
                sent_at = DateTime.UtcNow,
                message_content = message
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
    [HttpGet("dmdelete")]
    public async Task<IActionResult> DeleteDirectMessage ([FromBody] int messageId)
    {
        DirectMessage message = await _context.DirectMessages.FirstOrDefaultAsync(m => m.message_id == messageId); // Find message
        if (message == null) return BadRequest(new { error = "Message not found." });
        using var transaction = await _context.Database.BeginTransactionAsync();
        try {
            _context.DirectMessages.Remove(message); // Delete message
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return StatusCode(201, new { message = "Direct message deleted." });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = "Failed to delete message.", details = ex.Message });
        }
    }
    [HttpGet("privacy")]
    public IActionResult Privacy()
    {
        return Ok(new { message = "Privacy endpoint reached." });
    }

    [HttpGet("error")]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return Ok(new { error = "An error occurred.", requestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}