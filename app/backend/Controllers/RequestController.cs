using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using ChatHaven.Models;
using System.Security.Claims;

namespace ChatHaven.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RequestController : Controller
{
    private readonly ApplicationDbContext _context;
    public RequestController(ApplicationDbContext context)
    {
        _context = context;
    }


    [HttpGet("requests")]
    [Authorize]
    public async Task<IActionResult> GetRequests()
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);

        if (user == null) // Is there a user with the given username? If not, return error
            return BadRequest(new { error = "User not found" });

        var requests = await _context.Requests.Where(r => r.channel_owner_id == user.user_id).ToListAsync();
        return Ok(requests);
    }

    [HttpPost("create-request")]
    [Authorize]
    public async Task<IActionResult> CreateRequest([FromBody] Request req)
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);

        if (user == null) // Is there a user with the given username? If not, return error
            return BadRequest(new { error = "User not found" });

        if (!ModelState.IsValid)
            return BadRequest(new { error = "Invalid input", details = ModelState });

        if (_context.Requests.Any(obj => obj.requester_id == req.requester_id && obj.channel_id == req.channel_id))
        {
            return BadRequest(new { error = "The request already exists." });
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var channel = await _context.Channels.FirstOrDefaultAsync(c => c.id == req.channel_id);
            if (channel == null) // Is there a channel with the given channel_id? If not, return error
                return BadRequest(new { error = "Channel not found" });

            if (channel.owner_id == null) {
                return BadRequest(new { error = "Channel owner not found" });
            } 

            var team = await _context.Teams.FirstOrDefaultAsync(t => t.team_id == channel.team_id);
            if (team == null) // Is there a team with the given team_id? If not, return error
                return BadRequest(new { error = "Team not found" });

            var request = new Request
            {
                requester_id = user.user_id,
                requester_name = user.username,
                channel_owner_id = channel.owner_id.Value,
                channel_id = channel.id,
                channel_name = channel.channel_name,
                team_name = team.team_name,
                created_at = DateTime.UtcNow
            };
            _context.Requests.Add(request);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
            return StatusCode(201, new { message = "Request created successfully", requestId = request.request_id });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = "Failed to create request", details = ex.Message });
        }

    }

    [HttpPost("answer-request")]
    [Authorize]
    public async Task<IActionResult> AnswerRequest([FromBody] RequestActionRequest req)
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);

        if (user == null) // Is there a user with the given username? If not, return error
            return BadRequest(new { error = "User not found" });

        if (!ModelState.IsValid)
            return BadRequest(new { error = "Invalid input", details = ModelState });

        var request = await _context.Requests.FirstOrDefaultAsync(r => r.request_id == req.request_id);
        if (request == null) // Is there a request with the given request_id? If not, return error
            return BadRequest(new { error = "Request not found" });

        if (request.channel_owner_id != user.user_id) // Is the user the owner of the channel?
            return Unauthorized(new { error = "You are not the owner of the channel" });

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            if (req.accept) // request accepted
            {
                var channel = await _context.Channels.FirstOrDefaultAsync(obj => obj.id == request.channel_id);
                if (channel == null)  // No channel with the requested id within the team? Return error
                {
                    return BadRequest(new { error = "Channel not found" });
                }

                var requester = await _context.Users.FirstOrDefaultAsync(obj => obj.user_id == request.requester_id);
                if (requester == null) // the requester is not found
                {
                    return BadRequest(new { error = "Requester not found" });
                }

                var channelMembership = await _context.ChannelMemberships.FirstOrDefaultAsync(obj => obj.user_id == user.user_id && obj.channel_id == channel.id);
                if (channelMembership != null) // Already a member of the channel?
                {
                    return BadRequest(new { error = "User is already a member of the channel" });
                }
                else
                {
                    channelMembership = new ChannelMembership
                    {
                        user_id = requester.user_id,
                        channel_id = channel.id,
                        created_at = DateTime.UtcNow
                    };
                    _context.ChannelMemberships.Add(channelMembership); // Add user to channel
                }
                await _context.SaveChangesAsync();
                return Ok(new { message = "Request Accepted successfully" });
            }
            else // request declined
            {
                _context.Requests.Remove(request);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return Ok(new { message = "Request declined successfully" });
            }
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new
            {
                error = "Failed to answer request",
                details = ex.Message
            });
        }

    }

}
