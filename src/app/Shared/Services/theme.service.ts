import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private initialTheme = localStorage.getItem('theme') === 'dark';
  private isDarkModeSubject = new BehaviorSubject<boolean>(this.initialTheme);
  isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    this.applyTheme(this.initialTheme);
  }

  toggleTheme(): void {
    const newStatus = !this.isDarkModeSubject.value;
    this.applyTheme(newStatus);
  }

  private applyTheme(isDark: boolean): void {
    const themeName = isDark ? 'dark' : 'light';
    const html = document.documentElement;

    html.setAttribute('data-theme', themeName);
    html.setAttribute('data-bs-theme', themeName);

    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    localStorage.setItem('theme', themeName);
    this.isDarkModeSubject.next(isDark);
  }
}
