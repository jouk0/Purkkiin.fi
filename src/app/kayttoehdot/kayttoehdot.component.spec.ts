import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KayttoehdotComponent } from './kayttoehdot.component';

describe('KayttoehdotComponent', () => {
  let component: KayttoehdotComponent;
  let fixture: ComponentFixture<KayttoehdotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KayttoehdotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KayttoehdotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
