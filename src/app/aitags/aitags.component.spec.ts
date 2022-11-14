import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AitagsComponent } from './aitags.component';

describe('AitagsComponent', () => {
  let component: AitagsComponent;
  let fixture: ComponentFixture<AitagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AitagsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AitagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
