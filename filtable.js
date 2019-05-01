/* Filtable 0.11 - jQuery table filtering plugin */
(function ($) {

	// zebra striping classes
	var zebra = ['odd','even'];
	// list of inputs to keep track of
	var controls = [];
	// control types with events
	var controlEvents = {
		'text':     { selector: 'input[type="text"]',     event: 'keyup' },
		'select':   { selector: 'select',                 event: 'change' },
		'checkbox': { selector: 'input[type="checkbox"]', event: 'click' }
	};

	var methods = {

		// [public] Default setup, taking a source jQuery object for automatic filtering
		init: function (options) {
			options = $.extend({
				controlPanel: null,
				handleSort: true
			}, options);

			var $table = $(this);

			return this.each(function () {
				// set up events on form controls
				for ( var elemType in controlEvents ) {
					// select an input type
					$(controlEvents[elemType].selector, options.controlPanel).each(function () {
						var ctrlType = elemType;
						var $ctrl = $(this);
						controls.push($ctrl);
						// attach specific event to this input
						$ctrl.on(controlEvents[ctrlType].event, function () {
							if (ctrlType === 'select') {
								// update URL hash (doesn't trigger onhashchange)
								var ctrlHash = $ctrl.data('filter-hash');
								if (ctrlHash) {
									methods.updateFilterHash(ctrlHash, $ctrl.val());
								}
							}
							methods.createAndRunFilters($table);
						});
					});
				}

				// filter on hashchange
				$(window).on('hashchange', function() {
					methods.applyHashFilters(options.controlPanel);
					methods.createAndRunFilters($table);
				});

				// apply filters on page load
				methods.applyHashFilters(options.controlPanel);
				methods.createAndRunFilters($table);
			});

		},

		// [public] Do the actual filtering
		filter: function (options) {
			options = $.extend({
				filters: [],
				handleSort: true
			}, options);

			return this.each(function () {
				var $table = $(this);
				$table.trigger('beforetablefilter');

				// Re-stripe rows when the table gets sorted by Stupid-Table-Plugin
				if ( options.handleSort ) {
					$table.on('aftertablesort', function (event, data) {
						methods.handleRowsThenStripe($table, function ($tr) {
							return !$tr.hasClass('hidden');
						});
					});
				}

				// Run filter asynchronously to force browser redraw on beforetablefilter and avoid locking the browser
				setTimeout(function () {
					methods.handleRowsThenStripe($table, function ($tr) {
						// Callback function that does the processing
						for ( var i = 0, numFilters = options.filters.length; i < numFilters; i++ ) {
							var cols = options.filters[i].columns;
							var val = options.filters[i].value.toString().toLowerCase();

							var showCol = false;
							for ( var j = 0, numCols = cols.length; j < numCols; j++ ) {
								var $td = $tr.find('td').eq(cols[j]);
								// Use `data-filter-val` attribute if provided
								var fval = $td.data('filter-val');
								var cellFilterVal = (fval === undefined ? $td.text() : fval);

								if ( cellFilterVal.toString().toLowerCase().indexOf(val) >= 0 ) {
									showCol = true;
								}
							}
							if ( !showCol ) {
								return false;
							}
						}

						return true;
					});

					$table.trigger('aftertablefilter');
				}, 10);
			});

		},



		// [private] Loops through table rows and runs callback to decide whether row should be shown
		handleRowsThenStripe: function ($table, callback) {
			var stripe = 0;
			var $oldTbody = $table.find('> tbody');

			$oldTbody.each(function () {
				// Work with a copy of the tbody so we can make changes with speed
				var $newTbody = $oldTbody.clone();

				$newTbody.find('> tr').each(function () {
					var $tr = $(this);
					var showTR = callback($tr);

					$tr.removeClass( zebra.join(' ') );
					if ( showTR ) {
						$tr.removeClass('hidden');
						$tr.addClass( zebra[stripe] );
						stripe = 1 - stripe;
					} else {
						$tr.addClass('hidden');
					}
				});

				// Replace old tbody with the modified copy
				$oldTbody.replaceWith($newTbody);
			});
		},

		// [private] Generate filter data structure and run filtering
		createAndRunFilters: function ($table) {
			var filters = [];

			for ( var i = 0, len = controls.length; i < len; i++ ) {
				var $ctrl = controls[i];
				// quit if no `data-filter-col` attribute
				var coldata = $ctrl.data('filter-col');
				if ( coldata === undefined ) {
					continue;
				}

				var cols = coldata.toString().split(',');
				var val = "";

				var isCheckbox = controls[i].is( controlEvents.checkbox.selector );
				if ( isCheckbox ) {
					if ( controls[i].is(':checked') ) {
						val = $ctrl.data('filter-val');
					}
				} else {
					val = $ctrl.val();
				}

				filters.push( {'columns': cols, 'value': val} );
			}

			var args = [{'filters': filters}];
			methods.filter.apply( $table, args );
		},

		// [private] parse the URL hash value
		parseFilterHash: function() {
			var hashStr = window.location.hash.replace('#', '');
			if (hashStr.length === 0) {
				return {};
			}

			var filters = {};
			var hashArr = hashStr.split('&');
			for (var i in hashArr) {
				var filterData = hashArr[i].split('=');
				if (filterData.length === 2) {
					filters[filterData[0]] = filterData[1];
				}
			}

			return filters;
		},

		// [private] get URL hash and apply to control panel fields
		applyHashFilters: function(controlPanel) {
			var hashData = methods.parseFilterHash();
			for (var field in hashData) {
				$('[data-filter-hash="' + field + '"]', controlPanel).val( hashData[field] );
			}
		},

		// [private] update value for fieldName in the URL hash
		updateFilterHash: function(fieldName, fieldVal) {
			var hashData = methods.parseFilterHash();
			hashData[fieldName] = fieldVal;

			// recompose hash
			var hashStr = '#';
			for (var f in hashData) {
				if (hashData[f].length === 0)
					continue;
				if (hashStr !== '#')
					hashStr += '&';

				hashStr += f + '=' + hashData[f];
			}

			// remove hash if empty
			if (hashStr === '#')
				hashStr = window.location.pathname + window.location.search;

			window.history.replaceState(undefined, undefined, hashStr);
		}
	};

	$.fn.filtable = function (method) {
		if ( method === 'filter' ) {
			return methods.filter.apply( this, Array.prototype.slice.call(arguments, 1) );
		} else if ( typeof method === 'object' || !method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error('Unknown method `' + method + '` on jQuery.filtable');
		}
	};
})(jQuery);
