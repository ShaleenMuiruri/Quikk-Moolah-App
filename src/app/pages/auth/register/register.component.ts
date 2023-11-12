import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { AuthService } from 'src/app/services/auth.service';

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
      phoneNumber: new FormControl('', [Validators.required]),
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
    private toast: HotToastService
  ) {}

  registerWithEmailAndPassword() {
    const payload = Object.assign(this.registerForm.value);
    this.authService
      .registerWithEmailAndPassword(payload)
      .then((res: any) => {
        this.router.navigateByUrl('dashboard/home');
        this.toast.success('Registration successful');
      })
      .catch((error: any) => {
        console.error("error", error)
        this.toast.error(error);
      });
  }
}
