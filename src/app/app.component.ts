import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { ScrollTopComponent } from './Shared/components/scroll-top/scroll-top.component';
import { ThemeService } from './Core/Services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerComponent, ScrollTopComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'GadcoEcommerce';
  private readonly _ThemeService = inject(ThemeService);

  ngOnInit() {
    this._ThemeService.loadTheme();
  }
}
