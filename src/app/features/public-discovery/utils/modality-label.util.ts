import { PublicServiceModality } from '../models/public-discovery.models';

export function modalityLabel(modality: PublicServiceModality): string {
  const labels: Record<PublicServiceModality, string> = {
    presencial: 'Presencial',
    remota: 'Remota',
    hibrida: 'Hibrida',
  };

  return labels[modality];
}
