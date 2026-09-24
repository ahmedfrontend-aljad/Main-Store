import { inject, Injectable, signal } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  isLoading$ = new BehaviorSubject(false);

  spinner = inject(NgxSpinnerService);

  start(): void {
    this.isLoading$.next(true);
    this.spinner.show();
  }

  stop(): void {
    this.isLoading$.next(false);
    this.spinner.hide();
  }
}
