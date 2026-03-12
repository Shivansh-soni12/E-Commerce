
import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user-service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cart: any[] = [];
  private cartSubject = new BehaviorSubject<any[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor(private injector: Injector) {}

  private get userService(): UserService {
    return this.injector.get(UserService);
  }

  // The method Hero.ts is looking for
  
  private syncToDb() {
    this.cartSubject.next([...this.cart]);
    const user = this.userService.loggedInUser;
    if (user) {
      const updatedUser = { ...user, cart: this.cart };
      this.userService.updateProfile(updatedUser).subscribe({
        next: (res) => this.userService.updateLocalUser(res.user),
        error: (err) => console.error("Database sync failed", err)
      });
    }
  }

  addItem(product: any) {
    const pId = product.productId || product._id || product.id;
    const existing = this.cart.find(i => (i as any).productId === pId);

    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({
        productId: pId, // Essential for MongoDB
        name: product.name,
        price: product.price,
        image: product.image || '',
        quantity: 1
      } as any);
    }
    this.syncToDb();
  }

  removeItem(productId: string) {
    const item = this.cart.find(i => (i as any).productId === productId);
    if (item && item.quantity > 1) {
      item.quantity--;
    } else {
      this.cart = this.cart.filter(i => (i as any).productId !== productId);
    }
    this.syncToDb();
  }

  deleteItem(productId: string) {
    this.cart = this.cart.filter(i => (i as any).productId !== productId);
    this.syncToDb();
  }

  setCart(items: any[]) {
    this.cart = items || [];
    this.cartSubject.next([...this.cart]);
  }

  clearCart() {
    this.cart = [];
    this.cartSubject.next([]);
  }

}