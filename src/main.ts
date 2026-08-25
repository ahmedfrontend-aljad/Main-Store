/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

if (BsDropdownModule && !(BsDropdownModule as any).forRoot) {
  (BsDropdownModule as any).forRoot = () => BsDropdownModule;
}
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
