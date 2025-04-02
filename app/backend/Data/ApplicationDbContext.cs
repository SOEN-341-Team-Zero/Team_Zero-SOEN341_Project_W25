using Microsoft.EntityFrameworkCore;
using ChatHaven.Models;

namespace ChatHaven.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) {}

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

    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<Channel> Channels { get; set; }
    public virtual DbSet<Team> Teams { get; set; }
    public virtual DbSet<ChannelMembership> ChannelMemberships { get; set; }
    public virtual DbSet<TeamMembership> TeamMemberships { get; set; }
    public virtual DbSet<ChannelMessage> ChannelMessages { get; set; }
    public virtual DbSet<DirectMessage> DirectMessages { get; set; }
    public virtual DbSet<DirectMessageChannel> DirectMessageChannels { get; set; }

    public DbSet<Request> Requests { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        /*modelBuilder.HasPostgresEnum<Activity>("Activity");
        modelBuilder.HasPostgresEnum<ChannelVisibility>("channel_visibility");*/
    }
}