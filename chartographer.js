/*!
Chartographer 0.0.0 (https://github.com/danmane/chartogrpaher)
Copyright 2014 Palantir Technologies
Licensed under MIT (https://github.com/danmane/chartographer/blob/master/LICENSE)
*/

var Chartographer;
(function (Chartographer) {
    var nameKey = "_chartographer_name";
    function dataset(key, data) {
        var metadata = {};
        metadata[nameKey] = key;
        return new Plottable.Dataset(data, metadata);
    }
    var validTypes = ["linear", "log", "ordinal", "time"];
    var camelCase = function (s) { return s[0].toUpperCase + s.substring(1); };
    var type2axis = { linear: "Numeric", log: "Numeric", ordinal: "Category", time: "Time" };
    var Chart = (function () {
        function Chart(datasets, spec) {
            this._xAccessor = "x";
            this._yAccessor = "y";
            this.colorVar = "fill";
            this.isNewStylePlot = false;
            if (datasets instanceof Array)
                datasets = { "": datasets };
            this.datasets = d3.entries(datasets).map(function (kv) { return dataset(kv[0], kv[1]); });
        }
        Chart.prototype._project = function (attr, accessor, scale) {
            if (attr === "color")
                attr = this.colorVar;
            if (this.isNewStylePlot) {
                this.plot.project(attr, accessor, scale);
            }
            else {
                this.plots.forEach(function (p) { return p.project(attr, accessor, scale); });
            }
        };
        Chart.prototype._generatePlots = function (x, y) {
            var _this = this;
            if (this.isNewStylePlot) {
                this.plot = new Plottable.Plot[this.plotType](x, y);
                this.datasets.forEach(function (d) { return _this.plot.addDataset(d.metadata().nameKey, d); });
            }
            else {
                this.plots = this.datasets.map(function (d) { return new Plottable.Plot[_this.plotType](d, x, y); });
            }
        };
        Chart.prototype.setType = function (t, isX) {
            t = t.toLowerCase();
            if (t === "time" && !isX)
                throw new Error("Can't use time as y-type");
            if (validTypes.indexOf(t) === -1)
                throw new Error("Unrecognized type" + t);
            return t;
        };
        Chart.prototype.xType = function (t) {
            this._xType = this.setType(t, true);
            return this;
        };
        Chart.prototype.yType = function (t) {
            this._yType = this.setType(t, false);
            return this;
        };
        Chart.prototype.xAccessor = function (accessor) {
            this._xAccessor = accessor;
            return this;
        };
        Chart.prototype.yAccessor = function (accessor) {
            this._yAccessor = accessor;
            return this;
        };
        Chart.prototype.deduceType = function (accessor, dataset) {
            var data = dataset.data();
            var a = typeof (accessor) === "string" ? function (x) { return x[accessor]; } : accessor;
            var d = a(data[0]);
            if (d instanceof Date)
                return "time";
            if (typeof (d) === "number")
                return "linear";
            if (typeof (d) === "string")
                return "ordinal";
            console.log("Data type couldn't be deduced; see example");
            console.log(d);
            throw new Error("Unrecognized data type");
        };
        Chart.prototype._setup = function () {
            this._xType || (this._xType = this.deduceType(this.xAccessor, this.datasets[0]));
            this._yType || (this._yType = this.deduceType(this.yAccessor, this.datasets[0]));
            var xScale = new Plottable.Scale[camelCase(this._xType)]();
            var yScale = new Plottable.Scale[camelCase(this._yType)]();
            var colorScale = new Plottable.Scale.Color();
            var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
            var legend = new Plottable.Component.HorizontalLegend(colorScale);
            this._generatePlots(xScale, yScale);
            this._project("x", this._xAccessor, xScale);
            this._project("y", this._yAccessor, yScale);
            this._project("color", function (d, i, m) { return m[nameKey]; });
            var center = this.plot || new Plottable.Component.Group(this.plots);
            center.merge(gridlines);
            var xAxis = new Plottable.Axis[type2axis[this._xType]](xScale, "bottom");
            var yAxis = new Plottable.Axis[type2axis[this._yType]](yScale, "left");
            var table = new Plottable.Component.Table([
                [null, legend],
                [yAxis, center],
                [null, xAxis]
            ]);
            return table;
        };
        Chart.prototype.renderTo = function (svg) {
            this._setup().renderTo(svg);
        };
        return Chart;
    })();
    Chartographer.Chart = Chart;
    var LineChart = (function () {
        function LineChart() {
            this.plotType = "Line";
        }
        return LineChart;
    })();
    Chartographer.LineChart = LineChart;
})(Chartographer || (Chartographer = {}));
