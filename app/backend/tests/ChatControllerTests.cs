using Xunit;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Controllers;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using ChatHaven.Models;
using System.Security.Claims;

public class ChatControllerTests
{
    private readonly ApplicationDbContext _context;
    private readonly ChatController _controller;

    public ChatControllerTests() {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()).ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning)).Options;
        _context = new ApplicationDbContext(options);
        _controller = new ChatController(_context);
    }

    [Fact]
    public async Task RetrieveChannelMessages_ReturnsStatusCode403() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "1")], "mock"))}};

        _context.ChannelMessages.AddRange(new List<ChannelMessage> {
            new ChannelMessage {message_id = 1, sender_id = 1, channel_id = 1, message_content = "Hello World", sent_at = DateTime.Now, reply_to_id = null, reactions = null, reaction_users = null},
            new ChannelMessage {message_id = 2, sender_id = 2, channel_id = 2, message_content = "Hey?", sent_at = DateTime.Now, reply_to_id = null, reactions = null, reaction_users = null}
        });

        _context.Channels.AddRange(new List<Channel> {
            new Channel {id = 1, channel_name = "The Boys", team_id = 1, is_public = false},
            new Channel {id = 2, channel_name = "The Girls", team_id = 2, is_public = true}
        });

        _context.ChannelMemberships.AddRange(new List<ChannelMembership> {new ChannelMembership {id = 2, created_at = DateTime.Now, user_id = 2, channel_id = 2}});

        await _context.SaveChangesAsync();

        // Act
        var objectResult = (await _controller.RetrieveChannelMessages(1)) as ObjectResult;

        // Assert
        Assert.NotNull(objectResult);
        Assert.Equal(403, objectResult!.StatusCode);
        Assert.NotNull(objectResult!.Value);
        Assert.Equal("User is not a member of this channel", (objectResult.Value as dynamic).error);
    }

    [Fact]
    public async Task RetrieveChannelMessages_ReturnsChannelChatMessages() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "1")], "mock"))}};

        _context.ChannelMessages.AddRange(new List<ChannelMessage> {
            new ChannelMessage {message_id = 1, sender_id = 1, channel_id = 1, message_content = "Hello World", sent_at = DateTime.Now, reply_to_id = null, reactions = null, reaction_users = null},
            new ChannelMessage {message_id = 2, sender_id = 2, channel_id = 2, message_content = "Hey?", sent_at = DateTime.Now, reply_to_id = null, reactions = null, reaction_users = null}
        });

        _context.Channels.AddRange(new List<Channel> {
            new Channel {id = 1, channel_name = "The Boys", team_id = 1, is_public = true},
            new Channel {id = 2, channel_name = "The Girls", team_id = 2, is_public = false}
        });

        _context.ChannelMemberships.AddRange(new List<ChannelMembership> {
            new ChannelMembership {id = 1, created_at = DateTime.Now, user_id = 1, channel_id = 1},
            new ChannelMembership {id = 2, created_at = DateTime.Now, user_id = 2, channel_id = 2}
        });

        await _context.SaveChangesAsync();

        // Act
        var wrapper = ((await _controller.RetrieveChannelMessages(1)) as ObjectResult)?.Value;
        var result = wrapper != null && wrapper.GetType().GetProperty("messages")?.GetValue(wrapper) is List<object> messages ? messages : new List<object>();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(new List<int> {1}, result.Select(m => (int)((dynamic)m).message_id).ToList());
    }

    [Fact]
    public async Task RetrieveChannelMessages_ReturnsBadRequest_WhenChannelIsNotFound() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "1")], "mock"))}};

        _context.ChannelMessages.AddRange(new List<ChannelMessage> {
            new ChannelMessage {message_id = 1, sender_id = 1, channel_id = 1, message_content = "Hello World", sent_at = DateTime.Now, reply_to_id = null, reactions = null, reaction_users = null},
            new ChannelMessage {message_id = 2, sender_id = 2, channel_id = 2, message_content = "Hey?", sent_at = DateTime.Now, reply_to_id = null, reactions = null, reaction_users = null}
        });

        _context.Channels.AddRange(new List<Channel> {new Channel {id = 2, channel_name = "The Girls", team_id = 2, is_public = false}});

        _context.ChannelMemberships.AddRange(new List<ChannelMembership> {
            new ChannelMembership {id = 1, created_at = DateTime.Now, user_id = 1, channel_id = 1},
            new ChannelMembership {id = 2, created_at = DateTime.Now, user_id = 2, channel_id = 2}
        });

        await _context.SaveChangesAsync();

        // Act
        var result = ((await _controller.RetrieveChannelMessages(1)) as BadRequestObjectResult)?.Value;

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Channel not found.", (result as dynamic)!.error);
    }

    [Fact]
    public async Task DeleteMessageFromChannel_ReturnsStatusCode201() {
        // Arrange
        _context.ChannelMessages.AddRange(new List<ChannelMessage> {
            new ChannelMessage {message_id = 1, sender_id = 1, channel_id = 1, message_content = "Hello World", sent_at = DateTime.Now, reply_to_id = null, reactions = null, reaction_users = null},
            new ChannelMessage {message_id = 2, sender_id = 2, channel_id = 2, message_content = "Hey?", sent_at = DateTime.Now, reply_to_id = null, reactions = null, reaction_users = null},
            new ChannelMessage {message_id = 3, sender_id = 3, channel_id = 1, message_content = "Hey!", sent_at = DateTime.Now, reply_to_id = null, reactions = null, reaction_users = null},
            new ChannelMessage {message_id = 4, sender_id = 1, channel_id = 1, message_content = "Bro...", sent_at = DateTime.Now, reply_to_id = null, reactions = null, reaction_users = null}
        });
        await _context.SaveChangesAsync();

        // Act
        var objectResult = (await _controller.DeleteMessageFromChannel(new List<List<int>>([new List<int>([1, 3]), new List<int>([1])]))) as ObjectResult;

        // Assert
        Assert.Equal(new List<int> {2, 4}, await _context.ChannelMessages.Select(m => m.message_id).ToListAsync());
        Assert.NotNull(objectResult);
        Assert.Equal(201, objectResult!.StatusCode);
        Assert.NotNull(objectResult!.Value);
        Assert.Equal("Messages deleted from channel.", (objectResult.Value as dynamic).message);
    }

    [Fact]
    public async Task DeleteMessageFromChannel_ReturnsBadRequest_WhenNoMessagesAreFound() {
        // Arrange
        _context.ChannelMessages.AddRange(new List<ChannelMessage> {new ChannelMessage {message_id = 2, sender_id = 2, channel_id = 2, message_content = "Hey?", sent_at = DateTime.Now, reply_to_id = null, reactions = null, reaction_users = null}});
        await _context.SaveChangesAsync();

        // Act
        var result = ((await _controller.DeleteMessageFromChannel(new List<List<int>>([new List<int>([1, 2]), new List<int>([1])]))) as BadRequestObjectResult)?.Value;

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Messages not found.", (result as dynamic).error);
    }

    [Fact]
    public async Task RetrieveDirectMessages_ReturnsPrivateChatMessages() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "1")], "mock"))}};

        _context.DirectMessageChannels.AddRange(new List<DirectMessageChannel> {new DirectMessageChannel {dm_id = 1, user_id1 = 1, user_id2 = 2}});

        _context.DirectMessages.AddRange(new List<DirectMessage> {
            new DirectMessage {message_id = 1, sender_id = 1, receiver_id = 2, sent_at = DateTime.Now, message_content = "Hello World", dm_id = 1, reply_to_id = null},
            new DirectMessage {message_id = 2, sender_id = 2, receiver_id = 1, sent_at = DateTime.Now, message_content = "Hey?", dm_id = 1, reply_to_id = null}
        });

        await _context.SaveChangesAsync();

        // Act
        var wrapper = ((await _controller.RetrieveDirectMessages(1)) as ObjectResult)?.Value;
        var result = wrapper != null && wrapper.GetType().GetProperty("messages")?.GetValue(wrapper) is List<object> messages ? messages : new List<object>();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(new List<int> {1, 2}, result.Select(m => (int)((dynamic)m).message_id).ToList());
    }

    [Fact]
    public async Task RetrieveDirectMessage_ReturnsBadRequest_WhenDirectMessageChannelIsNotFound() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "1")], "mock"))}};
        _context.DirectMessages.AddRange(new List<DirectMessage> {
            new DirectMessage {message_id = 1, sender_id = 1, receiver_id = 2, sent_at = DateTime.Now, message_content = "Hello World", dm_id = 1, reply_to_id = null},
            new DirectMessage {message_id = 2, sender_id = 2, receiver_id = 1, sent_at = DateTime.Now, message_content = "Hey?", dm_id = 1, reply_to_id = null}
        });
        await _context.SaveChangesAsync();

        // Act
        var result = ((await _controller.RetrieveDirectMessages(1)) as BadRequestObjectResult)?.Value;

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Direct message channel not found", (result as dynamic).error);
    }

    [Fact]
    public async Task DeleteDirectMessage_ReturnsStatusCode201() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "1")], "mock"))}};
        _context.DirectMessages.AddRange(new List<DirectMessage> {
            new DirectMessage {message_id = 1, sender_id = 1, receiver_id = 2, sent_at = DateTime.Now, message_content = "Hello World", dm_id = 1, reply_to_id = null},
            new DirectMessage {message_id = 2, sender_id = 2, receiver_id = 1, sent_at = DateTime.Now, message_content = "Hey?", dm_id = 2, reply_to_id = null}
        });
        await _context.SaveChangesAsync();

        // Act
        var objectResult = (await _controller.DeleteDirectMessage(new List<int>([1]))) as ObjectResult;

        // Assert
        Assert.Equal(new List<int> {2}, _context.DirectMessages.Select(m => m.message_id));
        Assert.NotNull(objectResult);
        Assert.Equal(201, objectResult!.StatusCode);
        Assert.Equal("Direct messages deleted.", (objectResult as dynamic).Value.message);
    }

    [Fact]
    public async Task DeleteDirectMessage_ReturnsBadRequest_WhenNoMessagesAreFound() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "1")], "mock"))}};
        _context.DirectMessages.AddRange(new List<DirectMessage> {new DirectMessage {message_id = 2, sender_id = 2, receiver_id = 1, sent_at = DateTime.Now, message_content = "Hey?", dm_id = 2, reply_to_id = null}});
        await _context.SaveChangesAsync();

        // Act
        var result = ((await _controller.DeleteDirectMessage(new List<int>([1]))) as BadRequestObjectResult)?.Value;

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Message not found.", (result as dynamic).error);
    }

    [Fact]
    public async Task DeleteDirectMessage_ReturnsBadRequest_WhenUserIsNotTheSender() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "1")], "mock"))}};
        _context.DirectMessages.AddRange(new List<DirectMessage> {
            new DirectMessage {message_id = 1, sender_id = 2, receiver_id = 1, sent_at = DateTime.Now, message_content = "Hello World", dm_id = 1, reply_to_id = null},
            new DirectMessage {message_id = 2, sender_id = 1, receiver_id = 2, sent_at = DateTime.Now, message_content = "Hey?", dm_id = 2, reply_to_id = null}
        });
        await _context.SaveChangesAsync();

        // Act
        var result = ((await _controller.DeleteDirectMessage(new List<int>([1, 2]))) as BadRequestObjectResult)?.Value;

        // Assert
        Assert.NotNull(result);
        Assert.Equal("No permissions to delete this message", (result as dynamic).error);
    }
}
