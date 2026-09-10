import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription, Unsubscribable } from 'rxjs';
import { AuthService } from '../../../Core/Services/auth.service';
import { StoreInputComponent } from '../../../Shared/components/store-input/store-input.component';
import { SubmitButtonComponent } from '../../../Shared/components/submit-button/submit-button.component';
import { LoadingService } from '../../../Core/Services/loading.service';
import { CommonModule } from '@angular/common';
import { GuestAuthService } from '../../../Core/Services/guest-auth.service';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TranslateModule,
    StoreInputComponent,
    SubmitButtonComponent,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  isloading: boolean = false;
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _AuthService = inject(AuthService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _Router = inject(Router);
  private readonly _TranslateService = inject(TranslateService);
  private readonly _LoadingService = inject(LoadingService);
  private readonly _GuestAuthService = inject(GuestAuthService);

  destoryUserData!: Unsubscribable;
  destoryGustData!: Unsubscribable;

  loginForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.loginForm = this._FormBuilder.group({
      companyId: [1],
      branchId: [1],
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [true],
      getRoles: [true],
    });
  }

  sendLoginData(): void {
    this._LoadingService.start();

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this._LoadingService.stop();
      this._ToastrService.error(
        this._TranslateService.instant('auth.validation.invalidForm'),
      );
      return;
    }

    this.isloading = true;

    const payload = {
      ...this.loginForm.value,
      getRoles: true,
    };

    this.destoryUserData = this._AuthService.sendLoginData(payload).subscribe({
      next: (res) => {
        this._LoadingService.stop();
        this.isloading = false;

        if (res?.IsSuccess && res?.Obj?.AccessToken) {
          this._ToastrService.success(
            this._TranslateService.instant('auth.loginSuccess'),
          );
          localStorage.setItem('userToken', res.Obj.AccessToken);
          const decoded: any = jwtDecode(res.Obj.AccessToken)!;
          const userId = decoded.Id;
          localStorage.setItem('userId', userId);
          this._Router.navigate(['/home']);
        } else {
          this._ToastrService.error(
            res?.Message || this._TranslateService.instant('auth.loginError'),
          );
        }
      },
      error: (err) => {
        this._LoadingService.stop();
        this.isloading = false;
        console.error('HTTP Error:', err);
        this._ToastrService.error(
          this._TranslateService.instant('auth.loginError'),
        );
      },
    });
  }

  guestLogin(): void {
    this._LoadingService.start();
    this._GuestAuthService.ensureGuestToken();
    this._LoadingService.stop();
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
