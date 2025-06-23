using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RecipePlatform.BLL.DTOs;
using RecipePlatform.Models.RecipeModule;

namespace RecipePlatform.BLL.Interfaces
{
    public interface IRecipeService
    {
        Task<IEnumerable<RecipeDto>> GetAllRecipesAsync();
        Task<RecipeDto> GetRecipeByIdAsync(int id);
        Task AddRecipeAsync(Recipe recipe);
    }
}
