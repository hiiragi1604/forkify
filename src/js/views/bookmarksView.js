import Views from './views.js';
import icons from 'url:../../img/icons.svg';
import previewView from './previewView.js';

class BookmarksView extends Views {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = `No bookmarks yet!`;
  _message = ``;

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkup() {
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join();
  }
}

export default new BookmarksView();
