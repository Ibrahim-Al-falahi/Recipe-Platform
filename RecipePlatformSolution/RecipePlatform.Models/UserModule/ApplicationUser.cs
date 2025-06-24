using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using RecipePlatform.Models.RecipeModule;

namespace RecipePlatform.Models.UserModule
{
    public class ApplicationUser:IdentityUser
    {
        public string Name { get; set; }

        public ICollection<Rating> Ratings { get; set; } = new HashSet<Rating>();
        public ICollection<Recipe> Recipes { get; set; } = new HashSet<Recipe>();
    }
}
