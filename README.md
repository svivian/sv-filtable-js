jQuery Table Filter plugin
=============================

A jQuery plugin to filter a table. Simply pass in a set of filters detailing the columns to be filtered.

A filter is an object containing `column` and `value` properties. For example, this represents a search of the first column for the string "test":

	{ column: 0, value: 'test' }

The plugin accepts an array of such filters in the "filters" parameter. For example this filters the table to rows where the first cell contains "hello" *and* the third cell contains "world":

	var myfilters = [{ column: 0, value: 'hello' }, { column: 2, value: 'world' }];
	$('#mytable').tablefilter({ 'filters': myfilters });
