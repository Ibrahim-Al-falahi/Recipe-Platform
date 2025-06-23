using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RecipePlatform.Models.RecipeModule;

namespace RecipePlatform.DAL.Interfaces
{
    public interface IUnitOfWork:IDisposable
    {
        IRecipeRepository Recipes { get; }
        IGenericRepository<Category> Categories { get; }
        Task<int> CompleteAsync();
    }
}
