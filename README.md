
SV-Filtable
=================================================

**sv-filtable-js** is a vanilla JavaScript plugin for filtering a table. Give it a set of input fields and it will automagically filter when the user interacts with those inputs (e.g. types in a text field). Alternatively, use the explicit filter method to filter whenever you like!


## Auto-filter mode

The main mode of Filtable is automatic filtering of the table. Simply pass in the parent of the form fields (as a jQuery element), and Filtable will bind events to those inputs and filter the table whenever text is typed or options selected. Here's a quick step-by-step guide:

1. Start with a standard HTML data table:

		<table id="data">
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

3. Include the Filtable script:

		<script src="/path/to/sv-filtable.js"></script>

4. Call Filtable with HTMLElement objects (e.g. as returned from `document.querySelector``) for the table and form wrapper:

	const table = document.querySelector('#data');
	const controlPanel = document.querySelector('#table-filters');
	new SV.Filtable(table, controlPanel);

Done!


## Explicit filtering mode

Filtable allows you to explicitly filter a table whenever you like. The automatic filtering should be fine in most cases (and it's easier), but this mode allows more control where necessary. Just call the `applyFilters` method on the Filtable object, with an array of filters. A filter is an object containing `columns` and `value` properties. The `columns` property must be an array, with the column numbers being zero-indexed. For example, this represents a search of the first column for the string "test":

	[{ columns: [0], value: 'test' }]

While this combines two filters:

	[
		{ columns: [0], value: 'foo' },
		{ columns: [1], value: 'bar' }
	]

Here's the equivalent of the above auto-filter:

	const table = document.querySelector('#data');
	const filtable = new SV.Filtable(table);
	document.querySelector('#filter-country').addEventListener('keyup', function () {
		let search = this.value;
		let filter = {columns: [3], value: search};
		filtable.applyFilters([filter]);
	});


## Zebra-striping

Filtable also adds `odd` and `even` classes to the remaining visible table rows. This avoids zebra-striping problems when using the `nth-child` selector - for example if rows 2 and 4 are filtered out, rows 1, 3 and 5 would normally end up with the same colour. You can start with odd/even classes on your table in the HTML, or even use `nth-child` in the CSS (for brevity) with odd/even overrides.

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

Filtable supports custom events. Currently there are two: `sv.filtable.before` and `sv.filtable.after`, which are called respectively (can you guess?) *before* the table filtering begins and *after* filtering is finished. This allows you to, for example, display a message like "Processing..." while the filtering is occurring. The events are triggered on the table element itself.

	const table = document.querySelector('#data');
	const controlPanel = document.querySelector('#table-filters');
	const consoleMsg = document.querySelector('#console-msg');

	table.addEventListener('sv.filtable.before', function() {
		consoleMsg.textContent = 'Filtering table...';
	});
	table.addEventListener('sv.filtable.after', function() {
		consoleMsg.textContent = 'Done filtering!';
	});

	new SV.Filtable(table, controlPanel);
