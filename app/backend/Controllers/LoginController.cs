using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Models;

namespace ChatHaven.Controllers;

public class LoginController : Controller
{
    [HttpGet("index")]
    public IActionResult Index()
    {
        return Ok(new { message = "Index endpoint reached." });
    }

    [HttpGet("validate")]
    public IActionResult Validate([FromQuery] string username, [FromQuery] string password) // Check if username is already in use
    {
        var user = new User
        {
            Username = username,
            Password = password,
            EmailAddress = username + "@" + "concordia.ca",
            Role = User.Role.Member
        };
        if (!ModelState.IsValid) // Ensure validity
        {
            return BadRequest(new { error = "Invalid input", details = ModelState });
        }
        return Ok(new { message = "Credentials validated successfully", username = username, emailaddress = user.EmailAddress, role = user.Role });
    }
    
    [HttpGet("privacy")]
    public IActionResult Privacy()
    {
        return Ok(new { message = "Privacy endpoint reached." });
    }

    [HttpGet("error")]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return Ok(new { error = "An error occurred.", requestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}