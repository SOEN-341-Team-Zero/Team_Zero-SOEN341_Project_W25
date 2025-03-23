using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using ChatHaven.Models;


namespace ChatHaven.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegisterController : Controller
{
    private readonly ApplicationDbContext _context;

    public RegisterController(ApplicationDbContext context)
    {
        _context = context;
    }
    [HttpGet("index")]
    public IActionResult Index()
    {
        return Redirect("/register");
    }

    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromBody] LoginRequest request)
    {
        Console.WriteLine(request.ToString());

        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            Console.WriteLine(request);
            return BadRequest(new { error = "Username and password are required!" });
        }

        if (!ModelState.IsValid) // Ensure validity
        {
            return BadRequest(new { error = "Invalid input", details = ModelState });
        }

        // Check if the user from the database
        var userFound = await _context.Users.FirstOrDefaultAsync(u => u.username == request.Username);
        if (userFound != null)
        {
            return BadRequest(new { error = "This username is already taken" });
        }

        User newUser = new User { username = request.Username, password = request.Password, isAdmin = request.isAdmin, Activity = UserActivity.Offline.ToString() };
        _context.Users.Add(newUser);
        try
        {
            Console.WriteLine("About to save changes...");
            _context.Database.SetCommandTimeout(30);
            _context.SaveChanges();

            TeamMembership membership = new TeamMembership
            {
                user_id = newUser.user_id,
                team_id = 0,
                created_at = DateTime.UtcNow
            };
            _context.TeamMemberships.Add(membership);
            _context.SaveChanges();

            Console.WriteLine("User saved successfully.");
            return Ok(new { message = "User registered successfully!" });
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error saving user: " + ex.Message);
            return StatusCode(500, new { error = "Internal server error", details = ex.Message });
        }
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
        // Ensure the error message is properly returned
        return Ok(new { error = "An error occurred." });
    }
}