// load namespace
SV = window.SV || {};

SV.Filtable = (function() {

	// constructor
	return function(tableElem, controlPanel) {

		// private members

		// control types with events
		const controlTypes = {
			text: {
				selector: 'input[type="text"]',
				event: 'keyup',
			},
			select: {
				selector: 'select',
				event: 'change',
			},
			checkbox: {
				selector: 'input[type="checkbox"]',
				event: 'click',
			},
		};

		let allControlFields = [];

		const zebraStripes = ['odd', 'even'];

		// public api
		let methods = {};

		// private methods

		/**
		 * Helper function for case-insensitive search.
		 */
		const strContains = function(haystack, needle) {
			return haystack.toLocaleLowerCase('en-US').indexOf(needle.toLocaleLowerCase('en-US')) != -1;
		};

		/**
		 * Simple range function.
		 */
		const allColumnIds = function() {
			const cells = tableElem.querySelectorAll(':scope > tbody > tr:first-child > td');
			const len = cells.length;

			let ids = [];
			for (let i = 0; i < len; i++) {
				ids.push(i);
			}

			return ids;
		};

		/**
		 * Check specified ids are valid columns.
		 */
		const validateColumnIds = function(allIds, filterIds) {
			for (let col of filterIds) {
				col = parseInt(col, 10);
				if (allIds.indexOf(col) == -1) {
					throw 'Error: invalid column specified in data-filter-col attribute';
				}
			}
		};

		/**
		 * Add event listeners to all input fields.
		 */
		const setUpInputEvents = function() {
			if (!controlPanel)
				return;

			for (let i in controlTypes) {
				let ctrlType = controlTypes[i];
				let fieldElems = controlPanel.querySelectorAll(ctrlType.selector);
				for (let field of fieldElems) {
					allControlFields.push(field);
					field.addEventListener(ctrlType.event, function (ev) {
						let filters = methods.buildFilters();
						methods.applyFilters(filters);
						updateHashFilter(field);
					});
				}
			}
		}

		/**
		 * Return whether this row should be shown or not.
		 */
		const filterRow = function(row, filters) {
			const cells = row.querySelectorAll(':scope > td');

			for (let filter of filters) {
				// skip if empty search value
				if (filter.value.length == 0)
					continue;

				let showThisRow = false;
				// check for match in any columns
				for (let col of filter.columns) {
					let cell = cells[col];
					let filterVal = cell.getAttribute('data-filter-value');
					if (filterVal) {
						// use exact match for filter-value
						if (filter.value == filterVal)
							showThisRow = true;
					} else {
						// partial match
						let cellVal = cell.textContent;
						if (strContains(cellVal, filter.value))
							showThisRow = true;
					}
				}

				// if this filter doesn't match, ignore the rest
				if (!showThisRow)
					return false;
			}

			// all filters matched
			return true;
		};

		/**
		 * Extract filter object from URL hash.
		 */
		const parseHashFilter = function() {
			let hashStr = window.location.hash.replace('#', '');
			if (hashStr.length === 0) {
				return {};
			}

			let filters = {};
			let params = hashStr.split('&');
			for (let param of params) {
				let filterData = param.split('=');
				if (filterData.length === 2)
					filters[filterData[0]] = filterData[1];
			}

			return filters;
		};

		/**
		 * Get URL hash and apply to control panel fields, which in turn filters the table.
		 */
		const applyHashFilters = function() {
			if (!controlPanel)
				return;

			let hashData = parseHashFilter();

			for (let name in hashData) {
				fieldElem = controlPanel.querySelector('[data-filter-hash="' + name + '"]');
				if (!fieldElem)
					continue;

				fieldElem.value = hashData[name];
			}
		};

		/**
		 * Update URL hash based on input value (doesn't trigger onhashchange).
		 */
		const updateHashFilter = function(field) {
			let fieldName = field.getAttribute('data-filter-hash');
			if (!fieldName)
				return;

			// extend current data
			let hashData = parseHashFilter();
			hashData[fieldName] = field.value;

			// recompose hash
			let hashStr = '#';
			for (let name in hashData) {
				if (hashData[name].length === 0)
					continue;
				if (hashStr !== '#')
					hashStr += '&';

				hashStr += name + '=' + hashData[name];
			}

			// remove hash if empty
			if (hashStr === '#')
				hashStr = window.location.pathname + window.location.search;

			// set hash
			window.history.replaceState(undefined, undefined, hashStr);
		};

		/**
		 * Set up.
		 */
		const init = function() {
			if (!tableElem)
				throw 'Error: invalid table element supplied';

			setUpInputEvents();

			// filter on hashchange
			window.addEventListener('hashchange', function(ev) {
				applyHashFilters();
				methods.applyFilters(methods.buildFilters());
			});

			// filter on page load
			applyHashFilters();
			// trigger redraw so browser can autocomplete fields
			setTimeout(function() {
				methods.applyFilters(methods.buildFilters());
			}, 10);
		};

		// public methods

		/**
		 * Create a set of filter objects based on all fields' values and data-filter-* properties.
		 */
		methods.buildFilters = function() {
			let filters = [];
			const allCols = allColumnIds();

			for (let fieldElem of allControlFields) {
				let columnIds = [];
				let columnVal = fieldElem.getAttribute('data-filter-col');

				if (columnVal) {
					columnIds = columnVal.toString().split(',');
					validateColumnIds(allCols, columnIds);
				} else {
					// if data-filter-col is missing we search all table columns
					columnIds = allCols;
				}

				let isCheckbox = fieldElem.matches(controlTypes.checkbox.selector);
				let fieldVal = '';
				if (isCheckbox) {
					fieldVal = fieldElem.checked ? fieldElem.value : '';
				} else {
					fieldVal = fieldElem.value;
				}

				filters.push({columns: columnIds, value: fieldVal});
			}

			return filters;
		};

		/**
		 * Reset the odd and even classes on visible rows.
		 */
		methods.restripeTable = function() {
			let tableRows = tableElem.querySelectorAll(':scope > tbody > tr');
			let stripe = 0;
			for (let row of tableRows) {
				row.classList.remove(...zebraStripes);
				if (!row.classList.contains('hidden')) {
					row.classList.add(zebraStripes[stripe]);
					stripe = 1 - stripe;
				}
			}
		};

		/**
		 * Apply the array of filters to the table.
		 * We no longer clone the tbody as it doesn't work with IntersectionObserver.
		 */
		methods.applyFilters = function(filters) {
			if (!Array.isArray(filters))
				throw 'Error: invalid filters supplied';

			// trigger before-filter event
			tableElem.dispatchEvent(new CustomEvent('sv.filtable.before'));

			// trigger a redraw to avoid locking up the browser and ensure sv.filtable.before takes effect
			setTimeout(function() {
				let tableRows = tableElem.querySelectorAll(':scope > tbody > tr');
				for (let row of tableRows) {
					let showRow = filterRow(row, filters);
					if (showRow) {
						row.classList.remove('hidden');
					} else {
						row.classList.add('hidden');
					}
				}

				methods.restripeTable();

				// trigger after-filter event
				tableElem.dispatchEvent(new CustomEvent('sv.filtable.after'));
			}, 10);
		};

		init();

		return methods;
	};

})();
