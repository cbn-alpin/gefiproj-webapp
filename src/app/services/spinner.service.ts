import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
/** Façade sur le spinner. */
export class SpinnerService {
  /** Nombre d'ouvertures encore actives. */
  iterationOfShow = 0;

  /** Nom du spinner. */
  private readonly name = 'primary';

  /** Indique si le spinner est visible. */
  get isVisible(): boolean {
    return this.iterationOfShow > 0;
  }

  /** Façade sur le spinner. */
  constructor(
    private spinnerSrv: NgxSpinnerService) {
    spinnerSrv.getSpinner(this.name).subscribe(spinner => {
      if (spinner && !spinner.show) {
        this.iterationOfShow = 0;
      }
    });
  }

  /** Affiche le spinner, si ce n'était déjà le cas. */
  show(): void {
    try {
      if (this.iterationOfShow++ < 1) {
        this.spinnerSrv.show(this.name);
      }
    } catch (error) {
      console.error(error);
    }
  }

  /** Cache le spinner si possible. */
  hide(): void {
    try {
      if (this.iterationOfShow-- <= 1) {
        this.spinnerSrv.hide(this.name);
      }

      if (this.iterationOfShow < 0) { // Fixe un problème sur un double appel
        this.iterationOfShow = 0;
      }
    } catch (error) {
      console.error(error);
    }
  }
}
