import { TestBed } from '@angular/core/testing';

import { OrderMgmt } from './order-mgmt';

describe('OrderMgmt', () => {
  let service: OrderMgmt;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderMgmt);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
