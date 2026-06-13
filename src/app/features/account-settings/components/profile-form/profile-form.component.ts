import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-form.component.html'
})
export class ProfileFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);

  @Input() userInitialData: any = null;
  @Output() readonly save = new EventEmitter<any>();

  readonly form = this.fb.group({
    name: ['', [Validators.required]],
    email: [{ value: '', disabled: true }, [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    if (this.userInitialData) {
      this.form.patchValue({
        name: this.userInitialData?.name || this.userInitialData?.user?.name || '',
        email: this.userInitialData?.email || this.userInitialData?.user?.email || ''
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.save.emit(this.form.getRawValue());
    }
  }
}
