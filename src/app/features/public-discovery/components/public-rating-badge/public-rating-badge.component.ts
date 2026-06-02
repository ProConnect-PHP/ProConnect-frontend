import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-public-rating-badge',
  template: `
    <span class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
      <span aria-hidden="true">Rating</span>
      <span>{{ label() }}</span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicRatingBadgeComponent {
  readonly rating = input(0);
  readonly reviewsCount = input(0);

  readonly label = computed(() => {
    if (this.reviewsCount() <= 0) return 'Sin reviews';
    return `${this.rating().toFixed(1)} (${this.reviewsCount()})`;
  });
}
