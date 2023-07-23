import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Customer } from 'src/app/Params';
import { UserDetails } from 'src/app/UserDetails';
import { UserDetailsService } from 'src/app/services/userdetails.service';

@Component({
  selector: 'app-search-customer-dialog',
  templateUrl: './search-customer-dialog.component.html',
  styleUrls: ['./search-customer-dialog.component.scss'],
})
export class SearchCustomerDialogComponent implements OnInit, AfterViewInit {

  @ViewChild('searchInput') searchInput!: ElementRef;

  searchResults: Customer[] = []

  customers: Customer[] = []

  searchValue = ''

  constructor(private modalController: ModalController, private userDetails: UserDetailsService) {

    this.customers = this.userDetails.getCustomers();

  }
  
  ngOnInit() { }

  ngAfterViewInit() {
    
    this.searchInput.nativeElement.focus()

  }

  doSearch(value: string) {

    if(value == ''){
      this.searchResults = []
      return
    }

    if(value.startsWith('+') || !Number.isNaN(Number(value))){

      this.filterCustomerContact(value)

    }else{

      this.filterCustomerName(value)

    }

  }

  filterCustomerName(name: string) {

    this.searchResults = this.customers.filter((element) => element.name.toLowerCase().includes(name.toLowerCase()))

  }

  filterCustomerContact(contact: string) {

    contact = contact.replace('+91', '')
    contact = contact.replace(' ', '')

    this.searchResults = this.customers.filter((element) => element.contact.includes(contact))

  }

  selectCustomer(customer: Customer) {

    this.modalController.dismiss({
      'customer': customer
    })

  }

}
