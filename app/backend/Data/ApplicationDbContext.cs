using Microsoft.EntityFrameworkCore;
using ChatHaven.Models;
using ChannelModel.Models;
using TeamModel.Models;
using UserModel.Models;

namespace ChatHaven.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Channel> Channels { get; set; }
        public DbSet<Team> Teams { get; set; }
    }
}