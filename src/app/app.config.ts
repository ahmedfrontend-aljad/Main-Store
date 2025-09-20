import {
  HttpClient,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  TRANSLATE_HTTP_LOADER_CONFIG,
  TranslateHttpLoader,
  TranslateHttpLoaderConfig,
} from '@ngx-translate/http-loader';
import { NgxSpinnerModule } from 'ngx-spinner';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { spinnerInterceptor } from './Core/Interceptors/spinner.interceptor';

// Factory function
export function translateLoaderFactory(): TranslateLoader {
  const http = inject(HttpClient);
  inject(TRANSLATE_HTTP_LOADER_CONFIG);
  return new TranslateHttpLoader();
}

const translateHttpLoaderConfigValue: TranslateHttpLoaderConfig = {
  prefix: './assets/i18n/',
  suffix: '.json',
  enforceLoading: false,
  useHttpBackend: false,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([spinnerInterceptor])),
    provideAnimations(),
    provideToastr(),
    importProvidersFrom(
      NgxSpinnerModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: translateLoaderFactory,
          deps: [],
        },
        fallbackLang: 'ar',
      })
    ),

    {
      provide: TRANSLATE_HTTP_LOADER_CONFIG,
      useValue: translateHttpLoaderConfigValue,
    },
  ],
};
