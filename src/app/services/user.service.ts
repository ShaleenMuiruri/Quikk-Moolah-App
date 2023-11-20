import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, QuerySnapshot } from '@angular/fire/compat/firestore';
import { User } from 'firebase/auth';
import 'firebase/compat/auth';
import { map, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private usersCollection: AngularFirestoreCollection<any>;
  constructor(private afs: AngularFirestore) {
    this.usersCollection = this.afs.collection('users');
  }

  getUserLoggedIn() {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    } else {
      return null;
    }
  }

  geUsersByEmail(user_id: string): Promise<QuerySnapshot<any>> {
    return this.usersCollection.ref.where('user_id', '==', user_id).get();
  }


  checkUserExists(uid: string): Promise<boolean> {
    return this.existsInCollection('user_id', uid, this.usersCollection);
  }

  private async existsInCollection(
    field: string,
    value: any,
    collection: AngularFirestoreCollection<any>
  ): Promise<boolean> {
    const snapshot = await collection.ref.where(field, '==', value).get();
    return !snapshot.empty;
  }
}
