import Highcharts from 'highcharts';
import 'highcharts/modules/data.js';
import 'highcharts/modules/exporting.js';
import 'highcharts/modules/offline-exporting.js';
import 'highcharts/modules/accessibility.js';
export function barCharts(op = {}) {
    const { element = '', type = '', title = '', subtitle = '', xAxisTitle = '',
        xAxisType = '', yAxisTitle = '', series = [],
        drilldown = {} } = op;
    Highcharts.chart(element, {
        chart: {
            type: type
        },
        title: {
            text: title
        },
        subtitle: {
            text: subtitle
        },
        accessibility: {
            announceNewData: {
                enabled: true
            }
        },
        xAxis: {
            title: {
                text: xAxisTitle
            },
            type: xAxisType
        },
        yAxis: {
            title: {
                text: yAxisTitle
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.0f}'
                }
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">${series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: ' +
                '<b>{point.y:.0f}</b> of total<br/>'
        },
        series: series,
        drilldown: {
            breadcrumbs: {
                position: {
                    align: 'right'
                }
            },
            ...drilldown
        },
        exporting: {
            fallbackToExportServer: false,
            enabled: true
        },
    });
}