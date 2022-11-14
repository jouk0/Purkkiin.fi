import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdCoverComponent } from './cd-cover.component';

describe('CdCoverComponent', () => {
  let component: CdCoverComponent;
  let fixture: ComponentFixture<CdCoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdCoverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CdCoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
