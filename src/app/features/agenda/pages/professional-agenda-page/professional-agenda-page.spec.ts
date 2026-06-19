import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalAgendaPage } from './professional-agenda-page';

describe('ProfessionalAgendaPage', () => {
  let component: ProfessionalAgendaPage;
  let fixture: ComponentFixture<ProfessionalAgendaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalAgendaPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalAgendaPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
