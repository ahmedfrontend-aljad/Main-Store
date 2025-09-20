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
import { TranslateModule } from '@ngx-translate/core';

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
  destoryRegisterData!: Unsubscribable;
  registerForm: FormGroup = this._FormBuilder.group({
    userName: [
      null,
      [Validators.required, Validators.minLength(2), Validators.maxLength(30)],
    ],
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, passwordValidator()]],

    /* nameAr: [
      null,
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30),
        Validators.pattern(/^[\u0600-\u06FF\s]+$/),
      ],
    ],
    phoneNumber: [
      null,
      [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)],
    ],*/
  });

  sendResgisterData(): any {
    this.isloading = true;
    this.destoryRegisterData = this._AuthService
      .sendRegisterData(this.registerForm.value)
      .subscribe({
        next: (res) => {
          if (res.IsSuccess) {
            console.log(res);
            this.isloading = false;
            this._ToastrService.success(res.Message, 'Success');
            this._Router.navigate(['/auth/login']);
          } else {
            this._ToastrService.error(res.Message, 'Failed');
            this.isloading = false;
          }
        },
        error: (err) => {
          console.log(err);
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
