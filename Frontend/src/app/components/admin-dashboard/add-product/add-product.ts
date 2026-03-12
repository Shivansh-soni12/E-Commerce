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
    imageUrl: ''
  };
 
  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  selectedFile: File | null = null;

onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
  }
}
onSubmit() {
  // 1. Create a FormData container
  const formData = new FormData();
  
  // 2. Append the text fields (MUST match your backend req.body names)
  formData.append('name', this.newProduct.name);
  formData.append('description', this.newProduct.description);
  formData.append('price', this.newProduct.price.toString());
formData.append('category', this.newProduct.category || '');
  // 3. Append the image file (MUST match upload.single("image") in routes)
  if (this.selectedFile) {
    formData.append('image', this.selectedFile, this.selectedFile.name);
  }

  // 4. Send the FormData to the service
  this.productService.addProduct(formData).subscribe({
    next: (res) => {
      alert('Product with Image added successfully!');
      this.router.navigate(['/admin/products']);
    },
    error: (err) => {
      console.error('Upload Error:', err);
      alert('Failed to upload image. Check backend console.');
    }
  });
}

}