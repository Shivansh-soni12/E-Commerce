import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 
import { UserService } from '../../../services/user-service';
 
@Component({
  selector: 'app-admin-main',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './admin-main.html',
  styleUrls: ['./admin-main.css'],
})
export class AdminMain {
 
  constructor(
    private userService: UserService,
    private router: Router
  ) {}
 
  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
 