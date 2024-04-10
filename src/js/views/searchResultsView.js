import Views from './views.js';
import icons from 'url:../../img/icons.svg';
import previewView from './previewView.js';

class searchResultView extends Views {
  _parentElement = document.querySelector('.results');
  _errorMessage = `No recipes found!`;
  _message = ``;

  _generateMarkup() {
    return this._data.map(result => previewView.render(result, false)).join();
  }
}

export default new searchResultView();
