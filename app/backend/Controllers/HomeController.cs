using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Runtime.CompilerServices;

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

    [HttpGet("auth-test")]
    [Authorize]
    public IActionResult GetHomeIndex()
    {
        return Ok(new { message = "Authenticated GET request successful!" });
    }

    [HttpGet("index")]
    [Authorize]
    public async Task<IActionResult> Index()
    {
        // Get user information
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);

        if (user == null)
            return BadRequest(new { error = "User not found" });

        // Set user information from query results
        var userId = user.user_id;
        var admin = user.isAdmin;

        // Fetch teams and channels where the user is a member
        var teams = await _context.TeamMemberships
            .Where(tm => tm.user_id == user.user_id)
            .Select(tm => new
            {
                tm.team_id,
                team_name = _context.Teams
                    .Where(t => t.team_id == tm.team_id)
                    .Select(t => t.team_name)
                    .FirstOrDefault(),
                channels = _context.Channels
                    .Where(c => c.team_id == tm.team_id /*&& _context.ChannelMemberships.Any(cm => cm.channel_id == c.id && cm.user_id == user.user_id)*/) // Removed when implementing private channels
                    .Select(c => new
                    {
                        c.team_id,
                        c.id,
                        c.channel_name
                    }).ToList()
            }).ToListAsync();

        var result = new
        {
            user = new
            {
                user_id = userId,
                user.username,
                user.isAdmin
            },
            teams
        };

        return Ok(result);
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
