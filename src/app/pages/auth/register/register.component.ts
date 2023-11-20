import { Component } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';
import { WalletService } from 'src/app/services/wallet.service';
import { WalletItem } from '../../dashboard/money-transfer/money-transfer.component';
export interface UserItem {
  user_id: string;
  email_address: string;
}
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  hide: boolean = true;
  hideConfirmPassword: boolean = true;
  loading: boolean = false;

  registerForm: FormGroup = new FormGroup(
    {
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator }
  );

  togglePasswordVisibility(): void {
    this.hide = !this.hide;
  }
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  private passwordMatchValidator(): Validators {
    return (control: AbstractControl): { mismatch: boolean } | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;

      if (password !== confirmPassword) {
        control.get('confirmPassword')?.setErrors({ mismatch: true });
        return { mismatch: true };
      } else {
        return null;
      }
    };
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private afs: AngularFirestore,
    private snackbarService: SnackbarService,
    private walletService: WalletService,
    private userService: UserService,
  ) {
    this.userCollection = afs.collection<UserItem>('users');
    this.items = this.userCollection.valueChanges();

    this.walletCollection = afs.collection<WalletItem>('wallet');
    this.walletItems = this.walletCollection.valueChanges();

    this.usersCollection = afs.collection<UserItem>('users');
    this.userItems = this.usersCollection.valueChanges();
  }

  registerWithEmailAndPassword() {
    this.loading = true;
    const payload = Object.assign(this.registerForm.value);
    this.authService
      .registerWithEmailAndPassword(payload)
      .then((res: any) => {
        const user = res.user;
        this.addItem({ user_id: user.uid, email_address: user.email });
        this.router.navigateByUrl('auth/login');
        this.snackbarService.openSnackBar('Registration Successful');
        this.loading = false;
      })
      .catch((error: any) => {
        this.loading = false;
        this.snackbarService.openSnackBar(error);
      });
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

  
  private userCollection: AngularFirestoreCollection<UserItem>;
  items: Observable<UserItem[]>;
  addItem(item: UserItem) {
    this.userCollection.add(item);
  }

  private walletCollection: AngularFirestoreCollection<WalletItem>;
  walletItems: Observable<WalletItem[]>;
  addWalletItem(item: WalletItem) {
    this.walletCollection.add(item);
  }

  private usersCollection: AngularFirestoreCollection<UserItem>;
  userItems: Observable<UserItem[]>;
  addUserItem(item: UserItem) {
    this.usersCollection.add(item);
  }

}
