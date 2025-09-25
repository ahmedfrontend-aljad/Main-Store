import { Component, inject, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../Core/Services/auth.service';
import { passwordValidator } from '../../Shared/validators/password.validator';
import { Unsubscribable } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-register',
  imports: [RouterLink, ReactiveFormsModule, TranslateModule],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.scss',
})
export class UserRegisterComponent implements OnDestroy {
  isloading: boolean = false;
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _AuthService = inject(AuthService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _Router = inject(Router);
  private readonly _TranslateService = inject(TranslateService);
  destoryRegisterData!: Unsubscribable;

  registerForm: FormGroup = this._FormBuilder.group({
    userName: [
      null,
      [Validators.required, Validators.minLength(2), Validators.maxLength(30)],
    ],
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, passwordValidator()]],
  });

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (control && control.touched && control.errors) {
      if (control.errors['required']) {
        return this._TranslateService.instant('auth.validation.required');
      }
      if (control.errors['minlength']) {
        return this._TranslateService.instant('auth.validation.minLength', {
          min: control.errors['minlength'].requiredLength,
        });
      }
      if (control.errors['maxlength']) {
        return this._TranslateService.instant('auth.validation.maxLength', {
          max: control.errors['maxlength'].requiredLength,
        });
      }
      if (control.errors['email']) {
        return this._TranslateService.instant('auth.validation.email');
      }
      if (control.errors['passwordInvalid']) {
        return this._TranslateService.instant(
          'auth.validation.passwordInvalid'
        );
      }
    }
    return '';
  }

  sendResgisterData(): any {
    this.isloading = true;
    this.destoryRegisterData = this._AuthService
      .sendRegisterData(this.registerForm.value)
      .subscribe({
        next: (res) => {
          this.isloading = false;
          if (res.IsSuccess) {
            this._ToastrService.success(res.Message, 'Success');
            this._Router.navigate(['/auth/login']);
          } else {
            this._ToastrService.error(res.Message, 'Failed');
          }
        },
        error: (err) => {
          this.isloading = false;
          this._ToastrService.error(err.Message, 'Failed');
        },
      });
  }

  ngOnDestroy(): void {
    if (this.destoryRegisterData) {
      this.destoryRegisterData.unsubscribe();
    }
  }
}
