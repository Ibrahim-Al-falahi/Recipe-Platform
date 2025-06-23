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

        public async Task<IEnumerable<Recipe>> GetAllWithDetailsAsync()
        {
            return await _context.Recipes
            .Include(r => r.Category)
            .Include(r => r.Ratings)
            .ToListAsync();
        }

        public async Task<Recipe> GetByIdWithDetailsAsync(int id)
        {
            return await _context.Recipes
            .Include(r => r.Category)
            .Include(r => r.Ratings)
            .FirstOrDefaultAsync(r => r.Id == id);
        }
    }
}
