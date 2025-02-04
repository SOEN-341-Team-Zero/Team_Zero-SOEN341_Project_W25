using System.ComponentModel.DataAnnotations;

namespace ChatHaven.Models
{
    public class User
    {

        [Key] // Primary key (Optional, EF assumes Id as PK)
        public int user_id { get; set; }

        [Required]
        [StringLength(25, MinimumLength = 1)] // Username length
        public string username { get; set; } = string.Empty;

        [Required]
        public Boolean isAdmin { get; set; }

        [Required]
        [StringLength(25, MinimumLength = 1)] // Password length
        public string password { get; set; } = string.Empty;

    }
}
