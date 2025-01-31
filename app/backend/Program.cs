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

// Add database context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Enable CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:3001", "http://localhost:5175", "http://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your_super_secret_key")) // Change this eventually
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

app.UseRouting();

// Enable CORS before authentication
app.UseCors("AllowFrontend");

app.UseAuthentication(); // Corrected method name
app.UseAuthorization();

app.MapControllers();

// Serve React App for non-API routes
app.UseSpa(spa =>
{
    spa.Options.SourcePath = "wwwroot"; // Adjust if needed

    if (app.Environment.IsDevelopment())
    {
        spa.UseProxyToSpaDevelopmentServer("http://localhost:3000"); // Adjust if needed
    }
});

app.Run();