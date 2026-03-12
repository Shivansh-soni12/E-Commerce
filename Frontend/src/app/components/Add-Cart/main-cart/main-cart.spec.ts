import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCart } from './main-cart';

describe('MainCart', () => {
  let component: MainCart;
  let fixture: ComponentFixture<MainCart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
