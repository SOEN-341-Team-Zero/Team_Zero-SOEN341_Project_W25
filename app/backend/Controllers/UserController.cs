using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;

namespace ChatHaven.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UserController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("getallusers")]
    [Authorize]
    public async Task<IActionResult> RetrieveAllUsers()
    { // For adding to teams
        var users = await _context.Users.ToListAsync();
        return Ok(users);
    }

}
