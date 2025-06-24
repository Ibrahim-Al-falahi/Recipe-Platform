using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RecipePlatform.Models.RecipeModule
{
    public class Category:BaseEntity
    {
        [Required]
        public string Name { get; set; }

        public ICollection<Recipe> Recipes { get; set; } = new HashSet<Recipe>();
    }
}
