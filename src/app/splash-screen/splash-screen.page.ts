import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { AnimationOptions, StatusBar } from '@capacitor/status-bar';
import { NavController, Platform } from '@ionic/angular';
import { DB_PARAMS, Params, User } from '../Params';
import { GeneralService } from '../services/general.service';
import { NaivgationService } from '../services/naivgation.service';
import { SQLiteService } from '../services/sqlite.service';
import { UserDetails } from '../UserDetails';
import { HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.page.html',
  styleUrls: ['./splash-screen.page.scss'],
})
export class SplashScreenPage implements OnInit {

  isLoading = true;

  constructor(private navService: NaivgationService, private sqlService: SQLiteService, private navController: NavController, private generalService: GeneralService,
    private platform: Platform) {

    StatusBar.hide();

    this.checkAllDBTables();

    this.checkLoginDetails();

    this.generalService.checkDefaultSettings();

    //this.navService.navigate('create-item')

  }

  async ngOnInit() {


  }

  async checkLoginDetails() {      // TODO :::: Rename function

    //  this.generalService.setLocalStoredValue('username', 'shu@bcs.in')

    let loggedInUsername = this.generalService.getLocalStoredValue('username');

    console.log("Previous username", loggedInUsername);

    if (loggedInUsername != null) {

      let details: any = undefined;

      await this.generalService.getUserDetails(undefined, loggedInUsername).then(async (data) => {

        this.isLoading = true;

        details = data;

      }).catch(() => {

        this.isLoading = false;

      })

      console.log("User already logged in with username " + loggedInUsername, details);

      if (details) {

        this.isLoading = true;

        await this.generalService.initItems();    // TODO :: ::

        await this.generalService.initSettings();

        UserDetails.Id = details.id;
        UserDetails.Name = details.name;
        UserDetails.Username = details.username;
        UserDetails.Logged_on = details.logged_in_on;
        UserDetails.ProjectId = details.project_id;
        UserDetails.IsAdmin = details.is_admin
        // UserDetails.FavouriteItems = JSON.parse(details.favourite_items);
        // UserDetails.DraftOrders = JSON.parse(details.draft_orders);

        this.generalService.initUserDraftOrders(UserDetails.Id);

        this.generalService.initUserFavItems(UserDetails.Id);

        this.generalService.initCustomers();

        this.navService.navigateRoot('home');

        // let details2 : User = {
        //   id: details.id,
        //   logged_in_on: details.logged_in_on,
        //   username: details.username,
        //   password: details.password,
        //   name: details.name,
        //   favourite_items: JSON.parse(details.favourite_items),
        //   draft_orders: JSON.parse(details.draft_orders)
        // }

        // console.log("User details", details2);

      } else {

        this.isLoading = false;

        this.navService.navigateRoot('login');

      }

    } else {

      this.isLoading = false;

      this.navService.navigateRoot('login');

    }

  }

  ionViewWillEnter() {
    StatusBar.hide();
  }

  async checkAllDBTables() {

    await DB_PARAMS.DB_TABLES.forEach(async element => {

      console.log("Checking Table ->", element.name, await this.sqlService.checkTableExists(element.name));

      if (!await this.sqlService.checkTableExists(element.name)) {

        console.log('Creating table : ', element.name);

        this.sqlService.createTable(element.name, element.columns)

        if (element.name == DB_PARAMS.DB_TABLES_NAMES.SETTINGS) {   // TODO :: :: 

          this.generalService.checkDefaultSettings();

        }

      }

    });

  }

}
