import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpennodeComponent } from './opennode.component';

describe('OpennodeComponent', () => {
  let component: OpennodeComponent;
  let fixture: ComponentFixture<OpennodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpennodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpennodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
