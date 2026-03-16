import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Product } from "../models/product";

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:5000/api/products';
  private products: Product[] = []; 

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((backendProducts) => backendProducts.map(p => ({
        ...p,
        id: String(p._id) 
      }))),
      tap(prods => this.products = prods)
    );
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(p => ({ 
        ...p, 
        id: String(p._id) 
      }))
    );
  }

  addProduct(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData, { withCredentials: true });
  }

  updateProduct(id: string, formData: FormData): Observable<any> {
  return this.http.patch(`http://localhost:5000/api/products/${id}`, formData, {
    withCredentials: true 
  });
}

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getProductsSnapshot(): Product[] {
    return this.products;
  }


}