import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user-service';
import { User } from '../../../models/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit, OnDestroy {

  currentUser: User | null = null;
  private userSub!: Subscription;
  loggedInUser!: User | null;
  isAdmin: boolean = false;

  constructor(
    public userService: UserService, 
    private router: Router
  ) {}


  ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.currentUser = user;
      console.log("Navbar updated with user:", user?.name);
      this.isAdmin = user?.role === 'admin';
    });
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']); 
  }

  ngOnDestroy() {

    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}