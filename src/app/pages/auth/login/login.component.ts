import { Component } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { WalletService } from 'src/app/services/wallet.service';
import { UserService } from 'src/app/services/user.service';
export interface WalletItem {
  user_id: string;
  wallet_balance: number;
}

export interface UserItem {
  user_id: string;
  email_address: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  hide: boolean = true;
  loading: boolean = false;

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  togglePasswordVisibility(): void {
    this.hide = !this.hide;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private afs: AngularFirestore,
    private walletService: WalletService,
    private userService: UserService,
    private snackbarService: SnackbarService
  ) {
    this.walletCollection = afs.collection<WalletItem>('wallet');
    this.walletItems = this.walletCollection.valueChanges();

    this.usersCollection = afs.collection<UserItem>('users');
    this.userItems = this.usersCollection.valueChanges();
  }
  loginWithGoogle() {
    this.authService
      .signInWithGoogle()
      .then(async (res) => {
        this.router.navigateByUrl('dashboard/home');
        const uid = res.user.uid;

        const walletExists = await this.walletService.checkWalletExists(uid);
        if (!walletExists) {
          this.addWalletItem({ user_id: uid, wallet_balance: 0 });
        }
        const userExists = await this.userService.checkUserExists(uid);
        if (!userExists) {
          this.addUserItem({ user_id: uid, email_address: res.user.email });
        }
        this.snackbarService.openSnackBar("Login Successful");
      })
      .catch((err) => {
        this.snackbarService.openSnackBar(err);
      });
  }

  loginWithEmailAndPassword() {
    this.loading = true;
    const payload = Object.assign(this.loginForm.value);
    this.authService
      .signInWithEmailAndPassword(payload)
      .then(async (res) => {
        this.router.navigateByUrl('dashboard/home');
        const uid = res.user.uid;
        const walletExists = await this.walletService.checkWalletExists(uid);
        if (!walletExists) {
          this.addWalletItem({ user_id: uid, wallet_balance: 0 });
        }
        this.snackbarService.openSnackBar("Login Successful");
        this.loading = false;
      })
      .catch((err) => {
        this.loading = false;
        this.snackbarService.openSnackBar(err.message);
      });
  }


  private walletCollection: AngularFirestoreCollection<WalletItem>;
  walletItems: Observable<WalletItem[]>;
  items: Observable<WalletItem[]>;
  addWalletItem(item: WalletItem) {
    this.walletCollection.add(item);
  }

  private usersCollection: AngularFirestoreCollection<UserItem>;
  userItems: Observable<UserItem[]>;
  addUserItem(item: UserItem) {
    this.usersCollection.add(item);
  }

  // async checkWalletExists(uid: string): Promise<boolean> {
  //   const snapshot = await this.walletCollection.ref
  //     .where('user_id', '==', uid)
  //     .get();

  //   return !snapshot.empty;
  // }

  // async checkUserExists(uid: string): Promise<boolean> {
  //   const snapshot = await this.usersCollection.ref
  //     .where('user_id', '==', uid)
  //     .get();

  //   return !snapshot.empty;
  // }
}
