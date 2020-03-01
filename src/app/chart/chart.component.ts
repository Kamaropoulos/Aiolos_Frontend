import { Component, OnInit } from '@angular/core';
// Dirty fix for `require` type definition
declare var require: any;
const CanvasJS = require('../../assets/canvasjs.min');
import { LogsService } from '@app/logs.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {
  sub: any;

  constructor(private logsService: LogsService) {}

  dataPoints: Array<Array<Object>> = [];

  chart: any;

  toggleDataSeries(e: any) {
    if (typeof e.dataSeries.visible === 'undefined' || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    this.chart.render();
  }

  dataConfig: Array<Object> = [];

  async ngOnInit() {
    let data = await this.logsService.getLogsFirstRun();
    for (const key in data[0]['sensorReadings']) {
      if (data[0]['sensorReadings'].hasOwnProperty(key)) {
        const element = data[0]['sensorReadings'][key];
        this.dataPoints[key] = [];
        this.dataConfig.push({
          type: 'line',
          xValueType: 'dateTime',
          // yValueFormatString: "$####.00",
          xValueFormatString: 'hh:mm:ss TT',
          showInLegend: true,
          name: key,
          dataPoints: this.dataPoints[key]
        });
      }
    }
    let dpsLength = 0;
    this.chart = new CanvasJS.Chart('chartContainer', {
      zoomEnabled: true,
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: 'Sensor Readings'
      },
      axisX: {
        scaleBreaks: {
          autoCalculate: true
        }
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: 'pointer',
        verticalAlign: 'top',
        fontSize: 22,
        fontColor: 'dimGrey',
        itemclick: this.toggleDataSeries
      },
      data: [...this.dataConfig]
    });

    let sensorReadings: any = data.map(log => {
      let d = log['sensorReadings'];
      d['time'] = log['createdAt'];
      return d;
    });

    let i = 0;

    sensorReadings.forEach((element: any) => {
      for (const key in element) {
        if (element.hasOwnProperty(key) && key != 'time') {
          const value = element[key];
          this.dataPoints[key].push({ x: new Date(element['time']), y: parseInt(value) });
          dpsLength = this.dataPoints.length;
        }
      }
    });
    this.chart.render();

    this.sub = interval(1000).subscribe(async val => {
      let data = await this.logsService.getUpdates();
      let sensorReadings: any = data.map(log => {
        let d = log['sensorReadings'];
        d['time'] = log['createdAt'];
        return d;
      });
      sensorReadings.forEach((element: any) => {
        for (const key in element) {
          if (element.hasOwnProperty(key) && key != 'time') {
            const value = element[key];
            this.dataPoints[key].push({ x: new Date(element['time']), y: parseInt(value) });
            dpsLength = this.dataPoints.length;
          }
        }
        dpsLength++;
      });
      this.chart.render();
    });
  }
}
