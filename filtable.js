
(function ($) {

	// zebra striping classes
	var zebra = ['odd','even'];

	var methods = {
		// [public] Default setup, taking a source jQuery object for automatic filtering
		init: function (options) {
			// console.log(arguments);

			options = $.extend({
				controls: null,
				handleSort: true
			}, options);

			var $table = $(this);

			$('input[type="text"]', options.controls).on('keyup', function () {
				var cols = $(this).data('filter');
				var val = $(this).val();
				var filter = [{ column: cols, value: val }];

				var args = [{'filters': filter}];
				methods.filter.apply( $table, args );
			});
		},

		// [public] Do the actual filtering
		filter: function (options) {
			options = $.extend({
				filters: [],
				handleSort: true
			}, options);

			// console.log(options.filters.columns);

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
						for ( var i = 0, len = options.filters.length; i < len; i++ ) {
							var col = options.filters[i].column;
							var val = options.filters[i].value.toLowerCase();

							var $td = $tr.find('td').eq(col);
							if ( $td.text().toLowerCase().indexOf(val) < 0 ) {
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
					}
					else {
						$tr.addClass('hidden');
					}
				});

				// Replace old tbody with the modified copy
				$oldTbody.replaceWith($newTbody);
			});
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
