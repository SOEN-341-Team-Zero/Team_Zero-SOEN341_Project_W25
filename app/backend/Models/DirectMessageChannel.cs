using System.ComponentModel.DataAnnotations;

namespace ChatHaven.Models
{
    public class DirectMessageChannel
    {
        [Required]
        [Key] // Primary
        public int dm_id { get; set; }
        [Required]
        [Range(1, int.MaxValue)] // Minimum sender ID
        public int user_id1 { get; set; }
        [Required]
        [Range(1, int.MaxValue)] // Minimum channel ID
        public int user_id2 { get; set; }
    }
}