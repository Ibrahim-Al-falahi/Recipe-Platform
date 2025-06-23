using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using RecipePlatform.BLL.Interfaces;
using RecipePlatform.DAL.Context;
using RecipePlatform.Models.RecipeModule;

namespace RecipePlatform.MVC.Controllers
{
    public class RecipeController : Controller
    {
        private readonly IRecipeService _recipeService;

        public RecipeController(IRecipeService recipeService)
        {
            _recipeService = recipeService;
        }

        // GET: Recipe
        public async Task<IActionResult> Index()
        {
            var recipes = await _recipeService.GetAllRecipesAsync();
            return View(recipes);
        }

        // GET: Recipe/Details/5
        public async Task<IActionResult> Details(int id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var recipe = await _recipeService.GetRecipeByIdAsync(id);
            if (recipe == null)
                return NotFound();

            return View(recipe);
        }

        // GET: Recipe/Create
        public async Task<IActionResult> Create()
        {
            ViewData["CategoryId"] = new SelectList(await _recipeService.GetAllCategoriesAsync(), "Id", "Name");
            //ViewData["UserId"] = new SelectList(_context.ApplicationUsers, "Id", "Id");
            return View();
        }

        // POST: Recipe/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        //[ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Recipe recipe)
        {
            if (ModelState.IsValid)
            {
                await _recipeService.AddRecipeAsync(recipe);
                return RedirectToAction(nameof(Index));
            }
            ViewData["CategoryId"] = new SelectList(await _recipeService.GetAllCategoriesAsync(), "Id", "Name", recipe.CategoryId);
            //ViewData["UserId"] = new SelectList(_context.ApplicationUsers, "Id", "Id", recipe.UserId);
            return View(recipe);
        }

        // GET: Recipe/Edit/5
        public async Task<IActionResult> Edit(int id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var recipe = await _recipeService.GetRecipeByIdAsync(id);
            if (recipe == null)
            {
                return NotFound();
            }

            var fullRecipe = new Recipe
            {
                Id = recipe.Id,
                Title = recipe.Title,
                Description = recipe.Description,
                Ingredients = recipe.Ingredients,
                Instructions = recipe.Instructions,
                PrepTimeMinutes = recipe.PrepTimeMinutes,
                CookTimeMinutes = recipe.CookTimeMinutes,
                Servings = recipe.Servings,
                Difficulty = recipe.Difficulty,                
            };

            ViewData["CategoryId"] = new SelectList(await _recipeService.GetAllCategoriesAsync(), "Id", "Name", fullRecipe.CategoryId);
            //ViewData["UserId"] = new SelectList(_context.ApplicationUsers, "Id", "Id", recipe.UserId);
            return View(recipe);
        }

        // POST: Recipe/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        //[ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Recipe recipe)
        {
            if (ModelState.IsValid)
            {
                await _recipeService.UpdateRecipeAsync(recipe);
                return RedirectToAction("Index");
            }

            ViewData["CategoryId"] = new SelectList(await _recipeService.GetAllCategoriesAsync(), "Id", "Name", recipe.CategoryId);
            //ViewData["UserId"] = new SelectList(_context.ApplicationUsers, "Id", "Id", recipe.UserId);
            return View(recipe);
        }

        // GET: Recipe/Delete/5
        public async Task<IActionResult> Delete(int id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var recipe = await _recipeService.GetRecipeByIdAsync(id);
            if (recipe == null) return NotFound();

            return View(recipe);
        }

        // POST: Recipe/Delete/5
        [HttpPost, ActionName("Delete")]
        //[ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            await _recipeService.DeleteRecipeAsync(id);
            return RedirectToAction("Index");
        }

        
    }
}
