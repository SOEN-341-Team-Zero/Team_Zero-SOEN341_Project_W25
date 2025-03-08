using System.ComponentModel.DataAnnotations;

namespace ChatHaven.Models
{
    public class DirectMessage
    {
        [Required]
        [Key] // Primary
        public int message_id { get; set; }
        [Required]
        [Range(1, int.MaxValue)] // Minimum sender ID
        public int sender_id { get; set; }
        [Required]
        [Range(1, int.MaxValue)] // Minimum channel ID
        public int receiver_id { get; set; }
        [Required]
        public DateTime sent_at { get; set; }
        [Required]
        [StringLength(10000, MinimumLength = 1)] // Minimum and maximum message length
        public required string message_content { get; set; }

        [Required]
        public int dm_id { get; set; }
    }
}