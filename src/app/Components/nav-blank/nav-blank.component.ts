import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MyTranslateService } from '../../Core/Services/my-translate.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-nav-blank',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './nav-blank.component.html',
  styleUrls: ['./nav-blank.component.scss'],
})
export class NavBlankComponent {
  // auth states
  isUserLogged = false;
  isGuest = false;
  isLoggedIn = false;

  showDropdown = false; // user dropdown
  showMobileMenu = false; // side menu
  showLangDropdown = false;

  // language
  selectedLanguage = 'English';

  private readonly _PLATFORM_ID = inject(PLATFORM_ID);
  private readonly _Router = inject(Router);
  private readonly _MyTranslateService = inject(MyTranslateService);

  constructor() {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      this.isUserLogged = !!localStorage.getItem('userToken');
      this.isGuest = !!localStorage.getItem('guestToken');
      const savedLang = localStorage.getItem('lang') || 'en';
      this.selectedLanguage = savedLang === 'ar' ? 'عربي' : 'English';
    }

    this.isLoggedIn = this.isUserLogged || this.isGuest;
  }

  //  Mobile Menu
  toggleMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      document.body.style.overflow = this.showMobileMenu ? 'hidden' : 'auto';
      document.body.style.height = this.showMobileMenu ? '100vh' : 'auto';
    }
  }

  //  User Dropdown (wishlist, orders, signout)
  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  //  Guest actions
  guestLogin(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      localStorage.removeItem('guestToken');
      this.isGuest = false;
      this._Router.navigate(['/auth/login']);
    }
  }

  guestRegister(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      localStorage.removeItem('guestToken');
      this.isGuest = false;
      this._Router.navigate(['/auth/register']);
    }
  }

  // Sign out
  signout(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      if (localStorage.getItem('userToken')) {
        localStorage.removeItem('userToken');
        this.isUserLogged = false;
      }
      if (localStorage.getItem('guestToken')) {
        localStorage.removeItem('guestToken');
        this.isGuest = false;
      }

      this.isLoggedIn = false;
      this._Router.navigate(['/auth/login']);
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

  //  Close dropdowns on outside click
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    const langDropdown = document.querySelector('.lang-dropdown');
    const langToggle = document.querySelector('.lang-toggle');
    const userDropdown = document.querySelector('.user-dropdown');
    const userToggle = document.querySelector('.user-toggle');

    if (
      this.showLangDropdown &&
      langDropdown &&
      langToggle &&
      !langDropdown.contains(target) &&
      !langToggle.contains(target)
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
