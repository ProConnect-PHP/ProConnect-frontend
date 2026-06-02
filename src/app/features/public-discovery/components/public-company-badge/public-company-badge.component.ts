import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { PublicCompany } from '../../models/public-discovery.models';

@Component({
  selector: 'app-public-company-badge',
  template: `
    @if (company(); as publicCompany) {
      <span class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
        {{ publicCompany.commercial_name }}
      </span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicCompanyBadgeComponent {
  readonly company = input<PublicCompany | null | undefined>(null);
}
