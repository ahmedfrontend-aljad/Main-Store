import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-scroll-top',
  standalone: true,
  imports: [],
  templateUrl: './scroll-top.component.html',
  styleUrl: './scroll-top.component.scss',
})
export class ScrollTopComponent {
  isVisable: boolean = false;
  private readonly scrollHeight: number = 300;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isVisable = window.pageYOffset > this.scrollHeight;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
