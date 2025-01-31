using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace ChatHaven.Controllers;

[Route("api/[controller]")]
[ApiController]
public class HomeController : Controller
{
    private readonly ApplicationDbContext _context;

    public HomeController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("index")]
    [Authorize]
    public async Task<IActionResult> Index([FromQuery] int userId)
    {
        if (userId <= 0)
        {
            return BadRequest(new { error = "Invalid user ID" });
        }

        // Fetch channels where the user is a member
        var channels = await _context.Channels
            .Where(c => _context.Database
            .ExecuteSqlRaw($"SELECT 1 FROM channel_membership WHERE user_id = {userId} AND channel_id = {c.Id}") > 0)
            .Select(c => new { c.Id, c.ChannelName })
            .ToListAsync();
        
        // Fetch teams where the user is a member
        var teams = await _context.Teams
            .Where(c => _context.Database
            .ExecuteSqlRaw($"SELECT 1 FROM team_membership WHERE user_id = {userId} AND team_id = {c.Id}") > 0)
            .Select(c => new { c.Id, c.TeamName })
            .ToListAsync();

        return Ok(new { message = "Home page loaded", channels, teams });
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
