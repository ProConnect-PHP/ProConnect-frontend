import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type RatingStarsSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-rating-stars',
  templateUrl: './rating-stars.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingStarsComponent {
  readonly rating = input(0);
  readonly size = input<RatingStarsSize>('md');
  readonly showValue = input(false);
  readonly readonly = input(true);

  readonly stars = [1, 2, 3, 4, 5] as const;

  readonly normalizedRating = computed(() => {
    const value = this.rating();
    if (!Number.isFinite(value)) return 0;
    if (value < 0) return 0;
    if (value > 5) return 5;
    return value;
  });

  readonly displayValue = computed(() => this.normalizedRating().toFixed(1));
  readonly ariaLabel = computed(() => `${this.displayValue()} de 5 estrellas`);

  fillPercent(star: number): string {
    const fill = Math.max(0, Math.min(1, this.normalizedRating() - star + 1));
    return `${Math.round(fill * 100)}%`;
  }
}
