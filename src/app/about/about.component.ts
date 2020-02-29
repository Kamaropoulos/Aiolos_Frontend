import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';

import { environment } from '@env/environment';

import * as mapboxgl from 'mapbox-gl';
import { LogsService } from '@app/logs.service';

import { interval } from 'rxjs';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  version: string | null = environment.version;

  data: Array<Object>;

  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = 37.9838;
  lng = 23.7275;

  constructor(private logsService: LogsService) {}

  ngOnInit() {
    Object.getOwnPropertyDescriptor(mapboxgl, 'accessToken').set(environment.mapbox.accessToken);
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      center: [this.lng, this.lat],
      zoom: 9
    }); // Add map controls
    // this.map.addControl(new mapboxgl.NavigationControl());

    var marker = new mapboxgl.Marker({
      draggable: false
    })
      .setLngLat([0, 0])
      .addTo(this.map);

    this.logsService.getLogs().subscribe((data: Array<Object>) => {
      this.data = data;
      for (let log of data) {
        let html =
          log['gps_data']['datestamp'] +
          ' ' +
          log['gps_data']['timestamp'] +
          '<br><table><tr><th>Sensor&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th><th>Reading</th></tr>';
        for (let record in log['sensorReadings']) {
          if (Object.prototype.hasOwnProperty.call(log['sensorReadings'], record)) {
            html += '<tr><td>' + record + '</td>' + '<td>' + log['sensorReadings'][record] + '</td></tr>';
          }
        }
        html += '</table>';
        var popup = new mapboxgl.Popup({ offset: 25 }).setHTML(html);
        var marker = new mapboxgl.Marker({
          draggable: false
        })
          .setLngLat([log['gps_data']['longitude'], log['gps_data']['latitude']])
          .setPopup(popup)
          .addTo(this.map);
      }
    });
  }
}
