using System.ComponentModel.DataAnnotations;

namespace ChatHaven.Models
{
    public class ChannelMembership
    {
        [Required]
        [Key] // Primary
        public int id { get; set; }
        [Required]
        [StringLength(25, MinimumLength = 1)]
        public required DateTime created_at { get; set; } // need to change to timestamp
        [Required]
        public required int user_id { get; set; }
        [Required]
        public required int channel_id { get; set; }
    }
}