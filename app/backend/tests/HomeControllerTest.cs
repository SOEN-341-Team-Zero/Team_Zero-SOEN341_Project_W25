using Xunit;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Controllers;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using ChatHaven.Models;
using System.Security.Claims;

public class HomeControllerTests
{
    private readonly ApplicationDbContext _context;
    private readonly HomeController _controller;

    public HomeControllerTests() {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()).ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning)).Options;
        _context = new ApplicationDbContext(options);
        var services = new ServiceCollection();
        services.AddDbContext<ApplicationDbContext>(options => options.UseInMemoryDatabase("TestDatabase"));
        _controller = new HomeController(_context, services.BuildServiceProvider().GetRequiredService<IServiceScopeFactory>());
    }
    
    [Fact]
    public async Task GetHomeIndex_ReturnsOkResult() {
        // Act
        var result = _controller.GetHomeIndex();

        // Assert
        Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Authenticated GET request successful!", ((dynamic) result).Value.message);
    }

    [Fact]
    public async Task Index_ReturnsTeams()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};
        _context.Users.AddRange(new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now});
        _context.Teams.AddRange(new Team {team_id = 1, team_name = "Test"});
        _context.TeamMemberships.AddRange(new TeamMembership {Id = 1, created_at = DateTime.Now, user_id = 1, team_id = 1});
        _context.Channels.AddRange(new Channel {id = 1, channel_name = "Test", is_public = true, owner_id = 1, team_id = 1});
        await _context.SaveChangesAsync();

        // Act
        var result = Assert.IsType<OkObjectResult>(await _controller.Index());

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(((dynamic) result).Value);
        Assert.NotNull(((dynamic) result).Value.teams);
        Assert.Equal(new List<int> {1}, (((dynamic) result!)!.Value!.teams! as IEnumerable<dynamic>).Select(t => (int) t.team_id).ToList());
    }

    [Fact]
    public async Task Index_ReturnsBadRequest_WhenUserIsNotFound() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};
        _context.Teams.AddRange(new Team {team_id = 1, team_name = "Test"});
        _context.TeamMemberships.AddRange(new TeamMembership {Id = 1, created_at = DateTime.Now, user_id = 1, team_id = 1});
        _context.Channels.AddRange(new Channel {id = 1, channel_name = "Test", is_public = true, owner_id = 1, team_id = 1});
        await _context.SaveChangesAsync();

        // Act
        var result = Assert.IsType<BadRequestObjectResult>(await _controller.Index());

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Value);
        Assert.Equal("User not found", (result.Value as dynamic)!.error);
    }

    [Fact]
    public async Task RetrieveDMChannelList_ReturnsDMChannels()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "1")], "mock"))}};
        _context.Users.AddRange(
            new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now},
            new User {user_id = 2, username = "Edward", isAdmin = true, password = "Edward", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now}
        );
        _context.DirectMessageChannels.AddRange(new DirectMessageChannel {dm_id = 1, user_id1 = 1, user_id2 = 2});
        _context.Teams.AddRange(new Team {team_id = 1, team_name = "Test"});
        await _context.SaveChangesAsync();

        // Act
        var result = Assert.IsType<OkObjectResult>(await _controller.RetrieveDMChannelList());

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(((dynamic) result).Value);
        Assert.NotNull(((dynamic) result).Value.dmChannels);
        Assert.Equal(new List<int> {1}, (((dynamic) result!)!.Value!.dmChannels! as IEnumerable<dynamic>).Select(dm => (int) dm.dm_id).ToList());
    }

    [Fact]
    public async Task UpdateActivity_ReturnsStatusCode201()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};
        _context.Users.AddRange(new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Offline.ToString(), last_seen = DateTime.Now});
        await _context.SaveChangesAsync();

        // Act
        var result = Assert.IsType<ObjectResult>(await _controller.UpdateActivity(new HomeController.ActivityRequest {Activity = UserActivity.Online.ToString()}));

        // Assert
        Assert.NotNull(result);
        Assert.Equal(201, ((dynamic) result).StatusCode);
        Assert.Equal("User activity was updated.", ((dynamic) result).Value.message);
    }

    [Fact]
    public async Task UpdateActivity_ReturnsBadRequest_WhenUserIsNotFound() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "1")], "mock"))}};
        await _context.SaveChangesAsync();

        // Act
        var result = Assert.IsType<BadRequestObjectResult>(await _controller.UpdateActivity(new HomeController.ActivityRequest {Activity = UserActivity.Online.ToString()}));

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Value);
        Assert.Equal("User not found", (result.Value as dynamic)!.error);
    }

    [Fact]
    public async Task GetLastSeenForUser_ReturnsLastSeen()
    {
        // Arrange
        var time = DateTime.Now;
        _context.Users.AddRange(new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = time});
        await _context.SaveChangesAsync();

        // Act
        var result = Assert.IsType<OkObjectResult>(await _controller.GetLastSeenForUser(1));

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(((dynamic) result).Value);
        Assert.NotNull(((dynamic) result).Value.last_seen);
        Assert.Equal(time.ToString(), ((dynamic) result!)!.Value!.last_seen.ToString());
    }

    [Fact]
    public async Task GetLastSeenForUser_ReturnsBadRequest_WhenUserIdIsInvalid() {
        // Arrange
        _context.Users.AddRange(new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now});
        await _context.SaveChangesAsync();

        // Act
        var result = Assert.IsType<BadRequestObjectResult>(await _controller.GetLastSeenForUser(-1));

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Value);
        Assert.Equal("Valid UserId is required", (result.Value as dynamic)!.error);
    }

    [Fact]
    public async Task GetLastSeenForUser_ReturnsBadRequest_WhenUserIsNotFound() {
        // Arrange
        await _context.SaveChangesAsync();

        // Act
        var result = Assert.IsType<BadRequestObjectResult>(await _controller.GetLastSeenForUser(1));

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Value);
        Assert.Equal("User not found", (result.Value as dynamic)!.error);
    }

    [Fact]
    public async Task CanAccessChannel_ReturnsOkResult()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};
        _context.Users.AddRange(new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now});
        _context.Channels.AddRange(new Channel {id = 1, channel_name = "Test", is_public = true, owner_id = 1, team_id = 1});
        _context.ChannelMemberships.AddRange(new ChannelMembership {id = 1, channel_id = 1, created_at = DateTime.Now, user_id  = 1});
        await _context.SaveChangesAsync();

        // Act
        var result = Assert.IsType<OkResult>(await _controller.CanAccessChannel(1));

        // Assert
        Assert.NotNull(result);
    }

    [Fact]
    public async Task CanAccessChannel_ReturnsStatusCode403()
    {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};
        _context.Users.AddRange(
            new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now},
            new User {user_id = 2, username = "Edward", isAdmin = true, password = "Edward", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now}
        );
        _context.Channels.AddRange(new Channel {id = 1, channel_name = "Test", is_public = false, owner_id = 2, team_id = 1});
        _context.ChannelMemberships.AddRange(new ChannelMembership {id = 1, channel_id = 1, created_at = DateTime.Now, user_id  = 2});
        await _context.SaveChangesAsync();

        // Act
        var result = Assert.IsType<ObjectResult>(await _controller.CanAccessChannel(1));

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(((dynamic) result).Value);
        Assert.Equal("User does not have access to this channel.", ((dynamic) result).Value.error);
    }

    [Fact]
    public async Task CanAccessChannel_ReturnsBadRequest_WhenUserIsNotFound() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};
        _context.Channels.AddRange(new Channel {id = 1, channel_name = "Test", is_public = true, owner_id = 1, team_id = 1});
        _context.ChannelMemberships.AddRange(new ChannelMembership {id = 1, channel_id = 1, created_at = DateTime.Now, user_id  = 1});
        await _context.SaveChangesAsync();

        // Act
        var result = Assert.IsType<BadRequestObjectResult>(await _controller.CanAccessChannel(1));

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Value);
        Assert.Equal("User not found", (result.Value as dynamic)!.error);
    }

    [Fact]
    public async Task CanAccessChannel_ReturnsBadRequest_WhenChannelIsNotFound() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};
        _context.Users.AddRange(new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now});
        _context.ChannelMemberships.AddRange(new ChannelMembership {id = 1, channel_id = 1, created_at = DateTime.Now, user_id  = 1});
        await _context.SaveChangesAsync();

        // Act
        var result = Assert.IsType<BadRequestObjectResult>(await _controller.CanAccessChannel(1));

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.Value);
        Assert.Equal("Channel not found", (result.Value as dynamic)!.error);
    }

    public async Task TeamCreation_ReturnsBadRequest_WhenUserIsNotAdmin() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};
        _context.Users.AddRange(new User {user_id = 1, username = "John", isAdmin = false, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now});
        await _context.SaveChangesAsync();

        // Act
        /* var result = (await _controller.TeamCreation(new TeamCreationRequest {team_name = "Test"})) as UnauthorizedObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal("User is not an admin", (result as dynamic)!.Value.error);*/
    }

    public async Task ChannelCreation_ReturnsStatusCode201() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};
        _context.Users.AddRange(new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now});
        _context.Teams.AddRange(new Team {team_id = 1, team_name = "Test"});
        await _context.SaveChangesAsync();

        // Act
        /* var objectResult = (await _controller.ChannelCreation(new ChannelCreationRequest {channel_name = "Test", team_id = 1, is_public = true})) as ObjectResult;

        // Assert
        Assert.Equal(new List<string> {"Test"}, await _context.Teams.Select(t => t.team_name).ToListAsync());
        Assert.NotNull(objectResult);
        Assert.Equal(201, objectResult!.StatusCode);
        Assert.NotNull(objectResult!.Value);
        Assert.Equal("Channel created successfully", (objectResult.Value as dynamic).message); */
    }

    public async Task ChannelCreation_ReturnsBadRequest_WhenUserIsNotFound() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};
        _context.Teams.AddRange(new Team {team_id = 1, team_name = "Test"});
        await _context.SaveChangesAsync();

        // Act
        /* var result = (await _controller.ChannelCreation(new ChannelCreationRequest {channel_name = "Test", team_id = 1, is_public = true})) as BadRequestObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal("User not found", (result as dynamic)!.Value.error); */
    }

    public async Task ChannelCreation_ReturnsBadRequest_WhenTeamIsNotFound() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};
        _context.Users.AddRange(new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now});
        await _context.SaveChangesAsync();

        // Act
        /* var result = (await _controller.ChannelCreation(new ChannelCreationRequest {channel_name = "Test", team_id = 1, is_public = true})) as BadRequestObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Team not found", (result as dynamic)!.Value.error); */
    }

    public async Task ChannelCreation_ReturnsBadRequest_WhenChannelExists() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};
        _context.Users.AddRange(new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now});
        _context.Channels.AddRange(new Channel {id = 1, channel_name = "Test", team_id = 1, is_public = true, owner_id = 1});
        _context.Teams.AddRange(new Team {team_id = 1, team_name = "Test"});
        await _context.SaveChangesAsync();

        // Act
        /* var result = (await _controller.ChannelCreation(new ChannelCreationRequest {channel_name = "Test", team_id = 1, is_public = true})) as BadRequestObjectResult;

        // Assert
        Assert.NotNull(result);
        Assert.Equal("A channel with an identical name already exists within Test", (result as dynamic)!.Value.error); */
    }

    public async Task DMCreation_ReturnsStatusCode201() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "1")], "mock"))}};
        _context.Users.AddRange(
            new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now},
            new User {user_id = 2, username = "Edward", isAdmin = true, password = "Edward", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now}
        );
        await _context.SaveChangesAsync();

        // Act
        /* var objectResult = (await _controller.DMCreation(new DMCreationRequest {recipient_name = "Edward"})) as ObjectResult;

        // Assert
        Assert.Equal(new List<int> {1}, await _context.DirectMessageChannels.Select(m => m.dm_id).ToListAsync());
        Assert.NotNull(objectResult);
        Assert.Equal(201, objectResult!.StatusCode);
        Assert.NotNull(objectResult!.Value);
        Assert.Equal("DM created successfully", (objectResult.Value as dynamic).message); */
    }

    public async Task DMCreation_ReturnsBadRequest_WhenUserIsNotFound() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "1")], "mock"))}};
        _context.Users.AddRange(new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now});
        await _context.SaveChangesAsync();

        // Act
        /* var objectResult = (await _controller.DMCreation(new DMCreationRequest {recipient_name = "Edward"})) as BadRequestObjectResult;

        // Assert
        Assert.NotNull(objectResult);
        Assert.Equal("Recipient not found.", (objectResult as dynamic)!.Value); */
    }

    public async Task DMCreation_ReturnsBadRequest_WhenDMChatExists() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "1")], "mock"))}};
        _context.DirectMessageChannels.AddRange(new DirectMessageChannel {dm_id = 1, user_id1 = 1, user_id2 = 2});
        _context.Users.AddRange(
            new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now},
            new User {user_id = 2, username = "Edward", isAdmin = true, password = "Edward", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now}
        );
        await _context.SaveChangesAsync();

        // Act
        /* var objectResult = (await _controller.DMCreation(new DMCreationRequest {recipient_name = "Edward"})) as BadRequestObjectResult;

        // Assert
        Assert.NotNull(objectResult);
        Assert.Equal("A chat already exists with this user.", (objectResult as dynamic)!.Value); */
    }

    public async Task GetUsersDM_ReturnsUsers() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "1")], "mock"))}};
        _context.Users.AddRange(
            new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now},
            new User {user_id = 2, username = "Edward", isAdmin = true, password = "Edward", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now}
        );
        await _context.SaveChangesAsync();

        // Act
        /* var result = ((await _controller.GetUsersDM()) as OkObjectResult)?.Value as List<string>;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(new List<string> {"John", "Edward"}, result); */
    }

    public async Task GetUserId_WhenUserIsNotFound() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("userId", "0")], "mock"))}};
        _context.Users.AddRange(
            new User {user_id = 0, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now},
            new User {user_id = 2, username = "Edward", isAdmin = true, password = "Edward", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now}
        );
        _context.DirectMessageChannels.AddRange(new DirectMessageChannel {dm_id = 1, user_id1 = 1, user_id2 = 2});
        await _context.SaveChangesAsync();

        // Act
        /* var objectResult = (await _controller.GetUsersDM()) as BadRequestObjectResult;

        // Assert
        Assert.NotNull(objectResult);
        Assert.Equal("User not found", (objectResult as dynamic)!.Value.error); */
    }
}