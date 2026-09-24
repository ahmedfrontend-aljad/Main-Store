import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import {
  TranslateService as NgxTranslateService,
  TranslateService,
} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class MyTranslateService {
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);
  private readonly _TranslateService = inject(TranslateService);

  constructor() {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      const savedLang = localStorage.getItem('lang') ?? 'ar'!;
      this._TranslateService.setFallbackLang('ar');

      this._TranslateService.use(savedLang);

      this.changeDirection();
    }
  }

  changeDirection() {
    const savedLang = localStorage.getItem('lang') ?? 'ar';
    document.documentElement.dir = savedLang === 'en' ? 'ltr' : 'rtl';
  }

  changeLang(lang: string): void {
    localStorage.setItem('lang', lang);
    this._TranslateService.use(lang);
    this.changeDirection();
  }
}
