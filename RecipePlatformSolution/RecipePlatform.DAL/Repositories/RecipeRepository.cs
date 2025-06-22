using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RecipePlatform.DAL.Context;
using RecipePlatform.DAL.Interfaces;
using RecipePlatform.Models.RecipeModule;

namespace RecipePlatform.DAL.Repositories
{
    public class RecipeRepository : GenericRepository<Recipe>, IRecipeRepository
    {
        private readonly ApplicationDbContext _context;

        public RecipeRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetAllCategories()
        {
            return await _context.Categories.ToListAsync();
        }

        public async Task<IEnumerable<Recipe>> GetAllWithCategory()
        {
            return await _context.Recipes.Include(x => x.Category).ToListAsync();
        }

        public async Task<Recipe> GetByIdWithCategory(int id)
        {
            return await _context.Recipes.Include(x=>x.Category).FirstOrDefaultAsync(x=>x.Id==id);
        }

        public async Task<bool> TodoListExists(int id)
        {
            return await _context.Recipes.AnyAsync(x=>x.Id==id);
        }
    }
}
