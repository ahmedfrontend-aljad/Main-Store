import {
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CartService } from '../../../Services/cart.service';
import { CatService } from '../../../Services/cat.service';
import { LoadingService } from '../../../Services/loading.service';
import { MyTranslateService } from '../../../Services/my-translate.service';
import { ThemeService } from '../../../Services/theme.service';
import { HelperService } from '../../../Services/helper.service';

@Component({
  selector: 'app-nav-blank',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule, FormsModule],
  templateUrl: './nav-blank.component.html',
  styleUrls: ['./nav-blank.component.scss'],
})
export class NavBlankComponent implements OnInit, OnDestroy {
  @Input() text: string = '';

  isUserLogged = false;
  isGuest = false;
  userId: any;
  itemsCount: number = 0;
  showDropdown = false;
  showMobileMenu = false;
  showLangDropdown = false;
  isDarkMode = false;
  ClientProfile: any;
  userAddress: string = '';
  selectedLanguage = 'English';
  groups: any[] = [];
  private cartSub!: Subscription;
  private routerSub!: Subscription;
  private langSub!: Subscription;
  private themeSub!: Subscription;

  private readonly _Router = inject(Router);
  private readonly _MyTranslateService = inject(MyTranslateService);
  private readonly _TranslateService = inject(TranslateService);
  private readonly _themeService = inject(ThemeService);
  private readonly _CartService = inject(CartService);
  private readonly _elementRef = inject(ElementRef);
  private readonly _HelperService = inject(HelperService);
  private readonly _CatService = inject(CatService);

  constructor() {
    this.updateLanguageLabel();
  }

  async ngOnInit(): Promise<void> {
    this.checkAuthStatus();

    this.themeSub = this._themeService.isDarkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });

    this.langSub = this._TranslateService.onLangChange.subscribe((event) => {
      this.selectedLanguage = event.lang === 'ar' ? 'عربي' : 'English';
    });

    this.cartSub = this._CartService.cartCount$.subscribe((count) => {
      this.itemsCount = count;
    });

    this.routerSub = this._Router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkAuthStatus();
      }
    });

    if (this.userId && this.isUserLogged) {
      this._CartService.getLoggedCart(this.userId).subscribe();
    }
    this._CatService.getCategories().subscribe((groups) => {
      this.groups = groups;
    });
  }

  private updateLanguageLabel(): void {
    const currentLang =
      this._TranslateService.currentLang ||
      localStorage.getItem('lang') ||
      'en';

    this.selectedLanguage = currentLang === 'ar' ? 'عربي' : 'English';
  }

  checkAuthStatus(): void {
    const userToken = localStorage.getItem('E_K_T');
    this.userId = localStorage.getItem('userId');
    this.ClientProfile =
      this._HelperService.getItemFromLocalStorage('ClientProfile') || '';
    this.userAddress = this.ClientProfile.Address || '';
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

  toggleLangDropdown(): void {
    this.showLangDropdown = !this.showLangDropdown;
  }

  signout(): void {
    localStorage.clear();
    this.isUserLogged = false;
    this.isGuest = true;
    this._CartService.updateCartCount(0);
    this._Router.navigate(['/auth/login']);
  }

  changeLang(lang: string): void {
    this._MyTranslateService.changeLang(lang);
    this.selectedLanguage = lang === 'ar' ? 'عربي' : 'English';
    this.showLangDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!this._elementRef.nativeElement.contains(target)) {
      if (this.showMobileMenu) {
        this.showMobileMenu = false;
        document.body.style.overflow = 'auto';
      }
      this.showLangDropdown = false;
      this.showDropdown = false;
      return;
    }

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

  productsSearch() {
    this._Router.navigate(['/products'], {
      queryParams: { search: this.text },
    });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
    if (this.themeSub) this.themeSub.unsubscribe();
    if (this.cartSub) this.cartSub.unsubscribe();
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.langSub) this.langSub.unsubscribe();
  }
}
