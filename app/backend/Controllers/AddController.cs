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
public class AddController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AddController(ApplicationDbContext context) {
        _context = context;
    }

    [HttpPost("addtoteam")]
    [Authorize]
    public async Task<IActionResult> AddToTeam([FromBody] AddToTeamRequest req)
    {
        Team team = await _context.Teams.FirstOrDefaultAsync(u => u.team_id == req.team_id);
        if (team == null) // No team with the requested ID? Return error
        {
            return BadRequest(new { error = "Team not found" });
        }
        foreach (string username in req.users_to_add) // For each user, add to team (or else return error)
        {
            User user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);
            if (user == null) // No user with such a name? Return error
            {
                return BadRequest(new { error = $"{username} not found" });
            }

            TeamMembership membership = await _context.TeamMemberships.FirstOrDefaultAsync(m => m.user_id == user.user_id && m.team_id == team.team_id);
            if (membership == null) // Already a member of the team? If not:
            {
                membership = new TeamMembership
                {
                    user_id = user.user_id,
                    team_id = team.team_id,
                    created_at = DateTime.UtcNow
                };
                _context.TeamMemberships.Add(membership); // Add user to team
            }
            await _context.SaveChangesAsync();
        }

        return StatusCode(201, new { message = "User added to team successfully" });
    }
    
    [HttpPost("addtochannel")]
    [Authorize]
    public async Task<IActionResult> AddToChannel([FromBody] AddToChannelRequest req)
    {
        Team team = await _context.Teams.FirstOrDefaultAsync(u => u.team_name == req.team_name);
        if (team == null)  // No team with such a name? Return error
        {
            return BadRequest(new { error = "Team not found" });
        }
        
        Channel channel = await _context.Channels.FirstOrDefaultAsync(u => u.channel_name == req.channel_name && u.team_id == team.team_id);
        if (channel == null)  // No channel with such a name within the team? Return error
        {
            return BadRequest(new { error = "Channel not found" });
        }

        foreach (string username in req.users_to_add) // For each user, add to channel (or else return error)
        {
            User user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);
            if (user == null) // No user with such a name? Return error
            {
                return BadRequest(new { error = $"{username} not found" });
            }

            TeamMembership teamMembership = await _context.TeamMemberships.FirstOrDefaultAsync(m => m.user_id == user.user_id && m.team_id == team.team_id);
            if (teamMembership == null) // Not a member of the team? Return error
            {
                return BadRequest(new { error = $"{username} not found in team" });
            }

            ChannelMembership membership = await _context.ChannelMemberships.FirstOrDefaultAsync(m => m.user_id == user.user_id && m.channel_id == channel.id);
            if (membership == null) // Already a member of the team? If not:
            {
                membership = new ChannelMembership
                {
                    user_id = user.user_id,
                    channel_id = team.team_id,
                    created_at = DateTime.UtcNow
                };
                _context.ChannelMemberships.Add(membership); // Add user to channel
            }
            await _context.SaveChangesAsync();
        }

        return StatusCode(201, new { message = "User added to channel successfully" });
    }

}
