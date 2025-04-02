using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using ChatHaven.Models;
using System.Security.Claims;

namespace ChatHaven.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StoryController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly Supabase.Client _supabaseClient;

    public StoryController(ApplicationDbContext context, Supabase.Client supabaseClient)
    {
        _context = context;
        _supabaseClient = supabaseClient;
    }

    [HttpGet("stories")]
    [Authorize]
    public async Task<IActionResult> GetStories()
    {
        var stories = await _context.Stories.ToListAsync();
        return Ok(new { status = "success", stories });
    }

    [HttpPost("upload")]
    [Authorize]
    public async Task<IActionResult> CreateStory([FromForm] StoryCreationRequest req)
    {

        if (req.file == null || req.file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }


        var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var user = await _context.Users.FirstOrDefaultAsync(u => u.username == username);
        if (user == null)
        {
            return Unauthorized("User not found.");
        }
        const long maxFileSize = 12 * 1024 * 1024; // 12 MB in bytes
        if (req.file.Length > maxFileSize)
        {
            return BadRequest("File size exceeds the 12 MB limit.");
        }


        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mov", ".avi", ".mkv" };
        var fileExtension = Path.GetExtension(req.file.FileName).ToLower();

        if (!allowedExtensions.Contains(fileExtension))
        {
            return BadRequest("Invalid file type. Only images and videos are allowed.");
        }

        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(req.file.FileName);
        var filePath = Path.Combine(Path.GetTempPath(), fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await req.file.CopyToAsync(stream);
        }

        await _supabaseClient.Storage
          .From("chat-haven-stories")
          .Upload(filePath, fileName, new Supabase.Storage.FileOptions { CacheControl = "3600", Upsert = false });

        System.IO.File.Delete(filePath);

        var fileType = allowedExtensions.Take(4).Contains(fileExtension) ? "image" : "video";

        var story = new Story
        {
            user_id = user.user_id,
            username = user.username,
            file_type = fileType,
            url = _supabaseClient.Storage.From("chat-haven-stories").GetPublicUrl(fileName).ToString(),
            created_at = DateTime.UtcNow
        };

        _context.Stories.Add(story);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Story created successfully", story });
    }
}