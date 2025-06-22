using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RecipePlatform.Models.Enum;
using RecipePlatform.Models.UserModule;

namespace RecipePlatform.Models.RecipeModule
{
    public class Recipe:BaseEntity
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public string Ingredients { get; set; }
        [Required]
        public string Instructions { get; set; }
        [Required]
        public int PrepTimeMinutes { get; set; }
        [Required]
        public int CookTimeMinutes { get; set; }
        [Required]
        public int Servings { get; set; }
        [Required]
        public DifficultyLevel Difficulty { get; set; }

        // Navigation properties
        [ForeignKey(nameof(UserId))]
        public ApplicationUser User { get; set; }
        public string UserId { get; set; }

        [ForeignKey(nameof(CategoryId))]
        public Category Category { get; set; }
        public int CategoryId { get; set; }
        public ICollection<Rating> Ratings { get; set; } = new HashSet<Rating>();



    }
}
