using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Data;
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

    [HttpOptions("validate")]
    public IActionResult Options()
    {
        return Ok();
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

        if (!ModelState.IsValid)
        {
            return BadRequest(new { error = "Invalid input", details = ModelState });
        }

        var userFound = await _context.Users.FirstOrDefaultAsync(u => u.username == request.Username);
        if (userFound == null || userFound.password != request.Password)
        {
            return Unauthorized(new { error = "Invalid username or password" });
        }
        //set last_seen on login just in case we dont update activity
        userFound.last_seen = DateTime.UtcNow;
        _context.Users.Update(userFound);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(userFound.username, userFound.user_id);
        return Ok(new { token });
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
    private string GenerateJwtToken(string username, int userId)
    {
        var claims = new[]
        {
                new Claim(JwtRegisteredClaimNames.Sub, username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("userId", userId.ToString(), ClaimValueTypes.Integer32)
            };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET")));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "https://chathavenzero.vercel.app/", //change
            audience: "https://chathavenzero.vercel.app/", //change
            claims: claims,
            expires: DateTime.Now.AddMinutes(52560000),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}