using Xunit;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Controllers;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using ChatHaven.Models;
using System.Security.Claims;

public class UserControllerTests
{
    private readonly ApplicationDbContext _context;
    private readonly UserController _controller;

    public UserControllerTests() {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()).ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning)).Options;
        _context = new ApplicationDbContext(options);
        _controller = new UserController(_context);
    }

    [Fact]
    public async Task RetrieveAllUsers_ReturnsUsers()
    {
        // Arrange
        _context.Users.AddRange(
            new User {user_id = 1, username = "John", isAdmin = true, password = "John", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now},
            new User {user_id = 2, username = "Edward", isAdmin = true, password = "Edward", Activity = UserActivity.Online.ToString(), last_seen = DateTime.Now}
        );
        await _context.SaveChangesAsync();

        // Act
        var result = Assert.IsType<OkObjectResult>(await _controller.RetrieveAllUsers());

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(((dynamic) result).Value);
        Assert.Equal(new List<int> {1, 2}, (((dynamic) result!)!.Value! as IEnumerable<dynamic>).Select(u => (int) u.user_id).ToList());
    }
}