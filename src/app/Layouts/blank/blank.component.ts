import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBlankComponent } from '../../Shared/components/nav-blank/nav-blank.component';
import { FooterComponent } from '../../pages/footer/footer.component';

@Component({
  selector: 'app-blank',
  imports: [RouterOutlet, NavBlankComponent, FooterComponent],
  templateUrl: './blank.component.html',
  styleUrl: './blank.component.scss',
})
export class BlankComponent {}
