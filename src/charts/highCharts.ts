import type HighchartsType from 'highcharts';

type ChartSeries = HighchartsType.SeriesOptionsType;

type BarChartOptions = {
    element: string;
    type?: NonNullable<HighchartsType.Options['chart']>['type'];
    title?: string;
    subtitle?: string;
    xAxisTitle?: string;
    yAxisTitle?: string;
    xAxisType?: 'category' | 'linear' | 'datetime' | 'logarithmic';
    series?: ChartSeries[];
    drilldown?: HighchartsType.DrilldownOptions;
};

export async function barCharts(op: BarChartOptions): Promise<void> {
    // Dynamic import all Highcharts modules
    const [HighchartsModule, DataModuleModule, ExportingModule, OfflineExportingModule, AccessibilityModule] = await Promise.all([import('highcharts'), import('highcharts/modules/data'), import('highcharts/modules/exporting'), import('highcharts/modules/offline-exporting'), import('highcharts/modules/accessibility')]);
    const Highcharts = HighchartsModule as typeof import('highcharts');
    (DataModuleModule as unknown as (hc: typeof Highcharts) => void)(Highcharts);
    (ExportingModule as unknown as (hc: typeof Highcharts) => void)(Highcharts);
    (OfflineExportingModule as unknown as (hc: typeof Highcharts) => void)(Highcharts);
    (AccessibilityModule as unknown as (hc: typeof Highcharts) => void)(Highcharts);
    const { element, type = 'column', title = '', subtitle = '', xAxisTitle = '', xAxisType = 'category', yAxisTitle = '', series = [], drilldown = {} } = op;
    Highcharts.chart(element, {
        chart: {
            type,
        },
        title: {
            text: title,
        },
        subtitle: {
            text: subtitle,
        },
        accessibility: {
            announceNewData: {
                enabled: true,
            },
        },
        xAxis: {
            title: {
                text: xAxisTitle,
            },
            type: xAxisType,
        },
        yAxis: {
            title: {
                text: yAxisTitle,
            },
        },
        legend: {
            enabled: false,
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.0f}',
                },
            },
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: ' + '<b>{point.y:.0f}</b> of total<br/>',
        },
        series,
        drilldown: {
            breadcrumbs: {
                position: {
                    align: 'right',
                },
            },
            ...drilldown,
        },
        exporting: {
            fallbackToExportServer: false,
            enabled: true,
        },
    });
}
