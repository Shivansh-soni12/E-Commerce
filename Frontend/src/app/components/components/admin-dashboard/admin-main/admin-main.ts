import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 
import { UserService } from '../../../services/user-service';
import { User } from '../../../models/user'; 
import { Observable } from 'rxjs'; 

@Component({
  selector: 'app-admin-main',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './admin-main.html',
  styleUrls: ['./admin-main.css'],
})
export class AdminMain {
  currentUser$: Observable<User | null>;

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.currentUser$ = this.userService.currentUser$;
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}