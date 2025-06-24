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
    public class CategoryService:ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;

        public CategoryService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task AddCategoryAsync(Category category)
        {
            await _unitOfWork.Categories.AddAsync(category);
            await _unitOfWork.CompleteAsync();
        }

        public async Task DeleteCategoryAsync(int id)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id);
            if (category == null) return;
            
            _unitOfWork.Categories.Remove(category);
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

        public async Task<CategoryDto> GetCategoryByIdAsync(int id)
        {
            var c = await _unitOfWork.Categories.GetByIdAsync(id);
            if (c == null) return null;

            return new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
            };


        }

        public async Task UpdateCategoryAsync(Category category)
        {
            var existing = await _unitOfWork.Categories.GetByIdAsync(category.Id);
            if (existing == null) return;

            existing.Name = category.Name;

            await _unitOfWork.CompleteAsync();
        }
    }
}
