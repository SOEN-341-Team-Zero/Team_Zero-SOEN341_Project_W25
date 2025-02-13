using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.Channels;


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
    public IActionResult DeleteMessageFromChannel([FromBody] int messageId)
    {
        return Ok(new { message = "Message deleted from channel." });
    }
    [HttpGet("dmsend")]
    public IActionResult SendDirectMessage([FromBody] string message, [FromBody] int senderId, [FromBody] int receiverId)
    {
        return Ok(new { message = "Message sent to receiver." });
    }
    public IActionResult DeleteDirectMessage([FromBody] int messageId)
    {
        return Ok(new { message = "Direct message deleted." });
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