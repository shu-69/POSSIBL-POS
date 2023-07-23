import { Component, OnInit, ComponentFactoryResolver, ViewContainerRef, ElementRef, Inject, ViewEncapsulation, Input } from '@angular/core';
import { Customer } from 'src/app/Params';
import { Charges, ShippingDetails } from 'src/app/home/home.page';
import { UserDetailsService } from 'src/app/services/userdetails.service';
import { Company, CompanyPaymentDetails, TermsNCondition } from 'src/app/setting-components/company-settings/company-settings.page';


@Component({
  selector: 'app-invoice1',
  templateUrl: './invoice1.component.html',
  styleUrls: ['./invoice1.component.scss'],
  styles: [
    `
    .parent {

display: flex;
flex-flow: column;
gap: 20px;
background: white;
color: black;
padding: 20px 30px;
//width: 1000px;

// overflow: visible;

.header {}

.companyDetailsContainer {

    display: flex;
    gap: 20px;
    align-items: center;

    .companyImage {

        width: 140px;
        height: 140px;

    }

    .details {

        display: flex;
        flex-flow: column;
        gap: 5px;
        align-items: start;
        font-size: 20px;

        .name {

            color: #d27c19;
            font-size: 32px;

        }



    }

}

.invoiceDetails {

    font-size: 18px;

    .field {

        display: flex;
        gap: 20px;

    }

}

.customerDetails {

    display: grid;
    grid-template-columns: repeat(3, calc((100% - 15px) / 2) 15px calc((100% - 15px) / 2));

    .details {

        display: flex;
        flex-flow: column;
        gap: 5px;
        font-size: 18px;

    }

}

.itemDetailsTable {

    padding-bottom: 320px;

    table {

        width: 100%;

        thead {

            border-top: 3px solid #d27c19;
            border-bottom: 3px solid #d27c19;
            font-family: unset;
            font-size: 18px;

            tr {

                th {

                    padding: 20px 0;

                }

            }

        }

        tbody {

            tr {

                font-family: unset;
                font-size: 18px;
                border-bottom: 2px solid lightgray;

                td {

                    padding: 20px 0;
                    text-align: center;

                }

                :first-child {

                    padding: 20px 0 20px 10px;
                    text-align: start;

                }

            }

        }

    }

}

.subtotalDetailsTable {

    table {

        width: 100%;

        tbody {

            font-weight: bold;
            border-top: 3px solid #d27c19;
            border-bottom: 3px solid #d27c19;

            tr {

                font-family: unset;
                font-size: 18px;
                border-bottom: 2px solid lightgray;

                td {

                    padding: 20px 0;
                    text-align: center;

                }

                :first-child {

                    padding: 20px 0 20px 10px;
                    text-align: start;

                }

            }

        }

    }

}

.bill-and-payment-details {

    display: flex;
    justify-content: space-between;

    // display: grid;
    // grid-template-columns: repeat(3, 1fr);

    .company-payment-details {

        display: flex;
        gap: 20px;
        font-size: 20px;
        height: fit-content;

        .upilogos {

            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5px;
            align-items: center;

            img {

                max-width: 40px;

            }

        }

        .qrContainer {

            img {

                width: 140px;
                height: 140px;

            }

        }

    }

    .amountDetailsContainer {

        display: flex;
        flex-flow: column;
        gap: 6px;
        font-size: 20px;
        min-width: 350px;

        .amount-field {

            display: grid;
            grid-template-columns: repeat(2, 60% 40%);
            text-align: end;

        }

        .totalAmount {

            padding: 10px 0;
            margin: 10px 0;
            display: grid;
            grid-template-columns: repeat(2, 60% 40%);
            text-align: end;
            border-top: 2px solid black;
            border-bottom: 2px solid black;

        }

    }

    .tncs {

        display: flex;
        gap: 20px;
        font-size: 20px;
        height: fit-content;
        margin-top: 40px;
        max-width: 500px;

    }

    .amountInWords {

        display: flex;
        flex-flow: column;
        gap: 6px;
        text-align: end;
        font-size: 20px;
        margin-top: 40px;

    }

    .signature {

        display: flex;
        flex-flow: column;
        gap: 6px;
        text-align: end;
        font-size: 20px;
        margin-top: 40px;

        .signature-container {

            height: 140px;

        }

    }

}

}

.bold {

font-weight: bold;

}

.normal {

font-weight: normal;

}

.flex {

display: flex;
gap: 10px;
align-items: center;

}
    `
  ],
  encapsulation: ViewEncapsulation.Emulated,
})
export class Invoice1Component {

  paymentQrString = 'shu'

  @Input() invoiceId: string = '';
  @Input() invoiceDate: string = '05/02/2023';
  @Input() dueDate: string = '';
  @Input() receivedAmount: string | number = '';
  @Input() company: Company | undefined;
  @Input() customer: Customer | undefined;
  @Input() shippingDetails: ShippingDetails | undefined;
  @Input() items: { cat_id: Number, item: any, details: { quantity: number } }[] = [];
  @Input() companyPaymentDetails: CompanyPaymentDetails | undefined;
  @Input() tncs: TermsNCondition[] = [];
  @Input() totalAmount: number | string = '';
  @Input() totalAmountInWords: string = '';


  // elRef: ElementRef

  logo = ''

  constructor(public userDetails: UserDetailsService) {

    console.log('c')

    this.logo = userDetails.getCompany()?.logo

    console.log(this.company, this.items)

  }

  ngOnInit() {

    console.log('ng')

    console.log(this.company, this.items)

  }

  // getComponentHTML() {

  //   return this.elRef.nativeElement.innerHTML;

  // }


}
