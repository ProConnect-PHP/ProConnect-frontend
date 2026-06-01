import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { ApiClientError } from '../../../core/http/models/api-error.model';
import { AppAlertComponent } from '../../../shared/ui/alert/alert.component';
import { AppBadgeComponent } from '../../../shared/ui/badge/badge.component';
import { AppButtonComponent } from '../../../shared/ui/button/button.component';
import { AppCardComponent } from '../../../shared/ui/card/card.component';
import { AppEmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { AppFormFieldComponent } from '../../../shared/ui/form-field/form-field.component';
import { AppLoadingSpinnerComponent } from '../../../shared/ui/loading-spinner/loading-spinner.component';
import { AppPageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { AppTextareaComponent } from '../../../shared/ui/textarea/textarea.component';
import { ProfessionalProfileApi } from '../data-access/professional-profile.api';
import { ProfessionalProfile } from '../models/professional-profile.models';

@Component({
  selector: 'app-professional-profile-page',
  imports: [
    ReactiveFormsModule,
    AppAlertComponent,
    AppBadgeComponent,
    AppButtonComponent,
    AppCardComponent,
    AppEmptyStateComponent,
    AppFormFieldComponent,
    AppLoadingSpinnerComponent,
    AppPageHeaderComponent,
    AppTextareaComponent,
  ],
  templateUrl: './professional-profile-page.component.html',
  styleUrl: './professional-profile-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalProfilePageComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly profileApi = inject(ProfessionalProfileApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly profile = signal<ProfessionalProfile | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    bio: [''],
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  save(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isSaving.set(true);

    const payload = {
      bio: this.form.getRawValue().bio.trim() || null,
    };

    const request = this.profile()
      ? this.profileApi.update(payload)
      : this.profileApi.create(payload);

    request
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.profile.set(response.professional_profile);
          this.form.patchValue({ bio: response.professional_profile.bio ?? '' });
          this.successMessage.set('Perfil guardado correctamente.');
        },
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  private loadProfile(): void {
    this.profileApi
      .show()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.profile.set(response.professional_profile);
          this.form.patchValue({ bio: response.professional_profile.bio ?? '' });
        },
        error: (error: unknown) => {
          if (error instanceof ApiClientError && error.status === 404) {
            this.profile.set(null);
            return;
          }

          this.errorMessage.set(this.errorFrom(error));
        },
      });
  }

  private errorFrom(error: unknown): string {
    if (error instanceof ApiClientError) return error.message;
    return 'No pudimos guardar el perfil. Intenta nuevamente.';
  }
}
