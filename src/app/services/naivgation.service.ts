import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NaivgationService {

  constructor(private router: Router, private navController: NavController) { }

  navigate(pageName: string){

    pageName.startsWith('/')? "" : pageName = '/' + pageName; 

    this.navController.navigateForward(pageName);  // TODO

    //this.router.navigateByUrl(pageName);
  }

  navigateRoot(pageName: string){
    this.navController.navigateRoot(pageName)
  }

  removePageFromStac(pageName: string){
    const index = this.router.config.findIndex((route) => route.path === pageName);
    if (index > -1) {
      this.router.config.splice(index, 1);
    }
  }



}
