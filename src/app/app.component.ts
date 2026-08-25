import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { ThemeService } from './Core/Services/theme.service';
import { ScrollTopComponent } from './Shared/components/scroll-top-model/scroll-top.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerComponent, ScrollTopComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Ebtikar Store';
  private readonly _ThemeService = inject(ThemeService);

  ngOnInit() {
    this._ThemeService.loadTheme();
  }
}
