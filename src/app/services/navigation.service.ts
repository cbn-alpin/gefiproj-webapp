import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';

/**
 * Service simplifiant les navigations.
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  /**
   * Adresse de la page de connexion.
   */
  public static readonly URL_LOGIN = '/connexion';

  /**
   * Service permettant de récupérer la page actuelle.
   */
  private readonly snapshot: RouterStateSnapshot;

  /**
   * Service simplifiant les navigations.
   * @param router : service permettant les navigations.
   */
  constructor(
    private router: Router) {
    this.snapshot = router.routerState.snapshot;
  }

  /**
   * Navige vers la page de connexion en enregistrant une référence vers la page courante.
   */
  public goToLogin(): void {
    try {
      this.router.navigate([
        NavigationService.URL_LOGIN
      ], {
        queryParams: {
          returnUrl: this.snapshot.url
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
}
