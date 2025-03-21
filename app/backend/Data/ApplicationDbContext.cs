using Microsoft.EntityFrameworkCore;
using ChatHaven.Models;
using Npgsql;

namespace ChatHaven.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    /* protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) {
         var connectionString = "User Id=postgres.jlhviztmroqdukbrhkll;Password=soen341teamzero;Server=aws-0-us-west-1.pooler.supabase.com;Port=5432;Database=postgres;";
         var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
         dataSourceBuilder.EnableUnmappedTypes();
         var dataSource = dataSourceBuilder.Build();

         optionsBuilder.UseNpgsql(dataSource);
         optionsBuilder.EnableSensitiveDataLogging();
     }*/

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

    public DbSet<Request> Requests { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        /*modelBuilder.HasPostgresEnum<Activity>("Activity");
        modelBuilder.HasPostgresEnum<ChannelVisibility>("channel_visibility");*/
    }
}