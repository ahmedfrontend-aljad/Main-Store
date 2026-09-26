import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class MyTranslateService {
  private readonly _TranslateService = inject(TranslateService);

  constructor() {
    const savedLang = localStorage.getItem('lang') ?? 'ar';

    this._TranslateService.setFallbackLang('ar');
    this._TranslateService.use(savedLang);

    this.changeDirection(savedLang);
  }

  changeDirection(lang: string): void {
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.lang = lang;
  }

  changeLang(lang: string): void {
    const currentLang = localStorage.getItem('lang') ?? 'ar';

    if (currentLang === lang) return;

    localStorage.setItem('lang', lang);
    this._TranslateService.use(lang);
    this.changeDirection(lang);

  }
}
