import { Component, OnInit } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { WalletService } from 'src/app/services/wallet.service';
import { UserItem } from '../../auth/register/register.component';
import {
  TransactionItem,
  TransactionsService,
} from 'src/app/services/transactions.service';

export interface Item {
  email: string;
  amount: number;
}
export interface WalletItem {
  user_id: string;
  wallet_balance: number;
}
interface UserData {
  email_address: string;
  user_id: string;
}

@Component({
  selector: 'app-money-transfer',
  templateUrl: './money-transfer.component.html',
  styleUrls: ['./money-transfer.component.scss'],
})
export class MoneyTransferComponent implements OnInit {
  showEmailInput: boolean = false;
  moneyTransferForm: FormGroup;
  walletData: WalletItem;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private transactionsService: TransactionsService,
    private walletService: WalletService,
    private afs: AngularFirestore
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.showEmailInput = params['showEmailInput'] === 'true';
      this.initForm();
    });

    const user = this.userService.getUserLoggedIn();
    console.log('user', user);

    if (user) {
      const userId = user.uid;
      console.log('userId', userId);

      this.walletService
        .getWalletByUserId(userId)
        .then((querySnapshot: QuerySnapshot<any>) => {
          if (!querySnapshot.empty) {
            const firstDocument = querySnapshot.docs[0].data();
            this.walletData = firstDocument;
            console.log('this.walletData', this.walletData);
          } else {
            console.log('No wallet data found');
          }
        })
        .catch((error) => {
          console.error('Error fetching wallet data:', error);
        });
    } else {
      console.log('No user logged in');
    }
  }

  initForm() {
    this.moneyTransferForm = this.formBuilder.group({
      email: [
        this.showEmailInput ? '' : null,
        this.showEmailInput ? [Validators.required, Validators.email] : null,
      ],
      amount: ['', Validators.required],
    });
  }

  async transferMoney() {
    if (!this.moneyTransferForm.valid) {
      return null;
    }

    const email_address = this.moneyTransferForm.value.email;

    try {
      const recipientQuery = await this.afs
        .collection('users', (ref) =>
          ref.where('email_address', '==', email_address)
        )
        .get()
        .toPromise();

      if (!recipientQuery.empty) {
        const recipientData = recipientQuery.docs[0].data() as UserData;
        const recipientId = recipientData.user_id;

        const sender = this.userService.getUserLoggedIn();
        const senderWalletSnapshot = await this.walletService.getWalletByUserId(
          sender.uid
        );
        const recipientWalletSnapshot =
          await this.walletService.getWalletByUserId(recipientId);

        if (!senderWalletSnapshot.empty && !recipientWalletSnapshot.empty) {
          const senderWalletId = senderWalletSnapshot.docs[0].id;
          const senderWalletData =
            senderWalletSnapshot.docs[0].data() as WalletItem;
          const senderCurrentAmount = senderWalletData.wallet_balance || 0;

          const recipientWalletId = recipientWalletSnapshot.docs[0].id;
          const recipientWalletData =
            recipientWalletSnapshot.docs[0].data() as WalletItem;
          const recipientCurrentAmount =
            recipientWalletData.wallet_balance || 0;

          const amount = parseFloat(this.moneyTransferForm.value.amount);

          if (senderCurrentAmount >= amount) {
            const senderNewAmount = senderCurrentAmount - amount;
            console.log(
              'SENDER AMOUNTS - Current - New',
              senderCurrentAmount,
              senderNewAmount
            );
            const recipientNewAmount = recipientCurrentAmount + amount;
            console.log(
              'RECIPIENT AMOUNTS - Current - New',
              recipientCurrentAmount,
              recipientNewAmount
            );

            await this.walletService.updateWalletBalance(
              senderWalletId,
              senderNewAmount
            );
            await this.walletService.updateWalletBalance(
              recipientWalletId,
              recipientNewAmount
            );

            const transactionItem: TransactionItem = {
              user_id: sender.uid,
              trans_type: 'transfer',
              trans_amount: amount,
            };
            this.transactionsService.createTransaction(transactionItem);
            

            console.log('Wallets updated successfully!');
          } else {
            console.log(
              'Sender does not have enough balance for the transfer.'
            );
          }
        } else {
          console.log('Sender or recipient wallet not found.');
        }
      } else {
        console.log('User with provided email not found!');
      }
    } catch (error) {
      console.error('Error during wallet update:', error);
    }
  }

  async topUp() {
    if (!this.moneyTransferForm.valid) {
      return null;
    }

    const user = this.userService.getUserLoggedIn();

    try {
      const walletSnapshot = await this.walletService.getWalletByUserId(
        user.uid
      );

      if (!walletSnapshot.empty) {
        const walletId = walletSnapshot.docs[0].id;
        const walletData = walletSnapshot.docs[0].data() as WalletItem;
        const currentAmount = walletData.wallet_balance || 0;
        const amount = parseFloat(this.moneyTransferForm.value.amount);
        const newAmount = currentAmount + amount;

        await this.walletService.updateWalletBalance(walletId, newAmount);
        console.log('Wallet updated successfully!');

        const transactionItem: TransactionItem = {
          user_id: user.uid,
          trans_type: 'topup',
          trans_amount: amount,
        };
        this.transactionsService.createTransaction(transactionItem);

      } else {
        console.log('No wallet found for the specified userId.');
      }
    } catch (error) {
      console.error('Error during wallet update:', error);
    }
  }
}
