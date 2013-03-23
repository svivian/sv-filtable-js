
(function ($) {
	$.fn.filtable = function (settings) {
		settings = $.extend({
			filters: [],
			handleSort: true
		}, settings);

		var zebra = ['odd','even'];

		// Loops through the table rows
		var handleRowsThenStripe = function ($table, callback) {
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
		};

		return this.each(function () {
			var $table = $(this);
			$table.trigger('beforetablefilter');

			// Re-stripe rows when the table gets sorted by Stupid-Table-Plugin
			if ( settings.handleSort ) {
				$table.on('aftertablesort', function (event, data) {
					handleRowsThenStripe($table, function ($tr) {
						return !$tr.hasClass('hidden');
					});
				});
			}

			// Run filter asynchronously to force browser redraw on beforetablefilter and avoid locking the browser
			setTimeout(function () {
				handleRowsThenStripe($table, function ($tr) {
					// Callback function that does the processing
					for ( var i = 0, len = settings.filters.length; i < len; i++ ) {
						var col = settings.filters[i].column;
						var val = settings.filters[i].value.toLowerCase();

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
	};
})(jQuery);
