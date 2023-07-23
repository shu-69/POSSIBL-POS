import { Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

import { DeviceDetectorService } from 'ngx-device-detector';
import { machineId, machineIdSync } from 'node-machine-id'

import { Title } from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private storage: Storage, private router: Router, private deviceService: DeviceDetectorService, private titleService : Title) {

    this.storage.create();

    this.titleService.setTitle(`Possibl POS`);

    this.router.navigateByUrl('splash-screen')  // TODO::: :: 

      //  this.router.navigateByUrl('invoice1')  // TODO::: :: 

    //this.checkDevice()

  }

  checkDevice() {

    // let global = window; 

    // console.log('Machine id', machineIdSync(true)) 

    // machineId().then((id) => {

    //   console.log('Machine id 2', id) 

    // })

    // let deviceInfo = this.deviceService.getDeviceInfo();
    // const isMobile = this.deviceService.isMobile();
    // const isTablet = this.deviceService.isTablet();
    // const isDesktopDevice = this.deviceService.isDesktop();
    // console.log(deviceInfo);
    // console.log(isMobile);  // returns if the device is a mobile device (android / iPhone / windows-phone etc)
    // console.log(isTablet);  // returns if the device us a tablet (iPad etc)
    // console.log(isDesktopDevice);
    // console.log('Machine id',)

  }

  getState(outlet: any) {
    // Changing the activatedRouteData.state triggers the animation
    return outlet.activatedRouteData.state;
  }
}
