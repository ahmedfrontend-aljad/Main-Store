import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { LoadingService } from '../../../Core/Services/loading.service';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-submit-button',
  imports: [TranslateModule, AsyncPipe],
  templateUrl: './submit-button.component.html',
  styleUrl: './submit-button.component.scss',
})
export class SubmitButtonComponent {
  @Input() buttonText?: string;
  @Input() isDisabled: any = false;
  @Output() btnClick = new EventEmitter<void>();
  readonly _LoadingService = inject(LoadingService);

  onClick(event: MouseEvent) {
    if (this.isDisabled || this._LoadingService.isLoading$.getValue()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.btnClick.emit();
  }
}
