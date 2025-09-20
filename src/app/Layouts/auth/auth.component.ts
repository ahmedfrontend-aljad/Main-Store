import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavAuthComponent } from "../../Components/nav-auth/nav-auth.component";
import { FooterComponent } from "../../Components/footer/footer.component";

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet, NavAuthComponent, FooterComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {}
