import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { finalize, firstValueFrom } from 'rxjs';
import { DataService } from '../../Core/Services/data.service';
import { LoadingService } from '../../Core/Services/loading.service';
import { StoreInputComponent } from '../../Shared/components/store-input/store-input.component';
import { StoreUrl } from '../../Shared/constants/api.constant';
import jwtDecode from 'jwt-decode';

export interface UserProfile {
  UserId: string;
  UserName: string;
  Email: string | null;
  Active: boolean;
  RoleGroupId: number;
  RoleGroupName: string | null;
  Client: any;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    StoreInputComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly _DataService = inject(DataService);
  private readonly _LoadingService = inject(LoadingService);
  private readonly _ToastrService = inject(ToastrService);
  private readonly _fb = inject(FormBuilder);

  profileData!: UserProfile;
  profileForm!: FormGroup;
  isEditMode: boolean = false;

  ngOnInit(): void {
    this.initForm();
    this.getProfileData();
  }

  private initForm(): void {
    this.profileForm = this._fb.group({
      userId: [{ value: '', disabled: true }],
      RoleGroupId: [{ value: '', disabled: true }],
      userName: [
        { value: '', disabled: true },
        [Validators.required, Validators.minLength(3)],
      ],
      email: [{ value: '', disabled: true }, [Validators.email]],
    });
  }

  async getProfileData(): Promise<void> {
    const userToken = localStorage.getItem('userToken')!;
    const decoded: any = jwtDecode(userToken);
    const userId = decoded.Id;
    if (!userId) {
      this._ToastrService.error('لم يتم العثور على معرّف المستخدم');
      return;
    }

    this._LoadingService.start();
    const endpoint = StoreUrl.endsWith('/')
      ? `${StoreUrl}User/GetProfile`
      : `${StoreUrl}/User/GetProfile`;

    try {
      const response: any = await firstValueFrom(
        this._DataService
          .get(`${endpoint}?userId=${userId}`)
          .pipe(finalize(() => this._LoadingService.stop())),
      );

      if (response?.IsSuccess) {
        this.profileData = response.Obj;
        this.populateForm(this.profileData);
      } else {
        this._ToastrService.error(
          response?.Message || 'فشلت عملية جلب البيانات',
        );
      }
    } catch (error) {
      console.error(error);
      this._ToastrService.error('حدث خطأ أثناء تحميل بيانات الملف الشخصي');
    }
  }

  private populateForm(data: UserProfile): void {
    this.profileForm.patchValue({
      userId: data.UserId,
      userName: data.UserName,
      email: data.Email,
      RoleGroupId: data.RoleGroupId,
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode) {
      this.profileForm.get('userName')?.enable();
      this.profileForm.get('email')?.enable();
    } else {
      this.profileForm.disable();
      if (this.profileData) {
        this.populateForm(this.profileData);
      }
    }
  }

  async updateProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this._LoadingService.start();

    const basePath = StoreUrl.endsWith('/') ? StoreUrl : `${StoreUrl}/`;
    const endpoint = `${basePath}User/UpdateClient`;

    const formValues = this.profileForm.getRawValue();
    const clientData = this.profileData?.Client || {};

    const payload = {
      userId: formValues.userId || localStorage.getItem('userId'),
      nameAr: formValues.userName,
      nameEn: formValues.userName,
      email: formValues.email,
      phoneNo: clientData.phoneNo || '',
      whatsapp: clientData.whatsapp || '',
      address: clientData.address || '',
      nationalAddress: clientData.nationalAddress || '',
      street: clientData.street || '',
      district: clientData.district || '',
      governorate: clientData.governorate || '',
      cityName: clientData.cityName || '',
      cityId: clientData.cityId || 0,
      buildingNumber: clientData.buildingNumber || '',
      latitude: clientData.latitude || '',
      longitude: clientData.longitude || '',
    };

    try {
      const response: any = await firstValueFrom(
        this._DataService
          .put(endpoint, payload)
          .pipe(finalize(() => this._LoadingService.stop())),
      );

      if (response?.IsSuccess) {
        this._ToastrService.success('تم تحديث البيانات بنجاح');
        this.isEditMode = false;
        this.profileForm.disable();
        this.getProfileData();
      } else {
        this._ToastrService.error(response?.Message || 'فشلت عملية التحديث');
      }
    } catch (error) {
      console.error(error);
      this._ToastrService.error('حدث خطأ أثناء حفظ التغييرات');
    }
  }
}
