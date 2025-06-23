using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RecipePlatform.DAL.Context;
using RecipePlatform.DAL.Interfaces;
using RecipePlatform.Models.RecipeModule;

namespace RecipePlatform.DAL.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        public IRecipeRepository Recipes { get; }

        public IGenericRepository<Category> Categories { get; }

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            Recipes = new RecipeRepository(context);
            Categories = new GenericRepository<Category>(context);
        }

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
