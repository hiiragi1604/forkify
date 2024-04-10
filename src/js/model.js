import { async } from 'regenerator-runtime';
import { API_URL } from './config.js';
import { getJSON, sendJSON } from './helpers.js';
import { RES_PER_PAGE, API_KEY } from './config.js';
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmark: [],
};
function createRecipeObject(data) {
  const recipe = data.data.recipe;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
  };
}

export async function loadRecipe(id) {
  try {
    const data = await getJSON(`${API_URL}/${id}?key=${API_KEY}`);
    state.recipe = createRecipeObject(data);
    if (state.bookmark.some(b => b.id === id)) state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    throw err;
  }
}

export async function loadSearchResults(query) {
  try {
    state.search.query = query;
    const data = await getJSON(`${API_URL}?search=${query}&key=${API_KEY}`);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
  } catch (err) {
    throw err;
  }
}

export function getSearchResultsPage(page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
}

export function updateServings(servings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity / state.recipe.servings) * servings;
  });
  state.recipe.servings = servings;
}

function saveBookmarks() {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmark));
}

export function addBookmark(recipe) {
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
    state.bookmark.push(recipe);
  }
  saveBookmarks();
}

export function deleteBookmark(id) {
  const index = state.bookmark.findIndex(el => el.id === id);
  state.bookmark.splice(index, 1);
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  saveBookmarks();
}

function init() {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmark = JSON.parse(storage);
}

init();

function clearBookmark() {
  localStorage.clear('bookmarks');
}

export async function uploadRecipe(newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArray = ing[1].replaceAll(' ', '').split(',');
        if (ingArray.length !== 3) throw new Error('Wrong ingredient format');
        const [quantity, unit, description] = ingArray;
        return {
          quantity: quantity ? Number(quantity) : null,
          unit,
          description,
        };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: Number(newRecipe.cookingTime),
      servings: Number(newRecipe.servings),
      ingredients: ingredients,
    };
    const data = await sendJSON(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    state.recipe.key = API_KEY;
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
}
