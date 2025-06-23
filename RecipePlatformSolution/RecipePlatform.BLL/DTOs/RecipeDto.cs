using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RecipePlatform.Models.Enum;

namespace RecipePlatform.BLL.DTOs
{
    public class RecipeDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Ingredients { get; set; }
        public string Instructions { get; set; }
        public int PrepTimeMinutes { get; set; }
        public int CookTimeMinutes { get; set; }
        public int TotalCookingTime { get; set; }
        public int Servings { get; set; }
        public DifficultyLevel Difficulty { get; set; }
        public string CategoryName { get; set; }
        public decimal AverageRating { get; set; }
    }
}
