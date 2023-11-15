import { Injectable } from '@angular/core';
import 'firebase/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';

export interface TransactionItem {
  user_id: string;
  trans_type: string;
  trans_amount: number;
}

@Injectable({
    providedIn: 'root',
  })
  
export class TransactionsService {
  constructor(private afs: AngularFirestore) {
    this.transactionsCollection = this.afs.collection('transactions');
  }

  getTransactionsByUserId(userId: string): Promise<any> {
    return this.afs
      .collection('transactions', (ref) => ref.where('user_id', '==', userId))
      .get()
      .toPromise();
  }

  async getTotalTransfered(userId: string): Promise<number> {
    let totalAmount = 0;

    try {
      const querySnapshot = await this.getTransactionsByUserId(userId);

      querySnapshot.forEach((doc) => {
        const transaction = doc.data() as TransactionItem;
        totalAmount += transaction.trans_amount;
      });
    } catch (error) {
      console.error('Error getting transactions:', error);
    }

    return totalAmount;
  }

  private transactionsCollection: AngularFirestoreCollection<TransactionItem>;

  createTransaction(item: TransactionItem) {
    this.transactionsCollection.add(item);
  }
}
