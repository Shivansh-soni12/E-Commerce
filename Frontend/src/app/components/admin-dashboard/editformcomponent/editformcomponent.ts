import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Ensure these paths match your actual folder structure
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
  selectedFile: File | null = null;

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
        },
        error: (err: any) => console.error('Could not load product', err)
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    // Use the MongoDB _id (usually preferred) or the id property
    const productId = this.product._id || String(this.product.id);

    const formData = new FormData();
    formData.append('name', this.product.name);
    formData.append('description', this.product.description);
    formData.append('price', this.product.price.toString());
    formData.append('category', this.product.category || '');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    this.productService.updateProduct(productId, formData).subscribe({
      next: () => {
        alert('Product updated successfully!');
        this.router.navigate(['/admin/manage']);
      },
      error: (err: any) => {
        console.error('Update failed:', err);
        alert('Failed to update product.');
      }
    });
  }

  onCancel() {
    this.router.navigate(['/admin/manage']);
  }
}