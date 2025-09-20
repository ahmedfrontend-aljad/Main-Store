import { NgClass } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, Unsubscribable } from 'rxjs';
import { AuthService } from '../../Core/Services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, NgClass , TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy {
  isloading: boolean = false;
  destroyLoginData!: Subscription;
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _AuthService = inject(AuthService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _Router = inject(Router);
  destoryUserData!: Unsubscribable;
  destoryGustData!: Unsubscribable;

  loginForm: FormGroup = this._FormBuilder.group({
    companyId: [1],
    branchId: [1],
    userName: [null, [Validators.required, Validators.minLength(3)]],
    password: [null, [Validators.required, Validators.pattern(/^\w{6,}$/)]],
    rememberMe: [true],
  });

  guestData: object = {
    companyId: 1,
    branchId: 1,
    userName: 'Admin',
    password: 'Admin123',
    rememberMe: false,
  };

  sendLodinData(): any {
    this.isloading = true;

    this.destoryUserData = this._AuthService
      .sendLoginData(this.loginForm.value)
      .subscribe({
        next: (res) => {
          console.log(res);
          this._ToastrService.success(res.message, 'Login Sucessful');
          this.isloading = false;
          localStorage.setItem('userToken', res.Obj.AccessToken);
          this._Router.navigate(['/home']);
        },
        error: (err) => {
          console.log(err);
          this._ToastrService.error('Username Or Password Is Incorrect');
          this.isloading = false;
        },
      });
  }
  guestLogin(): any {
    this.destoryGustData = this._AuthService
      .sendLoginData(this.guestData)
      .subscribe({
        next: (res) => {
          console.log(res);
          localStorage.setItem('guestToken', res.Obj.AccessToken);
          this._Router.navigate(['/guest/home']);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.destoryUserData) {
      this.destoryUserData.unsubscribe();
    }
    if (this.destoryGustData) {
      this.destoryGustData.unsubscribe();
    }
  }
}
