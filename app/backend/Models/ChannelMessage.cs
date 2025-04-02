using System;
using System.ComponentModel.DataAnnotations;


namespace ChatHaven.Models
{
    public class ChannelMessage
    {
        [Required]
        [Key] // Primary
        public int message_id { get; set; }
        [Required]
        [Range(1, int.MaxValue)] // Minimum sender ID
        public int sender_id { get; set; }
        [Required]
        [Range(1, int.MaxValue)] // Minimum channel ID
        public int channel_id { get; set; }
        [Required]
        [StringLength(10000, MinimumLength = 1)] // Minimum and maximum message length
        public required string message_content { get; set; }
        [Required]
        public DateTime sent_at { get; set; }
        public int? reply_to_id { get; internal set; }
        public string[]? reactions { get; set; }
        public int[]? reaction_users { get; set; }

        public string? audioURL{get;set;}
    }
}