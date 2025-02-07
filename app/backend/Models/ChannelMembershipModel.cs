using System.ComponentModel.DataAnnotations;

namespace ChatHaven.Models
{
    public class ChannelMembership
    {
        [Required]
        [Key] // Primary
        public int id { get; set; }
        [Required]
        public required DateTime created_at { get; set; }
        [Required]
        public required int user_id { get; set; }
        [Required]
        public required int channel_id { get; set; }
    }
}