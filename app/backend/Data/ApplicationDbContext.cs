using Microsoft.EntityFrameworkCore;
using ChatHaven.Models;

namespace ChatHaven.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Channel> Channels { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<ChannelMembership> ChannelMemberships { get; set; }
    public DbSet<TeamMembership> TeamMemberships { get; set; }
}