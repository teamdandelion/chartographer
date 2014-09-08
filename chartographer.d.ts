declare module Chartographer {
    class Chart {
        private _xType;
        private _yType;
        private _xAccessor;
        private _yAccessor;
        private datasets;
        private plots;
        private plot;
        private _xLabel;
        private _yLabel;
        private _titleLabel;
        colorVar: string;
        isNewStylePlot: boolean;
        plotType: string;
        constructor(datasets: any, spec: any);
        _project(attr: string, accessor: any, scale?: Plottable.Abstract.Scale<any, any>): void;
        _generatePlots(x: Plottable.Abstract.Scale<any, number>, y: Plottable.Abstract.Scale<any, number>): void;
        private setType(t, isX);
        xType(t: string): Chart;
        yType(t: string): Chart;
        xAccessor(accessor: any): Chart;
        yAccessor(accessor: any): Chart;
        titleLabel(label: string): Chart;
        xLabel(label: string): Chart;
        yLabel(label: string): Chart;
        private deduceType(accessor, dataset);
        _setup(): Plottable.Component.Table;
        renderTo(svg: any): void;
    }
    class LineChart extends Chart {
        plotType: string;
    }
    class ScatterChart extends Chart {
        plotType: string;
    }
    class BarChart extends Chart {
        plotType: string;
        isNewStylePlot: boolean;
    }
    class StackedBarChart extends BarChart {
        plotType: string;
    }
}
