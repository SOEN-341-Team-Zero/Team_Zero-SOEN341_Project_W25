using System.ComponentModel.DataAnnotations;

namespace ChatHaven.Models
{
    public class TeamMembership
    {
        [Required]
        [Key] // Primary
        public int Id { get; set; }
        [Required]
        [StringLength(25, MinimumLength = 1)]
        public required DateTime CreatedAt { get; set; } // need to change to timestamp
        [Required]
        public required int UserId { get; set; }
        [Required]
        public required int TeamId { get; set; }
    }
}