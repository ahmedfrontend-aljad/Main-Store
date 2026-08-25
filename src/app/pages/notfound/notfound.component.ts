import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../pages/footer/footer.component';
import { NavAuthComponent } from '../../Shared/components/nav-auth/nav-auth.component';

@Component({
  selector: 'app-notfound',
  imports: [NavAuthComponent, FooterComponent, RouterLink],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.scss',
})
export class NotfoundComponent {}
