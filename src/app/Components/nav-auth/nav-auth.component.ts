import { Component, inject, PLATFORM_ID } from '@angular/core';
import { MyTranslateService } from '../../Core/Services/my-translate.service';
import { TranslateModule } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-nav-auth',
  imports: [TranslateModule],
  templateUrl: './nav-auth.component.html',
  styleUrl: './nav-auth.component.scss',
})
export class NavAuthComponent {
  selectedLanguage = 'English';
  showLangDropdown = false;
  private readonly _MyTranslateService = inject(MyTranslateService);
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const savedLang = localStorage.getItem('lang') || 'en';
      this.selectedLanguage = savedLang === 'ar' ? 'عربي' : 'English';
    }
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
}
