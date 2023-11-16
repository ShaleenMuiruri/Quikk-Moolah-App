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

    if (user) {
      const userId = user.uid;
      this.transactionsService
        .getTotalTransfered(userId)
        .then((res) => {
          this.totalTransfered = res;
        })
        .catch((error) => {
          error;
        });

      this.walletService
        .getWalletByUserId(userId)
        .then((querySnapshot: QuerySnapshot<any>) => {
          if (!querySnapshot.empty) {
            const firstDocument = querySnapshot.docs[0].data();
            this.walletData = firstDocument;
          } else {
          }
        })
        .catch((error) => {
          error;
        });
    } else {
    }
  }
}
