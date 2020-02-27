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
  lat = 38.06218066666667;
  lng = 23.759690166666665;

  constructor(private logsService: LogsService) {}

  ngOnInit() {
    Object.getOwnPropertyDescriptor(mapboxgl, 'accessToken').set(environment.mapbox.accessToken);
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      center: [-77.04, 38.907],
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
        var popup = new mapboxgl.Popup({ offset: 25 }).setText(
          'Construction on the Washington Monument began in 1848.'
        );
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
