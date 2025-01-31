using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Data;
using ChatHaven.Models;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;


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
        return Redirect("/login");
    }

    [HttpGet("validate")]
    public async Task<IActionResult> Validate([FromQuery] string username, [FromQuery] string password)
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
            Role = Models.User.Roles.Member
        };
        if (!ModelState.IsValid) // Ensure validity
        {
            return BadRequest(new { error = "Invalid input", details = ModelState });
        }
        // Retrieve the user from the database

        var userFound = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (userFound == null || userFound.Password != password)
        {

            return Unauthorized(new { error = "Invalid username or password" });
        }
        if (userFound.Username == username && userFound.Password == password)
        {
            var token = GenerateJwtToken(userFound.Username);
            return Ok(new { token });
        }

        return Ok(new { message = "Credentials validated successfully", username = username, emailaddress = userFound.EmailAddress, role = userFound.Role, id = userFound.Id });
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
    private string GenerateJwtToken(string username)
    {
        var claims = new[]
        {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your_super_secret_key"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "yourdomain.com", //change
            audience: "yourdomain.com", //change
            claims: claims,
            expires: DateTime.Now.AddMinutes(30),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}