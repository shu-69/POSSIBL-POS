import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ListResult } from '@angular/fire/compat/storage/interfaces';
import { Observable, finalize } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage, private db: AngularFireDatabase) {}

  // Firestore ----------

  generateId(): string {
    return this.firestore.createId()
  }

  getItem(collectionPath: string, docId: string): Observable<any> {
    return this.firestore.collection(collectionPath).doc(docId).valueChanges()
  }

  getItems(collectionPath: string): Observable<any[]> {
    return this.firestore.collection(collectionPath).valueChanges();
  }

  addItem(collectionPath: string, item: any, documentId?: string): Promise<unknown> {
    if (documentId) {
      // If a custom document ID is provided, use it
      return this.firestore.collection(collectionPath).doc(documentId).set(item);
    } else {
      // If no custom document ID is provided, Firestore will generate one
      return this.firestore.collection(collectionPath).add(item);
    }
  }

  updateItem(collectionPath: string, id: string, updatedData: any): Promise<void> {
    return this.firestore.collection(collectionPath).doc(id).update(updatedData);
  }

  deleteItem(collectionPath: string, id: string): Promise<void> {
    return this.firestore.collection(collectionPath).doc(id).delete();
  }

  // Storage -----------
  
  uploadFile(file: File, storagePath: string): AngularFireUploadTask {
    return this.storage.ref(storagePath).put(file);
  }

  deleteFile(storagePath: string, fileName: string): Observable<any> {
    const path = `${storagePath}/${fileName}`;
    const ref = this.storage.ref(path);
    return ref.delete();
  }

  getAllFiles(storagePath: string): Observable<ListResult> {
    return this.storage.ref(storagePath).listAll().pipe(
      finalize(() => {})
    );
  }

  // Realtime

  getValue(path: string): Observable<any> {
    return this.db.object(path).valueChanges();
  }  

}
