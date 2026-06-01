import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-card',
  imports: [RouterLink],
  templateUrl: './auth-card.component.html',
  styleUrl: './auth-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCardComponent {
  readonly eyebrow = input('Acceso');
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
}
