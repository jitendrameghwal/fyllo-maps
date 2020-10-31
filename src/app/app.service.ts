import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  token = 'RI7zIZcFTlmPsctUjDDhXNFivHQBIfCTNldbEkxpDNkO4EIPGmBHh1OTEi0vZUU1';

  constructor(protected httpClient: HttpClient) { }

  getMarkers(): Observable<object> {
    return this.httpClient.get(`https://api.agrihawk.in/api/devices/getMarkers?access_token=${this.token}`);
  }

  getMarkerDetails(plotId: string): Observable<object> {
    return this.httpClient.get(`https://api.agrihawk.in/api/plots/getLatestDataForMap?plotId=${plotId}&access_token=${this.token}`);
  }

}
