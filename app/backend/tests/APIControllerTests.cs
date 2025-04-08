using Xunit;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Controllers;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using ChatHaven.Models;

public class APIControllerTests
{
    private readonly APIController _controller;

    public APIControllerTests() {_controller = new APIController();}

    public async Task GetData_ReturnsOkResult() {
        // Act
        var result = _controller.GetData();

        // Assert
        var okObjectResult = Assert.IsType<OkObjectResult>(result);
        var okResult = Assert.IsType<OkResult>(okObjectResult.Value);
        Assert.Equal("Hello from .NET Core API!", okResult.ToString());
    }
}