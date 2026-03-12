import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Editformcomponent } from './editformcomponent';

describe('Editformcomponent', () => {
  let component: Editformcomponent;
  let fixture: ComponentFixture<Editformcomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Editformcomponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Editformcomponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
