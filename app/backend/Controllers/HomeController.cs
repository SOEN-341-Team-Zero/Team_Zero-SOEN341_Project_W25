using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore.Query;

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
                        c.channel_name,
                        c.is_public
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


    public class ActivityRequest {public string Activity { get; set; }}
    [HttpPost("activity")]
    public async Task<IActionResult> UpdateActivity([FromBody] ActivityRequest request)
    {
        if(User.FindFirst(ClaimTypes.NameIdentifier) == null || User.FindFirst(ClaimTypes.NameIdentifier).Value == null) return StatusCode(500, new { error = "Failed to create team", details = "" });
        var user = await _context.Users.FirstOrDefaultAsync(u => u.username == User.FindFirst(ClaimTypes.NameIdentifier).Value);
        if (user == null) return BadRequest(new { error = "User not found" });
        using var transaction = await _context.Database.BeginTransactionAsync();
        try {
            user.Activity = request.Activity;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch (Exception e)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = "Failed to create team", details = e.Message });
        }
        return StatusCode(201, new { message = "User activity was updated." });
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
