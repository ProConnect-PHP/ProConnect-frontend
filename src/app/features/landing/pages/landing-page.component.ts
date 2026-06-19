import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type Tone = 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate';

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
  short: string;
  title: string;
  description: string;
  tone: Tone;
}

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
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
      short: 'AG',
      title: 'Agenda avanzada',
      description:
        'Horarios laborales, excepciones, pausas, feriados, buffers y reglas por servicio.',
      tone: 'blue',
    },
    {
      short: 'RS',
      title: 'Reservas inteligentes',
      description:
        'Slots disponibles en tiempo real con validación de disponibilidad antes de confirmar.',
      tone: 'emerald',
    },
    {
      short: 'PK',
      title: 'Paquetes de sesiones',
      description:
        'Venta y seguimiento de paquetes para procesos de coaching, consultoría o formación.',
      tone: 'amber',
    },
    {
      short: 'VC',
      title: 'Videollamadas',
      description:
        'Sesiones remotas con acceso controlado según reserva, horario y usuario autenticado.',
      tone: 'rose',
    },
    {
      short: 'PG',
      title: 'Pagos',
      description:
        'Base preparada para registrar pagos, estados, confirmaciones y operaciones comerciales.',
      tone: 'violet',
    },
    {
      short: 'NT',
      title: 'Notificaciones',
      description:
        'Avisos en vivo para reservas, cambios de estado, recordatorios y cancelaciones.',
      tone: 'slate',
    },
    {
      short: 'CL',
      title: 'Clientes',
      description:
        'Historial de reservas, paquetes activos y relación organizada entre cliente y profesional.',
      tone: 'blue',
    },
    {
      short: 'MX',
      title: 'Multiusuario',
      description:
        'Cada profesional opera servicios, agenda y configuración de forma aislada en la misma plataforma.',
      tone: 'emerald',
    },
  ];
}
