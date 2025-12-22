import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralReportingComponent } from './general-reporting.component';

describe('GeneralReportingComponent', () => {
  let component: GeneralReportingComponent;
  let fixture: ComponentFixture<GeneralReportingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralReportingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
