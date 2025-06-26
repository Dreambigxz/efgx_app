import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidateComponent } from './liquidate.component';

describe('LiquidateComponent', () => {
  let component: LiquidateComponent;
  let fixture: ComponentFixture<LiquidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiquidateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiquidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
