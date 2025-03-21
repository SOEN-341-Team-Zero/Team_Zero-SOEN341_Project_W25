using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

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

        [Required]
        public bool is_public { get; set; }

        public int owner_id { get; set; }
    }
}