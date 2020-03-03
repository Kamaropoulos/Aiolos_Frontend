import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';

import { environment } from '@env/environment';

import * as mapboxgl from 'mapbox-gl';
import { LogsService } from '@app/logs.service';

import { interval } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  // Global map object
  map: mapboxgl.Map;

  // Style of the map we'll be loading.
  // Can also be 'mapbox://styles/mapbox/satellite-v9' for a satellite map
  style = 'mapbox://styles/mapbox/streets-v11';

  // Coordinates for the location we're going to focus initially.
  // In this case Athens, Greece.
  lat = 37.9838;
  lng = 23.7275;

  // The subscribe object for the rxjs interval
  sub: any;

  // The last point we've added to the map.
  // It's going to be a two element array, one for longitude and one for latitude.
  lastPoint: number[];

  // The maximum number of points to display on the first load.
  // This will be the last X points we get from the logs API.
  pointsToDisplay = 10;

  // The number of displayed points in the map
  // and how many we've ommited in order to increase performance
  displayedPoints: number = 0;
  ommitedPoints: number = 0;

  constructor(private logsService: LogsService) {}

  async ngOnInit() {
    // Load access token into the mapboxx object
    Object.getOwnPropertyDescriptor(mapboxgl, 'accessToken').set(environment.mapbox.accessToken);
    // Create map on the #map div
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      center: [this.lng, this.lat],
      zoom: 9
    });

    // Check to see if it's the first run of the component
    var firstRun: Boolean = true;

    // Run every second
    this.sub = interval(1000).subscribe(async val => {
      // If it's the first time we run this or if live updates are enabled (firstTime overides liveUpdate)
      if (this.logsService.liveUpdate || firstRun) {
        let data: Array<Object>;
        if (firstRun) {
          // Get logs for the first time
          data = await this.logsService.getLogsFirstRun();
          // Since we got our data, set firstRun to false
          firstRun = false;
          // If we get more data than the maximum allowed displayed points,
          // ommit the excess data points and keep the count of how many points we ommited.
          if (data.length > this.pointsToDisplay) {
            this.ommitedPoints = data.length - this.pointsToDisplay;
            data = data.slice(data.length - this.pointsToDisplay, data.length);
          }
        } else {
          // If this is not the first time we run this, get only the changes since the last time we got the logs
          data = await this.logsService.getUpdates();
        }

        // Here we are now getting new points every second.
        // Those will be added on top of the maximum loaded points
        // so we should keep count of how many points we're adding so we can display
        // the number of displayed points on the map.

        // Initialize new point counter.
        // This will decide if we actually got any new points
        // and whether we actually have to fly to the new marker in the map.
        let newPointsCount = 0;
        // Add the number of data points we got to the number of displayed points
        this.displayedPoints = this.displayedPoints + data.length;

        // For every log we got
        for (let log of data) {
          // We only add markers for logs with valid GPS data, aka only status == A.
          if (log['gps_data']['status'] == 'A') {
            // We got a new valid point to add a marker for.
            // This means we'll have to fly to it.
            // Increase the relevant counter.
            newPointsCount++;

            // Some dirty templating for the data inside the popup box.
            // This should normally be done in a new component but yeah...

            // Here we will display the sensor readings for the specific log,
            // as well as it's date and time.

            // Those are going to be displayed withing an HTML table.
            // Create the table and add the header.
            let html =
              log['gps_data']['datestamp'] +
              ' ' +
              log['gps_data']['timestamp'] +
              '<br><table><tr><th>Sensor&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th><th>Reading</th></tr>';
            // Add tr with name and value for every sensor
            for (let record in log['sensorReadings']) {
              if (Object.prototype.hasOwnProperty.call(log['sensorReadings'], record)) {
                html += '<tr><td>' + record + '</td>' + '<td>' + log['sensorReadings'][record] + '</td></tr>';
              }
            }

            // Finally, add the table closing tag.
            html += '</table>';

            // Create a new popup with the HTML code we created above
            var popup = new mapboxgl.Popup({ offset: 25 }).setHTML(html);

            // Create a new marker on the log location and attach the newly created popup to it
            var marker = new mapboxgl.Marker({
              draggable: false
            })
              .setLngLat([log['gps_data']['longitude'], log['gps_data']['latitude']])
              .setPopup(popup)
              .addTo(this.map);

            // When we are adding multiple markers, we need a way to keep track of the last one,
            // in order to be able to fly to it. That's what we'll be doing here.
            this.lastPoint = [log['gps_data']['longitude'], log['gps_data']['latitude']];
          }
        }

        // If we got any new markers
        if (newPointsCount) {
          // fly to the last marker we added.
          this.map.flyTo({
            center: [this.lastPoint[0], this.lastPoint[1]],
            essential: true, // this animation is considered essential with respect to prefers-reduced-motion
            zoom: 22
          });
        }
      }
    });
  }
}
