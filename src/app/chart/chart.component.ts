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
  // The subscribe object for the rxjs interval
  sub: any;

  constructor(private logsService: LogsService) {}

  // We're going to keep all our data here.
  // This is a two dimmensional Object array.
  // It keeps all the data points for every sensor we have to display on the chart.
  dataPoints: Array<Array<Object>> = [];

  // Global object to keep our chart.
  chart: any;

  // Method to toggle data series visibility on and off.
  // This will be used on the chart legend.
  toggleDataSeries(e: any) {
    if (typeof e.dataSeries.visible === 'undefined' || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    } else {
      e.dataSeries.visible = true;
    }
    this.chart.render();
  }

  // Variable to store the data config of our chart.
  // We'll fill this with stuff about all of our sensors later on.
  dataConfig: Array<Object> = [];

  async ngOnInit() {
    // OnInit, get the logs for the first time
    let data = await this.logsService.getLogsFirstRun();

    // For every sensor in the sensorReadings
    for (const key in data[0]['sensorReadings']) {
      if (data[0]['sensorReadings'].hasOwnProperty(key)) {
        // Get the value for the sensor
        const element = data[0]['sensorReadings'][key];
        // Create a new array inside dataPoint for the sensor
        this.dataPoints[key] = [];
        // Add configuration for the sensor
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

    // Create a new CanvasJS chart on #chartContainer
    this.chart = new CanvasJS.Chart('chartContainer', {
      zoomEnabled: true,
      animationEnabled: true,
      exportEnabled: true,
      // When we have large time gaps between our data,
      // it'd be better to shrink it so it doesn't mess up
      // the way our useful data is displayed.
      // That's where scaleBreaks come in.
      axisX: {
        scaleBreaks: {
          autoCalculate: true,
          maxNumberOfAutoBreaks: 5
        }
      },
      // Share the same tooltip between on data lines.
      toolTip: {
        shared: true
      },
      // Set up a legend.
      // We also want to be able to toggle our data series,
      // so we do that with toggleDataSeries on click.
      legend: {
        cursor: 'pointer',
        verticalAlign: 'top',
        fontSize: 22,
        fontColor: 'dimGrey',
        itemclick: this.toggleDataSeries
      },
      // That's the sensor series configuration we created earlier.
      data: [...this.dataConfig]
    });

    // Add the createdAt field of the log to the sensorReadings object
    // for ever log item we have. This way we will have it available
    // without doing anything weird later on.
    let sensorReadings: any = data.map(log => {
      // Dump the logs into a new object so we don't have to touch the original one
      let d = log['sensorReadings'];

      // and add the createdAt field to it.
      d['time'] = log['createdAt'];

      // Then we just return the whole thing.
      return d;
    });

    // For every log we have
    sensorReadings.forEach((element: any) => {
      for (const key in element) {
        // and for every field/sensor that is not time, since we just need this for the X Axis
        if (element.hasOwnProperty(key) && key != 'time') {
          // keep the value of the sensor
          const value = element[key];

          // and add a new data point for that sensor, with it's createdAt time
          // on the X Axis and the sensor value on the Y Axis.
          this.dataPoints[key].push({ x: new Date(element['time']), y: parseInt(value) });

          // Set the lenght of the datapoints to the amount of datapoints after we added them
          dpsLength = this.dataPoints.length;
        }
      }
    });

    // Now that we've added some data to the chart, render it.
    this.chart.render();

    // Run the chart update every second.
    this.sub = interval(1000).subscribe(async val => {
      // If live updates are enabled:
      if (this.logsService.liveUpdate) {
        // Get the changes since the last time we got the logs.
        let data = await this.logsService.getUpdates();

        // Again, we need to add the createAt field of the log to the sensor readings object.
        let sensorReadings: any = data.map(log => {
          // Dump the logs into a new object so we don't have to touch the original one
          let d = log['sensorReadings'];

          // and add the createdAt field to it.
          d['time'] = log['createdAt'];

          // Then we just return the whole thing.
          return d;
        });

        // For every new log we got
        sensorReadings.forEach((element: any) => {
          for (const key in element) {
            // and for every field/sensor that is not time, since we just need this for the X Axis
            if (element.hasOwnProperty(key) && key != 'time') {
              // keep the value of the sensor
              const value = element[key];

              // and add a new data point for that sensor, with it's createdAt time
              // on the X Axis and the sensor value on the Y Axis.
              this.dataPoints[key].push({ x: new Date(element['time']), y: parseInt(value) });

              // Set the lenght of the datapoints to the amount of datapoints after we added them
              dpsLength = this.dataPoints.length;
            }
          }
          dpsLength++;
        });

        // Render the chart again, in case we've added any new log values to it.
        this.chart.render();
      }
    });
  }
}
