module Chartographer {
  export class Chart {
    private xType: string; // "linear", "log", "ordinal", "time"
    private yType: string; // "linear", "log", "ordinal"
    private xAccessor: any = "x";
    private yAccessor: any = "y"
    private dataArrays: any[][] = [];

    private plots: Plottable.Abstract.Plot[];
    private plot: Plottable.Abstract.NewStylePlot;

    private xLabel: string;
    private yLabel: string;
    private titleLabel: string;

    public isNewStylePlot = false;

    public dataset(name: string, data: any[]) {
      this.dataArrays.append(data);
      var dataset = new Plottable.Dataset(data, {name: name});
      if (isNewStylePlot) {
        this.plot.addDataset(name, dataset);
      } else {
        this.plots.append(this._getPlot(dataset));
      }
    }

    public xAccessor(accessor: any) {this.xAccessor = accessor; return this;}
    public yAccessor(accessor: any) {this.yAccessor = accessor; return this;}

    /* Should only be called for specifying "linear" vs "log", otherwise chartographer can deduce this */
    public xType(type: string) {this.xType = type; return this;}
    public yType(type: string) {this.yType = type; return this;}

    public _getPlot(dataset: Plottable.Dataset) {return this; /* override */}

    private deduceType(accessor: any, data: any[]) {
      var a = typeof(accessor) === "string" ? (x: any) =>
    }

    public renderTo(svg: any) {

    }
  }
}
