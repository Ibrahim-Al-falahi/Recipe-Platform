// API Configuration
const API_BASE_URL = "https://localhost:7125/api/"; // Replace with actual API URL
let authToken = null;
let currentUser = null;
let allRecipes = [];

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  // Check for existing token
  authToken = localStorage.getItem("tastebudToken");
  if (authToken) {
    validateToken();
  }

  // Load initial recipes
  loadAllRecipes();

  // Setup form submission
  document
    .getElementById("recipe-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      saveRecipe();
    });
});

// Authentication Functions
async function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showStatus("Please enter both email and password.", "error");
    return;
  }

  try {
    const response = await makeAPICall("/auth/login", "POST", {
      email: email,
      password: password,
    });

    if (response.token) {
      authToken = response.token;
      currentUser = response.user;
      localStorage.setItem("tastebudToken", authToken);
      showUserPanel();
      showStatus("Login successful!", "success");
    }
  } catch (error) {
    showStatus("Login failed: " + error.message, "error");
  }
}

async function register() {
  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  if (!name || !email || !password) {
    showStatus("Please fill in all registration fields.", "error");
    return;
  }

  try {
    const response = await makeAPICall("/auth/register", "POST", {
      name: name,
      email: email,
      password: password,
    });

    showStatus("Registration successful! Please login.", "success");
    showLoginForm();

    // Clear form
    document.getElementById("reg-name").value = "";
    document.getElementById("reg-email").value = "";
    document.getElementById("reg-password").value = "";
  } catch (error) {
    showStatus("Registration failed: " + error.message, "error");
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem("tastebudToken");
  showLoginForm();
  showStatus("Logged out successfully.", "success");
  document.getElementById("admin-section").classList.add("hidden");
}

async function validateToken() {
  try {
    const response = await makeAPICall("/auth/validate", "GET");
    if (response.user) {
      currentUser = response.user;
      showUserPanel();
      if (response.user.role === "admin") {
        document.getElementById("admin-section").classList.remove("hidden");
      }
    } else {
      logout();
    }
  } catch (error) {
    logout();
  }
}

// Recipe Functions
async function loadAllRecipes() {
  try {
    const response = await makeAPICall("/recipes", "GET");
    allRecipes = response.recipes || [];
    displayRecipes(allRecipes);
  } catch (error) {
    document.getElementById("recipes-container").innerHTML =
      '<div class="status error">Failed to load recipes: ' +
      error.message +
      "</div>";
  }
}

async function searchRecipes() {
  const query = document.getElementById("search-input").value.trim();

  if (!query) {
    loadAllRecipes();
    return;
  }

  try {
    const response = await makeAPICall(
      `/recipes/search?q=${encodeURIComponent(query)}`,
      "GET"
    );
    const recipes = response.recipes || [];
    displayRecipes(recipes);
  } catch (error) {
    showStatus("Search failed: " + error.message, "error");
  }
}

async function saveRecipe() {
  if (!authToken) {
    showStatus("Please login to add recipes.", "error");
    return;
  }

  const ingredients = [];
  document.querySelectorAll(".ingredient-input").forEach((input) => {
    if (input.value.trim()) {
      ingredients.push(input.value.trim());
    }
  });

  const recipeData = {
    title: document.getElementById("recipe-title").value,
    description: document.getElementById("recipe-description").value,
    ingredients: ingredients,
    instructions: document.getElementById("recipe-instructions").value,
    prepTime: parseInt(document.getElementById("prep-time").value) || 0,
    cookTime: parseInt(document.getElementById("cook-time").value) || 0,
    servings: parseInt(document.getElementById("servings").value) || 1,
    difficulty: document.getElementById("difficulty").value,
    category: document.getElementById("recipe-category").value,
  };

  try {
    const response = await makeAPICall("/recipes", "POST", recipeData);
    showStatus("Recipe saved successfully!", "success");
    cancelRecipeForm();
    loadAllRecipes(); // Refresh the list
  } catch (error) {
    showStatus("Failed to save recipe: " + error.message, "error");
  }
}

async function rateRecipe(recipeId, rating) {
  if (!authToken) {
    showStatus("Please login to rate recipes.", "error");
    return;
  }

  try {
    await makeAPICall(`/recipes/${recipeId}/rate`, "POST", { rating: rating });
    showStatus("Rating submitted!", "success");
    loadAllRecipes(); // Refresh to show new rating
  } catch (error) {
    showStatus("Failed to rate recipe: " + error.message, "error");
  }
}

async function deleteRecipe(recipeId) {
  if (!authToken) {
    showStatus("Please login to delete recipes.", "error");
    return;
  }

  if (!confirm("Are you sure you want to delete this recipe?")) {
    return;
  }

  try {
    await makeAPICall(`/recipes/${recipeId}`, "DELETE");
    showStatus("Recipe deleted successfully!", "success");
    loadAllRecipes();
  } catch (error) {
    showStatus("Failed to delete recipe: " + error.message, "error");
  }
}

// Admin Functions
async function loadAllUsers() {
  try {
    const response = await makeAPICall("/admin/users", "GET");
    const users = response.users || [];

    let html = '<h3>All Users</h3><div class="recipes-grid">';
    users.forEach((user) => {
      html += `
                        <div class="recipe-card">
                            <div class="recipe-title">${user.name}</div>
                            <div class="recipe-description">
                                Email: ${user.email}<br>
                                Role: ${user.role || "user"}<br>
                                Joined: ${new Date(
                                  user.createdAt
                                ).toLocaleDateString()}
                            </div>
                        </div>
                    `;
    });
    html += "</div>";

    document.getElementById("admin-data").innerHTML = html;
  } catch (error) {
    showStatus("Failed to load users: " + error.message, "error");
  }
}

async function loadAllRecipesAdmin() {
  try {
    const response = await makeAPICall("/admin/recipes", "GET");
    const recipes = response.recipes || [];

    let html = '<h3>All Recipes (Admin View)</h3><div class="recipes-grid">';
    recipes.forEach((recipe) => {
      html += `
                        <div class="recipe-card">
                            <div class="recipe-title">${recipe.title}</div>
                            <div class="recipe-meta">
                                <span>By: ${
                                  recipe.author?.name || "Unknown"
                                }</span>
                                <span>${recipe.category}</span>
                            </div>
                            <div class="recipe-description">${
                              recipe.description
                            }</div>
                            <div class="recipe-actions">
                                <button class="btn btn-danger btn-small" onclick="deleteRecipe('${
                                  recipe._id
                                }')">
                                    Delete Recipe
                                </button>
                            </div>
                        </div>
                    `;
    });
    html += "</div>";

    document.getElementById("admin-data").innerHTML = html;
  } catch (error) {
    showStatus("Failed to load recipes: " + error.message, "error");
  }
}

// Utility Functions
async function makeAPICall(endpoint, method = "GET", data = null) {
  const url = API_BASE_URL + endpoint;
  const headers = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const config = {
    method: method,
    headers: headers,
  };

  if (data && method !== "GET") {
    config.body = JSON.stringify(data);
  }

  // For demo purposes, simulate API responses
  return simulateAPIResponse(endpoint, method, data);
}

// Simulate API responses for demo purposes
function simulateAPIResponse(endpoint, method, data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate different API endpoints
      if (endpoint === "/auth/login") {
        if (
          data.email === "demo@tastebudrecipes.com" &&
          data.password === "demo123"
        ) {
          resolve({
            token: "demo-token-12345",
            user: {
              id: 1,
              name: "Demo User",
              email: "demo@tastebudrecipes.com",
              role: "user",
            },
          });
        } else if (
          data.email === "admin@tastebudrecipes.com" &&
          data.password === "admin123"
        ) {
          resolve({
            token: "admin-token-67890",
            user: {
              id: 2,
              name: "Admin User",
              email: "admin@tastebudrecipes.com",
              role: "admin",
            },
          });
        } else {
          reject(new Error("Invalid credentials"));
        }
      } else if (endpoint === "/auth/register") {
        resolve({ message: "User registered successfully" });
      } else if (endpoint === "/auth/validate") {
        if (authToken) {
          resolve({ user: currentUser });
        } else {
          reject(new Error("Invalid token"));
        }
      } else if (endpoint === "/recipes") {
        if (method === "GET") {
          resolve({
            recipes: generateDemoRecipes(),
          });
        } else if (method === "POST") {
          resolve({
            message: "Recipe created successfully",
            id: Math.random().toString(36),
          });
        }
      } else if (endpoint.includes("/recipes/search")) {
        const recipes = generateDemoRecipes();
        const query = new URLSearchParams(endpoint.split("?")[1])
          .get("q")
          .toLowerCase();
        const filtered = recipes.filter(
          (recipe) =>
            recipe.title.toLowerCase().includes(query) ||
            recipe.ingredients.some((ing) => ing.toLowerCase().includes(query))
        );
        resolve({ recipes: filtered });
      } else if (endpoint.includes("/recipes/") && endpoint.includes("/rate")) {
        resolve({ message: "Rating submitted" });
      } else if (endpoint.includes("/recipes/") && method === "DELETE") {
        resolve({ message: "Recipe deleted" });
      } else if (endpoint === "/admin/users") {
        resolve({
          users: [
            {
              id: 1,
              name: "Demo User",
              email: "demo@tastebudrecipes.com",
              role: "user",
              createdAt: new Date("2024-01-15"),
            },
            {
              id: 2,
              name: "Admin User",
              email: "admin@tastebudrecipes.com",
              role: "admin",
              createdAt: new Date("2024-01-01"),
            },
            {
              id: 3,
              name: "Sarah Chen",
              email: "sarah@tastebudrecipes.com",
              role: "user",
              createdAt: new Date("2024-02-01"),
            },
          ],
        });
      } else if (endpoint === "/admin/recipes") {
        const recipes = generateDemoRecipes();
        recipes.forEach((recipe) => {
          recipe.author = { name: "Demo User" };
        });
        resolve({ recipes: recipes });
      } else {
        reject(new Error("Endpoint not found"));
      }
    }, 500); // Simulate network delay
  });
}

function generateDemoRecipes() {
  return [
    {
      _id: "1",
      title: "Grandma's Secret Chocolate Cake",
      description:
        "A rich, moist chocolate cake passed down through generations. Perfect for special occasions!",
      ingredients: [
        "2 cups all-purpose flour",
        "2 cups sugar",
        "3/4 cup cocoa powder",
        "2 eggs",
        "1 cup milk",
        "1/2 cup vegetable oil",
      ],
      instructions:
        "1. Preheat oven to 350°F. 2. Mix dry ingredients. 3. Add wet ingredients and mix well. 4. Bake for 30-35 minutes.",
      prepTime: 20,
      cookTime: 35,
      servings: 8,
      difficulty: "Medium",
      category: "Dessert",
      rating: 4.8,
      author: "Demo User",
      createdAt: new Date("2024-06-20"),
    },
    {
      _id: "2",
      title: "Quick Breakfast Pancakes",
      description:
        "Fluffy pancakes that are perfect for busy mornings. Kids love them!",
      ingredients: [
        "2 cups flour",
        "2 tbsp sugar",
        "2 tsp baking powder",
        "1 egg",
        "1 1/4 cups milk",
        "2 tbsp melted butter",
      ],
      instructions:
        "1. Mix dry ingredients. 2. Whisk wet ingredients separately. 3. Combine and cook on griddle until golden.",
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: "Easy",
      category: "Breakfast",
      rating: 4.5,
      author: "Demo User",
      createdAt: new Date("2024-06-22"),
    },
    {
      _id: "3",
      title: "Mediterranean Pasta Salad",
      description:
        "A fresh and healthy pasta salad with Mediterranean flavors. Great for picnics and potlucks!",
      ingredients: [
        "1 lb pasta",
        "1 cup cherry tomatoes",
        "1/2 cup olives",
        "1/2 cup feta cheese",
        "1/4 cup olive oil",
        "2 tbsp lemon juice",
        "fresh basil",
      ],
      instructions:
        "1. Cook pasta according to package directions. 2. Chop vegetables. 3. Mix everything together with dressing. 4. Chill before serving.",
      prepTime: 15,
      cookTime: 12,
      servings: 6,
      difficulty: "Easy",
      category: "Lunch",
      rating: 4.3,
      author: "Sarah Chen",
      createdAt: new Date("2024-06-18"),
    },
    {
      _id: "4",
      title: "Spicy Thai Chicken Curry",
      description:
        "An authentic Thai curry with coconut milk and aromatic spices. Adjust the heat to your preference!",
      ingredients: [
        "2 lbs chicken thighs",
        "1 can coconut milk",
        "3 tbsp red curry paste",
        "1 onion",
        "2 bell peppers",
        "fresh basil",
        "fish sauce",
        "brown sugar",
      ],
      instructions:
        "1. Sauté curry paste in oil. 2. Add chicken and cook until browned. 3. Add coconut milk and vegetables. 4. Simmer for 20 minutes. 5. Season and garnish with basil.",
      prepTime: 25,
      cookTime: 30,
      servings: 4,
      difficulty: "Hard",
      category: "Dinner",
      rating: 4.7,
      author: "Demo User",
      createdAt: new Date("2024-06-15"),
    },
    {
      _id: "5",
      title: "Homemade Trail Mix",
      description:
        "Perfect healthy snack for hiking or just munching at home. Customize with your favorite nuts and dried fruits!",
      ingredients: [
        "1 cup almonds",
        "1 cup cashews",
        "1/2 cup dried cranberries",
        "1/2 cup raisins",
        "1/4 cup dark chocolate chips",
        "1 tsp sea salt",
      ],
      instructions:
        "1. Roast nuts in oven at 350°F for 8-10 minutes. 2. Let cool completely. 3. Mix with dried fruits and chocolate. 4. Store in airtight container.",
      prepTime: 5,
      cookTime: 10,
      servings: 8,
      difficulty: "Easy",
      category: "Snacks",
      rating: 4.2,
      author: "Sarah Chen",
      createdAt: new Date("2024-06-25"),
    },
  ];
}

function displayRecipes(recipes) {
  const container = document.getElementById("recipes-container");

  if (!recipes || recipes.length === 0) {
    container.innerHTML =
      '<div class="status">No recipes found. Try a different search or add some recipes!</div>';
    return;
  }

  let html = '<div class="recipes-grid">';

  recipes.forEach((recipe) => {
    const canEdit =
      currentUser &&
      (currentUser.role === "admin" || recipe.author === currentUser.name);
    const stars =
      "★".repeat(Math.floor(recipe.rating)) +
      "☆".repeat(5 - Math.floor(recipe.rating));

    html += `
                    <div class="recipe-card">
                        <div class="recipe-title">${recipe.title}</div>
                        <div class="recipe-meta">
                            <span>${recipe.category} • ${
      recipe.difficulty
    }</span>
                            <span class="recipe-rating">${stars} (${
      recipe.rating
    })</span>
                        </div>
                        <div class="recipe-description">${
                          recipe.description
                        }</div>
                        
                        <div class="recipe-ingredients">
                            <h4>Ingredients:</h4>
                            <div class="ingredients-list-display">
                                ${recipe.ingredients.slice(0, 3).join(", ")}${
      recipe.ingredients.length > 3 ? "..." : ""
    }
                            </div>
                        </div>
                        
                        <div class="recipe-meta">
                            <span>⏱️ ${
                              recipe.prepTime + recipe.cookTime
                            } mins total</span>
                            <span>🍽️ Serves ${recipe.servings}</span>
                        </div>
                        
                        <div class="recipe-actions">
                            <button class="btn btn-small" onclick="viewRecipeDetails('${
                              recipe._id
                            }')">View Details</button>
                            ${
                              authToken
                                ? `
                                <select onchange="rateRecipe('${recipe._id}', this.value)" class="rating-select">
                                    <option value="">Rate</option>
                                    <option value="1">1 ⭐</option>
                                    <option value="2">2 ⭐</option>
                                    <option value="3">3 ⭐</option>
                                    <option value="4">4 ⭐</option>
                                    <option value="5">5 ⭐</option>
                                </select>
                            `
                                : ""
                            }
                            ${
                              canEdit
                                ? `<button class="btn btn-danger btn-small" onclick="deleteRecipe('${recipe._id}')">Delete</button>`
                                : ""
                            }
                        </div>
                    </div>
                `;
  });

  html += "</div>";
  container.innerHTML = html;
}

function viewRecipeDetails(recipeId) {
  const recipe = allRecipes.find((r) => r._id === recipeId);
  if (!recipe) return;

  const modal = document.createElement("div");
  modal.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                background: rgba(0,0,0,0.8); z-index: 1000; 
                display: flex; align-items: center; justify-content: center;
                padding: 20px; box-sizing: border-box;
            `;

  modal.innerHTML = `
                <div style="background: white; border-radius: 15px; padding: 30px; max-width: 600px; max-height: 90vh; overflow-y: auto; width: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; color: #333;">${recipe.title}</h2>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 24px; cursor: pointer;">✕</button>
                    </div>
                    
                    <div style="margin-bottom: 20px; color: #666;">
                        <strong>Category:</strong> ${recipe.category} | 
                        <strong>Difficulty:</strong> ${recipe.difficulty} | 
                        <strong>Rating:</strong> ${"★".repeat(
                          Math.floor(recipe.rating)
                        )} (${recipe.rating})
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <strong>Description:</strong>
                        <p style="margin: 10px 0; line-height: 1.6;">${
                          recipe.description
                        }</p>
                    </div>
                    
                    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                        <div><strong>Prep Time:</strong> ${
                          recipe.prepTime
                        } mins</div>
                        <div><strong>Cook Time:</strong> ${
                          recipe.cookTime
                        } mins</div>
                        <div><strong>Servings:</strong> ${recipe.servings}</div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <strong>Ingredients:</strong>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            ${recipe.ingredients
                              .map(
                                (ing) =>
                                  `<li style="margin: 5px 0;">${ing}</li>`
                              )
                              .join("")}
                        </ul>
                    </div>
                    
                    <div>
                        <strong>Instructions:</strong>
                        <p style="margin: 10px 0; line-height: 1.6; white-space: pre-line;">${
                          recipe.instructions
                        }</p>
                    </div>
                </div>
            `;

  document.body.appendChild(modal);
}

// UI Helper Functions
function showStatus(message, type) {
  const existingStatus = document.querySelector(".status");
  if (existingStatus) {
    existingStatus.remove();
  }

  const status = document.createElement("div");
  status.className = `status ${type}`;
  status.textContent = message;

  document.getElementById("auth-status").appendChild(status);

  setTimeout(() => {
    if (status.parentNode) {
      status.remove();
    }
  }, 5000);
}

function showLoginForm() {
  document.getElementById("login-form").classList.remove("hidden");
  document.getElementById("register-form").classList.add("hidden");
  document.getElementById("user-panel").classList.add("hidden");
  document.getElementById("add-recipe-btn").classList.add("hidden");
}

function showRegisterForm() {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("register-form").classList.remove("hidden");
  document.getElementById("user-panel").classList.add("hidden");
}

function showUserPanel() {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("register-form").classList.add("hidden");
  document.getElementById("user-panel").classList.remove("hidden");
  document.getElementById("add-recipe-btn").classList.remove("hidden");
  document.getElementById("current-user").textContent = currentUser.name;

  if (currentUser.role === "admin") {
    document.getElementById("admin-section").classList.remove("hidden");
  }
}

function showRecipeForm() {
  document.getElementById("add-recipe-section").classList.remove("hidden");
  document.getElementById("add-recipe-btn").classList.add("hidden");
}

function cancelRecipeForm() {
  document.getElementById("add-recipe-section").classList.add("hidden");
  document.getElementById("add-recipe-btn").classList.remove("hidden");
  document.getElementById("recipe-form").reset();

  // Reset ingredients to just one input
  const container = document.getElementById("ingredients-container");
  container.innerHTML = `
                <div class="ingredient-item">
                    <input type="text" class="ingredient-input" placeholder="2 cups flour">
                    <button type="button" class="btn btn-danger btn-small" onclick="removeIngredient(this)">Remove</button>
                </div>
            `;
}

function addIngredient() {
  const container = document.getElementById("ingredients-container");
  const newItem = document.createElement("div");
  newItem.className = "ingredient-item";
  newItem.innerHTML = `
                <input type="text" class="ingredient-input" placeholder="1 cup sugar">
                <button type="button" class="btn btn-danger btn-small" onclick="removeIngredient(this)">Remove</button>
            `;
  container.appendChild(newItem);
}

function removeIngredient(button) {
  const container = document.getElementById("ingredients-container");
  if (container.children.length > 1) {
    button.parentElement.remove();
  } else {
    showStatus("At least one ingredient is required.", "error");
  }
}

// Demo credentials helper
window.addEventListener("load", function () {
  const demoInfo = document.createElement("div");
  demoInfo.style.cssText = `
                position: fixed; bottom: 20px; right: 20px; 
                background: rgba(0,0,0,0.8); color: white; 
                padding: 15px; border-radius: 10px; 
                font-size: 12px; z-index: 1000;
                max-width: 300px;
            `;
  demoInfo.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 10px;">🎭 Demo Credentials</div>
                <div><strong>User:</strong> demo@tastebudrecipes.com / demo123</div>
                <div><strong>Admin:</strong> admin@tastebudrecipes.com / admin123</div>
                <div style="margin-top: 10px; font-size: 11px; opacity: 0.8;">
                    This is a demonstration with simulated API responses. 
                    In production, replace the simulateAPIResponse function with real API calls.
                </div>
            `;
  document.body.appendChild(demoInfo);

  // Auto-hide after 10 seconds
  setTimeout(() => {
    demoInfo.style.opacity = "0";
    demoInfo.style.transition = "opacity 1s";
    setTimeout(() => demoInfo.remove(), 1000);
  }, 10000);
});
