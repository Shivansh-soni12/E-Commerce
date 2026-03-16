import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
 
@Component({
  selector: 'app-editproduct',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-product.html',
  styleUrls: ['./edit-product.css']
})
export class Editproduct implements OnInit {
  products: Product[] = [];
  searchTerm = '';
  sortCategory = '';
 
  constructor(private productService: ProductService, private router: Router) { }
 
  ngOnInit() { 
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }
 
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
 
  goToEdit(id: number) {
    this.router.navigate(['/admin/edit', id]); 
  }
 
  goToDelete(id: any) {
  if (confirm('Are you sure you want to delete this product?')) {

    const productId = String(id);

    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        alert('Product deleted!');
        
        this.products = this.products.filter(p => String(p.id) !== productId);
      },
      error: (err) => console.error('Delete failed:', err)
    });
  }
}
}
 
 