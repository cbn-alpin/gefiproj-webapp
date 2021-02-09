import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

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

  /**
   * Affiche un message d'erreur.
   * @param message : message à afficher. Si c'est une exception ou une exception HTTP, le message interne sera extirpé.
   * @param title : titre du message.
   * @param config : configuration du composant.
   */
  public error(message: string | HttpErrorResponse | Error, title?: string, config?: MatSnackBarConfig): void {
    if (message && message instanceof HttpErrorResponse) {
      message = message.error?.message
        ? message = message.error.message + (message.message ? ` (Erreur HTTP : '${message.message}')` : '')
        : message.message;
    } else if (message && message instanceof Error) {
      message = message.message;
    }

    if (title) {
      message = `${title} => ${message || ''}`;
    }

    if (message) {
      config = Object.assign({
        duration: 10000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: 'popup-error',
      }, config || {});
      this.snackBar.open(message as string, 'OK', config);
    }
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
