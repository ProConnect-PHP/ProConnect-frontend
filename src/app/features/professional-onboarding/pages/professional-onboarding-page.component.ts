import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthStore } from '../../../core/auth/services/auth.store';
import { hasProfessionalAccess } from '../../../core/auth/utils/auth-capabilities';
import { AppAlertComponent } from '../../../shared/ui/alert/alert.component';
import { AppCardComponent } from '../../../shared/ui/card/card.component';
import { AppPageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';

type OnboardingStep = {
  title: string;
  description: string;
};

@Component({
  selector: 'app-professional-onboarding-page',
  imports: [RouterLink, AppAlertComponent, AppCardComponent, AppPageHeaderComponent],
  templateUrl: './professional-onboarding-page.component.html',
  styleUrl: './professional-onboarding-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalOnboardingPageComponent {
  private readonly authStore = inject(AuthStore);

  readonly currentUser = computed(() => this.authStore.currentUser());
  readonly isProfessional = computed(() => hasProfessionalAccess(this.currentUser()));

  readonly steps: OnboardingStep[] = [
    {
      title: 'Datos profesionales',
      description: 'Presenta tu experiencia, especialidad y propuesta de valor.',
    },
    {
      title: 'Modalidades de atencion',
      description: 'Define si atiendes de forma presencial, remota o hibrida.',
    },
    {
      title: 'Servicios',
      description: 'Publica prestaciones con duracion, precio y una descripcion clara.',
    },
    {
      title: 'Disponibilidad',
      description: 'Configura horarios y excepciones para recibir reservas.',
    },
  ];
}
