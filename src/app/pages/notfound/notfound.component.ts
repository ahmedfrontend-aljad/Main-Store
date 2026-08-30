import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FooterComponent } from '../../pages/footer/footer.component';
import { NavAuthComponent } from '../../Shared/components/nav-auth/nav-auth.component';

@Component({
  selector: 'app-notfound',
  imports: [NavAuthComponent, FooterComponent, RouterLink, TranslateModule],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.scss',
})
export class NotfoundComponent {}
