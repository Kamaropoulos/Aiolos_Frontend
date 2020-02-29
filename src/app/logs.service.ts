import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, last } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  constructor(private httpClient: HttpClient) {}

  previousData: Array<Object> | undefined = undefined;

  getLogs(): Promise<Array<Object>> {
    return this.httpClient
      .get('http://192.168.100.4:3000/logs')
      .pipe(
        map((body: any) => {
          return body;
        }),
        catchError(() => of('Error, could not load logs'))
      )
      .toPromise();
  }

  async getUpdates(): Promise<Array<Object>> {
    if (!this.previousData) {
      let data = await this.getLogs();
      this.previousData = data;
      return data;
    } else {
      let latestData = await this.getLogs();
      let changes = latestData.filter(function(e) {
        return this.indexOf(e) < 0;
      }, this.previousData);
      this.previousData = latestData;
      return changes;
    }
  }
}
