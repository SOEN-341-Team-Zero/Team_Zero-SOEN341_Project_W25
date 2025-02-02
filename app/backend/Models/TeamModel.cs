using System;
using System.ComponentModel.DataAnnotations;
using ChatHaven.Models;



namespace ChatHaven.Models
{
    public class Team
    {
        [Required]
        [Key] // Primary
        public int team_id { get; set; }
        [Required]
        [StringLength(25)] // Max team name length
        public required string team_name { get; set; }
        //[Required]
        //public required List<User> Users { get; set; }
        //[Required]
        //public required List<Channel> Channels { get; set; }
    }
}