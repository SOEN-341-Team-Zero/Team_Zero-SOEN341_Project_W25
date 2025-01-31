using System.ComponentModel.DataAnnotations;

namespace ChatHaven.Models
{
    public class User
    {
        public enum Roles
        {
            Member,
            Admin
        }

        [Key] // Primary key (Optional, EF assumes Id as PK)
        public int Id { get; set; }

        [Required]
        [StringLength(25, MinimumLength = 1)] // Username length
        public string Username { get; set; } = string.Empty;

        [Required]
        public Roles Role { get; set; }

        [Required]
        [StringLength(254, MinimumLength = 5)] // Email constraints
        public string EmailAddress { get; set; } = string.Empty;

        [Required]
        [StringLength(25, MinimumLength = 1)] // Password length
        public string Password { get; set; } = string.Empty;
    }
}
