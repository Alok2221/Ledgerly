import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type DisplayCurrency = 'PLN' | 'USD' | 'EUR';

interface RateCache {
  fetchedAt: number;
  rates: Record<'USD' | 'EUR', number>;
}

const PREF_KEY = 'ledgerly-currency';
const RATES_KEY = 'ledgerly-fx-rates';
const CACHE_MS = 6 * 60 * 60 * 1000;
const FALLBACK: RateCache = {
  fetchedAt: 0,
  rates: { USD: 0.25, EUR: 0.23 },
};

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private http = inject(HttpClient);

  readonly currency = signal<DisplayCurrency>(this.readPref());
  readonly rates = signal<RateCache>(this.readCache() ?? FALLBACK);
  readonly rateLabel = computed(() => {
    const code = this.currency();
    if (code === 'PLN') return '';
    return `Shown in ${code} · ECB rates`;
  });

  constructor() {
    this.refreshRates();
  }

  setCurrency(code: DisplayCurrency): void {
    this.currency.set(code);
    try {
      localStorage.setItem(PREF_KEY, code);
    } catch {
      /* ignore */
    }
  }

  convertFromPln(amountPln: number): number {
    const code = this.currency();
    if (code === 'PLN') return amountPln;
    const rate = this.rates().rates[code];
    return amountPln * rate;
  }

  refreshRates(): void {
    const cached = this.readCache();
    if (cached && Date.now() - cached.fetchedAt < CACHE_MS) {
      this.rates.set(cached);
      return;
    }
    this.http
      .get<{ rates: { USD?: number; EUR?: number } }>(`${environment.apiUrl}/api/rates`)
      .pipe(
        tap((res) => {
          const next: RateCache = {
            fetchedAt: Date.now(),
            rates: {
              USD: res.rates.USD ?? FALLBACK.rates.USD,
              EUR: res.rates.EUR ?? FALLBACK.rates.EUR,
            },
          };
          this.rates.set(next);
          try {
            localStorage.setItem(RATES_KEY, JSON.stringify(next));
          } catch {
            /* ignore */
          }
        }),
        catchError(() => {
          if (cached) this.rates.set(cached);
          return of(null);
        }),
      )
      .subscribe();
  }

  private readPref(): DisplayCurrency {
    try {
      const value = localStorage.getItem(PREF_KEY);
      if (value === 'PLN' || value === 'USD' || value === 'EUR') return value;
    } catch {
      /* ignore */
    }
    return 'PLN';
  }

  private readCache(): RateCache | null {
    try {
      const raw = localStorage.getItem(RATES_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as RateCache;
      if (parsed?.rates?.USD && parsed?.rates?.EUR) return parsed;
    } catch {
      /* ignore */
    }
    return null;
  }
}
