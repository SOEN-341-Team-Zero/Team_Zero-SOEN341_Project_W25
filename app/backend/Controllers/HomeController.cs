using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore.Query;
using ChatHaven.Models;
namespace ChatHaven.Controllers;

[Route("api/[controller]")]
[ApiController]
public class HomeController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly IServiceScopeFactory _scopeFactory;

    public HomeController(ApplicationDbContext context, IServiceScopeFactory scopeFactory)
    {
        _context = context;
        _scopeFactory = scopeFactory;
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
                        c.is_public,
                        c.owner_id
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

    [HttpGet("dmlist")]
    [Authorize]
    public async Task<IActionResult> RetrieveDMChannelList()
    {
        var userId = Convert.ToInt32(User.FindFirst("userId")?.Value);
        if (userId == 0)
            return BadRequest(new { error = "User not found" });

        var dmcs = await _context.DirectMessageChannels
            .Where(dmc => dmc.user_id1 == userId || dmc.user_id2 == userId)
            .ToListAsync();


        var dmclist = new List<object>();

        foreach (var dmc in dmcs)
        {
            var otherUserId = dmc.user_id1 == userId ? dmc.user_id2 : dmc.user_id1;
            var otherUser = await _context.Users
                .Where(u => u.user_id == otherUserId)
                .Select(u => new { u.user_id, u.username, u.Activity })
                .FirstOrDefaultAsync();

            dmclist.Add(new
            {
                dmc.dm_id,
                otherUser
            });
        }
        return Ok(new { dmChannels = dmclist });
    }


    public class ActivityRequest { public string Activity { get; set; } }
    [HttpPost("activity")]
    public async Task<IActionResult> UpdateActivity([FromBody] ActivityRequest request)
    {
        var thisUser = ClaimTypes.NameIdentifier;
        if(thisUser == null) return BadRequest(new { error = "User not found" });
        var userTemp = User.FindFirst(thisUser);
        if(userTemp == null) return BadRequest(new { error = "User not found" });
        if(User.FindFirst(thisUser) == null || userTemp.Value == null) return StatusCode(500, new { error = "Failed to find the user", details = "" });
        var user = await _context.Users.FirstOrDefaultAsync(u => u.username == userTemp.Value);
        if(user == null) return BadRequest(new { error = "User not found" });
        using var transaction = await _context.Database.BeginTransactionAsync();
        try {
            user.Activity = request.Activity;
            _context.Users.Update(user);
            user.last_seen = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            if(request.Activity == "Online") new Timer(async state => {
                await Task.Run(async () => await UpdateUserActivity(userTemp));
                if(state is Timer tim) await tim.DisposeAsync();
            }, null, TimeSpan.FromMinutes(5.03), Timeout.InfiniteTimeSpan);
        }
        catch(Exception e) {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = "Failed to create team", details = e.Message });
        }
        return StatusCode(201, new { message = "User activity was updated." });
    }
    private async Task UpdateUserActivity(Claim userTemp) {
        using var scope = _scopeFactory.CreateScope();
        var scopedContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        using var transaction = await scopedContext.Database.BeginTransactionAsync();
        try {
            var user = await scopedContext.Users.FirstOrDefaultAsync(u => u.username == userTemp.Value);
            if(user.Activity == "Online" && user.last_seen - DateTime.Now > TimeSpan.FromMinutes(5)) {
                user.Activity = "Away";
                scopedContext.Users.Update(user);
                await scopedContext.SaveChangesAsync();
                await transaction.CommitAsync();
            }
        } catch {await transaction.RollbackAsync();}
    }
        public class UserIdRequest {public int UserId { get; set; }}

    [HttpPost("last-seen")]
    public async Task<IActionResult> GetLastSeenForUser([FromBody] UserIdRequest request)
    {
        if (request.UserId <= 0)
        {
            return BadRequest(new { error = "Valid UserId is required" });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.user_id == request.UserId);

        if (user == null)
            return BadRequest(new { error = "User not found" });

        var result = new
        {
            last_seen = user.last_seen
        };

        return Ok(result);
    }

    [HttpGet("can-access-channel")]
    [Authorize]
    public async Task<IActionResult> CanAccessChannel([FromQuery] int channelId)
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);

        if (user == null)
            return BadRequest(new { error = "User not found" });

        var channel = await _context.Channels.FirstOrDefaultAsync(c => c.id == channelId);

        if (channel == null)
            return BadRequest(new { error = "Channel not found" });

        var isMember = await _context.ChannelMemberships.AnyAsync(cm => cm.channel_id == channelId && cm.user_id == user.user_id);

        if (channel.is_public || isMember)
            return Ok();

        return StatusCode(403, new { error = "User does not have access to this channel." });
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
