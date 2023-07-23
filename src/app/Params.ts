
import { Charges, Items } from './home/home.page'

export class Params {

    public static BASE_URL = 'http://192.168.125.232:32923/mservice';

    public static ENCRYPTION_SECRET_KEY = 'PossiblPOS2023';

    public static URL_SUFFIXS = {

        "LOGIN": "/auvitposservice/accounts/authenticate",
        "LOAD_ITEMS": "/auvitposservice/items/fetchItems",
        "LOAD_CURRENCIES": "/auvitposservice/currency/getAllCurrencies",
        "UPLOAD_BILL": "/auvitposservice/invoice/uploadBill",
        "UPLOAD_INVOICE": "/mobileserviceapi/uploadImage"

    }

    public static SP_KEYS = {

        "LAST_ITEM_SYNC": "lastItemSyncOn"

    }

    /*  TODO  */

    public static PartyID = '1671355703247';

    public static BranchID = '1670560204557';

    public static InvoiceIdSuffix = 'INVOICE#'    

}

interface Table {

    'name': string,
    'columns': { 'COLUMN_NAME': string, 'COLUMN_DATATYPE': string }[]

}

export interface User {

    'id': string,
    'logged_in_on': string,
    'username': string,
    'password': string,
    'name': string,
    'favourite_items': Items[],  // TODO ::::
    'draft_orders': DraftOrder[],  // TODO ::::

}

export interface Address {

    'building': string,
    'flat': string,
    'road': string

}

export interface Customer {

    'id': string,
    'name': string,
    'contact': string,
    'email': string,
    'address': string,
    'gstno': string,
    'dlno': string,
    'state': string

}

export interface DraftOrder {

    'id': string,
    'user_id': string,
    'label': string,
    'added_on': string,
    'notes': string,
    'items': { cat_id: string, item: any, details: { quantity: number } } [],
    'charges': Charges,
    'customer': Customer

}

export interface FavouriteItem {

    'id'?: string,
    'user_id': string,
    'cat_id': string,
    'item_id': string
}

export interface Bill {

    'billid': string,
    'billurl': string,
    'notes': string,
    'billdocfilename': string,
    'amount': string | number,
    'docdate': string,
    'customer': Customer,
    'charges': Charges

}

export class DB_PARAMS {

    static DB_TABLES_NAMES = {

        'USERS': 'logged_in_users',
        'ITEM_CATEGORIES': 'item_categories',
        'ITEMS': 'items',
        'DRAFT_ORDERS': 'draft_orders',
        'FAVOURITE_ITEMS': 'favourite_items',
        'CURRENCIES': 'currencies',
        'SETTINGS': 'settings',
        'ORDERS': 'orders'

    }

    static USERS_TABLE_COLUMNS = {

        'ID': 'id',
        'LOGGED_IN_ON': 'logged_in_on',
        'USERNAME': 'username',
        'PASSWORD': 'password',
        'NAME': 'name',
        'PROJECT_ID': 'project_id',
        'IS_ADMIN': 'is_admin'
        // 'FAVOURITE_ITEMS': 'favourite_items',
        // 'DRAFT_ORDERS': 'draft_orders',

    }

    static ITEMS_CATEGORIES_TABLE_COLUMNS = {

        'ID': 'id',
        'NAME': 'name'

    }

    static ITEMS_TABLE_COLUMNS = {

        'ID': 'id',
        'CAT_ID': 'cat_id',
        'NAME': 'name',
        'PRICE': 'price',
        'MRP': 'mrp',
        'PTR': 'ptr',
        'UNIT': 'unit',
        'STOCK': 'stock',
        'ACTIVE' : 'active',
        'IMAGES': 'images',
        'MFG_DATE': 'mfg_date',
        'EXP_DATE': 'exp_date',
        'TAX_TYPE': 'tax_type',
        'TAX_VALUE': 'tax_value',
        'BONUS': 'bonus',
        'BAR_CODE': 'bar_code',
        'BATCH_NO': 'batch_no',
        'HSN_CODE': 'hsn_code'

    }

    static DRAFT_ORDERS_TABLE_COLUMNS = {

        'ID': 'id',
        'USER_ID': 'user_id',
        'LABEL': 'label',
        'ADDED_ON': 'added_on',
        'NOTES': 'notes',
        'ITEMS': 'items',
        'CHARGES': 'charges',
        'CUSTOMER': 'customer'

    }

    static FAVOURITE_ITEMS_TABLE_COLUMNS = {

        'ID': 'id',
        'USER_ID': 'user_id',
        'CATEGORY_ID': 'cat_id',
        'ITEM_ID': 'item_id'

    }

    static CURRENCIES_TABLE_COLUMNS = {

        'ID': 'id',
        'COUNTRY': 'country',
        'DECIMAL': 'decimal',
        'CURRENCY': 'currency',
        'SYMBOL': 'symbol'

    }

    static SETTINGS_TABLE_COLUMNS = {

        'ID': 'id',
        'TAX': 'tax',
        'CURRENCY': 'currency',
        'COMPANY': 'company',
        'BILLING': 'billing',
        'PAYMENT': 'payment'

    }

    static ORDERS_TABLE_COLUMNS = {

        'ID': 'id',
        'DATE': 'date',
        'NOTES': 'notes',
        'CHARGES': 'charges',
        'CUSTOMER': 'customer',
        'SYNCED': 'synced',

    }

    static DB_TABLES: Table[] = [

        {
            'name': this.DB_TABLES_NAMES.USERS,
            'columns': [
                { 'COLUMN_NAME': this.USERS_TABLE_COLUMNS.ID, 'COLUMN_DATATYPE': 'INTEGER PRIMARY KEY' },
                { 'COLUMN_NAME': this.USERS_TABLE_COLUMNS.USERNAME, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.USERS_TABLE_COLUMNS.PASSWORD, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.USERS_TABLE_COLUMNS.NAME, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.USERS_TABLE_COLUMNS.PROJECT_ID, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.USERS_TABLE_COLUMNS.LOGGED_IN_ON, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.USERS_TABLE_COLUMNS.IS_ADMIN, 'COLUMN_DATATYPE': 'TEXT' },
                // { 'COLUMN_NAME': this.USERS_TABLE_COLUMNS.FAVOURITE_ITEMS, 'COLUMN_DATATYPE': 'TEXT' },
                // { 'COLUMN_NAME': this.USERS_TABLE_COLUMNS.DRAFT_ORDERS, 'COLUMN_DATATYPE': 'TEXT' }
            ]
        },
        {
            'name': this.DB_TABLES_NAMES.ITEM_CATEGORIES,
            'columns': [
                { 'COLUMN_NAME': this.ITEMS_CATEGORIES_TABLE_COLUMNS.ID, 'COLUMN_DATATYPE': 'INTEGER' },
                { 'COLUMN_NAME': this.ITEMS_CATEGORIES_TABLE_COLUMNS.NAME, 'COLUMN_DATATYPE': 'TEXT' }
            ]
        },
        {
            'name': this.DB_TABLES_NAMES.ITEMS,
            'columns': [
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.ID, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.CAT_ID, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.NAME, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.PRICE, 'COLUMN_DATATYPE': 'DECIMAL(15,2)' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.MRP, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.PTR, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.UNIT, 'COLUMN_DATATYPE': 'INTEGER' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.STOCK, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.ACTIVE, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.IMAGES, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.MFG_DATE, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.EXP_DATE, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.TAX_TYPE, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.TAX_VALUE, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.BONUS, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.BAR_CODE, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.BATCH_NO, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ITEMS_TABLE_COLUMNS.HSN_CODE, 'COLUMN_DATATYPE': 'TEXT' },
            ]
        },
        {
            'name': this.DB_TABLES_NAMES.DRAFT_ORDERS,
            'columns': [
                { 'COLUMN_NAME': this.DRAFT_ORDERS_TABLE_COLUMNS.ID, 'COLUMN_DATATYPE': 'INTEGER PRIMARY KEY' },
                { 'COLUMN_NAME': this.DRAFT_ORDERS_TABLE_COLUMNS.USER_ID, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.DRAFT_ORDERS_TABLE_COLUMNS.LABEL, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.DRAFT_ORDERS_TABLE_COLUMNS.ADDED_ON, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.DRAFT_ORDERS_TABLE_COLUMNS.NOTES, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.DRAFT_ORDERS_TABLE_COLUMNS.ITEMS, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.DRAFT_ORDERS_TABLE_COLUMNS.CHARGES, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.DRAFT_ORDERS_TABLE_COLUMNS.CUSTOMER, 'COLUMN_DATATYPE': 'TEXT' }
            ]
        },
        {
            'name': this.DB_TABLES_NAMES.FAVOURITE_ITEMS,
            'columns': [
                { 'COLUMN_NAME': this.FAVOURITE_ITEMS_TABLE_COLUMNS.ID, 'COLUMN_DATATYPE': 'INTEGER PRIMARY KEY' },
                { 'COLUMN_NAME': this.FAVOURITE_ITEMS_TABLE_COLUMNS.USER_ID, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.FAVOURITE_ITEMS_TABLE_COLUMNS.CATEGORY_ID, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.FAVOURITE_ITEMS_TABLE_COLUMNS.ITEM_ID, 'COLUMN_DATATYPE': 'TEXT' },
            ]
        },
        {
            'name': this.DB_TABLES_NAMES.CURRENCIES,
            'columns': [
                { 'COLUMN_NAME': this.CURRENCIES_TABLE_COLUMNS.ID, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.CURRENCIES_TABLE_COLUMNS.COUNTRY, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.CURRENCIES_TABLE_COLUMNS.DECIMAL, 'COLUMN_DATATYPE': 'INTEGER' },
                { 'COLUMN_NAME': this.CURRENCIES_TABLE_COLUMNS.CURRENCY, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.CURRENCIES_TABLE_COLUMNS.SYMBOL, 'COLUMN_DATATYPE': 'TEXT' },
            ]
        },
        {
            'name': this.DB_TABLES_NAMES.SETTINGS,
            'columns': [
                { 'COLUMN_NAME': this.SETTINGS_TABLE_COLUMNS.ID, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.SETTINGS_TABLE_COLUMNS.TAX, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.SETTINGS_TABLE_COLUMNS.CURRENCY, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.SETTINGS_TABLE_COLUMNS.COMPANY, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.SETTINGS_TABLE_COLUMNS.BILLING, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.SETTINGS_TABLE_COLUMNS.PAYMENT, 'COLUMN_DATATYPE': 'TEXT' },
            ]
        },
        {
            'name': this.DB_TABLES_NAMES.ORDERS,
            'columns': [
                { 'COLUMN_NAME': this.ORDERS_TABLE_COLUMNS.ID, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ORDERS_TABLE_COLUMNS.DATE, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ORDERS_TABLE_COLUMNS.NOTES, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ORDERS_TABLE_COLUMNS.CHARGES, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ORDERS_TABLE_COLUMNS.CUSTOMER, 'COLUMN_DATATYPE': 'TEXT' },
                { 'COLUMN_NAME': this.ORDERS_TABLE_COLUMNS.SYNCED, 'COLUMN_DATATYPE': 'TEXT' },
            ]
        }

    ]

}
