import { describe, it, expect, vi } from 'vitest';
import { OrderDetail } from './order-detail';
import { OrderStatus } from '../../../models/order';

// Stub Angular modules to prevent JIT/Decorator errors
vi.mock('@angular/common', () => ({ CommonModule: class {}, PlatformLocation: class {} }));
vi.mock('@angular/router', () => ({ RouterModule: class {}, Router: class {}, ActivatedRoute: class {} }));
vi.mock('@angular/forms', () => ({ FormsModule: class {} }));

describe('OrderDetail', () => {
  const mockOrder = { id: 'o-123', userId: 3, status: OrderStatus.Pending } as any;
  const mockUser = { id: 3, name: 'Alice' } as any;

  // Shared mock setup
  const route = { snapshot: { paramMap: { get: (k: string) => k === 'id' ? 'o-123' : null } } } as any;
  const router = { navigate: vi.fn() } as any;
  const orderMgmt = { getOrderById: vi.fn(() => mockOrder) } as any;
  const userSvc = { getUserById: vi.fn(() => mockUser) } as any;

  const createComponent = () => new OrderDetail(route, router, orderMgmt, userSvc);

  it('should create', () => {
    const component = createComponent();
    expect(component).toBeTruthy();
  });

  it('should load order and user on init', () => {
    const component = createComponent();

    component.ngOnInit();

    // Verify order lookup
    expect(orderMgmt.getOrderById).toHaveBeenCalledWith('o-123');
    expect(component.order).toBe(mockOrder);

    // Verify user lookup triggered by the order's userId
    expect(userSvc.getUserById).toHaveBeenCalledWith(3);
    expect(component.orderUser).toBe(mockUser);
  });
});