import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBlankComponent } from '../../Shared/components/nav-blank/nav-blank.component';
import { FooterComponent } from '../../pages/footer/footer.component';

@Component({
  selector: 'app-guest',
  imports: [NavBlankComponent, RouterOutlet, FooterComponent],
  templateUrl: './guest.component.html',
  styleUrl: './guest.component.scss',
})
export class GuestComponent {}
