import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

type Tone = 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate';
type FeatureIcon =
  | 'calendar'
  | 'availability'
  | 'package'
  | 'video'
  | 'payment'
  | 'notification'
  | 'clients'
  | 'users';

interface Metric {
  value: string;
  label: string;
}

interface PreviewBooking {
  title: string;
  mode: string;
  time: string;
  status: string;
  statusTone: Extract<Tone, 'blue' | 'emerald' | 'amber'>;
  avatars: string[];
}

interface Feature {
  icon: FeatureIcon;
  title: string;
  description: string;
  tone: Tone;
}

@Component({
  selector: 'app-landing-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  private readonly router = inject(Router);

  readonly searchTerm = signal('');
  readonly selectedModality = signal('');

  readonly metrics: Metric[] = [
    {
      value: '24/7',
      label: 'Reservas disponibles',
    },
    {
      value: '3 modos',
      label: 'Online, presencial o híbrido',
    },
    {
      value: '1 panel',
      label: 'Agenda, clientes y servicios',
    },
  ];

  readonly weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  readonly calendarDays = Array.from({ length: 30 }, (_, index) => index + 1);

  readonly previewBookings: PreviewBooking[] = [
    {
      title: 'Consultoría inicial',
      mode: 'Online · 60 min',
      time: '09:30',
      status: 'Pagada',
      statusTone: 'emerald',
      avatars: ['JG', 'MR'],
    },
    {
      title: 'Sesión de seguimiento',
      mode: 'Híbrida · 45 min',
      time: '11:00',
      status: 'Confirmada',
      statusTone: 'blue',
      avatars: ['LC'],
    },
    {
      title: 'Mentoría profesional',
      mode: 'Online · 30 min',
      time: '15:15',
      status: 'Pendiente',
      statusTone: 'amber',
      avatars: ['AP', 'RS'],
    },
  ];

  readonly features: Feature[] = [
    {
      icon: 'calendar',
      title: 'Agenda avanzada',
      description:
        'Horarios laborales, excepciones, pausas, feriados, buffers y reglas por servicio.',
      tone: 'blue',
    },
    {
      icon: 'availability',
      title: 'Reservas inteligentes',
      description:
        'Slots disponibles en tiempo real con validación de disponibilidad antes de confirmar.',
      tone: 'emerald',
    },
    {
      icon: 'package',
      title: 'Paquetes de sesiones',
      description:
        'Venta y seguimiento de paquetes para procesos de coaching, consultoría o formación.',
      tone: 'amber',
    },
    {
      icon: 'video',
      title: 'Videollamadas',
      description:
        'Sesiones remotas con acceso controlado según reserva, horario y usuario autenticado.',
      tone: 'rose',
    },
    {
      icon: 'payment',
      title: 'Pagos',
      description:
        'Base preparada para registrar pagos, estados, confirmaciones y operaciones comerciales.',
      tone: 'violet',
    },
    {
      icon: 'notification',
      title: 'Notificaciones',
      description:
        'Avisos en vivo para reservas, cambios de estado, recordatorios y cancelaciones.',
      tone: 'slate',
    },
    {
      icon: 'clients',
      title: 'Clientes',
      description:
        'Historial de reservas, paquetes activos y relación organizada entre cliente y profesional.',
      tone: 'blue',
    },
    {
      icon: 'users',
      title: 'Multiusuario',
      description:
        'Cada profesional opera servicios, agenda y configuración de forma aislada en la misma plataforma.',
      tone: 'emerald',
    },
  ];

  submitSearch(): void {
    const search = this.searchTerm().trim();
    const modality = this.mapHomeModalityToApiModality(this.selectedModality());
    const queryParams: Record<string, string | number> = {
      page: 1,
      per_page: 12,
      sort: 'recent',
    };

    if (search) {
      queryParams['search'] = search;
    }

    if (modality) {
      queryParams['modality'] = modality;
    }

    void this.router.navigate(['/services'], { queryParams });
  }

  private mapHomeModalityToApiModality(value: string): 'presencial' | 'remota' | 'hibrida' | null {
    switch (value.trim().toLowerCase()) {
      case 'online':
      case 'remote':
      case 'remota':
        return 'remota';
      case 'presencial':
        return 'presencial';
      case 'hybrid':
      case 'hibrida':
      case 'híbrida':
      case 'híbrido':
        return 'hibrida';
      default:
        return null;
    }
  }
}
