using ChatHaven.Data;
using Npgsql;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ChatHaven.Models;
using DotNetEnv;

// Load environment variables from .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddControllersWithViews();
builder.Services.AddSignalR(options =>
{
    options.MaximumReceiveMessageSize = 2 * 1024 * 1024; 
});


builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var dataSourceBuilder = new NpgsqlDataSourceBuilder(Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING"));
    dataSourceBuilder.EnableUnmappedTypes();
    options.UseNpgsql(Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING"));
});

// supabase link for stories
var supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL");
var supabaseKey = Environment.GetEnvironmentVariable("SUPABASE_KEY");
var supabaseOptions = new Supabase.SupabaseOptions
{
    AutoConnectRealtime = false
};
var supabase = new Supabase.Client(supabaseUrl, supabaseKey, supabaseOptions);

try
{
    await supabase.InitializeAsync();
    Console.WriteLine("Supabase client initialized successfully.");
}
catch (Exception ex)
{
    Console.WriteLine($"Error initializing Supabase client: {ex.Message}");
    Console.WriteLine($"Stack Trace: {ex.StackTrace}");
    throw; // Re-throw the exception to ensure it doesn't fail silently
}

builder.Services.AddSingleton(supabase);
// end supabase link for stories

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:8080", "http://localhost:3001", "http://localhost:5175", "http://localhost:3000", "http://localhost:5173", "https://chathavenzero.vercel.app", "https://preview-chathavenzero.vercel.app")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials());

});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "https://chathavenzero.vercel.app/", // Change this eventually
            ValidAudience = "https://chathavenzero.vercel.app/",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET")))
        };
    });

builder.Services.AddAuthorization();
var app = builder.Build();

Console.WriteLine("Application is ready to listen for requests.");

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://*:{port}");

builder.WebHost.UseUrls($"http://*:{port}");

app.UseCors("AllowFrontend");
app.UseRouting();

app.UseAuthentication(); // For JWT
app.UseAuthorization();

app.MapControllers();

app.MapHub<ChatHub>("/chat");
app.MapHub<DMHub>("/dm");

app.Run();