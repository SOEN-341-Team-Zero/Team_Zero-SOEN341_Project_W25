using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ChatHaven.Models;
using UserModel.Models;
using System.Threading.Channels;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;

namespace ChatHaven.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AssignUsersToChannelsController : ControllerBase
{
    [HttpGet("index")]
    public IActionResult Index()
    {
        return Ok(new { message = "Index endpoint reached." });
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
