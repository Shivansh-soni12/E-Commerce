import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductCard } from '../product-card/product-card';
import { Product } from '../../../models/product';
import { ProductService } from '../../../services/product.service'; 
import { UserService } from '../../../services/user-service'; 
import { CartService } from '../../../services/cart.service';
import { User } from '../../../models/user';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-hero-page',
  standalone: true,
  imports: [CommonModule, ProductCard, FormsModule],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css'],
})
export class HeroPage implements OnInit, OnDestroy {
  bannerMessage: string = 'Shop The Latest Products!';
  products: Product[] = [];
  loggedInUser: User | null = null;
  searchTerm: string = '';
  sortCategory: string = '';
  products$!: Observable<Product[]>;
  
  private userSub!: Subscription;

  constructor(
  private productService: ProductService, 
  private userService: UserService,       
  public cartService: CartService, 
  private router: Router
) {}
  ngOnInit() {
    this.products$ = this.productService.getProducts();
    this.products$.subscribe(data => this.products = data);

    this.userSub = this.userService.currentUser$.subscribe(user => {
      this.loggedInUser = user;
    });
  }


onAddToCart(product: Product) {
  console.log('Attempting to add to cart:', product.name);

  if (!this.loggedInUser) {
    alert('Please login first to add items to cart!');
    this.router.navigate(['/login']);
    return;
  }

  try {
    this.userService.addToCart(product);

    alert("Added to Cart: " + product.name);
  } catch (error) {
    console.error("Critical error in onAddToCart:", error);
  }
}

  onAddToWishList(product: Product) {
    if (!this.loggedInUser) {
      alert('Please login first!');
      return;
    }
    
    this.userService.addToWishlist(product);
    alert('Added to wishlist');
  }

  get filteredProducts(): Product[] {
    let result = this.products;
    if (this.searchTerm) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          p.category?.toLowerCase().includes(this.searchTerm.toLowerCase()),
      );
    }
    if (this.sortCategory) {
      result = result.filter(
        (p) => p.category?.toLowerCase() === this.sortCategory.toLowerCase(),
      );
    }
    return result;
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}