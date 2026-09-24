import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter, Subscription } from 'rxjs';
import { CartService } from '../../../Services/cart.service';
import { MyTranslateService } from '../../../Services/my-translate.service';
import { ThemeService } from '../../../Services/theme.service';

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
  private themeSub!: Subscription;

  private readonly _Router = inject(Router);
  private readonly _MyTranslateService = inject(MyTranslateService);
  private readonly _TranslateService = inject(TranslateService);
  private readonly _themeService = inject(ThemeService);
  private readonly _CartService = inject(CartService);

  constructor() {
    this.updateLanguageLabel();
  }

  ngOnInit(): void {
    this.themeSub = this._themeService.isDarkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });

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
      localStorage.getItem('lang') ||
      'en';

    this.selectedLanguage = currentLang === 'ar' ? 'عربي' : 'English';
  }

  checkAuthStatus(): void {
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

  toggleTheme(): void {
    this._themeService.toggleTheme();
  }

  toggleMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    document.body.style.overflow = this.showMobileMenu ? 'hidden' : 'auto';
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
    localStorage.clear();
    this.isUserLogged = false;
    this.isGuest = true;
    this._CartService.updateCartCount(0);
    this._Router.navigate(['/auth/login']);
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

  ngOnDestroy(): void {
    if (this.themeSub) this.themeSub.unsubscribe();
    if (this.cartSub) this.cartSub.unsubscribe();
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.langSub) this.langSub.unsubscribe();
  }
}
