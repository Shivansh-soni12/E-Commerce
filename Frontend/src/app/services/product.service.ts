import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Product } from "../models/product";

@Injectable({ providedIn: 'root' })
export class ProductService {
  // Your base URL for all product operations
  private apiUrl = 'http://localhost:5000/api/products';
  private products: Product[] = []; 

  constructor(private http: HttpClient) {}

  // 1. Get all products and map MongoDB _id to frontend id
  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((backendProducts) => backendProducts.map(p => ({
        ...p,
        id: String(p._id) 
      }))),
      tap(prods => this.products = prods)
    );
  }

  // 2. Get single product
  getProductById(id: string): Observable<Product> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(p => ({ 
        ...p, 
        id: String(p._id) 
      }))
    );
  }

  // 3. Add Product - FIXED URL logic
  addProduct(formData: FormData): Observable<any> {
    // Corrected: Just use this.apiUrl (don't add /products again)
    return this.http.post(this.apiUrl, formData, { withCredentials: true });
  }

  // 4. Update Product - Works for both JSON and FormData
  updateProduct(id: string, updatedData: any): Observable<Product> {
    // Uses PATCH to match your backend route
    return this.http.patch<Product>(`${this.apiUrl}/${id}`, updatedData, { withCredentials: true });
  }

  // 5. Delete Product
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getProductsSnapshot(): Product[] {
    return this.products;
  }
}