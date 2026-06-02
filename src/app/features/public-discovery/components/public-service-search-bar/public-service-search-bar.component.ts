import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-public-service-search-bar',
  imports: [ReactiveFormsModule],
  template: `
    <label class="sr-only" for="public-service-search">Buscar servicios</label>
    <div class="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-2 shadow-sm sm:flex-row sm:items-center">
      <div class="flex min-h-12 flex-1 items-center gap-3 rounded-2xl bg-white px-4 shadow-sm">
        <span class="text-sm font-semibold text-slate-500" aria-hidden="true">Buscar</span>
        <input
          id="public-service-search"
          type="search"
          class="min-h-12 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
          placeholder="Servicio, profesional o empresa..."
          [formControl]="searchControl"
        />
      </div>
      <button
        type="button"
        class="inline-flex min-h-12 items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline focus:outline-2 focus:outline-indigo-700"
        (click)="submitSearch()"
      >
        Buscar
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServiceSearchBarComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly value = input<string | null | undefined>(null);
  readonly searchChange = output<string | null>();

  readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    effect(() => {
      const nextValue = this.value() ?? '';
      if (nextValue !== this.searchControl.value) {
        this.searchControl.setValue(nextValue, { emitEvent: false });
      }
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.emitSearch(value));
  }

  submitSearch(): void {
    this.emitSearch(this.searchControl.value);
  }

  private emitSearch(value: string): void {
    const trimmed = value.trim();
    this.searchChange.emit(trimmed.length > 0 ? trimmed : null);
  }
}
