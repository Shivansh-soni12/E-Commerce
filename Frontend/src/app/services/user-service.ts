import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map, of } from 'rxjs';
import { User } from '../models/user';
import { CartService } from './cart.service'; 
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:5000/api/users'; 
  
  // 1. SESSION STORAGE TOKEN
  // This survives page refreshes in the SAME tab, 
  // but is empty if the URL is pasted into a NEW tab.
  private TOKEN_KEY = 'authToken';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private injector: Injector, 
    private router: Router
  ) {}

  // Helper to expose the token to the Interceptor and Guard
  public getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  public getLoggedUserId(): string | null {
    return this.getToken() ? 'authenticated' : null;
  }

  public get loggedInUser(): User | null {
    return this.currentUserSubject.value;
  }

  private get cartService(): CartService {
    return this.injector.get(CartService);
  }

  /**
   * LOGIN
   * Captures the token and stores it in SessionStorage (Tab Memory).
   */
  login(credentials: any): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        // Store token in tab-specific memory
        if (response.token) {
          sessionStorage.setItem(this.TOKEN_KEY, response.token);
        }
        
        const user = response.user;
        return { ...user, id: user._id || user.id };
      }),
      tap(user => this.updateLocalUser(user))
    );
  }

  /**
   * SESSION CHECK
   * Repopulates the currentUserSubject on refresh using the token in SessionStorage.
   */
  public checkSession() {
    const token = this.getToken();
    if (!token) {
      this.logout();
      return;
    }

    // Call /me to get fresh user data using the stored token
    this.http.get<any>(`${this.apiUrl}/me`).subscribe({
      next: (res) => {
        this.updateLocalUser(res);
      },
      error: (err) => {
        console.log("Session invalid or expired:", err.status);
        this.logout();
      }
    });
  }

  public updateLocalUser(user: any) {
    const userData = user.user ? user.user : user; 
    this.currentUserSubject.next(userData);

    if (userData.cart) {
      this.cartService.setCart(userData.cart);
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateProfile(user: User): Observable<any> {
    const userId = user.id || (user as any)._id;
    return this.http.put<any>(`${this.apiUrl}/profile/${userId}`, user).pipe(
      tap(res => {
        if (res && res.user) {
          this.updateLocalUser(res.user);
        }
      })
    );
  }

  /**
   * LOGOUT
   * Completely clears the tab memory.
   */
  logout() {
    // Optional: notify backend
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();

    sessionStorage.clear(); // Wipes token and all tab data
    this.currentUserSubject.next(null);
    this.cartService.clearCart();
    
    this.router.navigate(['/login']);
  }

  // --- Utility Methods ---

  public isAuthenticated$(): Observable<boolean> {
    // Check if we have a token in the tab
    return of(!!this.getToken());
  }

  addToCart(product: any) {
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
    const updatedCart = user.cart.filter((i: any) => String(i.productId || i._id || i.id) !== pId);
    const updatedWishlist = user.wishlist ? [...user.wishlist] : [];
    if (!updatedWishlist.some((i: any) => String(i.productId || i._id || i.id) === pId)) {
      updatedWishlist.push({ productId: pId, name: product.name, price: product.price, image: product.image || '', quantity: 0 });
    }
    this.updateProfile({ ...user, cart: updatedCart, wishlist: updatedWishlist }).subscribe({
      next: (res) => this.updateLocalUser(res),
      error: (err) => console.error("Move to Wishlist failed", err)
    });
  }

  moveToCart(product: any) {
    const user = this.loggedInUser;
    if (!user) return;
    const pId = String(product.productId || product._id || product.id).trim();
    const updatedWishlist = (user.wishlist || []).filter((i: any) => String(i.productId || i._id || i.id).trim() !== pId);
    let updatedCart = user.cart ? [...user.cart] : [];
    const existingIndex = updatedCart.findIndex(i => String(i.productId || i._id || i.id).trim() === pId);
    if (existingIndex > -1) {
      const updatedItem = { ...updatedCart[existingIndex] };
      updatedItem.quantity += 1;
      updatedCart[existingIndex] = updatedItem;
    } else {
      updatedCart.push({ productId: pId, name: product.name, price: product.price, quantity: 1, image: product.image || '' });
    }
    this.cartService.setCart(updatedCart);
    this.updateProfile({ ...user, cart: updatedCart, wishlist: updatedWishlist }).subscribe({
      next: (res) => this.updateLocalUser(res),
      error: (err) => { this.cartService.setCart(user.cart); }
    });
  }

  removeFromWishlist(productId: string) {
    const user = this.loggedInUser;
    if (!user) return;
    const pId = String(productId).trim();
    const updatedWishlist = (user.wishlist || []).filter((i: any) => String(i.productId || i._id || i.id).trim() !== pId);
    this.updateProfile({ ...user, wishlist: updatedWishlist }).subscribe({
      next: (res) => this.updateLocalUser(res)
    });
  }
}