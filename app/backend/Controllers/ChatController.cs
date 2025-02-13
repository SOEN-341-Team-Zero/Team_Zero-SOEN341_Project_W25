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
    [HttpGet("channelsend")]
    public IActionResult SendMessageToChannel([FromBody] string message, [FromBody] int senderId, [FromBody] int channelId)
    {
        return Ok(new { message = "Message sent to channel." });
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
    [HttpGet("dmsend")]
    public IActionResult SendDirectMessage([FromBody] string message, [FromBody] int senderId, [FromBody] int receiverId)
    {
        return Ok(new { message = "Message sent to receiver." });
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