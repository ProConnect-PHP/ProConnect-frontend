import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppAlertComponent } from '../../../../../shared/ui/alert/alert.component';
import { AppModalComponent } from '../../../../../shared/ui/modal/modal.component';
import { CancellationPolicyCardComponent } from '../../components/cancellation-policy-card/cancellation-policy-card.component';
import { ReminderRuleFormModalComponent } from '../../components/reminder-rule-form-modal/reminder-rule-form-modal.component';
import { ReminderRulesCardComponent } from '../../components/reminder-rules-card/reminder-rules-card.component';
import { ReschedulingPolicyCardComponent } from '../../components/rescheduling-policy-card/rescheduling-policy-card.component';
import {
  mapBookingPolicyToUpdatePayload,
  mapReminderRuleToPayload,
} from '../../data-access/booking-policy.mapper';
import { BookingPolicyStore } from '../../data-access/booking-policy.store';
import {
  BookingPolicyGeneralSettings,
  ProfessionalBookingPolicy,
  ProfessionalBookingReminderRule,
  ReminderRuleDraft,
} from '../../models/booking-policy.model';
import {
  BookingPolicyFieldErrors,
  getApiFieldErrors,
} from '../../utils/booking-policy-error.util';

@Component({
  selector: 'app-booking-policy-settings-page',
  imports: [
    ReactiveFormsModule,
    AppAlertComponent,
    AppModalComponent,
    CancellationPolicyCardComponent,
    ReminderRuleFormModalComponent,
    ReminderRulesCardComponent,
    ReschedulingPolicyCardComponent,
  ],
  providers: [BookingPolicyStore],
  templateUrl: './booking-policy-settings-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingPolicySettingsPageComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly store = inject(BookingPolicyStore);
  readonly reminderModalOpen = signal(false);
  readonly editingRule = signal<ProfessionalBookingReminderRule | null>(null);
  readonly rulePendingDeletion = signal<ProfessionalBookingReminderRule | null>(null);
  readonly policyFieldErrors = signal<BookingPolicyFieldErrors>({});

  readonly form = this.fb.group({
    allowClientCancellation: [true],
    cancellationCutoffMinutes: [
      120,
      [Validators.required, Validators.min(0), Validators.max(10080)],
    ],
    allowClientRescheduling: [true],
    reschedulingCutoffMinutes: [
      120,
      [Validators.required, Validators.min(0), Validators.max(10080)],
    ],
    lateToleranceMinutes: [
      10,
      [Validators.required, Validators.min(0), Validators.max(120)],
    ],
    remindersEnabled: [true],
    cancellationPolicyText: ['', [Validators.maxLength(2000)]],
    reschedulingPolicyText: ['', [Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    this.form.controls.allowClientCancellation.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((enabled) => this.syncCancellationControls(enabled));
    this.form.controls.allowClientRescheduling.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((enabled) => this.syncReschedulingControls(enabled));

    this.loadPolicy();
  }

  loadPolicy(): void {
    this.store
      .loadPolicy()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (policy) => this.hydrateForm(policy),
        error: () => undefined,
      });
  }

  savePolicy(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.store.saving()) return;

    this.policyFieldErrors.set({});
    const value = this.form.getRawValue();
    const settings: BookingPolicyGeneralSettings = {
      allowClientCancellation: value.allowClientCancellation,
      cancellationCutoffMinutes: value.cancellationCutoffMinutes,
      allowClientRescheduling: value.allowClientRescheduling,
      reschedulingCutoffMinutes: value.reschedulingCutoffMinutes,
      lateToleranceMinutes: value.lateToleranceMinutes,
      remindersEnabled: value.remindersEnabled,
      cancellationPolicyText: value.cancellationPolicyText,
      reschedulingPolicyText: value.reschedulingPolicyText,
    };

    this.store
      .savePolicy(mapBookingPolicyToUpdatePayload(settings))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (policy) => this.hydrateForm(policy),
        error: (error: unknown) => this.policyFieldErrors.set(getApiFieldErrors(error)),
      });
  }

  openCreateRule(): void {
    if (this.store.ruleSaving()) return;
    this.store.clearRuleErrors();
    this.editingRule.set(null);
    this.reminderModalOpen.set(true);
  }

  openEditRule(rule: ProfessionalBookingReminderRule): void {
    if (this.store.ruleSaving()) return;
    this.store.clearRuleErrors();
    this.editingRule.set(rule);
    this.reminderModalOpen.set(true);
  }

  closeRuleModal(): void {
    if (this.store.ruleSaving()) return;
    this.reminderModalOpen.set(false);
    this.editingRule.set(null);
    this.store.clearRuleErrors();
  }

  saveReminderRule(draft: ReminderRuleDraft): void {
    if (this.store.ruleSaving()) return;

    const editingRule = this.editingRule();
    const payload = mapReminderRuleToPayload(draft);
    const request = editingRule
      ? this.store.updateReminderRule(editingRule.id, payload)
      : this.store.createReminderRule(payload);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.reminderModalOpen.set(false);
        this.editingRule.set(null);
      },
      error: () => undefined,
    });
  }

  toggleReminderRule(rule: ProfessionalBookingReminderRule): void {
    if (this.store.ruleSaving()) return;

    this.store
      .toggleReminderRule(
        rule.id,
        !rule.isActive,
        mapReminderRuleToPayload({
          ...rule,
          isActive: !rule.isActive,
        }),
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ error: () => undefined });
  }

  requestRuleDeletion(rule: ProfessionalBookingReminderRule): void {
    if (this.store.ruleSaving()) return;
    this.store.clearRuleErrors();
    this.rulePendingDeletion.set(rule);
  }

  closeDeleteConfirmation(): void {
    if (!this.store.ruleSaving()) this.rulePendingDeletion.set(null);
  }

  confirmRuleDeletion(): void {
    const rule = this.rulePendingDeletion();
    if (!rule || this.store.ruleSaving()) return;

    this.store
      .deleteReminderRule(rule.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.rulePendingDeletion.set(null),
        error: () => undefined,
      });
  }

  private hydrateForm(policy: ProfessionalBookingPolicy): void {
    this.form.reset(
      {
        allowClientCancellation: policy.allowClientCancellation,
        cancellationCutoffMinutes: policy.cancellationCutoffMinutes,
        allowClientRescheduling: policy.allowClientRescheduling,
        reschedulingCutoffMinutes: policy.reschedulingCutoffMinutes,
        lateToleranceMinutes: policy.lateToleranceMinutes,
        remindersEnabled: policy.remindersEnabled,
        cancellationPolicyText: policy.cancellationPolicyText ?? '',
        reschedulingPolicyText: policy.reschedulingPolicyText ?? '',
      },
      { emitEvent: false },
    );
    this.syncCancellationControls(policy.allowClientCancellation);
    this.syncReschedulingControls(policy.allowClientRescheduling);
    this.form.markAsPristine();
    this.policyFieldErrors.set({});
  }

  private syncCancellationControls(enabled: boolean): void {
    this.setControlsEnabled(
      [
        this.form.controls.cancellationCutoffMinutes,
        this.form.controls.cancellationPolicyText,
      ],
      enabled,
    );
  }

  private syncReschedulingControls(enabled: boolean): void {
    this.setControlsEnabled(
      [
        this.form.controls.reschedulingCutoffMinutes,
        this.form.controls.reschedulingPolicyText,
      ],
      enabled,
    );
  }

  private setControlsEnabled(
    controls: Array<
      | typeof this.form.controls.cancellationCutoffMinutes
      | typeof this.form.controls.cancellationPolicyText
    >,
    enabled: boolean,
  ): void {
    for (const control of controls) {
      if (enabled) {
        control.enable({ emitEvent: false });
      } else {
        control.disable({ emitEvent: false });
      }
    }
  }
}
