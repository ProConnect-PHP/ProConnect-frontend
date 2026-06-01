import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  readonly previewBookings = [
    { title: 'Sesion de liderazgo', mode: 'Videollamada', time: '09:00' },
    { title: 'Diagnostico inicial', mode: 'Presencial', time: '10:15' },
    { title: 'Mentoria premium', mode: 'Hibrida', time: '12:00' },
  ];

  readonly calendarDays = Array.from({ length: 28 }, (_value, index) => index + 1);

  readonly features = [
    {
      title: 'Agenda inteligente',
      short: 'AI',
      tone: 'blue',
      description: 'Reglas semanales, buffers y duraciones para calcular disponibilidad real.',
    },
    {
      title: 'Videollamadas',
      short: 'VC',
      tone: 'emerald',
      description: 'Servicios remotos con enlaces listos para compartir con clientes.',
    },
    {
      title: 'Pagos',
      short: '$',
      tone: 'amber',
      description: 'Campo de precio preparado para evolucionar a checkout en futuras fases.',
    },
    {
      title: 'Disponibilidad',
      short: '24',
      tone: 'rose',
      description: 'Excepciones por feriados, licencias u horarios alternativos.',
    },
    {
      title: 'Servicios',
      short: 'SR',
      tone: 'slate',
      description: 'CRUD completo para publicar, editar o pausar servicios profesionales.',
    },
  ];
}
