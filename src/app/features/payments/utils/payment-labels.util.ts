import {
  PaymentIntentStatus,
  PaymentProvider,
  PaymentStatus,
} from '../data-access/payments.models';

export function paymentProviderLabel(provider: PaymentProvider): string {
  switch (provider) {
    case 'simulator':
      return 'Simulador';
    case 'mercadopago':
      return 'Mercado Pago';
    case 'paypal':
      return 'PayPal';
  }
}

export function paymentStatusLabel(
  status: PaymentIntentStatus | PaymentStatus | string,
): string {
  switch (status) {
    case 'approved':
    case 'succeeded':
      return 'Pagado';
    case 'pending':
      return 'Pendiente';
    case 'checkout_created':
      return 'Checkout creado';
    case 'processing':
      return 'Procesando';
    case 'rejected':
    case 'failed':
      return 'Fallido';
    case 'cancelled':
      return 'Cancelado';
    case 'expired':
      return 'Expirado';
    case 'refunded':
      return 'Reembolsado';
    case 'partially_refunded':
      return 'Reembolso parcial';
    default:
      return 'Sin estado';
  }
}
