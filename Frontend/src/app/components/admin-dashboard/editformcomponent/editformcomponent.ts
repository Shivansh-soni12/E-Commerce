import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product';

@Component({
  selector: 'app-editformcomponent',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './editformcomponent.html',
  styleUrls: ['./editformcomponent.css']
})
export class Editformcomponent implements OnInit {
  product!: Product;
  originalProduct!: string; 
  selectedFile: File | null = null;
  isSubmitting: boolean = false;

  categoryBrands: { [key: string]: string[] } = {
    'Electronics': ['Samsung', 'Sony', 'LG', 'Apple'],
    'Computers': ['Dell', 'HP', 'Lenovo', 'ASUS'],
    'Wearables': ['Boat', 'Noise', 'Apple', 'Fitbit'],
    'Accessories': ['Logitech', 'Razer', 'Corsair', 'TP-Link']
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductById(id).subscribe({
        next: (found: Product) => {
          this.product = { ...found };
          this.originalProduct = JSON.stringify(found);
        },
        error: (err) => console.error('Load error', err)
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  canSave(): boolean {
    const hasFile = this.selectedFile !== null;
    const hasTextChanged = JSON.stringify(this.product) !== this.originalProduct;
    return hasFile || hasTextChanged;
  }

  onSubmit() {
    this.isSubmitting = true;
    const productId = this.product._id || String(this.product.id);
    const formData = new FormData();
    
    formData.append('name', this.product.name);
    formData.append('description', this.product.description);
    formData.append('price', this.product.price.toString());
    formData.append('category', this.product.category || '');
    formData.append('brand', this.product.brand || '');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    this.productService.updateProduct(productId, formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Product updated successfully!');
        this.router.navigate(['/admin/manage']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Update failed', err);
        alert('Error updating product.');
      }
    });
  }

  onCancel() {
    this.router.navigate(['/admin/manage']);
  }
}