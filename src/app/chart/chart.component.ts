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

  dataPoints: any[] = [];

  async ngOnInit() {
    let dpsLength = 0;
    let chart = new CanvasJS.Chart('chartContainer', {
      zoomEnabled: true,
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: ''
      },
      data: [
        {
          type: 'spline',
          dataPoints: this.dataPoints
        }
      ]
    });

    let data = await this.logsService.getUpdates();
    let mq2: any = data.map(log => {
      return log['sensorReadings']['MQ2'];
    });

    let i = 0;
    mq2.forEach((value: any) => {
      this.dataPoints.push({ x: ++i, y: parseInt(value) });
    });
    dpsLength = this.dataPoints.length;
    chart.render();
    this.sub = interval(1000).subscribe(async val => {
      let data = await this.logsService.getUpdates();
      let mq2: any = data.map((log: any) => {
        return log['sensorReadings']['MQ2'];
      });

      let j = i;
      mq2.forEach((value: any) => {
        this.dataPoints.push({ x: ++j, y: parseInt(value) });
        dpsLength++;
      });
      i = j;

      // if (dataPoints.length >  20 ) {
      //       dataPoints.shift();
      //     }
      chart.render();
    });

    // async function updateChart(data:any) {
    //   // let data = await logs.getUpdates();
    //   let mq2:any = data.map((log:any) => {
    //     return log["sensorReadings"]["MQ2"];
    //   });
    //   $.each(mq2, function(key:any, value:any) {
    //     dataPoints.push({x: ++i, y: parseInt(value)});
    //     dpsLength++;
    //   });

    //   // if (dataPoints.length >  20 ) {
    //   //       dataPoints.shift();
    //   //     }
    //   chart.render();
    //   }
  }
}
