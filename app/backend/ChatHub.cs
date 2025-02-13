using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

public class ChatHub : Hub
{
    private readonly ChatHaven.Data.ApplicationDbContext _context;
    public ChatHub(ChatHaven.Data.ApplicationDbContext context) // we should really have a UserService... duplicating code for no reason all the time lol
    {
        _context = context;
    }
    public async Task JoinChannel(int channelId)
    {
        try
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"channel_{channelId}");
            await Clients.Group($"channel_{channelId}").SendAsync("ReceiveSystemMessage", $"User {Context.ConnectionId} joined channel {channelId}");
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error joining channel {channelId}: {ex.Message}");
            throw;
        }
    }

    public async Task LeaveChannel(int channelId)
    {
        try
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"channel_{channelId}");
            await Clients.Group($"channel_{channelId}").SendAsync("ReceiveSystemMessage", $"User {Context.ConnectionId} left channel {channelId}");
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error leaving channel {channelId}: {ex.Message}");
            throw;
        }
    }

    public async Task SendMessageToChannel(int channelId, int senderId, string messageContent)
    {
        try
        {
            var sentAt = DateTime.UtcNow;


          string? username = await _context.Users
            .FromSqlRaw("SELECT username FROM \"Users\" WHERE user_id = {0}", senderId)
            .Select(u => u.username)  
            .FirstOrDefaultAsync();

            if (string.IsNullOrEmpty(username))
            {
                username = "Unknown";
            }
            Console.WriteLine($"Sending message to channel {channelId}: {messageContent} from {username}");
            await Clients.Group($"channel_{channelId}").SendAsync("ReceiveMessage", senderId, username, messageContent, sentAt, channelId);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error sending message to channel {channelId}: {ex.Message}");
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
}
