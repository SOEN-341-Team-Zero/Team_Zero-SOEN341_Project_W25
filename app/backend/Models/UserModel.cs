using System;
using System.ComponentModel.DataAnnotations;

namespace UserModel.Models
{
    public class User
    {
        public enum Roles
        {
        Member,
        Admin
        }
        [Required]
        [Key] // Primary
        private int id {get; set; }
        [Required]
        [StringLength(25)] // Max username length
        public required string Username { get; set; }
        [Required]
        public required Roles Role { get; set; }
        [Required]
        [StringLength(254)] // Max email address length (set by RFC 5321 and SMTP constraints)
        public required string EmailAddress { get; set; }
        [Required]
        [StringLength(25)] // Max password length
        public required string Password { get; set; }
    }
}