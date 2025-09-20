import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../Components/footer/footer.component';
import { NavBlankComponent } from '../../Components/nav-blank/nav-blank.component';

@Component({
  selector: 'app-guest',
  imports: [NavBlankComponent, RouterOutlet, FooterComponent],
  templateUrl: './guest.component.html',
  styleUrl: './guest.component.scss',
})
export class GuestComponent  {

}
