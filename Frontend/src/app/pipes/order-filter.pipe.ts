import { Pipe, PipeTransform } from '@angular/core';
import { Order } from '../models/order';

@Pipe({
  name: 'orderFilter',

})
export class OrderFilterPipe implements PipeTransform {

  transform(orders: Order[], searchText: string, status: string): Order[] {
    if (!orders) return [];

    let filtered = status === 'All' 
      ? orders 
      : orders.filter(o => o.status.toLowerCase() === status.toLowerCase());

    if (searchText) {
      const lowerTerm = searchText.toLowerCase();
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(lowerTerm) || 
        o.productDetails?.some(p => p.name.toLowerCase().includes(lowerTerm))
      );
    }

    return filtered;
  }
}