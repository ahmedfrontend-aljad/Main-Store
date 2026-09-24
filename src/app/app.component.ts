import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { ScrollTopComponent } from './Shared/components/scroll-top-model/scroll-top.component';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from './Shared/Services/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NgxSpinnerComponent,
    ScrollTopComponent,
    TranslateModule,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Ebtikar Store';
  private readonly _ThemeService = inject(ThemeService);

  ngOnInit() {
    this._ThemeService.toggleTheme();
  }
}
