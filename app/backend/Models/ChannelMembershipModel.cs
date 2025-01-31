using System.ComponentModel.DataAnnotations;

namespace ChatHaven.Models
{
    public class ChannelMembership
    {
        [Required]
        [Key] // Primary
        public int Id { get; set; }
        [Required]
        [StringLength(25, MinimumLength = 1)]
        public required string CreatedAt { get; set; } // need to change to timestamp
        [Required]
        public required int UserId { get; set; }
        [Required]
        public required int ChannelId { get; set; }
    }
}