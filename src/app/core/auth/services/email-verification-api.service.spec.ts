import { TestBed } from '@angular/core/testing';

import { EmailVerificationApiService } from './email-verification-api.service';

describe('EmailVerificationApiService', () => {
  let service: EmailVerificationApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailVerificationApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
