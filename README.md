## Chartographer

Charographer is a simple declarative API for creating pretty charts on websites. It uses [Plottable](http://plottablejs.org/), a modular charting library, to create easy reusable charts. Since Plottable is built on D3, it implicitly uses D3 and SVG for rendering. CSS can be used for most styling (e.g. font sizes and gridline thickness) although color choice depends on API usage.

Chartographer makes it trivially easy to produce elegant charts, and its API has a 1-to-1 correspondance with JSON, so charts can be generated using its API or by inputting properly formatted JSON objects.

Chartographer strongly favors convention over configuration. If you want to make more bespoke charts or tweak them, Plottable is a far more flexible library for chart creation. The Chartographer source is deliberately simple to read and Chartographer templates are a great jumping off point for creating more complex charts using Plottable.

## License

Chartographer is made available under the MIT License.  Copyright 2014, Palantir Technologies.
