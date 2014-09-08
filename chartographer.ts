module Chartographer {
  export class Chart {
    private xType: string; // "Linear", "Log", "Ordinal", "Time"
    private yType: string; // "Linear", "Log", "Ordinal"
    private xAccessor: any = "x";
    private yAccessor: any = "y"
    private dataArrays: any[][] = [];
    private dataCounter = 0;

    private plots: Plottable.Abstract.Plot[];
    private plot: Plottable.Abstract.NewStylePlot;

    private xLabel: string;
    private yLabel: string;
    private titleLabel: string;

    public colorVar = "fill";

    public isNewStylePlot = false;

    public dataset(key: string, data: any[]);
    public dataset(data: any[]);
    public dataset(keyOrData: any, data?: any[]) {
      var key = typeof(keyOrData) === "string" ? keyOrDatset : (dataCounter++).toString();
      data = typeof(keyOrData) === "string"? data : keyOrDataset;
      if (!data.length) throw new Error("I'm expecting some array thingy for data, work with me please");
      if (data.length === 0) throw new Error("Adding empty data is just silly. Whatchya tryna do?");
      this.dataArrays.append(data);
      var dataset = new Plottable.Dataset(data, {_chartographer_name: name});
      if (isNewStylePlot) {
        this.plot.addDataset(name, dataset);
      } else {
        this.plots.append(this._getPlot(dataset));
      }
    }

    public xAccessor(accessor: any) {this.xAccessor = accessor; return this;}
    public yAccessor(accessor: any) {this.yAccessor = accessor; return this;}

    public _getPlot(dataset: Plottable.Dataset) {return this; /* override */}

    private deduceType(accessor: any, data: any[]) {
      var a = typeof(accessor) === "string" ? (x) => x[accessor] : accessor;
      var d = a(data[0]);
      if (d instanceof Date) return "time";
      if (typeof(d) === "number") return "linear";
      if (typeof(d) === "string") return "ordinal";
      console.log("Sorry (wo)man, I can't figure out what type of data we're working with here. Here's an example of what I'm seeing:");
      console.log(d);
      throw new Error("Unrecognized data type :/");
    }

    public _setup(): Plottable.Component.Table {
      var xScale = new Plottable.Scale[xType]();
      var yScale = new Plottable.Scale[yType]();
      var colorScale = new Plottable.Scale.Color();
      var gridlines = new Plottable.Component.Gridlines(xScale, yScale);
      var legend = new Plottable.Component.HorizontalLegend(colorScale);
      this.project("x", this.xAccessor, xScale);
      this.project("y", this.yAccessor, yScale);
      this.project("color", (d,i,m) => m["_chartographer_name"]);
      var center = this.plot ? this.plot : new ComponentGroup(this.plots);
      center.merge(gridlines);
      var table = new Plottable.Component.Table([
        [null, legend],
        [yAxis, center],
        [null, xAxis]
      ]);
      return table;
    }

    public renderTo(svg: any) {this._setup().renderTo(svg);}
  }
}
