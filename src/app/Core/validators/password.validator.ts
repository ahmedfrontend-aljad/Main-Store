import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const errors: ValidationErrors = {}; 

    if (value.length < 8) {
      errors['minLength'] = true;
    }
    if (!/[A-Z]/.test(value)) {
      errors['requireUppercase'] = true;
    }
    if (!/[a-z]/.test(value)) {
      errors['requireLowercase'] = true;
    }
    if (!/[0-9]/.test(value)) {
      errors['requireNumber'] = true;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors['requireSpecialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
}
