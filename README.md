
Filtable - a jQuery table filtering plugin
=================================================

Filtable is a simple jQuery plugin to filter a table. Give it a set of filters detailing the search terms and columns to search, and it will reduce the table to only the rows containing those terms.

## Filters

A filter is an object containing `column` and `value` properties. For example, this represents a search of the first column for the string "test":

	{ column: 0, value: 'test' }

Filtable accepts an array of such filters in the "filters" parameter. For example this filters the table to rows where the first cell contains "hello" *and* the third cell contains "world":

	var myfilters = [{ column: 0, value: 'hello' }, { column: 2, value: 'world' }];
	$('#mytable').filtable({ 'filters': myfilters });

## Zebra-striping

Filtable also adds `odd` and `even` classes to the remaining visible table rows. This avoids zebra-striping problems when using the `nth-child` selector - for example if rows 2 and 4 are filtered out, rows 1, 3 and 5 would normally end up with the same colour. You can start with odd/even classes on your table in the HTML, or even use `nth-child` in the CSS (for bevity) with odd/even overrides.

Here's some example CSS, for a table with class `data-table`. The `nth-child` rule will be used on the default table set up, while the `.even` and `.odd` rules will be used when the table is filtered.

	.data-table th,
	.data-table td {
		border-width: 1px 0;
		border-style: solid;
		border-color: #c4c4c4;
	}

	.data-table tr:nth-child(even) > td,
	.data-table tr.even > td {
		background-color: #f6f6f6;
	}
	.data-table tr:nth-child(odd) > td,
	.data-table tr.odd > td {
		background-color: #ffffff;
	}

	.data-table tr.hidden {
		display: none;
	}

## Events

Filtable supports custom events. Currently there are two: `beforetablefilter` and `aftertablefilter`, which are called respectively (can you guess?) before the table filtering begins and after filtering is finished. This allows you to for example display a message like "Processing..." while the filtering is occurring.

	var $table = $('#mytable');
	$table.on('beforetablefilter', function (event) {
		$('#msg').text('Filtering table...')
	});
	$table.on('aftertablefilter', function (event) {
		$('#msg').text('Done filtering!')
	});
	$table.filtable({ filters: myfilters });
