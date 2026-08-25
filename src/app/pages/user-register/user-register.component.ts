import { Component, inject, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Unsubscribable } from 'rxjs';
import { AuthService } from '../../Core/Services/auth.service';
import { LoadingService } from '../../Core/Services/loading.service';
import { StoreInputComponent } from '../../Shared/components/store-input/store-input.component';
import { SubmitButtonComponent } from '../../Shared/components/submit-button/submit-button.component';
import { passwordValidator } from '../../Shared/validators/password.validator';

@Component({
  selector: 'app-user-register',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TranslateModule,
    StoreInputComponent,
    SubmitButtonComponent,
  ],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.scss',
})
export class UserRegisterComponent implements OnDestroy {
  isloading: boolean = false;
  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _AuthService = inject(AuthService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _Router = inject(Router);
  private readonly _LoadingService = inject(LoadingService);
  destoryRegisterData!: Unsubscribable;

  registerForm: FormGroup = this._FormBuilder.group({
    userName: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(30)],
    ],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  get passwordControl() {
    return this.registerForm.get('password')!;
  }

  submit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this._LoadingService.start();
    this.destoryRegisterData = this._AuthService
      .sendRegisterData(this.registerForm.value)
      .subscribe({
        next: (res) => {
          this._LoadingService.stop();
          if (res.IsSuccess) {
            this._ToastrService.success(res.Message, 'Success');
            this._Router.navigate(['/auth/login']);
          } else {
            this._ToastrService.error(res.Message, 'Failed');
          }
        },
        error: (err) => {
          this._LoadingService.stop();
          console.log(err);
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
