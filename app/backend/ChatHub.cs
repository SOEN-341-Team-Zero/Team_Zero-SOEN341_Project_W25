using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

public class ChatHub : Hub
{
    private readonly ChatHaven.Data.ApplicationDbContext _context;
    public ChatHub(ChatHaven.Data.ApplicationDbContext context)
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

    public async Task SendMessageToChannel(
    int channelId, 
    int userId, 
    string message, 
    int? replyToId = null, 
    string? replyToUsername = null, 
    string? replyToMessage = null)
{
    try
    {
        var sentAt = DateTime.UtcNow;

        string? username = await _context.Users
            .FromSqlRaw("SELECT username FROM \"Users\" WHERE user_id = {0}", userId)
            .Select(u => u.username)  
            .FirstOrDefaultAsync();

        if (string.IsNullOrEmpty(username))
        {
            username = "Unknown";
        }
        
        Console.WriteLine($"Sending message to channel {channelId}: {message} from {username}");
        
        // Save message
        ChatHaven.Models.ChannelMessage channelMessage = new ChatHaven.Models.ChannelMessage
        {
            sender_id = userId,  // Note: Your client uses userId, not senderId
            channel_id = channelId,
            sent_at = DateTime.UtcNow,
            message_content = message,  // Client uses "message" not "messageContent"
            reply_to_id = replyToId
        };
        
        _context.ChannelMessages.Add(channelMessage);
        await _context.SaveChangesAsync();
        
        // Broadcast message with all reply information provided by the client
        await Clients.Group($"channel_{channelId}").SendAsync("ReceiveMessage", 
            userId,  // Changed from senderId to userId
            username, 
            message,  // Changed from messageContent to message
            sentAt, 
            channelId, 
            replyToId, 
            replyToUsername, 
            replyToMessage);
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