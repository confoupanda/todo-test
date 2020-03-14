import {View} from "./view.js"
import {Controller} from "./controller.js"
import {Model} from "./model.js"
import {Store} from "./store.js"

/*global app, $on */
(function () {
	'use strict';

	/**
	 * Sets up a brand new Todo list.
	 *
	 * @param {string} name The name of your new to do list.
	 */
	function Todo(name) {
		this.storage = new Store(name);
		this.model = new Model(this.storage);
		this.template = new app.Template();
		this.view = new View(this.template);
		this.controller = new Controller(this.model, this.view);
	}

	var todo = new Todo('todos-vanillajs');

	function setView() {
		todo.controller.setView(document.location.hash);
	}
	$on(window, 'load', setView);
	$on(window, 'hashchange', setView);
})();
