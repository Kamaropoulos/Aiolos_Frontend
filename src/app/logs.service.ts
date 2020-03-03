import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, last } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  constructor(private httpClient: HttpClient) {}

  // Toggle whether to run live updates on the data or not
  liveUpdate: Boolean = true;

  // Global variable for getting only the changes from latest logs
  previousData: Array<Object> | undefined = undefined;

  getLogs(): Promise<Array<Object>> {
    // Get the logs from the API
    return (
      this.httpClient
        .get('/logs')
        .pipe(
          map((body: any) => {
            return body;
          }),
          catchError(() => of('Error, could not load logs'))
        )
        // Convert Observable to Promise for easier manipulation and get some async/await convinience
        .toPromise()
    );
  }

  // Get the logs from the API on the first time we ever need them
  async getLogsFirstRun(): Promise<Array<Object>> {
    let data = await this.getLogs();
    this.previousData = data;
    return data;
  }

  // Get only the logs we haven't seen before
  async getUpdates(): Promise<Array<Object>> {
    // If previousData is undefined, aka this is our first time here:
    if (!this.previousData) {
      // Get the logs from the API
      let data = await this.getLogs();
      // and store them to previousData
      this.previousData = data;
      // Lastly, return the data we got from the API
      return data;
    } else {
      // It's not our first time here, get the logs
      let latestData = await this.getLogs();
      // Get only the differences between latestData and previousData
      var changes = latestData.filter(item1 => !this.previousData.some(item2 => item2['_id'] === item1['_id']));
      // Set previousData to the latest version of the logs we just got
      this.previousData = latestData;
      // Return the changes
      return changes;
    }
  }
}
