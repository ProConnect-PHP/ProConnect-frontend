import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rating-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingInputComponent),
      multi: true,
    },
  ],
  templateUrl: './rating-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingInputComponent implements ControlValueAccessor {
  readonly label = input('Selecciona una calificacion');
  readonly invalid = input(false);

  readonly stars = [1, 2, 3, 4, 5] as const;
  readonly value = signal(0);
  readonly hovered = signal(0);
  readonly disabled = signal(false);

  private onChange: (value: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: number | null): void {
    this.value.set(this.normalize(value));
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  selectRating(value: number): void {
    if (this.disabled()) return;

    const nextValue = this.normalize(value);
    this.value.set(nextValue);
    this.onChange(nextValue);
    this.onTouched();
  }

  previewRating(value: number): void {
    if (this.disabled()) return;
    this.hovered.set(value);
  }

  clearPreview(): void {
    this.hovered.set(0);
  }

  markTouched(): void {
    this.onTouched();
  }

  isActive(star: number): boolean {
    const preview = this.hovered();
    return star <= (preview || this.value());
  }

  private normalize(value: number | null): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
    if (value < 0) return 0;
    if (value > 5) return 5;
    return Math.trunc(value);
  }
}
