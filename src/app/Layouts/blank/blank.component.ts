import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../pages/footer/footer.component';
import { NavBlankComponent } from '../../Shared/components/nav-blank/nav-blank.component';

@Component({
  selector: 'app-blank',
  imports: [RouterOutlet, NavBlankComponent, FooterComponent],
  templateUrl: './blank.component.html',
  styleUrl: './blank.component.scss',
})
export class BlankComponent {}
