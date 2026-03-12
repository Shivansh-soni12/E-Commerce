import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileDashboard } from './profile-dashboard';

describe('ProfileDashboard', () => {
  let component: ProfileDashboard;
  let fixture: ComponentFixture<ProfileDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
