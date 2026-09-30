import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../core/currency.service';

@Pipe({ name: 'money', standalone: true, pure: false })
export class MoneyPipe implements PipeTransform {
  private currency = inject(CurrencyService);
  private formatter = new CurrencyPipe('en-US');

  transform(value: number | null | undefined): string {
    const amount = this.currency.convertFromPln(Number(value ?? 0));
    const code = this.currency.currency();
    return this.formatter.transform(amount, code, 'symbol-narrow', '1.2-2') ?? '';
  }
}
