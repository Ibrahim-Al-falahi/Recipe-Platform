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
        Task<IEnumerable<Recipe>> GetAllWithCategory();
        Task<Recipe> GetByIdWithCategory(int id);
        Task<IEnumerable<Category>> GetAllCatagories();
        Task<bool> TodoListExists(int id);
    }
}
