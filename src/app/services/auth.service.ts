import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '../Params';
import { Observable, of } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, public firestoreDb: AngularFirestore) { }

  async authenticate(username : string, password : string) : Promise<Observable<any>> {

    return await this.firestoreDb.collection('accounts').doc(username).valueChanges()

    // let response : any = { }

    // console.log(data)

    // if(data) {

    //   if(password == data.password){

    //     response.success = true;

    //     response.result = {

    //       id: data.id,
    //       name: data.name,
    //       username: data.username,
    //       logged_in_on: new Date().toString(),
    //       projectId: ''

    //     }

    //   }else{

    //     response = undefined

    //   }

    // }else{

    //   response = undefined;

    // }

    // return of (response);

  }

}
