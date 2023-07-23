import { Items } from "./home/home.page";
import { Customer, DB_PARAMS, DraftOrder, FavouriteItem } from "./Params";
import { SQLiteService } from "./services/sqlite.service";
import { Billing, Company, CompanyPaymentDetails } from "./setting-components/company-settings/company-settings.page";
import { Currency } from "./setting-components/currency-settings/currency-settings.page";
import { Tax } from "./setting-components/tax-settings/tax-settings.page";

export class UserDetails {

    public static Id = '';
    public static Username = '';
    public static Password = '';
    public static Logged_on = '';
    public static Name = '';
    public static ProjectId = '';
    public static IsAdmin = false;
    public static Items : Items[] = [];
    public static FavouriteItems : FavouriteItem[] = [];
    public static DraftOrders : DraftOrder[] = [];
    public static Tax : Tax;
    public static Currency : Currency;
    public static Company : Company;
    public static Billing : Billing;
    public static CompanyPayment : CompanyPaymentDetails;

    public static Customers : Customer[] = []

    constructor(private sqlService: SQLiteService) { }

}