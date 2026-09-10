import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import jwtDecode from 'jwt-decode';
import { Subscription } from 'rxjs';
import { CartService } from '../../../Core/Services/cart.service';
import { MyTranslateService } from '../../../Core/Services/my-translate.service';
import { ThemeService } from '../../../Core/Services/theme.service';

@Component({
  selector: 'app-nav-blank',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './nav-blank.component.html',
  styleUrls: ['./nav-blank.component.scss'],
})
export class NavBlankComponent implements OnInit, OnDestroy {
  isUserLogged = false;
  isGuest = false;
  decoded: any;
  itemsCount: number = 0;
  showDropdown = false;
  showMobileMenu = false;
  showLangDropdown = false;
  isDarkMode = false;
  selectedLanguage = 'English';

  private cartSub!: Subscription;

  private readonly _PLATFORM_ID = inject(PLATFORM_ID);
  private readonly _Router = inject(Router);
  private readonly _MyTranslateService = inject(MyTranslateService);
  private readonly _themeService = inject(ThemeService);
  private readonly _CartService = inject(CartService);

  constructor() {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const token = localStorage.getItem('userToken');

      if (token) {
        this.isUserLogged = true;
        this.isGuest = false;
        try {
          this.decoded = jwtDecode(token);
        } catch (e) {
          console.error('Invalid token:', e);
        }
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

    this.cartSub = this._CartService.cartCount$.subscribe((count) => {
      this.itemsCount = count;
    });

    if (this.decoded?.Id) {
      this._CartService.getLoggedCart(this.decoded.Id).subscribe();
    }
  }

  ngOnDestroy(): void {
    if (this.cartSub) {
      this.cartSub.unsubscribe();
    }
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

  toggleMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      document.body.style.overflow = this.showMobileMenu ? 'hidden' : 'auto';
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  guestLogin(): void {
    this._Router.navigate(['/auth/login']);
  }

  guestRegister(): void {
    this._Router.navigate(['/auth/register']);
  }

  signout(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('cartCount');
      this.isUserLogged = false;
      this.isGuest = true;
      this._CartService.updateCartCount(0);
      this._Router.navigate(['/home']);
    }
  }

  toggleLangDropdown(): void {
    this.showLangDropdown = !this.showLangDropdown;
  }

  changeLang(lang: string): void {
    this._MyTranslateService.changeLang(lang);
    this.selectedLanguage = lang === 'ar' ? 'عربي' : 'English';
    this.showLangDropdown = false;
  }

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
