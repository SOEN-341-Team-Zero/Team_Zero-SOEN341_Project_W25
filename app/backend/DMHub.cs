using ChatHaven.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;

public class DMHub : Hub
{
    private readonly ChatHaven.Data.ApplicationDbContext _context;
    public DMHub(ChatHaven.Data.ApplicationDbContext context)
    {
        _context = context;
    }
    
    public async Task JoinDM(int dmId)
    {
        try
        {
            var token = getJWT();

            await Groups.AddToGroupAsync(Context.ConnectionId, $"dm_{dmId}");
            await Clients.Group($"dm_{dmId}").SendAsync("ReceiveSystemMessage", $"User {Context.ConnectionId} joined dm {dmId}");
            Console.WriteLine($"DEBUG - USER {token.Claims.FirstOrDefault(c => c.Type == "sub")?.Value} joined dm {dmId}");
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error joining dm {dmId}: {ex.Message}");
            throw;
        }
    }

    public async Task LeaveDM(int dmId)
    {
        try
        {
            var token = getJWT();

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"dm_{dmId}");
            await Clients.Group($"dm_{dmId}").SendAsync("ReceiveSystemMessage", $"User {Context.ConnectionId} left dm {dmId}");
            Console.WriteLine($"DEBUG - USER {token.Claims.FirstOrDefault(c => c.Type == "sub")?.Value} left dm {dmId}");
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error leaving dm {dmId}: {ex.Message}");
            throw;
        }
    }

    public async Task SendMessageToDM(
        int dmId, 
        string messageContent, 
        int? replyToId = null,
        string? replyToUsername = null,
        string? replyToMessage = null)
    {
        try
        {
            var token = getJWT();

            var sentAt = DateTime.UtcNow;

            var senderId = Convert.ToInt32(token.Claims.FirstOrDefault(c => c.Type == "userId")?.Value);
            var senderUsername = token.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

            Console.WriteLine($"Sending message to dm {dmId}: {messageContent} from {senderUsername ?? "ERROR"}");
           
            var receiverId = await _context.DirectMessageChannels
                .Where(d => d.dm_id == dmId)
                .Select(d => d.user_id1 == senderId ? d.user_id2 : d.user_id1)
                .FirstOrDefaultAsync();

            var directMessage = new DirectMessage
            {
                sender_id = senderId,
                dm_id = dmId,
                message_content = messageContent,
                sent_at = sentAt,
                receiver_id = receiverId,
                reply_to_id = replyToId
            };

            _context.DirectMessages.Add(directMessage);
            await _context.SaveChangesAsync();

            await Clients.Group($"dm_{dmId}").SendAsync(
                "ReceiveMessage", 
                senderId, 
                senderUsername, 
                messageContent, 
                sentAt, 
                dmId,
                replyToId,
                replyToUsername,
                replyToMessage);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error sending message to dm {dmId}: {ex.Message}");
            throw;
        }
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        Console.WriteLine($"Client connected: {Context.ConnectionId}");
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        await base.OnDisconnectedAsync(exception);
        Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
    }

    private JwtSecurityToken getJWT()
    {
        var token = Context.GetHttpContext()?.Request.Query["access_token"].ToString();

        if (string.IsNullOrEmpty(token))
        {
            token = Context.GetHttpContext()?.Request.Headers["Authorization"]
                .ToString()?.Replace("Bearer ", "");
        }

        if (string.IsNullOrEmpty(token))
        {
            Console.WriteLine("DEBUG - Headers: " + string.Join(", ", Context.GetHttpContext()?.Request.Headers.Keys ?? Array.Empty<string>()));
            Console.WriteLine("DEBUG - Query Params: " + string.Join(", ", Context.GetHttpContext()?.Request.Query.Keys ?? Array.Empty<string>()));
            throw new Exception("No authorization token found in query or headers");
        }

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        Console.WriteLine($"DEBUG - Token claims: {string.Join(", ", jwtToken.Claims.Select(c => $"{c.Type}={c.Value}"))}");
        return jwtToken;
    }
}