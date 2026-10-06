import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  setItemToLocalStorage(name: string, value: any): void {
    localStorage.setItem(name, JSON.stringify(value));
  }

  getItemFromLocalStorage(key: string) {
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      return JSON.parse(item);
    } catch (e) {
      return item;
    }
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

  formatDateToISO(date: any): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  }

  removeItemFromLocalStorage(name: string): any {
    localStorage.removeItem(name);
  }
}
