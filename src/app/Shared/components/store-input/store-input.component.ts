import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule, NgClass, NgSwitch } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import {
  CountryISO,
  NgxIntlTelInputModule,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { Calendar, CalendarModule } from 'primeng/calendar';
import { HelperService } from '../../../Core/Services/helper.service';
import { USER_PROFILE } from '../../constants/general.constant';

@Component({
  selector: 'app-store-input',
  standalone: true,
  imports: [
    CommonModule,
    NgSwitch,
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CalendarModule,
    NgxIntlTelInputModule,
    BsDropdownModule,
  ],
  templateUrl: './store-input.component.html',
  styleUrl: './store-input.component.scss',
})
export class StoreInputComponent implements OnInit {
  validators = Validators;
  @Input({ required: true }) control!: AbstractControl;
  @Input() readonly = false;
  @Input() type?: string;
  @Input() placeholder?: string;
  @Output() emitChanged = new EventEmitter<any>();
  @Input() addon?: string;
  @ViewChild('calendar') calendar?: Calendar;

  preferredCountries: CountryISO[] = [CountryISO.SaudiArabia, CountryISO.Egypt];
  SearchCountryField = SearchCountryField;
  selectedCountry: CountryISO = CountryISO.SaudiArabia;

  @Input() phoneValidation = false;
  @Input() label?: string;
  PhoneNumberFormat = PhoneNumberFormat;
  @Input() patternMessage?: string;

  private readonly _HelperService = inject(HelperService);
  private readonly cdr = inject(ChangeDetectorRef);
  private debounceTimer: any;

  passwordVisible: boolean = false;

  ngOnInit() {
    const user = this._HelperService.getItemFromLocalStorage(USER_PROFILE);
    const vatType = user?.VatType;

    if (vatType === 1) {
      this.selectedCountry = CountryISO.SaudiArabia;
    } else if (vatType === 2) {
      this.selectedCountry = CountryISO.Egypt;
    } else {
      this.selectedCountry = CountryISO.SaudiArabia;
    }
  }

  get formControl(): FormControl {
    return this.control as FormControl;
  }

  getChangedItem(ev: any): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.emitChanged.emit(ev);
    }, 250);
  }

  togglePasswordVisibility(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.passwordVisible = !this.passwordVisible;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  onMonthChange(event: any): void {
    if (
      this._HelperService.getItemFromLocalStorage(USER_PROFILE)?.BranchSettings
        ?.IntegrateWithRsd
    ) {
      const month = event.month - 1;
      const year = event.year;
      this.formControl.setValue(new Date(year, month, 1));
      this.emitChanged.emit();
      this.calendar?.hideOverlay();
    }
  }

  closeCalendar() {
    if (this.calendar?.overlayVisible) {
      this.calendar.hideOverlay();
    }
  }
}
