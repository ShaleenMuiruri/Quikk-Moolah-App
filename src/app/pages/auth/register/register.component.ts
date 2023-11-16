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
    private afs: AngularFirestore
  ) {
    this.userCollection = afs.collection<UserItem>('users');
    this.items = this.userCollection.valueChanges();
  }

  registerWithEmailAndPassword() {
    const payload = Object.assign(this.registerForm.value);
    this.authService
      .registerWithEmailAndPassword(payload)
      .then((res: any) => {
        const user = res.user;

        this.addItem({ user_id: user.uid, email_address: user.email });
        this.router.navigateByUrl('auth/login');
        // this.toast.success('Registration successful');
      })
      .catch((error: any) => {
        console.error('error', error);
        // this.toast.error(error);
      });
  }
  private userCollection: AngularFirestoreCollection<UserItem>;

  items: Observable<UserItem[]>;

  addItem(item: UserItem) {
    this.userCollection.add(item);
  }
}
