using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RecipePlatform.Models.RecipeModule;

namespace RecipePlatform.DAL.Interfaces
{
    public interface IRecipeRepository:IGenericRepository<Recipe>
    {
        Task<IEnumerable<Recipe>> GetAllWithDetailsAsync();
        Task<Recipe> GetByIdWithDetailsAsync(int id);
    }
}
