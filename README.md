
Filtable - a jQuery table filtering plugin
=================================================

Filtable is a simple jQuery plugin to filter a table. Give it a set of input fields and it will automatically filter when the user interacts with those inputs (e.g. types in a text field). Alternatively, use the explicit filter method to filter whenever you like!

Current version: 0.10


## Auto-filter mode

The main mode of Filtable is automatic filtering of the table. Simply pass in the parent of the form fields (as a jQuery element), and Filtable will bind events to those inputs and filter the table whenever text is typed or options selected. Here's a quick step-by-step guide:

1. Start with a standard HTML data table:

		<table id="mytable">
		<thead>
			<tr>
				<th>First name</th>
				<th>Last name</th>
				<th>City</th>
				<th>Country</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Homer</td>
				<td>Simpson</td>
				<td>Springfield</td>
				<td>USA</td>
			</tr>
			<!-- ...and so on -->
		</tbody>
		</table>

2. Add your filter, e.g. a basic text input. Here we put it in a wrapper div:

		<div id="table-filters">
			<label for="filter-country">Country:</label>
			<input type="text" id="filter-country" data-filter-col="3">
		</div>

	The `data-filter-col` attribute states which column will get filtered. The column is zero-indexed, i.e. the first column is `0` and the fourth is `3`. Multiple columns can be specified by delimiting with commas e.g. `0,1` to match either of the first two columns.

3. Include jQuery and Filtable:

		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
		<script src="filtable.js"></script>

4. Call Filtable on the table and pass the wrapper div as the `controlPanel` parameter:

		$('#mytable').filtable({ controlPanel: $('#table-filters') });

Done!


## Explicit filtering mode

Filtable allows you to explicitly filter a table whenever you like. The automatic filtering should be fine in most cases (and it's easier), but this mode allows more control where necessary. Just call Filtable with the string `'filter'` as the first parameter, then specify an array of filters in the options parameter.

A filter is an object containing `columns` and `value` properties. For example, this represents a search of the first column for the string "test":

	{ column: 0, value: 'test' }

Here's the equivalent of the above auto-filter:

	$('#filter-country').on('keyup', function () {
		var search = $(this).val();
		var filter = {columns: 3, value: search};
		$('#mytable').filtable('filter', {filters: [filter]});
	});

Here is a more complex example. We have a "name" input that filters on the first or last name, plus our "country" filter. This filters the table to rows where the name contains "simp" *and* the country contains "united":

	var myfilters = [{ columns: '0,1', value: 'simp' }, { column: 3, value: 'united' }];
	$('#mytable').filtable('filter', {filters: myfilters});


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

Filtable supports custom events. Currently there are two: `beforetablefilter` and `aftertablefilter`, which are called respectively (can you guess?) *before* the table filtering begins and *after* filtering is finished. This allows you to, for example, display a message like "Processing..." while the filtering is occurring.

	var $table = $('#mytable');
	$table.on('beforetablefilter', function (event) {
		$('#msg').text('Filtering table...')
	});
	$table.on('aftertablefilter', function (event) {
		$('#msg').text('Done filtering!')
	});
	$table.filtable({ filters: myfilters });
