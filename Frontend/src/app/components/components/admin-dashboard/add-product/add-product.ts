import { Component } from '@angular/core';
import { Product } from '../../../models/product';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-product.html',
  styleUrls: ['./add-product.css'],
})

export class AddProduct {
  newProduct: Product = {
    id: 0,
    name: '',
    description: '',
    price: null as any,
    category: '',
    brand: '', 
    imageUrl: ''
  };

  categoryBrands: { [key: string]: string[] } = {
    'Electronics': ['Samsung', 'Sony', 'LG', 'Apple'],
    'Computers': ['Dell', 'HP', 'Lenovo', 'ASUS'],
    'Wearables': ['Boat', 'Noise', 'Apple', 'Fitbit'],
    'Accessories': ['Logitech', 'Razer', 'Corsair', 'TP-Link']
  };

  selectedFile: File | null = null;
  constructor(private productService: ProductService, private router: Router) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('name', this.newProduct.name);
    formData.append('description', this.newProduct.description);
    formData.append('price', this.newProduct.price.toString());
    formData.append('category', this.newProduct.category);
    formData.append('brand', this.newProduct.brand); // Added this

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    this.productService.addProduct(formData).subscribe({
      next: () => {
        alert('Product Added!');
        this.router.navigate(['/admin/products']);
      },
      error: (err) => console.error(err)
    });
  }
}