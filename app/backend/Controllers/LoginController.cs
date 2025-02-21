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

        if (!ModelState.IsValid) // Ensure validity
        {
            return BadRequest(new { error = "Invalid input", details = ModelState });
        }

        // Retrieve the user from the database
        var userFound = await _context.Users.FirstOrDefaultAsync(u => u.username == request.Username);
        if (userFound == null || userFound.password != request.Password)
        {
            return Unauthorized(new { error = "Invalid username or password" });
        }

        // Generate JWT token on successful login
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
        // to-do : ADD ENV VARIABLES.
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("b5b4b36131cb788d80a377ca153e162a7ebab86b04145d7ecd6f0b7f49dad52ebc473872fa268bf1b671bb7692572ebd6c0ab9a187506873b16952920399e9d38ad882b82d743cfab92cd2db80d1a1a092b43af53d61d6ed9da94b8fd15418100b6ccbe11dcd70c5aa1979b188fa2016d81afff32ebe52ed78fcb22e0916279a97562056a95b4883a5276401f4c6e6bcea335422156362ca0fd195b89bbee9d636a072ff2a86a070a49f7ae2f469f7b337a2813e80c95fa25c085c712cbe4cedd7eb87ae1b4b84e97b676781f4c842a43654832cec9e8cca401ab9bff8cf9dae5ba206d949182d64deefa3aacf7e6cfc6d6d98cf7402b7cadb8448f14dfbc775"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "https://chathavenzero.vercel.app/", //change
            audience: "https://chathavenzero.vercel.app/", //change
            claims: claims,
            expires: DateTime.Now.AddMinutes(60),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}