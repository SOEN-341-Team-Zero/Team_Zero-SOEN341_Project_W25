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
        Team team = await _context.Teams.FirstOrDefaultAsync(u => u.team_name == req.team_name);
        if (team == null)
        {
            return BadRequest(new { error = "Team not found" });
        }
        foreach (string username in req.users_to_add)
        {
            User user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);
            if (user == null)
            {
                return BadRequest(new { error = $"{username} not found" });
            }
            TeamMembership membership = await _context.TeamMemberships.FirstOrDefaultAsync(m => m.user_id == user.user_id && m.team_id == team.team_id);
            if (membership == null)
            {
                membership = new TeamMembership
                {
                    user_id = user.user_id,
                    team_id = team.team_id,
                    created_at = DateTime.UtcNow
                };
                _context.TeamMemberships.Add(membership);
            }
            await _context.SaveChangesAsync();
        }

        return StatusCode(201, new { message = "User added to team successfully" });
    }

}
