import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { User } from '../models/user';
import { CartService } from './cart.service'; 
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:5000/api/users'; 
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getInitialUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private loggedUserId: string = '';

  constructor(private http: HttpClient, private injector: Injector, private router: Router) {
    this.checkSession(); 
  }

  private getInitialUser(): User | null {
    const id = sessionStorage.getItem('userId');
    const role = sessionStorage.getItem('userRole');
    if (id) {
      return { id: id, role: role || 'user', name: 'Loading...' } as any;
    }
    return null;
  }

  public setLoggedUser(id: string, role: string = 'user') {
    this.loggedUserId = id;
    sessionStorage.setItem('userId', id);
    sessionStorage.setItem('userRole', role);
  }

  public getLoggedUserId(): string {
    const id = sessionStorage.getItem('userId');
    this.loggedUserId = id || ''; 
    return this.loggedUserId;
  }

  public checkSession() {
    this.http.get<any>(`${this.apiUrl}/me`, { withCredentials: true }).subscribe({
      next: (res) => {
        this.updateLocalUser(res);
      },
      error: (err) => {
        console.log("Server session check failed:", err.status);
        
        if (err.status === 401) {
          this.logout();
        } else {
          
          const id = sessionStorage.getItem('userId');
          if (id) {
            const role = sessionStorage.getItem('userRole') || 'user';
            this.currentUserSubject.next({ id, role, name: 'User' } as any);
          } else {
            this.logout();
          }
        }
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
    
    this.currentUserSubject.next(userData);

    const id = userData._id || userData.id;
    const role = userData.role || 'user';

    if (id) {
      this.setLoggedUser(String(id), role);
    }

    if (userData.cart) {
      this.cartService.setCart(userData.cart);
    }
  }

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
        if (res && res.user) {
          this.updateLocalUser(res.user);
        }
      })
    );
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

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe();
    this.currentUserSubject.next(null);
    this.loggedUserId = '';
    sessionStorage.clear(); 
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }
}