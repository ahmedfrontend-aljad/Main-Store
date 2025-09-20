import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return { required: true };
    }

    const errors: any = {};

    if (value.length < 8) {
      errors.minLength = 'Password must be at least 8 characters long';
    }

    if (!/[A-Z]/.test(value)) {
      errors.uppercase = 'Password must contain at least one uppercase letter';
    }

    if (!/[a-z]/.test(value)) {
      errors.lowercase = 'Password must contain at least one lowercase letter';
    }

    if (!/[0-9]/.test(value)) {
      errors.number = 'Password must contain at least one number';
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.specialChar =
        'Password must contain at least one special character';
    }

    return Object.keys(errors).length ? errors : null;
  };
}
