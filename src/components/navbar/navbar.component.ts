import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  constructor(private authService: AuthService, private router: Router){}

  logout() {
    this.authService.logout()
      .then(() => {
        // Redirect to home page after successful logout
        this.router.navigateByUrl('auth/login');
      })
      .catch((error) => {
        // Handle logout error, if any
        console.error('Logout error:', error);
      });
  }
}