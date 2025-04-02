using Xunit;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Controllers;
using ChatHaven.Data;
using Moq;
using ChatHaven.Models;
using Microsoft.EntityFrameworkCore;

public class RegisterControllerTests
{
    private readonly ApplicationDbContext _context;
    private readonly RegisterController _controller;

    public RegisterControllerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase")
            .Options;
        _context = new ApplicationDbContext(options);
        _controller = new RegisterController(_context);
    }

    [Fact]
    public void Index_ReturnsRedirectResult()
    {
        // Act
        var result = _controller.Index();

        // Assert
        var redirectResult = Assert.IsType<RedirectResult>(result);
        Assert.Equal("/register", redirectResult.Url);
    }

    [Fact]
    public async Task Validate_ReturnsBadRequest_WhenUsernameOrPasswordIsEmpty()
    {
        // Arrange
        var request = new LoginRequest { Username = "", Password = "" };

        // Act
        var result = await _controller.Validate(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Username and password are required!", ((dynamic)badRequestResult.Value).error);
    }

    [Fact]
    public async Task Validate_ReturnsBadRequest_WhenUsernameIsTaken()
    {
        // Arrange
        var request = new LoginRequest { Username = "existingUser", Password = "password" };
        _context.Users.Add(new User { username = "existingUser" });
        await _context.SaveChangesAsync();

        // Act
        var result = await _controller.Validate(request);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("This username is already taken", ((dynamic)badRequestResult.Value).error);
    }

    [Fact]
    public void Privacy_ReturnsOkResult()
    {
        // Act
        var result = _controller.Privacy();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Privacy endpoint reached.", ((dynamic)okResult.Value).message);
    }

    [Fact]
    public void Error_ReturnsOkResult()
    {
        // Act
        var result = _controller.Error();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("An error occurred.", ((dynamic)okResult.Value).error);
    }
}
