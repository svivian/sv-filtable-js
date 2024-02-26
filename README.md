SV-Filtable
=================================================

**sv-filtable-js** is a vanilla JavaScript library for filtering a table. Give it a set of input fields and it will automagically filter the table when the user interacts with those inputs, such as typing in a text field. Filtering can also be performed manually if desired, and there are events that can be hooked into for custom behaviour.

Note: this library used to be a jQuery plugin - if you are looking for that, grab it from the [v1.2 tag](https://github.com/svivian/sv-filtable-js/releases/tag/v1.2).

If you're looking for table sorting as well, check out [SV-Sortable](https://github.com/svivian/sv-sortable-js). Both libraries are independent but work nicely in tandem.


## Auto-filter mode

The main mode of Filtable is automatic filtering of the table. Simply pass in the table element and wrapper containing input fields, and Filtable will bind events to those inputs and filter the table whenever text is typed or options selected. Here's a quick step-by-step guide:

1. Start with a standard HTML data table:

	```html
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
	```

2. Add some basic CSS. Filtable adds a `hidden` class to unmatched rows, so the only required CSS is:

	```css
	tr.hidden {
		display: none;
	}
	```

3. Add your filter, e.g. a basic text input. Here we put it in a wrapper div:

	```html
	<div id="table-filters">
		<label for="filter-country">Country:</label>
		<input type="text" id="filter-country" data-filter-col="3">
	</div>
	```

	The `data-filter-col` attribute states which column will get filtered (zero-indexed). See below for all options.

4. Include the Filtable script in your page's `<head>`. For performance reasons we are using the `defer` attribute:

	```html
	<script defer src="/path/to/sv-filtable.js"></script>
	```

5. Call `SV.Filtable` with HTMLElement objects for the table and form wrapper (such as those returned from `document.querySelector`). As we are deferring script loading, we must run this after page load:

	```html
	<script>
	// Run on page load
	document.addEventListener('DOMContentLoaded', function() {
		const table = document.querySelector('#data');
		const controlPanel = document.querySelector('#table-filters');
		new SV.Filtable(table, controlPanel);
	});
	</script>
	```

Voila! Typing in the text box will now filter the table on the fourth column.


## Supported filters & options

Filtable supports text inputs, select dropdowns, and checkboxes. Text inputs can be either `<input type="text">` or `<input type="search">` (the latter helpfully adds an X to clear the input).

For all inputs, the `data-filter-col` attribute can be used to specify which column(s) to filter. Columns are zero-indexed, i.e. the first column is `0` and the fourth is `3`. Multiple columns can be specified by delimiting with commas e.g. `0,1` to match either of the first two columns. If the attribute is omitted, all columns are searched.

For text inputs, the search value is taken from whatever is typed in the box, and a fuzzy search is used (i.e. 'a' matches all rows containing the letter a somewhere). For the others, the value is taken from the `value` attribute of the selected option or checkbox, and an exact match is used.

Table cells may also specify the `data-filter-value` attribute, which is used to override the cell's text value when filtering. This is useful when cells contain non-textual content such as images. For example if our table contained a tick or cross depending on some attribute, we can set the attribute to Y or N accordingly, and use a checkbox with a value of Y:

```html
<!-- in the filters -->
<label><input type="checkbox" id="filter-europe" value="Y" data-filter-col="4"> Europe</label>

<!-- in the table, an extra column with a tick for Europe -->
<tr>
	<td>Basil</td>
	<td>Brush</td>
	<td>London</td>
	<td>UK</td>
	<td data-filter-value="Y"><img src="tick.png"></td>
</tr>
```

### Zebra-striping

The third argument to the constructor is an options object, which can be used to override the default options. There is currently one option, `zebraStriping`, which will add alternating `odd` and `even` classes to the remaining visible table rows. This avoids zebra-striping problems in CSS when using the `nth-child` selector - for example if rows 2 and 4 are filtered out, rows 1, 3 and 5 would normally end up with the same colour. Example usage:

```js
new SV.Filtable(table, controlPanel, {zebraStriping: true});
```

You can start with odd/even classes on your table in the HTML, or even use `nth-child` in the CSS (for brevity) with odd/even overrides. Here's some example CSS, for a table with class `data-table`. The `nth-child` rule will be used on the default table set up, while the `.odd` and `.even` rules will be used when the table is filtered.

```css
.data-table tr:nth-child(odd) > td {
	background-color: #ffffff;
}
.data-table tr:nth-child(even) > td {
	background-color: #f4f4f2;
}
.data-table tr.odd > td {
	background-color: #ffffff;
}
.data-table tr.even > td {
	background-color: #f4f4f2;
}
```


## Methods

The Filtable object contains some public methods, which can be used to manually apply filtering.

### `.applyFilters(filters)`

The `applyFilters` method allows you to explicitly filter a table whenever you like. The automatic filtering should be fine in most cases (and it's easier), but this mode allows more control where necessary. An array of filters must be passed into the function - a filter is an object containing `columns` and `value` properties. The `columns` property must be an array, with the column numbers being zero-indexed. For example, this represents a search of the first column for the string "test":

```js
[{ columns: [0], value: 'test' }]
```

While this combines two filters:

```js
[
	{ columns: [0], value: 'foo' },
	{ columns: [1], value: 'bar' }
]
```

Here's the equivalent of the auto-filter from the previous section:

```js
const table = document.querySelector('#data');
const filtable = new SV.Filtable(table);
document.querySelector('#filter-country').addEventListener('keyup', function () {
	let search = this.value;
	let filter = {columns: [3], value: search};
	filtable.applyFilters([filter]);
});
```

### `.buildFilters()`

The `buildFilters` method returns an array of filters based on the current state of the filter elements. This is useful if you want to apply custom filters as above, but base them on the current state.

### `.restripeTable()`

Filtable can automatically add zebra striping to the table (see above), however it only works during Filtable's own operations. The `restripeTable` method can be used if you changed the table rows externally in some way, for example using my other plugin, [SV-Sortable](https://github.com/svivian/sv-sortable-js). In this example we hook into an event from that plugin to reset the striping when a table is sorted:

```js
const sortable = new SV.Sortable(table);
const filtable = new SV.Filtable(table, controlPanel);

table.addEventListener('sv.sortable.after', function() {
	filtable.restripeTable();
});
```


## Events

Filtable supports two custom events: `sv.filtable.before` and `sv.filtable.after`, which are called respectively (can you guess?) *before* the table filtering begins and *after* filtering is finished. This allows you to, for example, display a message like "Processing..." while the filtering is occurring. The events are triggered on the table element itself.

```js
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
```
