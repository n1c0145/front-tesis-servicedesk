import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlaReportingComponent } from './sla-reporting.component';

describe('SlaReportingComponent', () => {
  let component: SlaReportingComponent;
  let fixture: ComponentFixture<SlaReportingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlaReportingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlaReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
