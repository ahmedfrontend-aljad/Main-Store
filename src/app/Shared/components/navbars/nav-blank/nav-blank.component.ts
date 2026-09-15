import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, Subscription } from 'rxjs';
import { CartService } from '../../../../Core/Services/cart.service';
import { MyTranslateService } from '../../../../Core/Services/my-translate.service';
import { ThemeService } from '../../../../Core/Services/theme.service';

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
  userId: any;
  itemsCount: number = 0;
  showDropdown = false;
  showMobileMenu = false;
  showLangDropdown = false;
  isDarkMode = false;
  selectedLanguage = 'English';

  private cartSub!: Subscription;
  private routerSub!: Subscription;
  private langSub!: Subscription;

  private readonly _PLATFORM_ID = inject(PLATFORM_ID);
  private readonly _Router = inject(Router);
  private readonly _MyTranslateService = inject(MyTranslateService);
  private readonly _TranslateService = inject(TranslateService);
  private readonly _themeService = inject(ThemeService);
  private readonly _CartService = inject(CartService);

  constructor() {
    this.updateLanguageLabel();
  }

  ngOnInit(): void {
    this._themeService.loadTheme();
    this.updateThemeState();
    this.checkAuthStatus();
    this.updateLanguageLabel();

    this.langSub = this._TranslateService.onLangChange.subscribe((event) => {
      this.selectedLanguage = event.lang === 'ar' ? 'عربي' : 'English';
    });

    this.routerSub = this._Router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAuthStatus();
      });

    this.cartSub = this._CartService.cartCount$.subscribe((count) => {
      this.itemsCount = count;
    });

    if (this.userId && this.isUserLogged) {
      this._CartService.getLoggedCart(this.userId).subscribe();
    }
  }

  private updateLanguageLabel(): void {
    const currentLang =
      this._TranslateService.currentLang ||
      (isPlatformBrowser(this._PLATFORM_ID)
        ? localStorage.getItem('lang')
        : null) ||
      'en';

    this.selectedLanguage = currentLang === 'ar' ? 'عربي' : 'English';
  }

  checkAuthStatus(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const userToken = localStorage.getItem('userToken');
      this.userId = localStorage.getItem('userId');

      if (userToken) {
        this.isUserLogged = true;
        this.isGuest = false;
      } else {
        this.isUserLogged = false;
        this.isGuest = true;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.cartSub) this.cartSub.unsubscribe();
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.langSub) this.langSub.unsubscribe();
  }

  toggleTheme(): void {
    this._themeService.toggleTheme();
    this.updateThemeState();
  }

  private updateThemeState(): void {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const html = document.documentElement;
      const body = document.body;

      const hasDarkClass =
        html.classList.contains('dark') ||
        body.classList.contains('dark') ||
        body.classList.contains('dark-theme');
      const hasDarkAttr =
        html.getAttribute('data-bs-theme') === 'dark' ||
        html.getAttribute('data-theme') === 'dark';
      const savedTheme = localStorage.getItem('theme');

      this.isDarkMode = hasDarkClass || hasDarkAttr || savedTheme === 'dark';
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
      localStorage.clear();
      this.isUserLogged = false;
      this.isGuest = true;
      this._CartService.updateCartCount(0);
      this._Router.navigate(['/auth/login']);
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
