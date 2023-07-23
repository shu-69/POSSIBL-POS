import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})

export class SQLiteService {

  browserDb: any;

  DB_NAME = 'data.db';

  constructor(private sqlite: SQLite, private platform: Platform, private http: HttpClient) {

    this.initBrowserDatabase();
    
  }

  async initBrowserDatabase(): Promise<void> {

    this.browserDb = (<any>window).openDatabase('data', '', 'my first database', 2 * 1024 * 1024);

  }

  createTable(TABLE_NAME: string, COLUMNS: { "COLUMN_NAME": string, "COLUMN_DATATYPE": string }[]) {

    let Query = "CREATE TABLE IF NOT EXISTS " + TABLE_NAME + " ";

    Query += "( ";

    COLUMNS.forEach((COLUMN, Index) => {

      Query += COLUMN.COLUMN_NAME + " " + COLUMN.COLUMN_DATATYPE + (Index == COLUMNS.length - 1 ? " " : ", ")

    });

    Query += ")";

    if (this.platform.is('desktop') || this.platform.is('electron')) {

      this.browserDb.transaction(function (tx: any) {
        tx.executeSql(Query);
      }, function (error: any) {
        console.error('Error creating table:', error);
      }, function () {
        console.log('Table created successfully');
      });

      console.log('Electron db created')

    } else {

      try {

        this.sqlite.create({
          name: this.DB_NAME,
          location: 'default'
        }).then((db: SQLiteObject) => {

          db.executeSql(Query, [])
            .then(() => {
              console.log(TABLE_NAME, "Table created")
              return true
            })
            .catch(e => {
              console.error(e)
              return false
            })

        }).catch(e => console.log(e));

      } catch (e) {
        console.error(e)
      }

    }

  }

  async deleteTableData(TableName: string) {

    if(this.platform.is('desktop') || this.platform.is('electron')){

      this.browserDb.transaction(function (tx: any) {
        tx.executeSql(`DELETE FROM ${TableName}`, [], function (tx: any, result: any) {
          console.log('Records deleted successfully');
        }, function (error: any) {
          console.error(error);
        });
      });

    }else{

      try {
        const db: SQLiteObject = await this.sqlite.create({
          name: this.DB_NAME,
          location: 'default',
        });
        const result = await db.executeSql(`DELETE FROM ${TableName}`);
      } catch (error) {
        console.error(error);
      }

    }

  }

  async getTableData(TableName: string,): Promise<any[]> {

    //let query = 'SELECT * FROM ' + TableName + ';'

    if(this.platform.is('desktop') || this.platform.is('electron')) {

      let db = this.browserDb

      return new Promise(function (resolve, reject) {
        db.transaction(function (tx: any) {
          tx.executeSql(`SELECT * FROM ${TableName}`, [], function (tx: any, result: any) {
            const data = [];
            for (let i = 0; i < result.rows.length; i++) {
              data.push(result.rows.item(i));
            }
            resolve(data);
          }, function (error: any) {
            reject(error);
          });
        });
      });

    }else{

      try {
        const db: SQLiteObject = await this.sqlite.create({
          name: this.DB_NAME,
          location: 'default',
        });
        const result = await db.executeSql(`SELECT * FROM ${TableName}`, []);
        const data = [];
        for (let i = 0; i < result.rows.length; i++) {
          data.push(result.rows.item(i));
        }
        return data;
      } catch (error) {
        console.error(error);
        return [];
      }

    }


  }

  async executeQuery(query: string): Promise<any> {

    if(this.platform.is('desktop') || this.platform.is('electron')){

      // this.browserDb.transaction(function (tx: any) {
      //   tx.executeSql(query, [], function (tx: any, result: any) {

      //     return result;
   
      //   }, function (error: any) {

      //   });
      // });

      let db = this.browserDb;

      return new Promise(function (resolve, reject) {
        db.transaction(function (tx: any) {
          tx.executeSql(query, [], function (tx: any, result: any) {
            console.log('executeQuery', query, result)
            resolve(result);
          }, function (error: any) {
            console.error('executeQuery', query, error)
            reject(error);
          });
        });
      });
      
    }else{

      try {

        const db: SQLiteObject = await this.sqlite.create({
          name: this.DB_NAME,
          location: 'default',
        });
  
        return await db.executeSql(query, []);
  
      } catch (e) {
        console.log("Error on execution query", query, e)
      }

    }

  }

  async checkTableExists(tableName: string): Promise<boolean> {

    if (this.platform.is('desktop') || this.platform.is('electron')) {
      
      return new Promise((resolve, reject) => {
        this.browserDb.transaction((tx: any) => {
          tx.executeSql(
            `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`,
            [],
            (tx: any, result: any) => {
              if (result.rows.length > 0) {
                console.log('Table exists');
                resolve(true);
              } else {
                console.log('Table does not exist');
                resolve(false);
              }
            },
            (error: any) => {
              console.error('Error checking table existence:', error);
              reject(error);
            }
          );
        });
      });


    } else {

      try {

        const db: SQLiteObject = await this.sqlite.create({
          name: this.DB_NAME,
          location: 'default'
        });

        const result = await db.executeSql(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`, []);

        return result.rows.length > 0;

      } catch (error) {

        console.log("Error checking table", error)

        return false;
      }

    }


  }

}
