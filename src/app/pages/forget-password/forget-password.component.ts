import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { StoreInputComponent } from '../../Shared/components/store-input/store-input.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../../Core/Services/data.service';
import { firstValueFrom, tap } from 'rxjs';
import { StoreUrl } from '../../Shared/constants/api.constant';
import { LoadingService } from '../../Core/Services/loading.service';
import { SubmitButtonComponent } from '../../Shared/components/submit-button/submit-button.component';
import { AuthService } from '../../Core/Services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [
    TranslateModule,
    StoreInputComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SubmitButtonComponent,
  ],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
})
export class ForgetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  isLoading: boolean = false;

  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _DataService = inject(DataService);
  private readonly _LoadingService = inject(LoadingService);
  private readonly _AuthService = inject(AuthService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _Router = inject(Router);

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.resetForm = this._FormBuilder.group({
      userName: ['', Validators.required],
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      branchId: [1],
    });
  }

  sendData(): void {
    this._LoadingService.start();

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this._LoadingService.start();
    this._AuthService.sendRegisterData(this.resetForm.value).subscribe({
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
}
