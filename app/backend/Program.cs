using ChatHaven.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.SpaServices.Extensions;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddControllersWithViews();
builder.Services.AddSignalR();
// Add database context

builder.Services.AddDbContext<ApplicationDbContext>(options =>
   options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Enable CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:3001", "http://localhost:5175", "http://localhost:3000", "http://localhost:5173", "https://chathavenzero.vercel.app")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()); // Allow credentials (cookies, headers)

});

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "yourdomain.com", // Change this eventually
            ValidAudience = "yourdomain.com",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("b5b4b36131cb788d80a377ca153e162a7ebab86b04145d7ecd6f0b7f49dad52ebc473872fa268bf1b671bb7692572ebd6c0ab9a187506873b16952920399e9d38ad882b82d743cfab92cd2db80d1a1a092b43af53d61d6ed9da94b8fd15418100b6ccbe11dcd70c5aa1979b188fa2016d81afff32ebe52ed78fcb22e0916279a97562056a95b4883a5276401f4c6e6bcea335422156362ca0fd195b89bbee9d636a072ff2a86a070a49f7ae2f469f7b337a2813e80c95fa25c085c712cbe4cedd7eb87ae1b4b84e97b676781f4c842a43654832cec9e8cca401ab9bff8cf9dae5ba206d949182d64deefa3aacf7e6cfc6d6d98cf7402b7cadb8448f14dfbc775"))
        };
    });

builder.Services.AddAuthorization();

// Serve React Frontend
builder.Services.AddSpaStaticFiles(configuration =>
{
    configuration.RootPath = "wwwroot"; // Adjust if needed
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseSpaStaticFiles(); // Add this line to serve SPA static files

// Get Railway-assigned PORT or default to 3000
var port = Environment.GetEnvironmentVariable("PORT") ?? "3001";

app.Urls.Add($"http://*:{port}");

// Enable CORS before authentication
app.UseCors("AllowFrontend");
app.UseRouting();

app.UseAuthentication(); // For JWT
app.UseAuthorization();

app.MapControllers();

app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<ChatHub>("/chat");
    endpoints.MapHub<DMHub>("/dm");
});

// Serve React App for non-API routes
var excludedPaths = new PathString[] { "/api" };
app.UseWhen(ctx =>
{
    var path = ctx.Request.Path;
    return !Array.Exists(excludedPaths, excluded => path.StartsWithSegments(excluded, StringComparison.OrdinalIgnoreCase));
}, then =>
{
    then.UseSpa(spa =>
    {
        spa.Options.SourcePath = "wwwroot"; // Adjust if needed

        if (app.Environment.IsDevelopment())
        {
            spa.UseProxyToSpaDevelopmentServer("http://localhost:5173"); // Ensure this matches your Vite dev server port
        }
    });
});

app.Run();