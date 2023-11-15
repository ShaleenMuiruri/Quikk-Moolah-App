import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { WalletService } from 'src/app/services/wallet.service';
import { QuerySnapshot } from '@angular/fire/compat/firestore';
import { WalletItem } from '../../auth/login/login.component';
import {
  TransactionItem,
  TransactionsService,
} from 'src/app/services/transactions.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  walletData: WalletItem;
  totalTransfered: number;
  showTransferFormFlag: boolean = false;

  showTransferForm() {
    this.showTransferFormFlag = !this.showTransferFormFlag;
  }

  constructor(
    private userService: UserService,
    private walletService: WalletService,
    private transactionsService: TransactionsService
  ) {}

  ngOnInit() {
    const user = this.userService.getUserLoggedIn();
    console.log('user', user);

    if (user) {
      const userId = user.uid;
      console.log('userId', userId);

      this.transactionsService
        .getTotalTransfered(userId)
        .then((res) => {
          this.totalTransfered = res;
          console.log('res', res);
        })
        .catch((error) => {
          console.error('Error fetching transaction total:', error);
        });


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
  
}
