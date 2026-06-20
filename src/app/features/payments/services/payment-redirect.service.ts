import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

import { PaymentIntent } from '../data-access/payments.models';

const paymentIntentStorageKey = 'proconnect.paymentIntent';

type StoredPaymentIntent = Pick<PaymentIntent, 'id' | 'payable_type' | 'payable_id'>;

@Injectable({ providedIn: 'root' })
export class PaymentRedirectService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  remember(paymentIntent: PaymentIntent): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const value: StoredPaymentIntent = {
      id: paymentIntent.id,
      payable_type: paymentIntent.payable_type,
      payable_id: paymentIntent.payable_id,
    };

    this.document.defaultView?.sessionStorage.setItem(
      paymentIntentStorageKey,
      JSON.stringify(value),
    );
  }

  getRemembered(): StoredPaymentIntent | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const storedValue =
      this.document.defaultView?.sessionStorage.getItem(paymentIntentStorageKey) ?? null;
    if (!storedValue) return null;

    try {
      const parsed = JSON.parse(storedValue) as Partial<StoredPaymentIntent>;
      if (
        typeof parsed.id !== 'string' ||
        (parsed.payable_type !== 'booking' && parsed.payable_type !== 'package') ||
        typeof parsed.payable_id !== 'string'
      ) {
        return null;
      }

      return {
        id: parsed.id,
        payable_type: parsed.payable_type,
        payable_id: parsed.payable_id,
      };
    } catch {
      return null;
    }
  }

  clear(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.document.defaultView?.sessionStorage.removeItem(paymentIntentStorageKey);
  }

  redirectToCheckout(checkoutUrl: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const openedWindow = this.document.defaultView?.open(
      checkoutUrl,
      '_blank',
      'noopener,noreferrer',
    );

    if (!openedWindow) {
      this.document.location.href = checkoutUrl;
    }
  }
}
