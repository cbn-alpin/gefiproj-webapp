import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  /**
   * Titre du composant.
   */
  title = 'GeFiProj';

  /**
   * Message affiché sous le spinner.
   */
  spinnerMessage = 'Veuillez patienter...';
}
