import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  hide: boolean = true;


  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  togglePasswordVisibility(): void {
    this.hide = !this.hide;
  }

  constructor(private authService: AuthService, private router: Router){
    
  }
  loginWithGoogle(){
    this.authService.signInWithGoogle().then((res: any) =>{
      this.router.navigateByUrl('dashboard/home')
    }).catch((error:any) =>{
      console.error(error)

    })
  }

  loginWithEmailAndPassword(){
    const payload = Object.assign(this.loginForm.value);
    this.authService.signInWithEmailAndPassword(payload).then((res: any) =>{
      this.router.navigateByUrl('dashboard/home')
    }).catch((error:any) =>{
      console.error(error)

    })
  }
}
