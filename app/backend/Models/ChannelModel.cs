using System.ComponentModel.DataAnnotations;

namespace ChatHaven.Models
{
    public class Channel
    {
        [Required]
        [Key] // Primary
        public int Id { get; set; }
        [Required]
        [StringLength(25)] // Max channel name length
        public required string ChannelName { get; set; }
        [Required]
        public required List<User> Users { get; set; }
    }
}