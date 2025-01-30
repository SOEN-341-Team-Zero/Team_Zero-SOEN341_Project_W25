using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class APIController : ControllerBase
{
    [HttpGet]
    public IActionResult GetData()
    {
        return Ok(new { message = "Hello from .NET Core API!" });
    }
}