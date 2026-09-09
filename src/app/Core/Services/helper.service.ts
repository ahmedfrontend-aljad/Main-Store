import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  getItemFromLocalStorage(name: string): any {
    return JSON.parse(localStorage.getItem(name)!);
  }

  cleanNullValues(formValue: any): any {
    Object.keys(formValue).forEach((key) => {
      let value = formValue[key];
      if (Array.isArray(value)) {
        value.forEach((obj: any) => this.cleanNullValues(obj));
      }
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        this.cleanNullValues(value);
      }
      if (value == null) {
        delete formValue[key];
      }
    });

    return formValue;
  }

  formatDateDisplay(date: string | null | undefined): string {
    if (!date || typeof date !== 'string') return '';

    return date.split('T')[0];
  }

  formatAmount(value: number | null | undefined): string {
    return (value ?? 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
