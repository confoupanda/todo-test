import {qs} from "./helpers.js"
import {qsa} from "./helpers.js"
import {$on} from "./helpers.js"
import {$delegate} from "./helpers.js"
import {$parent} from "./helpers.js"

/**
 * View that abstracts away the browser's DOM completely.
 * It has two simple entry points:
 *
 *   - bind(eventName, handler)
 *     Takes a todo application event and registers the handler
 *   - render(command, parameterObject)
 *     Renders the given command with the options
 */
export class View{ 

	constructor(template) {
		this.template = template;

		this.ENTER_KEY = 13;
		this.ESCAPE_KEY = 27;

		this.$todoList = qs('.todo-list');
		this.$todoItemCounter = qs('.todo-count');
		this.$clearCompleted = qs('.clear-completed');
		this.$main = qs('.main');
		this.$footer = qs('.footer');
		this.$toggleAll = qs('.toggle-all');
		this.$newTodo = qs('.new-todo');
	}

	/**
	 * Remove Todo based on id
	 * @param {Number} id The ID of the item you want to remove
	 */
	_removeItem(id) {
		var elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	}

	/**
	 * Hide finished items
	 * @param {Number} completedCount number of the element checked
	 * @param {Boolean} visible true if visible, false if not.
	 */
	_clearCompletedButton(completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'block' : 'none';
	}

	/**
	 * Indicates the current page
	 * @param {String} currentPage the current page with parameter.
	 */
	_setFilter(currentPage) {
		qs('.filters .selected').className = '';
		qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
	}

	/**
	 * Test if item is finished
	 * @param {Number} id The ID of the item you want to complete
	 * @param {Boolean} completed false or true
	 */
	_elementComplete(id, completed) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = completed ? 'completed' : '';

		// In case it was toggled from an event and not by clicking the checkbox
		qs('input', listItem).checked = completed;
	}

	/**
	 * Allows the editing of an element
	 * @param {Number} id The ID of the item you want to edit
	 * @param {String} [title] The title of the task
	 */
	_editItem(id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = listItem.className + ' editing';

		var input = document.createElement('input');
		input.className = 'edit';

		listItem.appendChild(input);
		input.focus();
		input.value = title;
	}

	/**
	 * Replaces the old element with the edited element
	 * @param {Number} id The ID of the item, where edit is done
	 * @param {String} [title] The title of the task
	 */
	_editItemDone(id, title) {
		var listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		var input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.className = listItem.className.replace('editing', '');

		qsa('label', listItem).forEach(function (label) {
			label.textContent = title;
		});
	}
	/**
	 * Return the element of the DOM
	 * @param {String} viewCmd the active function 
	 * @param {Object} parameter the active parameter 
	 */
	render(viewCmd, parameter) {
		var self = this;
		var viewCommands = {
			/**
			 * show the element
			 */
			showEntries: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},
			/**
			 * Delete the item
			 */
			removeItem: function () {
				self._removeItem(parameter);
			},
			/**
			 * update the count
			 */
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},
			/**
			 * show the button : clearCompleted
			 */
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},
			/**
			 * checks if visibility of the block was none or block 
			 */
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
			},
			/**
			 * check or uncheck all items with toggleAll
			 */
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},
			/**
			 * make a filter with parameter
			 */
			setFilter: function () {
				self._setFilter(parameter);
			},
			/**
			 * delete content for new Todo
			 */
			clearNewTodo: function () {
				self.$newTodo.value = '';
			},
			/**
			 * show element with status 'commpleted'
			 */
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			},
			/**
			 * allows to edit a item
			 */
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},
			/**
			 * save the edition of the item
			 */
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title);
			}
		};

		viewCommands[viewCmd]();
	}

	/**
	 * set an id to the item
	 * @param {Object} element the element selected
	 */
	_itemId(element) {
		var li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	}

	/**
	 * EventListener on the validation of the edition of an element
	 * @param {Function} handler make a conditional callback
	 */
	_bindItemEditDone(handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				handler({
					id: self._itemId(this),
					title: this.value
				});
			}
		});

		$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				// Remove the cursor from the input when you hit enter just like if it
				// were a real form
				this.blur();
			}
		});
	}

	/**
	 * EventListener on canceling item editing
	 * @param {Function} handler make a conditional callback
	 */
	_bindItemEditCancel(handler) {
		var self = this;
		$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({id: self._itemId(this)});
			}
		});
	}

	/**
	 * Links Controller methods to View items
	 * @param {Function} event the active element
	 * @param {Function} handler make a conditional callback
	 */
	bind(event, handler) {
		var self = this;
		if (event === 'newTodo') {
			/**
			 * $on : add a listener
			 * set sel.$newTodo.value on handler
			 */
			$on(self.$newTodo, 'change', function () {
				handler(self.$newTodo.value);
			});

		} else if (event === 'removeCompleted') {
			$on(self.$clearCompleted, 'click', function () {
				handler();
			});

		} else if (event === 'toggleAll') {
			$on(self.$toggleAll, 'click', function () {
				handler({completed: this.checked});
			});

		} else if (event === 'itemEdit') {
			$delegate(self.$todoList, 'li label', 'dblclick', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemRemove') {
			$delegate(self.$todoList, '.destroy', 'click', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemToggle') {
			$delegate(self.$todoList, '.toggle', 'click', function () {
				handler({
					id: self._itemId(this),
					completed: this.checked
				});
			});

		} else if (event === 'itemEditDone') {
			self._bindItemEditDone(handler);

		} else if (event === 'itemEditCancel') {
			self._bindItemEditCancel(handler);
		}
	}
}
