/**
 * app Configure a brand new Todo list.
 */
import {View} from "./view.js"
import {Controller} from "./controller.js"
import {Model} from "./model.js"
import {Store} from "./store.js"
import {Template} from "./template.js"
import {$on} from "./helpers.js"

/**
 *
 * @param {string} name The name of your new to do list.	 
 */
function Todo(name) {
	this.storage = new Store(name);
	this.model = new Model(this.storage);
	this.template = new Template();
	this.view = new View(this.template);
	this.controller = new Controller(this.model, this.view);
}
/**
 * Defines a new todo
 */
var todo = new Todo('todos-vanillajs');

/**
 * Add the path of the page in the url
 */
function setView() {
	todo.controller.setView(document.location.hash);
}

$on(window, 'load', setView);
$on(window, 'hashchange', setView);

