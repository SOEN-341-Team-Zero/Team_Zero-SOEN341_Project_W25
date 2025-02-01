using System.ComponentModel.DataAnnotations;

namespace ChatHaven.Models
{
    public class Channel
    {
        [Required]
        [Key] // Primary
        public int id { get; set; }
        [Required]
        [StringLength(25)] // Max channel name length
        public required string channel_name { get; set; }
        [Required]
        public required int team_id { get; set; }
    }
}