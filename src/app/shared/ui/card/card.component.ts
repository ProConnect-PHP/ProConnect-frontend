import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppCardComponent {
  readonly title = input<string | null>(null);
  readonly description = input<string | null>(null);
  readonly bodyClass = input('p-4 sm:p-5');
}
