import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('navigates to the marketplace with the home search and mapped modality', () => {
    const fixture = TestBed.createComponent(LandingPageComponent);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.searchTerm.set(' terapia ');
    fixture.componentInstance.selectedModality.set('online');
    fixture.componentInstance.submitSearch();

    expect(navigate).toHaveBeenCalledWith(['/services'], {
      queryParams: {
        page: 1,
        per_page: 12,
        sort: 'recent',
        search: 'terapia',
        modality: 'remota',
      },
    });
  });

  it('navigates with the default marketplace query when the search is blank', () => {
    const fixture = TestBed.createComponent(LandingPageComponent);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.componentInstance.searchTerm.set('   ');
    fixture.componentInstance.submitSearch();

    expect(navigate).toHaveBeenCalledWith(['/services'], {
      queryParams: {
        page: 1,
        per_page: 12,
        sort: 'recent',
      },
    });
  });

  it('uses the form submit event for searches', () => {
    const fixture = TestBed.createComponent(LandingPageComponent);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    input.value = 'psicologo montevideo';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(navigate).toHaveBeenCalledWith(['/services'], {
      queryParams: {
        page: 1,
        per_page: 12,
        sort: 'recent',
        search: 'psicologo montevideo',
      },
    });
  });
});
