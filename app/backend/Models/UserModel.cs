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
        public int user_id { get; set; }

        [Required]
        [StringLength(25, MinimumLength = 1)] // Username length
        public string username { get; set; } = string.Empty;

        [Required]
        public string role { get; set; }

        [Required]
        [StringLength(254, MinimumLength = 5)] // Email constraints
        public string email { get; set; } = string.Empty;

        [Required]
        [StringLength(25, MinimumLength = 1)] // Password length
        public string password { get; set; } = string.Empty;
    }
}
