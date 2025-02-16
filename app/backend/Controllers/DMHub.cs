using ChatHaven.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

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
            await Groups.AddToGroupAsync(Context.ConnectionId, $"dm_{dmId}");
            await Clients.Group($"dm_{dmId}").SendAsync("ReceiveSystemMessage", $"User {Context.ConnectionId} joined channel {dmId}");
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error joining channel {dmId}: {ex.Message}");
            throw;
        }
    }

    public async Task LeaveDM(int dmId)
    {
        try
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"dm_{dmId}");
            await Clients.Group($"dm_{dmId}").SendAsync("ReceiveSystemMessage", $"User {Context.ConnectionId} left dm {dmId}");
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Error leaving channel {dmId}: {ex.Message}");
            throw;
        }
    }

    public async Task SendMessageToDM(int dmId, string messageContent)
    {
        try
        {
            var sentAt = DateTime.UtcNow;

            var senderId = Context.User?.FindFirst("userId");
            var senderUsername = Context.User?.FindFirst("username");

            Console.WriteLine($"Sending message to dm {dmId}: {messageContent} from {senderUsername}");
            await Clients.Group($"dm_{dmId}").SendAsync("ReceiveMessage", senderId, senderUsername, messageContent, sentAt, dmId);
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
}
