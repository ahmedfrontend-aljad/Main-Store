import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavAuthComponent } from '../../Shared/components/nav-auth/nav-auth.component';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet, NavAuthComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {}
