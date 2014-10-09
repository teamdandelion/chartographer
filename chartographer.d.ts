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
        private colorRange;
        private hasDeployed;
        constructor(datasets: any, spec: any);
        xType(t: string): Chart;
        yType(t: string): Chart;
        xAccessor(accessor: any): Chart;
        yAccessor(accessor: any): Chart;
        colors(colors: string[]): Chart;
        titleLabel(label: string): Chart;
        xLabel(label: string): Chart;
        yLabel(label: string): Chart;
        renderTo(svg: any): void;
        _project(attr: string, accessor: any, scale?: Plottable.Scale.AbstractScale<any, any>): void;
        _generatePlots(x: Plottable.Scale.AbstractScale<any, number>, y: Plottable.Scale.AbstractScale<any, number>): void;
        private setType(t, isX);
        private deduceType(accessor, dataset);
        private modifyDataForNewStylePlot();
        getComponents(): ChartComponents;
    }
    class LineChart extends Chart {
        plotType: string;
        colorVar: string;
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
        isNewStylePlot: boolean;
    }
}
