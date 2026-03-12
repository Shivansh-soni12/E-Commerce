import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { UserService } from '../../../services/user-service';
import { OrderMgmt } from '../../../services/order-mgmt'; 
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-order-main',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './order-main.html',
  styleUrls: ['./order-main.css']
})
export class OrderMain implements OnInit {
  stats = {
    totalOrders: 0,
    pendingCount: 0
  };

  constructor(
    private userService: UserService,
    private orderMgmt: OrderMgmt, 
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
   
    this.userService.currentUser$.pipe(
      filter(user => !!user && (!!user._id || !!user.id))
    ).subscribe(user => {
      const userId = user!._id || user!.id;
      
     
      this.orderMgmt.getStats(String(userId)).subscribe({
        next: (data: any) => {
          this.stats = {
            totalOrders: data.totalOrders || 0,
            pendingCount: data.pendingCount || 0
          };
          this.cdr.detectChanges(); 
        },
        error: (err) => console.error("Error loading dashboard stats:", err)
      });
    });
  }
}