import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderMgmt } from '../../../services/order-mgmt';
import { UserService } from '../../../services/user-service';
import { RouterLink, RouterModule, RouterOutlet } from "@angular/router"; 
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core'; 

@Component({
  selector: 'app-order-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterModule],
  templateUrl: './order-dashboard.html',
  styleUrls: ['./order-dashboard.css'] 
})
export class OrderDashboard implements OnInit, OnDestroy {
  stats = {
    totalOrders: 0,
    pendingCount: 0
  };
  private userSub!: Subscription;

  constructor(
    private orderMgmt: OrderMgmt,
    private userService: UserService ,
    private cdr : ChangeDetectorRef
  ) {}

  ngOnInit(): void {
   
    this.userSub = this.userService.currentUser$.pipe(
      filter(user => !!user && (!!user._id || !!user.id))
    ).subscribe(user => {
      const userId = user!._id || user!.id;
      console.log("Dashboard: User confirmed, fetching stats for:", userId);
      
      this.orderMgmt.getStats(String(userId)).subscribe({
  next: (data: any) => {
    console.log("Applying stats to UI:", data);
    this.stats = {
      totalOrders: data.totalOrders,
      pendingCount: data.pendingCount
    };
    this.cdr.detectChanges(); 
  },
  error: (err) => console.error(err)
});
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}