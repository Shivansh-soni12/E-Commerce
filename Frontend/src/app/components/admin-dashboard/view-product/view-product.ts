import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Product } from '../../../models/product';
import { ProductService } from '../../../services/product.service'; 
 
@Component({
  selector: 'app-view-product',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './view-product.html',
  styleUrls: ['./view-product.css'],
})
export class ViewProduct implements OnInit {
  products: Product[] = []; 
 
  searchTerm: string = '';
  sortCategory: string = '';
 
  constructor(private productService: ProductService) {} 
ngOnInit() {
this.productService.getProducts().subscribe({
  next: (data) => this.products = data,
  error: (err) => console.error(err)
});}
 
 
  get filteredProducts(): Product[] {
    return this.products.filter(p => {
      const matchesSearch =
        !this.searchTerm ||
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchTerm.toLowerCase());
 
      const matchesCategory =
        !this.sortCategory || p.category === this.sortCategory;
 
      return matchesSearch && matchesCategory;
    });
  }
}
