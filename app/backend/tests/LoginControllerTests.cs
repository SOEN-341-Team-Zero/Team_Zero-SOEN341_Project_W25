using Xunit;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Controllers;
using ChatHaven.Data;
using Moq;
using System.Threading.Tasks;

public class LoginControllerTests
{
    private readonly Mock<ApplicationDbContext> _mockContext;
    private readonly LoginController _controller;

    public LoginControllerTests()
    {
        _mockContext = new Mock<ApplicationDbContext>();
        _controller = new LoginController(_mockContext.Object);
    }

    [Fact]
    public void Index_ReturnsRedirectResult()
    {
        // Act
        var result = _controller.Index();

        // Assert
        var redirectResult = Assert.IsType<RedirectResult>(result);
        Assert.Equal("/login", redirectResult.Url);
    }

    [Fact]
    public void Options_ReturnsOkResult()
    {
        // Act
        var result = _controller.Options();

        // Assert
        Assert.IsType<OkResult>(result);
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
}
