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
    let prevData = this.previousData;
    if (!this.previousData) {
      let data = await this.getLogs();
      this.previousData = data;
      return data;
    } else {
      let latestData = await this.getLogs();

      var changes = latestData.filter(item1 => !this.previousData.some(item2 => item2['_id'] === item1['_id']));

      this.previousData = latestData;
      return changes;
    }
  }
}
