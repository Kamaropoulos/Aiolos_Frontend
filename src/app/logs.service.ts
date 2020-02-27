import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  constructor(private httpClient: HttpClient) {}

  getLogs(): Observable<Array<Object>> {
    return this.httpClient.get('http://192.168.100.4:4000/logs').pipe(
      map((body: any) => {
        console.log(body);
        return body;
      }),
      catchError(() => of('Error, could not load logs'))
    );
  }
}
