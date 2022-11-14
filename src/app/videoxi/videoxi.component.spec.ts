import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoxiComponent } from './videoxi.component';

describe('VideoxiComponent', () => {
  let component: VideoxiComponent;
  let fixture: ComponentFixture<VideoxiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoxiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoxiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
