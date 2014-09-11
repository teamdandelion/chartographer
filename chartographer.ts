module Chartographer {
  /*
   * Plottable is currently undergoing an API shift; new plots (aka "NewStylePlots")
   * have a more advanced API that accepts multiple datasets, but not all plots are
   * so enlightened. Until the old plots are converted (should be by end of September),
   * there is some casing logic to access the old API for old plots.
   **/

  interface ChartComponents {
    xScale: Plottable.Abstract.Scale<any, any>;
    yScale: Plottable.Abstract.Scale<any, any>;
    colorScale: Plottable.Abstract.Scale<any, string>;
    xAxis: Plottable.Abstract.Axis;
    yAxis: Plottable.Abstract.Axis;
    xLabel?: Plottable.Component.AxisLabel;
    yLabel?: Plottable.Component.AxisLabel;
    titleLabel?: Plottable.Component.TitleLabel;
    legend?: Plottable.Component.HorizontalLegend;
    plot?: Plottable.Abstract.NewStylePlot<any,any>; // if non NewStylePlot
    plots?: Plottable.Abstract.Plot[]; // if NewStylePlot
    table: Plottable.Component.Table;
  }

  export class Chart {
    private _xType: string; // "Linear", "Log", "Ordinal", "Time"
    private _yType: string; // "Linear", "Log", "Ordinal"
    private _xAccessor: any = "x";
    private _yAccessor: any = "y"
    private datasets: Plottable.Dataset[];

    private plots: Plottable.Abstract.XYPlot<any,any>[];
    private plot: Plottable.Abstract.NewStylePlot<any,any>;
    private _xLabel: string;
    private _yLabel: string;
    private _titleLabel: string;
    public colorVar = "fill";
    public isNewStylePlot = false;
    public plotType: string;
    private colorRange: string[];
    private hasDeployed = false;
    // Chartographer deploys by rendering, or providing its pieces.

    constructor(datasets: any, spec: any) {
      if (datasets instanceof Array) datasets = {"": datasets};
      datasets = d3.entries(datasets);
      this.datasets = datasets.map((kv) => makeDataset(kv.key, kv.value));
    }

    /* Manually set the xType for the data: "Linear" || "Log" || "Ordinal" || "Time" */
    public xType(t: string) {this._xType = this.setType(t, true);  return this;}
    /* Manually set the yType for the data: "Linear" || "Log" || "Ordinal" || "Time" */
    public yType(t: string) {this._yType = this.setType(t, false); return this;}
    public xAccessor(accessor: any) {this._xAccessor = accessor; return this;}
    public yAccessor(accessor: any) {this._yAccessor = accessor; return this;}
    public colors(colors: string[]) {this.colorRange = colors; return this;}
    public titleLabel(label: string) {this._titleLabel = label; return this;}
    public xLabel(label: string) {this._xLabel = label; return this;}
    public yLabel(label: string) {this._yLabel = label; return this;}

    public renderTo(svg: any) {
      this.getComponents().table.renderTo(svg);
    }

    public _project(attr: string, accessor: any, scale?: Plottable.Abstract.Scale<any,any>) {
      if (this.isNewStylePlot) {
        this.plot.project(attr, accessor, scale);
      } else {
        this.plots.forEach((p: Plottable.Abstract.Plot) => p.project(attr, accessor, scale));
      }
    }

    public _generatePlots(x: Plottable.Abstract.Scale<any,number>, y: Plottable.Abstract.Scale<any,number>) {
      if (this.isNewStylePlot) {
        this.plot = new Plottable.Plot[this.plotType](x, y);
        this.datasets.forEach((d: Plottable.Dataset) => this.plot.addDataset(d.metadata()[nameKey], d));
      } else {
        this.plots = this.datasets.map((d: Plottable.Dataset) => new Plottable.Plot[this.plotType](d, x, y));
      }
    }

    private setType(t: string, isX: boolean) {
      t = t.toLowerCase();
      if (t === "time" && !isX) throw new Error("Can't use time as y-type");
      if (validTypes.indexOf(t) === -1) throw new Error("Unrecognized type" + t);
      if (t === "log") t = "modifiedLog";
      return t;
    }

    private deduceType(accessor: any, dataset: Plottable.Dataset) {
      var data = dataset.data();
      var a = typeof(accessor) === "string" ? (x) => x[accessor] : accessor;
      var d = a(data[0]);
      if (d instanceof Date) return "time";
      if (typeof(d) === "number") return "linear";
      if (typeof(d) === "string") return "ordinal";
      console.log("Data type couldn't be deduced; here's an example");
      console.log(d);
      throw new Error("Unrecognized data type");
    }

    private modifyDataForNewStylePlot() {
      // This code will disappear once NewStylePlots are universally supported in Plottable
      this.datasets.forEach((dataset) => {
        var key = dataset.metadata()[nameKey];
        dataset.data().forEach((v) => v[nameKey] = key);
      });
    }

    public getComponents(): ChartComponents {
      if (this.isNewStylePlot) this.modifyDataForNewStylePlot();
      this._xType || (this._xType = this.deduceType(this._xAccessor, this.datasets[0]));
      this._yType || (this._yType = this.deduceType(this._yAccessor, this.datasets[0]));
      var xScale = new Plottable.Scale[camelCase(this._xType)]();
      var yScale = new Plottable.Scale[camelCase(this._yType)]();
      var colorScale = new Plottable.Scale.Color();
      if (this.colorRange) colorScale.range(this.colorRange);
      var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
      var legend = colorScale.domain().length > 1 ? new Plottable.Component.HorizontalLegend(colorScale) : null;
      this._generatePlots(xScale, yScale);
      this._project("x", this._xAccessor, xScale);
      this._project("y", this._yAccessor, yScale);
      var colorAccessor: any = this.isNewStylePlot ? nameKey : (d,i,m) => m[nameKey];
      this._project(this.colorVar, colorAccessor, colorScale);
      var center: any = this.plot || new Plottable.Component.Group(this.plots);
      center.merge(gridlines);
      var xAxis = new Plottable.Axis[type2axis[this._xType]](xScale, "bottom");
      var yAxis = new Plottable.Axis[type2axis[this._yType]](yScale, "left");
      var titleLabel = this._titleLabel ? new Plottable.Component.TitleLabel(this._titleLabel) : null;
      var xLabel = this._xLabel ? new Plottable.Component.AxisLabel(this._xLabel) : null;
      var yLabel = this._yLabel ? new Plottable.Component.AxisLabel(this._yLabel, "left") : null;
      var table = new Plottable.Component.Table([
        [null, null, titleLabel],
        [null, null, legend],
        [yLabel, yAxis, center],
        [null, null, xAxis],
        [null, null, xLabel]
      ]);
      table.classed("chartographer", true);
      var chartComponents: ChartComponents = {
        xScale: xScale, yScale: yScale, colorScale: colorScale,
        gridlines: gridlines, legend: legend, xAxis: xAxis, yAxis: yAxis,
        center: center, plot: this.plot, plots: this.plots,
        titleLabel: titleLabel, xLabel: xLabel, yLabel: yLabel,
        table: table
      };
      return chartComponents;
    }
  }

  export class LineChart extends Chart {
    public plotType = "Line";
    public colorVar = "stroke";
  }

  export class ScatterChart extends Chart {
    public plotType = "Scatter";
  }

  export class BarChart extends Chart {
    public plotType = "ClusteredBar";
    public isNewStylePlot = true;
  }

  export class StackedBarChart extends BarChart {
    public plotType = "StackedBar";
    public isNewStylePlot = true;
  }

  var nameKey = "_chartographer_name";
  var makeDataset = (key: string, data: any[]) => new Plottable.Dataset(data, {"_chartographer_name": key});
  var validTypes = ["linear", "log", "ordinal", "time"];
  var camelCase = (s: string) => s[0].toUpperCase() + s.substring(1);
  var type2axis = {linear: "Numeric", modifiedLog: "Numeric", ordinal: "Category", time: "Time"};

}
