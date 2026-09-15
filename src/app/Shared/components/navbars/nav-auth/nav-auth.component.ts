import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MyTranslateService } from '../../../../Core/Services/my-translate.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../../../Core/Services/theme.service';

@Component({
  selector: 'app-nav-auth',
  imports: [TranslateModule],
  templateUrl: './nav-auth.component.html',
  styleUrl: './nav-auth.component.scss',
})
export class NavAuthComponent implements OnInit {
  selectedLanguage = 'English';
  showLangDropdown = false;
  private readonly _MyTranslateService = inject(MyTranslateService);
  private readonly _TranslateService = inject(TranslateService);
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);
  isDarkMode = false;

  constructor(private _themeService: ThemeService) {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const savedLang = localStorage.getItem('lang') || 'en';
      this.selectedLanguage = savedLang === 'ar' ? 'عربي' : 'English';
    }
  }

  ngOnInit(): void {
    this.updateLanguageLabel();
    this._themeService.loadTheme();
    this.updateThemeState();
    console.log('Nav Auth');
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

  toggleLangDropdown() {
    this.showLangDropdown = !this.showLangDropdown;
  }

  changeLang(lang: string): void {
    this._MyTranslateService.changeLang(lang);
    if (lang === 'en') {
      this.selectedLanguage = 'English';
    } else if (lang === 'ar') {
      this.selectedLanguage = 'عربي';
    }

    this.showLangDropdown = false;
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
}
