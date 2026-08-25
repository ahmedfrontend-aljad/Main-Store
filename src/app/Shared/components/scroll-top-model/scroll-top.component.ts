import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-scroll-top',
  imports: [],
  templateUrl: './scroll-top.component.html',
  styleUrl: './scroll-top.component.scss',
})
export class ScrollTopComponent {
  isVisable: boolean = false;
  private readonly _PLATFORM_ID = inject(PLATFORM_ID);
  private readonly scrollHeight: number = 300;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!isPlatformBrowser(this._PLATFORM_ID)) return;
    this.isVisable = window.pageYOffset > this.scrollHeight;
  }
  scrollToTop() {
    if (isPlatformBrowser(this._PLATFORM_ID)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
