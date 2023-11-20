import { Injectable } from '@angular/core';
import 'firebase/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  geUsersById(
    userId: any
  ): QuerySnapshot<any> | PromiseLike<QuerySnapshot<any>> {
    throw new Error('Method not implemented.');
  }
  geUserById(
    userId: any
  ): QuerySnapshot<any> | PromiseLike<QuerySnapshot<any>> {
    throw new Error('Method not implemented.');
  }
  private walletsCollection: AngularFirestoreCollection<any>;

  constructor(private afs: AngularFirestore) {
    this.walletsCollection = this.afs.collection('wallet');
  }


  getWalletByUserId(userId: string): Promise<any> {
    return this.afs
      .collection('wallet', (ref) => ref.where('user_id', '==', userId))
      .get()
      .toPromise();
  }

  updateWalletBalance(walletId: string, newAmount: number): Promise<void> {
    const walletRef = this.afs.collection('wallet').doc(walletId);
    return walletRef.update({ wallet_balance: newAmount });
  }

  checkWalletExists(uid: string): Promise<boolean> {
    return this.existsInCollection('user_id', uid, this.walletsCollection);
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
