using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatHaven.Models
{
    public enum UserActivity {
        Online,
        Away,
        Offline
    }
    public class User
    {

        [Key] // Primary key (Optional, EF assumes Id as PK)
        public int user_id { get; set; }

        [Required]
        [StringLength(25, MinimumLength = 1)] // Username length
        public string username { get; set; } = string.Empty;

        [Required]
        public bool isAdmin { get; set; }

        [Required]
        [StringLength(25, MinimumLength = 1)] // Password length
        public string password { get; set; } = string.Empty;

        [Column("Activity")]
        public string Activity { get; set; } = UserActivity.Offline.ToString();
        public DateTime? last_seen { get; internal set; }
    }
}
