import { Injectable } from '@angular/core';
import { UserDetails } from '../UserDetails';

@Injectable({
  providedIn: 'root'
})
export class UserDetailsService {

  constructor() { }

  getFavItems() {

    return UserDetails.FavouriteItems ? UserDetails.FavouriteItems : [];

  }

  getTax() {

    return UserDetails.Tax;

  }

  getCurrency() {

    return UserDetails.Currency ? UserDetails.Currency : null;

  }

  getCompany() {

    return UserDetails.Company;

  }

  getBilling() {

    return UserDetails.Billing ? UserDetails.Billing : null;

  }

  getCompanyPaymentDetails() {

    return UserDetails.CompanyPayment

  }

  getCustomers() {

    return UserDetails.Customers

  }

}
