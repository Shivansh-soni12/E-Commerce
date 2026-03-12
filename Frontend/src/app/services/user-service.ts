import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { User } from '../models/user';
import { CartService } from './cart.service'; 

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:5000/api/users'; 
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private injector: Injector) {
    this.checkSession(); // Restored the call
  }
public checkSession() {
    this.http.get<any>(`${this.apiUrl}/me`, { withCredentials: true }).subscribe({
      next: (res) => {
        // We pass 'res' to updateLocalUser which handles the .user wrapping
        this.updateLocalUser(res);
      },
      error: (err) => {
        console.log("No active session found on server.");
        // Optional: clear state if session is dead
        this.currentUserSubject.next(null);
      }
    });
  }
  private get cartService(): CartService {
    return this.injector.get(CartService);
  }

  public get loggedInUser(): User | null {
    return this.currentUserSubject.value;
  }

public updateLocalUser(user: any) {
  const userData = user.user ? user.user : user; 
  
  // 1. UPDATE IMMEDIATELY so Guards can see the login state
  console.log("Syncing State (Immediate):", userData);
  this.currentUserSubject.next(userData);

  // 2. Keep the rest in setTimeout to avoid Angular UI errors
  setTimeout(() => {
    if (userData.cart) {
      this.cartService.setCart(userData.cart);
    }
  }, 0);
}

  // --- AUTH & ADMIN METHODS ---

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  login(credentials: any): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials, { withCredentials: true })
      .pipe(
        map(response => {
          const user = response.user || response;
          return {
            ...user,
            id: user._id || user.id,
            role: user.role || 'user'
          };
        }),
        tap(user => this.updateLocalUser(user))
      );
  }

updateProfile(user: User): Observable<any> {
  const userId = user.id || (user as any)._id;
  return this.http.put<any>(`${this.apiUrl}/profile/${userId}`, user, { withCredentials: true }).pipe(
    tap(res => {
      // The backend returns { message: "...", user: { ... } }
      // We pass the nested user object to updateLocalUser
      if (res && res.user) {
        this.updateLocalUser(res.user);
      }
    })
  );
}
  // --- CART & WISHLIST (Redirects to CartService logic) ---

  addToCart(product: any) {
    // Simply tells CartService to do the work
    this.cartService.addItem(product);
  }

  addToWishlist(product: any) {
    const user = this.loggedInUser;
    if (!user) return;
    const pId = product.productId || product._id || product.id;
    const wishlist = user.wishlist ? [...user.wishlist] : [];
    
    if (!wishlist.some(i => (i.productId || (i as any)._id) === pId)) {
      wishlist.push({
        productId: pId, name: product.name, price: product.price, image: product.image || '',
        quantity: 0
      });
      this.updateProfile({ ...user, wishlist }).subscribe({
        next: (res) => this.updateLocalUser(res)
      });
    }
  }

  moveToWishlist(product: any) {
    const user = this.loggedInUser;
    if (!user) return;

    const pId = String(product.productId || product._id || product.id);

    // 1. Filter out the item from the Cart
    const updatedCart = user.cart.filter((i: any) => {
      const currentId = String(i.productId || i._id || i.id);
      return currentId !== pId;
    });

    // 2. Add to Wishlist only if it's truly not there
    const updatedWishlist = user.wishlist ? [...user.wishlist] : [];
    const alreadyInWishlist = updatedWishlist.some((i: any) => {
      const currentId = String(i.productId || i._id || i.id);
      return currentId === pId;
    });

    if (!alreadyInWishlist) {
      updatedWishlist.push({
        productId: pId,
        name: product.name,
        price: product.price,
        image: product.image || '',
        quantity: 0
      });
    }

    // 3. Save to DB
    this.updateProfile({ ...user, cart: updatedCart, wishlist: updatedWishlist }).subscribe({
      next: (res) => this.updateLocalUser(res),
      error: (err) => console.error("Move to Wishlist failed", err)
    });
  }
  // FIX: Move from Wishlist to Cart (The 400 Error Fix)
 moveToCart(product: any) {
  const user = this.loggedInUser;
  if (!user) return;

  // 1. Normalize ID (Ensuring it's a clean string)
  const pId = String(product.productId || product._id || product.id).trim();

  // 2. Remove from Wishlist
  const updatedWishlist = (user.wishlist || []).filter((i: any) => 
    String(i.productId || i._id || i.id).trim() !== pId
  );

  // 3. Prepare the New Cart
  let updatedCart = user.cart ? [...user.cart] : [];
  const existingIndex = updatedCart.findIndex(i => 
    String(i.productId || i._id || i.id).trim() === pId
  );

  if (existingIndex > -1) {
    // If it exists, we create a fresh object copy to trigger Angular change detection
    const updatedItem = { ...updatedCart[existingIndex] };
    updatedItem.quantity += 1;
    updatedCart[existingIndex] = updatedItem;
  } else {
    // If it's new, we ensure all Mongoose required fields are present
    updatedCart.push({
      productId: pId,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || ''
    });
  }

  // 4. PREVENT THE "DISAPPEARING" ACT
  // We update the local CartService IMMEDIATELY so the UI sees the item 
  // before the HTTP request even finishes.
  this.cartService.setCart(updatedCart);

  // 5. Sync to Database
  const finalUser = { ...user, cart: updatedCart, wishlist: updatedWishlist };
  this.updateProfile(finalUser).subscribe({
    next: (res) => {
      // This will call your setTimeout logic to finalize everything
      this.updateLocalUser(res);
      console.log("Move to Cart: Database Sync Successful");
    },
    error: (err) => {
      console.error("Move to Cart: Database Sync Failed", err);
      // Optional: Rollback local cart if DB fails
      this.cartService.setCart(user.cart); 
    }
  });
}

removeFromWishlist(productId: string) {
  const user = this.loggedInUser;
  if (!user) return;

  const pId = String(productId).trim();

  // 1. Filter out the item
  const updatedWishlist = (user.wishlist || []).filter((i: any) => {
    const currentId = String(i.productId || i._id || i.id).trim();
    return currentId !== pId;
  });

  // 2. Sync to Database
  this.updateProfile({ ...user, wishlist: updatedWishlist }).subscribe({
    next: (res) => {
      console.log("Item removed from wishlist successfully");
      this.updateLocalUser(res);
    },
    error: (err) => console.error("Failed to remove item from wishlist", err)
  });
}

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe();
    this.currentUserSubject.next(null);
    this.cartService.clearCart();
    localStorage.removeItem('user');
  }
}