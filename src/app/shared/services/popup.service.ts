import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  constructor(private readonly snackBar: MatSnackBar) {}

  public info(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'popup-information',
    });
  }

  public error(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'popup-error',
    });
  }

  public success(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'popup-success',
    });
  }
}

export class MockPopupService extends PopupService {
  info() {
    return;
  }

  error() {
    return;
  }

  success() {
    return;
  }
}
