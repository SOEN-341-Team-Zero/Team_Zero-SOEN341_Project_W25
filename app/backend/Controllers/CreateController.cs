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
}
