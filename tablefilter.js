
(function ($) {
	$.fn.tablefilter = function (settings) {
		settings = $.extend({
			filters: []
		}, settings);

		var zebra = ['even','odd'];

		return this.each(function () {
			var $table = $(this);
			$table.trigger('beforetablefilter');

			// Run filter asynchronously to force browser redraw on beforetablefilter and avoid locking the browser
			setTimeout(function() {
				var stripe = 0;
				// currently only support one tbody
				var $oldTbody = $table.find('> tbody');

				$oldTbody.each(function(){
					// copy the table body so we can make changes with speed
					var $newTbody = $oldTbody.clone();

					$newTbody.find('> tr').each(function(){
						var $tr = $(this);
						var showTR = true;
						// reset zebra stripes
						$tr.removeClass( zebra.join(' ') );

						for ( var i = 0, len = settings.filters.length; i < len; i++ )
						{
							var col = settings.filters[i].column;
							var val = settings.filters[i].value;

							var $td = $tr.find('td').eq(col);
							if ( $td.text().indexOf(val) < 0 ) {
								showTR = false;
								break;
							}
							else {
								$tr.addClass( zebra[stripe] );
								stripe = 1 - stripe;
							}
						}

						if ( showTR )
							$tr.removeClass('hidden');
						else
							$tr.addClass('hidden');
					});

					// replace old tbody with this one
					$oldTbody.replaceWith($newTbody);
				});
			}, 10);
		});
	};
})(jQuery);
