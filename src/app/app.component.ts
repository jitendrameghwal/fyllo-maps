import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { AppService } from './app.service';
import { forkJoin, Observable } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('mapContainer', { static: false }) gmap: ElementRef;
  map: google.maps.Map;
  lat = 28.644800;
  lng = 77.216721;

  coordinates = new google.maps.LatLng(this.lat, this.lng);

  mapOptions: google.maps.MapOptions = {
    center: this.coordinates,
    zoom: 8
  };

  markers: any;
  markersData: any = [];


  constructor(private appService: AppService, protected loaderService: NgxUiLoaderService) { }
  ngAfterViewInit() {
    this.loaderService.startLoader('baseLoader');
    this.appService.getMarkers().subscribe(data => {
      this.markers = data;
      const allApi = [];
      this.markers.forEach(marker =>
        allApi.push(this.appService.getMarkerDetails(marker.plotId)));
      forkJoin(allApi).subscribe((data: any[]) => {
        this.setMarkersData(data);
        this.mapInitializer();
        setTimeout(() => this.loaderService.stopLoader('baseLoader'), 0);
      }, err => console.log(err));
    });
  }

  setMarkersData(data: any) {
    if (!!data) {
      data.forEach((marker, i) => {
        this.markersData.push({
          airTemp: marker.airTemp,
          airHumidity: marker.airHumidity,
          leafWetness: marker.leafWetness,
          lightIntensity: marker.lightIntensity,
          rainFall: marker.rainFall,
          title: this.markers[i].place
        });
      });
    }
  }

  mapInitializer(): void {
    this.map = new google.maps.Map(this.gmap.nativeElement,
      this.mapOptions);
    this.loadAllMarkers();
  }

  loadAllMarkers(): void {
    this.markersData.forEach((markerInfo, i) => {
      const { lat, lng } = this.markers[i].location;
      // Creating a new marker object
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng)
      });

      const contentString = this.createContentString(markerInfo);
      const infoWindow = new google.maps.InfoWindow({
        content: contentString
      });

      // Add click event to open info window on marker
      marker.addListener('mouseover', () => {
        infoWindow.open(marker.getMap(), marker);
      });
      marker.addListener('mouseout', () => {
        infoWindow.close();
      });
      this.map.setCenter(marker.getPosition());
      // Adding marker to google map
      marker.setMap(this.map);
    });
  }

  createContentString(markerInfo: any) {
    return `<div id=content>
      <div id=siteNotice>
      </div>
      <h1 id=firstHeading class=firstHeading>${markerInfo.title}</h1>
      <div id=bodyContent>
      <p><b>Rainfall: </b>${markerInfo.rainFall}</p>
      <p><b>Light Intensity: </b>${markerInfo.lightIntensity}</p>
      <p><b>Leaf Wetness: </b>${markerInfo.leafWetness}</p>
      <p><b>Air Humidity: </b>${markerInfo.airHumidity}</p>
      <p><b>Air Temparature: </b>${markerInfo.airTemp}</p>
      </div>
      </div>`;
  }
}
