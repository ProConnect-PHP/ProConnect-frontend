import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  host: {
    '(document:keydown.escape)': 'handleEscape()',
  },
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppModalComponent {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly titleId = input('dialog-title');
  readonly descriptionId = input('dialog-description');
  readonly close = output<void>();

  handleEscape(): void {
    if (this.open()) this.close.emit();
  }
}
