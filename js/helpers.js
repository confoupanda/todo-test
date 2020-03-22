/*global NodeList */

/**
 * Get element by CSS selector:
 * 
 * @param {string} selector CSS selector
 * @param {string} scope the search root
 */
	export function qs(selector, scope) {
		return (scope || document).querySelector(selector);
	}

/**
 * Get elements by CSS selector:
 * 
 * @param {string} selector CSS selector
 * @param {string} scope the search root
 */
	export function qsa(selector, scope) {
		return (scope || document).querySelectorAll(selector);
	}

/**
 * AddEvenListener Wrapper,
 * Used in View and App
 * @param {HTMLElement} target html element
 * @param {String} type the type of the listener ex: 'change' or 'click'
 * @param {Function} callback Eventlistener
 * @param {object} useCapture the element taken from the callback
 */
	export function $on(target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	}

/**
 * Attach a handler to event for all elements that match the selector,
 * now or in the future, based on a root element
 * @param {HTMLElement} target html element
 * @param {String} selector CSS selector
 * @param {String} type the type of the listener
 * @param {Function} handler a function executed if a condition is fulfilled in View
 */
	export function $delegate(target, selector, type, handler) {
		function dispatchEvent(event) {
			var targetElement = event.target;
			var potentialElements = qsa(selector, target);
			var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

			if (hasMatch) {
				handler.call(targetElement, event);
			}
		}

		// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		var useCapture = type === 'blur' || type === 'focus';

		$on(target, type, dispatchEvent, useCapture);
	}

	/**
	 * Find the element's parent with the given tag name:
	 * $parent(qs('a'), 'div');
	 * @param {HTMLElement} element the element parent
	 * @param {String} tagName tagName of the element
	 */
	export function $parent(element, tagName) {
		if (!element.parentNode) {
			return;
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
			return element.parentNode;
		}
		return $parent(element.parentNode, tagName);
	}

	// Allow for looping on nodes by chaining:
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;

