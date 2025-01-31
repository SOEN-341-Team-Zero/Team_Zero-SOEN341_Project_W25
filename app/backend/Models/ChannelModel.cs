using System;
using System.ComponentModel.DataAnnotations;
using UserModel.Models;



namespace ChannelModel.Models
{
    public class Channel
    {
        [Key] // Primary
        public int Id { get; set; }
        [Required]
        [StringLength(25)] // Max channel name length
        public required string ChannelName { get; set; }
        [Required]
        public required List<User> Users { get; set; }
    }
}