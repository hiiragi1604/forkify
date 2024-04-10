import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchResultsView from './views/searchResultsView.js';
import bookmarksView from './views/bookmarksView.js';
import searchView from './views/searchView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
import { CLOSE_WINDOW_TIMEOUT } from './config';

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

async function controlRecipe() {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();
    searchResultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmark);
    await model.loadRecipe(id);
    const recipe = model.state.recipe;
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
}

async function controlSearchResults() {
  try {
    const query = searchView.getQuery();
    if (!query) return;
    searchResultsView.renderSpinner();
    await model.loadSearchResults(query);
    searchResultsView.render(model.getSearchResultsPage(1));
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
}

function controlPagination(page) {
  searchResultsView.render(model.getSearchResultsPage(page));
  paginationView.render(model.state.search);
}

function controlServings(servings) {
  model.updateServings(servings);
  recipeView.update(model.state.recipe);
}

function controlAddBookmark() {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmark);
}

function controlBookmark() {
  bookmarksView.render(model.state.bookmark);
}

async function controlAddRecipe(newRecipe) {
  try {
    addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    recipeView.render(model.state.recipe);
    addRecipeView.renderMessage();
    bookmarksView.render(model.state.bookmark);
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, CLOSE_WINDOW_TIMEOUT);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
}

function init() {
  bookmarksView.addHandlerRender(controlBookmark);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerButton(controlPagination);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  addRecipeView._addHandlerUpload(controlAddRecipe);
}

init();
