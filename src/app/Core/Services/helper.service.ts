import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  getItemFromLocalStorage(name: string): any {
    return JSON.parse(localStorage.getItem(name)!);
  }
}
