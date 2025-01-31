using System;
using System.ComponentModel.DataAnnotations;
using ChatHaven.Models;



namespace ChatHaven.Models
{
    public class Team
    {
        [Required]
        [Key] // Primary
        public int Id { get; set; }
        [Required]
        [StringLength(25)] // Max team name length
        public required string TeamName { get; set; }
        [Required]
        public required List<User> Users { get; set; }
    }
}