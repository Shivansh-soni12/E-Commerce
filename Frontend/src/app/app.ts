import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/shared/navbar/navbar';
import { FooterComponent } from './components/shared/footer-component/footer-component';
import { UserService } from './services/user-service';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    Navbar, 
    FooterComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  currentUser: any = null;

  constructor(private userService: UserService) {}

 ngOnInit() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log("Navbar Switcher detected user:", user?.role);
    });
  }
} 
