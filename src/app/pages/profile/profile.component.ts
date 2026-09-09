import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { finalize, firstValueFrom } from 'rxjs';
import { DataService } from '../../Core/Services/data.service';
import { LoadingService } from '../../Core/Services/loading.service';
import { StoreInputComponent } from '../../Shared/components/store-input/store-input.component';
import { StoreUrl } from '../../Shared/constants/api.constant';

export interface UserProfile {
  UserId: string;
  UserName: string;
  Email: string;
  Active: boolean;
  RoleGroupId: number;
  RoleGroupName: string;
  Client: Client;
}

export interface Client {
  Id: number;
  NameAr: string;
  NameEn: string;
  ClientCode: string;
  Email: string;
  PhoneNo: string;
  Whatsapp: string;
  Address: string;
  NationalAddress: string;
  Street: string;
  District: string;
  Governorate: string;
  CityName: string;
  CityId: number;
  BuildingNumber: string;
  Latitude: string;
  Longitude: string;
  IsStoreClient: boolean;
  StoreUserId: string;
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
      email: [
        { value: '', disabled: true },
        [Validators.required, Validators.email],
      ],

      nameAr: [{ value: '', disabled: true }],
      nameEn: [{ value: '', disabled: true }],
      phoneNo: [{ value: '', disabled: true }, [Validators.required]],
      whatsapp: [{ value: '', disabled: true }],
      address: [{ value: '', disabled: true }, [Validators.required]],
      nationalAddress: [{ value: '', disabled: true }],
      governorate: [{ value: '', disabled: true }],
      cityName: [{ value: '', disabled: true }],
      district: [{ value: '', disabled: true }],
      street: [{ value: '', disabled: true }],
      buildingNumber: [{ value: '', disabled: true }],
      clientCode: [{ value: '', disabled: true }],
    });
  }

  async getProfileData(): Promise<void> {
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
      this._ToastrService.error('لم يتم العثور على رمز الجلسة');
      return;
    }

    const decoded: any = jwtDecode(userToken);
    const userId = decoded?.Id;
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
        this._ToastrService.error(response?.Message);
      }
    } catch (error) {
      console.error(error);
      this._ToastrService.error('حدث خطأ أثناء تحميل بيانات الملف الشخصي');
    }
  }

  private populateForm(data: UserProfile): void {
    const client = data?.Client || ({} as Client);

    this.profileForm.patchValue({
      userId: data.UserId,
      userName: data.UserName,
      email: data.Email,
      RoleGroupId: data.RoleGroupId,

      nameAr: client.NameAr || data.UserName,
      nameEn: client.NameEn || '',
      phoneNo: client.PhoneNo || '',
      whatsapp: client.Whatsapp || '',
      address: client.Address || '',
      nationalAddress: client.NationalAddress || '',
      governorate: client.Governorate || '',
      cityName: client.CityName || '',
      district: client.District || '',
      street: client.Street || '',
      buildingNumber: client.BuildingNumber || '',
      clientCode: client.ClientCode || '',
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode) {
      const editableControls = [
        'userName',
        'email',
        'nameAr',
        'nameEn',
        'phoneNo',
        'whatsapp',
        'address',
        'nationalAddress',
        'governorate',
        'cityName',
        'district',
        'street',
        'buildingNumber',
      ];

      editableControls.forEach((controlName) => {
        this.profileForm.get(controlName)?.enable();
      });
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
    const clientData = this.profileData?.Client || ({} as Client);

    const payload = {
      userId: formValues.userId || localStorage.getItem('userId'),
      nameAr: formValues.nameAr || formValues.userName,
      nameEn: formValues.nameEn || formValues.userName,
      email: formValues.email,
      phoneNo: formValues.phoneNo,
      whatsapp: formValues.whatsapp,
      address: formValues.address,
      nationalAddress: formValues.nationalAddress,
      street: formValues.street,
      district: formValues.district,
      governorate: formValues.governorate,
      cityName: formValues.cityName,
      cityId: clientData.CityId || 0,
      buildingNumber: formValues.buildingNumber,
      latitude: clientData.Latitude || '',
      longitude: clientData.Longitude || '',
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
        this._ToastrService.error(response?.Message);
      }
    } catch (error) {
      console.error(error);
      this._ToastrService.error('حدث خطأ أثناء حفظ التغييرات');
    }
  }
}
