
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
				for ( var i in controlEvents ) {
					// select an input type
					$(controlEvents[i].selector, options.controlPanel).each(function () {
						$ctrl = $(this);
						controls.push($ctrl);
						// attach specific event to this input
						$ctrl.on(controlEvents[i].event, function () {
							methods.createAndRunFilters($table);
						});
					});
				}
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
							var val = options.filters[i].value.toLowerCase();

							var showCol = false;
							for ( var j = 0, numCols = cols.length; j < numCols; j++ ) {
								var $td = $tr.find('td').eq(cols[j]);
								if ( $td.text().toLowerCase().indexOf(val) >= 0 ) {
									showCol = true;
								}
							}
							if ( !showCol )
								return false;
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
					}
					else {
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
				var cols = $ctrl.data('filter').toString().split(',');
				var val = $ctrl.val();

				filters.push( {'columns': cols, 'value': val} );
			}

			var args = [{'filters': filters}];
			methods.filter.apply( $table, args );
		}
	}

	$.fn.filtable = function (method) {
		if ( method === 'filter' ) {
			return methods.filter.apply( this, Array.prototype.slice.call(arguments, 1) );
		}
		else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		}
		else {
			$.error('Unknown method `' + method + '` on jQuery.filtable');
		}
	};
})(jQuery);
