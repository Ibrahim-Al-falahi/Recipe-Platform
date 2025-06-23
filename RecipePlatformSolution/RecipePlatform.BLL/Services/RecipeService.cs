using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RecipePlatform.BLL.DTOs;
using RecipePlatform.BLL.Interfaces;
using RecipePlatform.DAL.Interfaces;
using RecipePlatform.Models.RecipeModule;

namespace RecipePlatform.BLL.Services
{
    public class RecipeService : IRecipeService
    {
        private readonly IUnitOfWork _unitOfWork;

        public RecipeService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task AddRecipeAsync(Recipe recipe)
        {
            await _unitOfWork.Recipes.AddAsync(recipe);
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteRecipeAsync(int id)
        {
            var recipe = await _unitOfWork.Recipes.GetByIdAsync(id);
            if (recipe == null) return;

            _unitOfWork.Recipes.Remove(recipe);
            await _unitOfWork.CompleteAsync();
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
        {
            var category = await _unitOfWork.Categories.GetAllAsync();
            return category.Select(c => new CategoryDto 
            {
                Id = c.Id,
                Name = c.Name,
            });
        }

        public async Task<IEnumerable<RecipeDto>> GetAllRecipesAsync()
        {
            var recipe= await _unitOfWork.Recipes.GetAllWithDetailsAsync();
            return recipe.Select(r=>new RecipeDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                Ingredients = r.Ingredients,
                Instructions = r.Instructions,
                PrepTimeMinutes = r.PrepTimeMinutes,
                CookTimeMinutes = r.CookTimeMinutes,
                TotalCookingTime= r.PrepTimeMinutes+ r.CookTimeMinutes,
                Servings = r.Servings,
                Difficulty = r.Difficulty,
                CategoryName=r.Category.Name,
                AverageRating=r.Ratings.Any()? r.Ratings.Average(x=>x.UserRating):0
            });
        }

        public async Task<RecipeDto> GetRecipeByIdAsync(int id)
        {
            var r = await _unitOfWork.Recipes.GetByIdWithDetailsAsync(id);

            if (r == null) return null;

            return new RecipeDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                Ingredients = r.Ingredients,
                Instructions = r.Instructions,
                PrepTimeMinutes = r.PrepTimeMinutes,
                CookTimeMinutes = r.CookTimeMinutes,
                TotalCookingTime = r.PrepTimeMinutes + r.CookTimeMinutes,
                Servings = r.Servings,
                Difficulty = r.Difficulty,
                CategoryName = r.Category.Name,
                AverageRating = r.Ratings.Any() ? r.Ratings.Average(x => x.UserRating) : 0
            };
        }

        public async Task UpdateRecipeAsync(Recipe recipe)
        {
            var existing = await _unitOfWork.Recipes.GetByIdAsync(recipe.Id);
            if (existing == null) return;

            existing.Title = recipe.Title;
            existing.Description = recipe.Description;
            existing.Ingredients = recipe.Ingredients;
            existing.Instructions = recipe.Instructions;
            existing.PrepTimeMinutes = recipe.PrepTimeMinutes;
            existing.CookTimeMinutes = recipe.CookTimeMinutes;
            existing.Servings = recipe.Servings;
            existing.CategoryId = recipe.CategoryId;
            existing.Difficulty = recipe.Difficulty;

            await _unitOfWork.CompleteAsync();
        }
    }
}
