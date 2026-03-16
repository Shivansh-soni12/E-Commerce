
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

private syncToDb() {
  this.cartSubject.next([...this.cart]);
  
  const user = this.userService.loggedInUser;
  if (user) {
    const updatedUser = { ...user, cart: this.cart };
    this.userService.updateProfile(updatedUser).subscribe({
      next: (res) => {
          console.log("Cart synced successfully");
      },
      error: (err) => console.error("Database sync failed", err)
    });
  }
}

addItem(product: any) {
  const pId = product.productId || product._id || product.id;
  
  const user = this.userService.loggedInUser;
  if (user && user.cart) {
      this.cart = [...user.cart]; 
  }

  const existing = this.cart.find(i => String(i.productId) === String(pId));

  if (existing) {
    existing.quantity++;
  } else {
    this.cart.push({
      productId: pId, 
      name: product.name,
      price: product.price,
      image: product.imageUrl || product.image || '', 
      quantity: 1
    });
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