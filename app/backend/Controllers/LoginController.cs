using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Models;
using UserModel.Models;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;

namespace ChatHaven.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoginController : Controller
{
    private readonly ApplicationDbContext _context;

    public LoginController(ApplicationDbContext context)
    {
        _context = context;
    }
    [HttpGet("index")]
    public IActionResult Index()
    {
        return Ok(new { message = "Index endpoint reached." });
    }

    [HttpGet("validate")]
    public async Task<IActionResult> Validate([FromQuery] string username, [FromQuery] string password) // Check if username and password are correct
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
                return BadRequest(new { error = "Username and password are required" });
        }
        var user = new User
        {
            Id = 1,
            Username = username,
            Password = password,
            EmailAddress = username + "@" + "concordia.ca",
            Role = UserModel.Models.User.Roles.Member
        };
        if (!ModelState.IsValid) // Ensure validity
        {
            return BadRequest(new { error = "Invalid input", details = ModelState });
        }
        // Retrieve the user from the database
        /*
        var userFound = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (userFound == null || userFound.Password != password)
        {
            return Unauthorized(new { error = "Invalid username or password" });
        }
        */
        return Ok(new { message = "Credentials validated successfully", username = username, emailaddress = /*userFound.EmailAddress*/ user.EmailAddress, role = /*userFound.Role*/ user.Role, id = /*userFound.Id*/ 1});
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