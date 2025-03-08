using Microsoft.EntityFrameworkCore;
using ChatHaven.Models;

namespace ChatHaven.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Parameterless constructor
    public ApplicationDbContext() { }

    public DbSet<User> Users { get; set; }
    public DbSet<Channel> Channels { get; set; }
    public DbSet<Team> Teams { get; set; }
    public DbSet<ChannelMembership> ChannelMemberships { get; set; }
    public DbSet<TeamMembership> TeamMemberships { get; set; }
    public DbSet<ChannelMessage> ChannelMessages { get; set; }
    public DbSet<DirectMessage> DirectMessages { get; set; }
    public DbSet<DirectMessageChannel> DirectMessageChannels { get; set; }
}