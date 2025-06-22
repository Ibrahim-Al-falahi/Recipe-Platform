using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RecipePlatform.Models.UserModule;

namespace RecipePlatform.Models.RecipeModule
{
    public class Rating:BaseEntity
    {
        [Range(1,5)]
        public decimal UserRating { get; set; }

        [ForeignKey(nameof(UserId))]
        public ApplicationUser User { get; set; }
        public string UserId { get; set; }

        [ForeignKey(nameof(RecipeId))]
        public Recipe Recipe { get; set; }
        public string RecipeId { get; set; }
    }
}
