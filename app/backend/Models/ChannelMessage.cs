using System;
using System.ComponentModel.DataAnnotations;

namespace ChatHaven.Models
{
    public class ChannelMessage
    {
        [Key] // Primary key
        public int message_id { get; set; }

        [Required]
        public required int sender_id { get; set; }

        [Required]
        public required int channel_id { get; set; }

        [Required]
        public required string message_content { get; set; }

        [Required]
        public DateTime sent_at { get; set; } = DateTime.UtcNow;
    }
}
