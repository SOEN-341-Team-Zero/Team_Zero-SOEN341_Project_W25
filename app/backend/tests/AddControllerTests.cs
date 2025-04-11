using Xunit;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Controllers;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using ChatHaven.Models;
using System.Security.Claims;

public class AddControllerTests
{
    private readonly ApplicationDbContext _context;
    private readonly AddController _controller;

    public AddControllerTests() {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()).Options;
        _context = new ApplicationDbContext(options);
        _controller = new AddController(_context);
    }

    [Fact]
    public async Task SendUsers_ReturnsUsersOutsideOfTeam() {
        // Arrange
        _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.TeamMemberships.AddRange(new List<TeamMembership> {
            new TeamMembership {Id = 1, created_at = DateTime.Now, user_id = 1, team_id = 1},
            new TeamMembership {Id = 2, created_at = DateTime.Now, user_id = 2, team_id = 2},
            new TeamMembership {Id = 3, created_at = DateTime.Now, user_id = 3, team_id = 1},
            new TeamMembership {Id = 4, created_at = DateTime.Now, user_id = 4, team_id = 2}
        });

        await _context.SaveChangesAsync();

        // Act
        var result = ((await _controller.SendUsers(1)) as ObjectResult)?.Value as List<string>;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(new List<string> {"Edward", "Cynthia"}, (dynamic)result);
    }
    
    [Fact]
    public async Task SendTeamUsers_ReturnsUsersOutsideOfChannel() {
        // Arrange
        _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.TeamMemberships.AddRange(new List<TeamMembership> {
            new TeamMembership {Id = 1, created_at = DateTime.Now, user_id = 1, team_id = 1},
            new TeamMembership {Id = 2, created_at = DateTime.Now, user_id = 2, team_id = 2},
            new TeamMembership {Id = 3, created_at = DateTime.Now, user_id = 3, team_id = 1},
            new TeamMembership {Id = 4, created_at = DateTime.Now, user_id = 4, team_id = 1}
        });

        _context.ChannelMemberships.AddRange(new List<ChannelMembership> {
            new ChannelMembership {id = 1, created_at = DateTime.Now, user_id = 1, channel_id = 1},
            new ChannelMembership {id = 2, created_at = DateTime.Now, user_id = 2, channel_id = 2},
            new ChannelMembership {id = 3, created_at = DateTime.Now, user_id = 3, channel_id = 3},
            new ChannelMembership {id = 4, created_at = DateTime.Now, user_id = 4, channel_id = 3}
        });

        await _context.SaveChangesAsync();

        // Act
        var result = ((await _controller.SendTeamUsers(1, 1)) as ObjectResult)?.Value as List<string>;

        // Assert
        Assert.NotNull(result);
        Assert.Equal(new List<string> {"Alicia", "Cynthia"}, (dynamic)result);
    }

    [Fact]
    public async Task SendAllChannelUsers_ReturnsUsersInChannel() {
        // Arrange
        _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.ChannelMemberships.AddRange(new List<ChannelMembership> {
            new ChannelMembership {id = 1, created_at = DateTime.Now, user_id = 1, channel_id = 1},
            new ChannelMembership {id = 2, created_at = DateTime.Now, user_id = 2, channel_id = 1},
            new ChannelMembership {id = 3, created_at = DateTime.Now, user_id = 3, channel_id = 2},
            new ChannelMembership {id = 4, created_at = DateTime.Now, user_id = 4, channel_id = 2}
        });

        await _context.SaveChangesAsync();

        // Act
        var result = ((await _controller.SendAllChannelUsers(1)) as ObjectResult)?.Value as dynamic;

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result!.users);
        Assert.Equal(new List<string> {"John", "Edward"}, ((IEnumerable<dynamic>)result.users).Select(u => (string)u.username).ToList());
    }

    [Fact]
    public async Task SendAllTeamUsers_ReturnsUsersInTeam() {
        // Arrange
        _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.TeamMemberships.AddRange(new List<TeamMembership> {
            new TeamMembership {Id = 1, created_at = DateTime.Now, user_id = 1, team_id = 1},
            new TeamMembership {Id = 2, created_at = DateTime.Now, user_id = 2, team_id = 1},
            new TeamMembership {Id = 3, created_at = DateTime.Now, user_id = 3, team_id = 2},
            new TeamMembership {Id = 4, created_at = DateTime.Now, user_id = 4, team_id = 2}
        });

        await _context.SaveChangesAsync();

        // Act
        var result = ((await _controller.SendAllTeamUsers(1)) as ObjectResult)?.Value as dynamic;

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result!.users);
        Assert.Equal(new List<string> {"John", "Edward"}, ((IEnumerable<dynamic>)result.users).Select(u => (string)u.username).ToList());
    }

    [Fact]
    public async Task AddToTeam_ReturnsStatusCode201() {
        // Arrange
        _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.TeamMemberships.AddRange(new List<TeamMembership> {
            new TeamMembership {Id = 1, created_at = DateTime.Now, user_id = 1, team_id = 1},
            new TeamMembership {Id = 2, created_at = DateTime.Now, user_id = 2, team_id = 2},
            new TeamMembership {Id = 3, created_at = DateTime.Now, user_id = 3, team_id = 1},
            new TeamMembership {Id = 4, created_at = DateTime.Now, user_id = 4, team_id = 2}
        });

        _context.Teams.AddRange(new List<Team> {
            new Team {team_id = 1, team_name = "Test Team"},
            new Team {team_id = 2, team_name = "The Forum"}
        });

        await _context.SaveChangesAsync();

        // Act
        var objectResult = Assert.IsType<ObjectResult>(await _controller.AddToTeam(new AddToTeamRequest {team_id = 1, users_to_add = new List<string> {"Edward"}, users_to_delete = new List<string> {"John"}}));

        // Assert
        Assert.Equal(await _context.TeamMemberships.Where(m => m.team_id == 1).Select(m => m.user_id).ToListAsync(), new List<int> {3, 2});
        Assert.Equal(201, objectResult.StatusCode);
        Assert.NotNull(objectResult.Value);
        Assert.Contains("message", objectResult.Value.ToString());
    }

    [Fact]
    public async Task AddToTeam_ReturnsBadRequest_WhenTeamIsNotFound() {
        // Arrange
        _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.TeamMemberships.AddRange(new List<TeamMembership> {
            new TeamMembership {Id = 1, created_at = DateTime.Now, user_id = 1, team_id = 1},
            new TeamMembership {Id = 2, created_at = DateTime.Now, user_id = 2, team_id = 2},
            new TeamMembership {Id = 3, created_at = DateTime.Now, user_id = 3, team_id = 1},
            new TeamMembership {Id = 4, created_at = DateTime.Now, user_id = 4, team_id = 2}
        });

        _context.Teams.AddRange(new List<Team> {
            new Team {team_id = 3, team_name = "Test Team"},
            new Team {team_id = 4, team_name = "The Forum"}
        });

        await _context.SaveChangesAsync();

        // Act
        var objectResult = Assert.IsType<BadRequestObjectResult>(await _controller.AddToTeam(new AddToTeamRequest {team_id = 1, users_to_add = new List<string> {"Edward"}, users_to_delete = new List<string> {"John"}}));

        // Assert
        Assert.NotNull(objectResult.Value as dynamic);
        Assert.Equal("Team not found", (objectResult.Value as dynamic)!.error);
    }

    [Fact]
    public async Task AddToTeam_ReturnsBadRequest_WhenUserToAddIsNotFound() {
        // Arrange
        _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.TeamMemberships.AddRange(new List<TeamMembership> {
            new TeamMembership {Id = 1, created_at = DateTime.Now, user_id = 1, team_id = 1},
            new TeamMembership {Id = 2, created_at = DateTime.Now, user_id = 2, team_id = 2},
            new TeamMembership {Id = 3, created_at = DateTime.Now, user_id = 3, team_id = 1},
            new TeamMembership {Id = 4, created_at = DateTime.Now, user_id = 4, team_id = 2}
        });

        _context.Teams.AddRange(new List<Team> {
            new Team {team_id = 1, team_name = "Test Team"},
            new Team {team_id = 2, team_name = "The Forum"}
        });

        await _context.SaveChangesAsync();

        // Act
        var objectResult = Assert.IsType<BadRequestObjectResult>(await _controller.AddToTeam(new AddToTeamRequest {team_id = 1, users_to_add = new List<string> {"Edward"}, users_to_delete = new List<string> {"John"}}));

        // Assert
        Assert.NotNull(objectResult.Value as dynamic);
        Assert.Equal("Edward not found", (objectResult.Value as dynamic)!.error);
    }

    [Fact]
    public async Task AddToTeam_ReturnsBadRequest_WhenUserToDeleteIsNotFound() {
        // Arrange
        _context.Users.AddRange(new List<User> {
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.TeamMemberships.AddRange(new List<TeamMembership> {
            new TeamMembership {Id = 1, created_at = DateTime.Now, user_id = 1, team_id = 1},
            new TeamMembership {Id = 2, created_at = DateTime.Now, user_id = 2, team_id = 2},
            new TeamMembership {Id = 3, created_at = DateTime.Now, user_id = 3, team_id = 1},
            new TeamMembership {Id = 4, created_at = DateTime.Now, user_id = 4, team_id = 2}
        });

        _context.Teams.AddRange(new List<Team> {
            new Team {team_id = 1, team_name = "Test Team"},
            new Team {team_id = 2, team_name = "The Forum"}
        });

        await _context.SaveChangesAsync();

        // Act
        var objectResult = Assert.IsType<BadRequestObjectResult>(await _controller.AddToTeam(new AddToTeamRequest {team_id = 1, users_to_add = new List<string> {"Edward"}, users_to_delete = new List<string> {"John"}}));

        // Assert
        Assert.NotNull(objectResult.Value as dynamic);
        Assert.Equal("John not found", (objectResult.Value as dynamic)!.error);
    }

    [Fact]
    public async Task AddToChannel_ReturnsStatusCode201() {
        // Arrange
        _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.TeamMemberships.AddRange(new List<TeamMembership> {
            new TeamMembership {Id = 1, created_at = DateTime.Now, user_id = 1, team_id = 1},
            new TeamMembership {Id = 2, created_at = DateTime.Now, user_id = 2, team_id = 1},
            new TeamMembership {Id = 3, created_at = DateTime.Now, user_id = 3, team_id = 1},
            new TeamMembership {Id = 4, created_at = DateTime.Now, user_id = 4, team_id = 2}
        });

        _context.ChannelMemberships.AddRange(new List<ChannelMembership> {
            new ChannelMembership {id = 1, created_at = DateTime.Now, user_id = 1, channel_id = 1},
            new ChannelMembership {id = 2, created_at = DateTime.Now, user_id = 3, channel_id = 1},
            new ChannelMembership {id = 3, created_at = DateTime.Now, user_id = 2, channel_id = 1}
        });

        _context.Teams.AddRange(new List<Team> {
            new Team {team_id = 1, team_name = "Test Team"},
            new Team {team_id = 2, team_name = "The Forum"}
        });

        _context.Channels.AddRange(new List<Channel> {
            new Channel {id = 1, channel_name = "Talk", team_id = 1, is_public = false, owner_id = 3},
            new Channel {id = 2, channel_name = "Talk2", team_id = 2, is_public = true, owner_id = 2}
        });

        await _context.SaveChangesAsync();

        // Act
        var objectResult = Assert.IsType<ObjectResult>(await _controller.AddToChannel(new AddToChannelRequest {team_id = 1, channel_id = 1, users_to_add = new List<string> {"Edward"}, users_to_delete = new List<string> {"John"}}));

        // Assert
        Assert.Equal(await _context.ChannelMemberships.Where(m => m.channel_id == 1).Select(m => m.user_id).ToListAsync(), new List<int> {3, 2});
        Assert.Equal(201, objectResult.StatusCode);
        Assert.NotNull(objectResult.Value);
        Assert.Contains("message", objectResult.Value.ToString());
    }

    [Fact]
    public async Task AddToChannel_ReturnsBadRequest_WhenTeamIsNotFound() {
        // Arrange
       _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.TeamMemberships.AddRange(new List<TeamMembership> {
            new TeamMembership {Id = 1, created_at = DateTime.Now, user_id = 1, team_id = 1},
            new TeamMembership {Id = 2, created_at = DateTime.Now, user_id = 2, team_id = 2},
            new TeamMembership {Id = 3, created_at = DateTime.Now, user_id = 3, team_id = 1},
            new TeamMembership {Id = 4, created_at = DateTime.Now, user_id = 4, team_id = 2}
        });

        _context.ChannelMemberships.AddRange(new List<ChannelMembership> {
            new ChannelMembership {id = 1, created_at = DateTime.Now, user_id = 1, channel_id = 1},
            new ChannelMembership {id = 2, created_at = DateTime.Now, user_id = 3, channel_id = 1},
            new ChannelMembership {id = 3, created_at = DateTime.Now, user_id = 2, channel_id = 2}
        });

        _context.Teams.AddRange(new List<Team> {new Team {team_id = 2, team_name = "The Forum"}});

        _context.Channels.AddRange(new List<Channel> {
            new Channel {id = 1, channel_name = "Talk", team_id = 1, is_public = false, owner_id = 3},
            new Channel {id = 2, channel_name = "Talk2", team_id = 2, is_public = true, owner_id = 2}
        });

        await _context.SaveChangesAsync();

        // Act
        var objectResult = Assert.IsType<BadRequestObjectResult>(await _controller.AddToChannel(new AddToChannelRequest {team_id = 1, channel_id = 1, users_to_add = new List<string> {"Edward"}, users_to_delete = new List<string> {"John"}}));

        // Assert
        Assert.NotNull(objectResult.Value as dynamic);
        Assert.Equal("Team not found", (objectResult.Value as dynamic)!.error);
    }

    [Fact]
    public async Task AddToChannel_ReturnsBadRequest_WhenChannelIsNotFound() {
        // Arrange
       _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.TeamMemberships.AddRange(new List<TeamMembership> {
            new TeamMembership {Id = 1, created_at = DateTime.Now, user_id = 1, team_id = 1},
            new TeamMembership {Id = 2, created_at = DateTime.Now, user_id = 2, team_id = 2},
            new TeamMembership {Id = 3, created_at = DateTime.Now, user_id = 3, team_id = 1},
            new TeamMembership {Id = 4, created_at = DateTime.Now, user_id = 4, team_id = 2}
        });

        _context.ChannelMemberships.AddRange(new List<ChannelMembership> {
            new ChannelMembership {id = 1, created_at = DateTime.Now, user_id = 1, channel_id = 1},
            new ChannelMembership {id = 2, created_at = DateTime.Now, user_id = 3, channel_id = 1},
            new ChannelMembership {id = 3, created_at = DateTime.Now, user_id = 2, channel_id = 2}
        });

        _context.Teams.AddRange(new List<Team> {
            new Team {team_id = 1, team_name = "Test Team"},
            new Team {team_id = 2, team_name = "The Forum"}
        });

        _context.Channels.AddRange(new List<Channel> {new Channel {id = 2, channel_name = "Talk2", team_id = 2, is_public = true, owner_id = 2}});

        await _context.SaveChangesAsync();

        // Act
        var objectResult = Assert.IsType<BadRequestObjectResult>(await _controller.AddToChannel(new AddToChannelRequest {team_id = 1, channel_id = 1, users_to_add = new List<string> {"Edward"}, users_to_delete = new List<string> {"John"}}));

        // Assert
        Assert.NotNull(objectResult.Value as dynamic);
        Assert.Equal("Channel not found", (objectResult.Value as dynamic)!.error);
    }

    [Fact]
    public async Task AddToChannel_ReturnsBadRequest_WhenUserToAddIsNotFound() {
        // Arrange
        _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.TeamMemberships.AddRange(new List<TeamMembership> {
            new TeamMembership {Id = 1, created_at = DateTime.Now, user_id = 1, team_id = 1},
            new TeamMembership {Id = 2, created_at = DateTime.Now, user_id = 2, team_id = 1},
            new TeamMembership {Id = 3, created_at = DateTime.Now, user_id = 3, team_id = 1},
            new TeamMembership {Id = 4, created_at = DateTime.Now, user_id = 4, team_id = 2}
        });

        _context.ChannelMemberships.AddRange(new List<ChannelMembership> {
            new ChannelMembership {id = 1, created_at = DateTime.Now, user_id = 1, channel_id = 1},
            new ChannelMembership {id = 2, created_at = DateTime.Now, user_id = 3, channel_id = 1},
            new ChannelMembership {id = 3, created_at = DateTime.Now, user_id = 2, channel_id = 2}
        });

        _context.Teams.AddRange(new List<Team> {
            new Team {team_id = 1, team_name = "Test Team"},
            new Team {team_id = 2, team_name = "The Forum"}
        });

        _context.Channels.AddRange(new List<Channel> {
            new Channel {id = 1, channel_name = "Talk", team_id = 1, is_public = false, owner_id = 3},
            new Channel {id = 2, channel_name = "Talk2", team_id = 2, is_public = true, owner_id = 2}
        });

        await _context.SaveChangesAsync();

        // Act
        var objectResult = Assert.IsType<BadRequestObjectResult>(await _controller.AddToChannel(new AddToChannelRequest {team_id = 1, channel_id = 1, users_to_add = new List<string> {"Edward"}, users_to_delete = new List<string> {"John"}}));

        // Assert
        Assert.NotNull(objectResult.Value as dynamic);
        Assert.Equal("Edward not found", (objectResult.Value as dynamic)!.error);
    }

    [Fact]
    public async Task AddToChannel_ReturnsBadRequest_WhenUserToAddIsNotFoundInTeam() {
        // Arrange
        _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.TeamMemberships.AddRange(new List<TeamMembership> {
            new TeamMembership {Id = 1, created_at = DateTime.Now, user_id = 1, team_id = 1},
            new TeamMembership {Id = 2, created_at = DateTime.Now, user_id = 2, team_id = 2},
            new TeamMembership {Id = 3, created_at = DateTime.Now, user_id = 3, team_id = 1},
            new TeamMembership {Id = 4, created_at = DateTime.Now, user_id = 4, team_id = 2}
        });

        _context.ChannelMemberships.AddRange(new List<ChannelMembership> {
            new ChannelMembership {id = 1, created_at = DateTime.Now, user_id = 1, channel_id = 1},
            new ChannelMembership {id = 2, created_at = DateTime.Now, user_id = 3, channel_id = 1},
            new ChannelMembership {id = 3, created_at = DateTime.Now, user_id = 2, channel_id = 2}
        });

        _context.Teams.AddRange(new List<Team> {
            new Team {team_id = 1, team_name = "Test Team"},
            new Team {team_id = 2, team_name = "The Forum"}
        });

        _context.Channels.AddRange(new List<Channel> {
            new Channel {id = 1, channel_name = "Talk", team_id = 1, is_public = false, owner_id = 3},
            new Channel {id = 2, channel_name = "Talk2", team_id = 2, is_public = true, owner_id = 2}
        });

        await _context.SaveChangesAsync();

        // Act
        var objectResult = Assert.IsType<BadRequestObjectResult>(await _controller.AddToChannel(new AddToChannelRequest {team_id = 1, channel_id = 1, users_to_add = new List<string> {"Edward"}, users_to_delete = new List<string> {"John"}}));

        // Assert
        Assert.NotNull(objectResult.Value as dynamic);
        Assert.Equal("Edward not found in team", (objectResult.Value as dynamic)!.error);
    }

    [Fact]
    public async Task AddToChannel_ReturnsBadRequest_WhenUserToDeleteIsNotFoundInTeam() {
        // Arrange
        _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.TeamMemberships.AddRange(new List<TeamMembership> {
            new TeamMembership {Id = 2, created_at = DateTime.Now, user_id = 2, team_id = 1},
            new TeamMembership {Id = 3, created_at = DateTime.Now, user_id = 3, team_id = 1},
            new TeamMembership {Id = 4, created_at = DateTime.Now, user_id = 4, team_id = 2}
        });

        _context.ChannelMemberships.AddRange(new List<ChannelMembership> {
            new ChannelMembership {id = 1, created_at = DateTime.Now, user_id = 1, channel_id = 1},
            new ChannelMembership {id = 2, created_at = DateTime.Now, user_id = 3, channel_id = 1},
            new ChannelMembership {id = 3, created_at = DateTime.Now, user_id = 2, channel_id = 2}
        });

        _context.Teams.AddRange(new List<Team> {
            new Team {team_id = 1, team_name = "Test Team"},
            new Team {team_id = 2, team_name = "The Forum"}
        });

        _context.Channels.AddRange(new List<Channel> {
            new Channel {id = 1, channel_name = "Talk", team_id = 1, is_public = false, owner_id = 3},
            new Channel {id = 2, channel_name = "Talk2", team_id = 2, is_public = true, owner_id = 2}
        });

        await _context.SaveChangesAsync();

        // Act
        var objectResult = Assert.IsType<BadRequestObjectResult>(await _controller.AddToChannel(new AddToChannelRequest {team_id = 1, channel_id = 1, users_to_add = new List<string> {"Edward"}, users_to_delete = new List<string> {"John"}}));

        // Assert
        Assert.NotNull(objectResult.Value as dynamic);
        Assert.Equal("John not found in team", (objectResult.Value as dynamic)!.error);
    }

    [Fact]
    public async Task LeaveChannel_ReturnsStatusCode201() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};

        _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.ChannelMemberships.AddRange(new List<ChannelMembership> {
            new ChannelMembership {id = 1, created_at = DateTime.Now, user_id = 1, channel_id = 1},
            new ChannelMembership {id = 2, created_at = DateTime.Now, user_id = 3, channel_id = 1},
            new ChannelMembership {id = 3, created_at = DateTime.Now, user_id = 2, channel_id = 1}
        });

        _context.Channels.AddRange(new List<Channel> {
            new Channel {id = 1, channel_name = "Talk", team_id = 1, is_public = false, owner_id = 3},
            new Channel {id = 2, channel_name = "Talk2", team_id = 2, is_public = true, owner_id = 2}
        });

        await _context.SaveChangesAsync();

        // Act
        var objectResult = Assert.IsType<ObjectResult>(await _controller.LeaveChannel(1));

        // Assert
        Assert.Equal(await _context.ChannelMemberships.Where(m => m.channel_id == 1).Select(m => m.id).ToListAsync(), new List<int> {2, 3});
        Assert.Equal(201, objectResult.StatusCode);
        Assert.NotNull(objectResult.Value);
        Assert.Contains("message", objectResult.Value.ToString());
    }

    [Fact]
    public async Task LeaveChannel_ReturnsBadRequest_WhenChannelIsNotFound() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};

        _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.ChannelMemberships.AddRange(new List<ChannelMembership> {
            new ChannelMembership {id = 1, created_at = DateTime.Now, user_id = 1, channel_id = 1},
            new ChannelMembership {id = 2, created_at = DateTime.Now, user_id = 3, channel_id = 1},
            new ChannelMembership {id = 3, created_at = DateTime.Now, user_id = 2, channel_id = 1}
        });

        _context.Channels.AddRange(new List<Channel> {new Channel {id = 2, channel_name = "Talk2", team_id = 2, is_public = true, owner_id = 2}});

        await _context.SaveChangesAsync();

        // Act
        var objectResult = Assert.IsType<BadRequestObjectResult>(await _controller.LeaveChannel(1));

        // Assert
        Assert.NotNull(objectResult.Value as dynamic);
        Assert.Equal("Channel not found", (objectResult.Value as dynamic)!.error);
    }

    [Fact]
    public async Task LeaveChannel_ReturnsBadRequest_WhenChannelMembershipIsNotFound() {
        // Arrange
        _controller.ControllerContext = new ControllerContext {HttpContext = new DefaultHttpContext {User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "John")], "mock"))}};

        _context.Users.AddRange(new List<User> {
            new User {user_id = 1, username = "John", isAdmin = false},
            new User {user_id = 2, username = "Edward", isAdmin = false},
            new User {user_id = 3, username = "Alicia", isAdmin = false},
            new User {user_id = 4, username = "Cynthia", isAdmin = false}
        });

        _context.ChannelMemberships.AddRange(new List<ChannelMembership> {
            new ChannelMembership {id = 2, created_at = DateTime.Now, user_id = 3, channel_id = 1},
            new ChannelMembership {id = 3, created_at = DateTime.Now, user_id = 2, channel_id = 1}
        });

        _context.Channels.AddRange(new List<Channel> {
            new Channel {id = 1, channel_name = "Talk", team_id = 1, is_public = false, owner_id = 3},
            new Channel {id = 2, channel_name = "Talk2", team_id = 2, is_public = true, owner_id = 2}
        });

        await _context.SaveChangesAsync();

        // Act
        var objectResult = Assert.IsType<BadRequestObjectResult>(await _controller.LeaveChannel(1));

        // Assert
        Assert.NotNull(objectResult.Value as dynamic);
        Assert.Equal("User not in channel", (objectResult.Value as dynamic)!.error);
    }
}