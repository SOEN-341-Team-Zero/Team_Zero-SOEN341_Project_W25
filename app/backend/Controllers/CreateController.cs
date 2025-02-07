using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using ChatHaven.Models;
using System.Security.Claims;

namespace ChatHaven.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CreateController : Controller
{
    private readonly ApplicationDbContext _context;
    public CreateController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("team")]
    [Authorize]
    public async Task<IActionResult> TeamCreation([FromBody] TeamCreationRequest req)
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Console.WriteLine($"{req.team_name} Team Creation Initiated by {username}");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);

        if (user == null)
            return BadRequest(new { error = "User not found" });

        if (!user.isAdmin)
            return Unauthorized(new { error = "User is not an admin" });

        if (!ModelState.IsValid)
            return BadRequest(new { error = "Invalid input", details = ModelState });

        Console.WriteLine($"Team Creation Approved");

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var team = new Team { team_name = req.team_name };
            _context.Teams.Add(team);
            await _context.SaveChangesAsync();

            var membership = new TeamMembership
            {
                user_id = user.user_id,
                team_id = team.team_id,
                created_at = DateTime.UtcNow
            };
            _context.TeamMemberships.Add(membership);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
            return StatusCode(201, new { message = "Team created successfully", teamId = team.team_id });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = "Failed to create team", details = ex.Message });
        }
    }

    [HttpPost("channel")]
    [Authorize]
    public async Task<IActionResult> ChannelCreation([FromBody] ChannelCreationRequest req)
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Console.WriteLine($"{req.channel_name} Channel Creation Initiated by {username}");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);
        
        if (user == null) // Is there a user with the given username? If not, return error
            return BadRequest(new { error = "User not found" });
        
        if (!user.isAdmin) // User must be an admin to create a channel
            return Unauthorized(new { error = "User is not an admin" });

        if (!ModelState.IsValid)
            return BadRequest(new { error = "Invalid input", details = ModelState });

        Console.WriteLine($"Channel Creation Approved");

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            Team team = _context.Teams.FirstOrDefault(t => t.team_name == req.team_name);
            if(team == null) // Is there a team with the given name? If not, return error
                return BadRequest(new { error = "Team not found" });
            
            var channel = new Channel { channel_name = req.channel_name, team_id = team.team_id };
            Channel channelFound = _context.Channels.FirstOrDefault(c => c.team_id == team.team_id && c.channel_name == req.channel_name);
            if(channelFound == null) { // Is there a channel with the given name? If not, add channel
                _context.Channels.Add(channel);
                await _context.SaveChangesAsync();

                var membership = new ChannelMembership // Add membership of channel to team
                {
                    user_id = user.user_id,
                    channel_id = channel.id,
                    created_at = DateTime.UtcNow
                };
                _context.ChannelMemberships.Add(membership);
                await _context.SaveChangesAsync();
            } else {
                return BadRequest(new { error = $"A channel with an identical name already exists within {team}" });
            }

            await transaction.CommitAsync();
            return StatusCode(201, new { message = "Channel created successfully", teamId = channel.team_id });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = "Failed to create channel", details = ex.Message });
        }
    }
}
