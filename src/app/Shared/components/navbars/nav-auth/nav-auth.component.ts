import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MyTranslateService } from '../../../Services/my-translate.service';
import { ThemeService } from '../../../Services/theme.service';

@Component({
  selector: 'app-nav-auth',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './nav-auth.component.html',
  styleUrl: './nav-auth.component.scss',
})
export class NavAuthComponent implements OnInit, OnDestroy {
  selectedLanguage = 'English';
  showLangDropdown = false;
  isDarkMode = false;

  private themeSub!: Subscription;
  private langSub!: Subscription;

  private readonly _MyTranslateService = inject(MyTranslateService);
  private readonly _TranslateService = inject(TranslateService);
  private readonly _themeService = inject(ThemeService);

  constructor() {
    this.updateLanguageLabel();
  }

  ngOnInit(): void {
    this.themeSub = this._themeService.isDarkMode$.subscribe((isDark) => {
      this.isDarkMode = isDark;
    });

    this.langSub = this._TranslateService.onLangChange.subscribe((event) => {
      this.selectedLanguage = event.lang === 'ar' ? 'عربي' : 'English';
    });
  }

  private updateLanguageLabel(): void {
    const currentLang =
      this._TranslateService.currentLang ||
      localStorage.getItem('lang') ||
      'en';

    this.selectedLanguage = currentLang === 'ar' ? 'عربي' : 'English';
  }

  toggleLangDropdown(): void {
    this.showLangDropdown = !this.showLangDropdown;
  }

  changeLang(lang: string): void {
    this._MyTranslateService.changeLang(lang);
    this.selectedLanguage = lang === 'ar' ? 'عربي' : 'English';
    this.showLangDropdown = false;
  }

  toggleTheme(): void {
    this._themeService.toggleTheme();
  }

  ngOnDestroy(): void {
    if (this.themeSub) this.themeSub.unsubscribe();
    if (this.langSub) this.langSub.unsubscribe();
  }
}
