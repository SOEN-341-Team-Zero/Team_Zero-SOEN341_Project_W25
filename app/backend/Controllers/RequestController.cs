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

        var requests = await _context.Requests.Where(r =>
        r.recipient_id == user.user_id).ToListAsync();
        return Ok(requests);
    }

    [HttpGet("exists")]
    [Authorize]
    public async Task<IActionResult> DoesRequestExist([FromQuery] int channel_id)
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);

        if (user == null) // Is there a user with the given username? If not, return error
            return BadRequest(new { error = "User not found" });

        var request = await _context.Requests.FirstOrDefaultAsync(r =>
        r.request_type == "join" && r.channel_id == channel_id && r.requester_id == user.user_id ||
        r.request_type == "invite" && r.channel_id == channel_id && r.recipient_id == user.user_id);

        if (request == null)
        {
            return Ok(new { exists = false });
        }

        return Ok(new { exists = true, type = request.request_type, request.request_id });

    }

    [HttpPost("join")]
    [Authorize]
    public async Task<IActionResult> CreateJoinRequest([FromBody] Request req)
    {
        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);

        if (user == null) // Is there a user with the given username? If not, return error
            return BadRequest(new { error = "User not found" });

        if (!ModelState.IsValid)
            return BadRequest(new { error = "Invalid input", details = ModelState });

        if (req.request_type != "join")
        {
            return BadRequest(new { error = "Invalid request type." });
        }

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

            if (channel.owner_id == null)
            {
                return BadRequest(new { error = "Channel owner not found" });
            }

            var team = await _context.Teams.FirstOrDefaultAsync(t => t.team_id == channel.team_id);
            if (team == null) // Is there a team with the given team_id? If not, return error
                return BadRequest(new { error = "Team not found" });

            var request = new Request
            {
                requester_id = user.user_id,
                requester_name = user.username,
                recipient_id = channel.owner_id.Value,
                channel_id = channel.id,
                channel_name = channel.channel_name,
                team_name = team.team_name,
                request_type = "join",
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

    [HttpPost("invite")] // invite one at a time - unused as of march 26th
    [Authorize]
    public async Task<IActionResult> CreateInviteRequest([FromBody] Request req)
    {

        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);

        if (user == null) // Is there a user with the given username? If not, return error
            return BadRequest(new { error = "User not found" });

        if (!ModelState.IsValid)
            return BadRequest(new { error = "Invalid input", details = ModelState });

        if (req.request_type != "invite")
        {
            return BadRequest(new { error = "Invalid request type." });
        }

        if (_context.Requests.Any(obj => obj.recipient_id == req.recipient_id && obj.channel_id == req.channel_id))
        {
            return BadRequest(new { error = "The request already exists." });
        }

        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var channel = await _context.Channels.FirstOrDefaultAsync(c => c.id == req.channel_id);
            if (channel == null) // Is there a channel with the given channel_id? If not, return error
                return BadRequest(new { error = "Channel not found" });

            if (channel.owner_id == null)
            {
                return BadRequest(new { error = "Channel owner not found" });
            }

            var team = await _context.Teams.FirstOrDefaultAsync(t => t.team_id == channel.team_id);
            if (team == null) // Is there a team with the given team_id? If not, return error
                return BadRequest(new { error = "Team not found" });

            var request = new Request
            {
                requester_id = user.user_id,
                requester_name = user.username,
                recipient_id = req.recipient_id,
                channel_id = channel.id,
                channel_name = channel.channel_name,
                team_name = team.team_name,
                request_type = "invite",
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

    [HttpPost("invite-by-names")]
    [Authorize]
    public async Task<IActionResult> CreateInviteRequestsByNames([FromBody] MassInviteCreationRequest req)
    {

        int successCount = 0;

        var requester = await _context.Users.FirstOrDefaultAsync(u => u.user_id == req.requester_id);
        if (requester == null) // Is there a user with the given requester_id? If not, return error
            return BadRequest(new { error = "Requester not found" });

        if (!ModelState.IsValid)
            return BadRequest(new { error = "Invalid input", details = ModelState });

        var channel = await _context.Channels.FirstOrDefaultAsync(c => c.id == req.channel_id);
        if (channel == null) // Is there a channel with the given channel_id? If not, return error
            return BadRequest(new { error = "Channel not found" });

        var team = await _context.Teams.FirstOrDefaultAsync(t => t.team_id == channel.team_id);
        if (team == null) // Is there a team with the given team_id? If not, return error
            return BadRequest(new { error = "Team not found" });

        using var transaction = await _context.Database.BeginTransactionAsync();

        foreach (string name in req.users_to_invite) // For each user, create an invite to the channel (or else return error)
        {

            try
            {
                User currentUser = await _context.Users.FirstOrDefaultAsync(u => u.username == name);
                if (currentUser == null) // No user with such a name? Return error
                {
                    return BadRequest(new { error = $"{name} not found" });
                }

                if (_context.Requests.Any(obj => obj.recipient_id == currentUser.user_id && obj.channel_id == req.channel_id))
                {
                    return BadRequest(new { error = "The request already exists." });
                }

                TeamMembership teamMembership = await _context.TeamMemberships.FirstOrDefaultAsync(m => m.user_id == currentUser.user_id && m.team_id == team.team_id);
                if (teamMembership == null) // Not a member of the team? Return error
                {
                    return BadRequest(new { error = $"{name} not found in team" });
                }
                ChannelMembership channelMembership = await _context.ChannelMemberships.FirstOrDefaultAsync(m => m.user_id == currentUser.user_id && m.channel_id == channel.id);
                if (channelMembership == null) // Already a member of the team but not a member of the channel?
                {
                    // create a request
                    var request = new Request
                    {
                        requester_id = requester.user_id,
                        requester_name = requester.username,
                        recipient_id = currentUser.user_id,
                        channel_id = channel.id,
                        channel_name = channel.channel_name,
                        team_name = team.team_name,
                        request_type = "invite",
                        created_at = DateTime.UtcNow
                    };
                    _context.Requests.Add(request);
                    await _context.SaveChangesAsync();
                    successCount++;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to create request", details = ex.Message });

            }
        }
        await transaction.CommitAsync();

        if (successCount > 0)
        {
            return StatusCode(201, new { message = successCount + " user" + (successCount > 1 ? "s" : "") + "successfully invited to the channel" });

        }
        else
        {
            return BadRequest(new { error = "No valid invites were created." });
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

        if (request.request_type == "join")
        {
            if (request.recipient_id != user.user_id) // Is the user the owner of the channel?
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

                    var channelMembership = await _context.ChannelMemberships.FirstOrDefaultAsync(obj => obj.user_id == request.requester_id && obj.channel_id == channel.id);
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
                }

                _context.Requests.Remove(request); // delete the request, no matter the answer
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = "Request " + (req.accept ? "Accepted" : "Declined") + " successfully" });


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
        else // it's an invite
        {
            if (request.recipient_id != user.user_id) // Is the current user the recipient of the invite?
                return Unauthorized(new { error = "You are not the correct recipient of this invite." });

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

                    var recipient = await _context.Users.FirstOrDefaultAsync(obj => obj.user_id == request.recipient_id);
                    if (recipient == null) // the recipient is not found
                    {
                        return BadRequest(new { error = "Recipient not found" });
                    }

                    var channelMembership = await _context.ChannelMemberships.FirstOrDefaultAsync(obj => obj.user_id == request.recipient_id && obj.channel_id == channel.id);
                    if (channelMembership != null) // Already a member of the channel?
                    {
                        return BadRequest(new { error = "User is already a member of the channel" });
                    }
                    else
                    {
                        channelMembership = new ChannelMembership
                        {
                            user_id = recipient.user_id,
                            channel_id = channel.id,
                            created_at = DateTime.UtcNow
                        };
                        _context.ChannelMemberships.Add(channelMembership); // Add user to channel
                    }
                }

                _context.Requests.Remove(request); // delete the request, no matter the answer
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { message = "Request " + (req.accept ? "Accepted" : "Declined") + " successfully" });


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

}
