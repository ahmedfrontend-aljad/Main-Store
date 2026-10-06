import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'theme';
  private readonly isDarkModeSubject = new BehaviorSubject<boolean>(
    this.readSaved(),
  );
  isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    this.applyTheme(this.isDarkModeSubject.value);
  }

  toggleTheme(): void {
    this.applyTheme(!this.isDarkModeSubject.value);
  }

  private readSaved(): boolean {
    try {
      return localStorage.getItem(this.KEY) === 'dark';
    } catch {
      return false;
    }
  }

  private applyTheme(isDark: boolean): void {
    const themeName = isDark ? 'dark' : 'light';
    const html = document.documentElement;

    html.setAttribute('data-theme', themeName);
    html.setAttribute('data-bs-theme', themeName);
    html.classList.toggle('dark', isDark);

    try {
      localStorage.setItem(this.KEY, themeName);
    } catch {}

    this.isDarkModeSubject.next(isDark);
  }
}
