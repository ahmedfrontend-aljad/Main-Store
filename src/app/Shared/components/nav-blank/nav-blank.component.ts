import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MyTranslateService } from '../../../Core/Services/my-translate.service';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../../Core/Services/theme.service';

@Component({
  selector: 'app-nav-blank',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './nav-blank.component.html',
  styleUrls: ['./nav-blank.component.scss'],
})
export class NavBlankComponent implements OnInit {
  isUserLogged = false;
  isGuest = false;

  showDropdown = false;
  showMobileMenu = false;
  showLangDropdown = false;
  isDarkMode = false;
  selectedLanguage = 'English';

  private readonly _PLATFORM_ID = inject(PLATFORM_ID);
  private readonly _Router = inject(Router);
  private readonly _MyTranslateService = inject(MyTranslateService);
  private readonly _themeService = inject(ThemeService);

  constructor() {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const token = localStorage.getItem('userToken');

      if (token) {
        this.isUserLogged = true;
        this.isGuest = false;
      } else {
        this.isUserLogged = false;
        this.isGuest = true;
      }

      const savedLang = localStorage.getItem('lang') || 'en';
      this.selectedLanguage = savedLang === 'ar' ? 'عربي' : 'English';
    }
  }

  ngOnInit(): void {
    this._themeService.loadTheme();
    this.updateThemeState();
  }

  toggleTheme(): void {
    this._themeService.toggleTheme();
    this.updateThemeState();
  }

  private updateThemeState(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.isDarkMode =
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark-theme');
    }
  }

  // Mobile Menu
  toggleMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      document.body.style.overflow = this.showMobileMenu ? 'hidden' : 'auto';
    }
  }

  // User Dropdown
  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  // Guest actions
  guestLogin(): void {
    this._Router.navigate(['/auth/login']);
  }

  guestRegister(): void {
    this._Router.navigate(['/auth/register']);
  }

  // Sign out
  signout(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('guestToken');
      this.isUserLogged = false;
      this.isGuest = true; 
      this._Router.navigate(['/home']);
    }
  }

  // Language
  toggleLangDropdown(): void {
    this.showLangDropdown = !this.showLangDropdown;
  }

  changeLang(lang: string): void {
    this._MyTranslateService.changeLang(lang);
    this.selectedLanguage = lang === 'ar' ? 'عربي' : 'English';
    this.showLangDropdown = false;
  }

  // Close dropdowns on outside click
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const langDropdown = document.querySelector('.dropdown');
    const userDropdown = document.querySelector('.user-dropdown');
    const userToggle = document.querySelector('.user-toggle');

    if (
      this.showLangDropdown &&
      langDropdown &&
      !langDropdown.contains(target)
    ) {
      this.showLangDropdown = false;
    }

    if (
      this.showDropdown &&
      userDropdown &&
      userToggle &&
      !userDropdown.contains(target) &&
      !userToggle.contains(target)
    ) {
      this.showDropdown = false;
    }
  }
}
