import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Utilisateur } from '../../models/utilisateur';
import { AuthService } from '../../services/authentication/auth.service';
import { IsAdministratorGuardService } from '../../services/authentication/is-administrator-guard.service';
import { PopupService } from '../../shared/services/popup.service';

export interface MenuItem {
  label: string;
  link?: string;
  icon?: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public user$: Observable<Utilisateur>;
  public user: Utilisateur;

  public menuItems: MenuItem[] = [
    {
      label: 'Accueil',
      link: '/home',
      icon: 'home',
    },
    {
      label: 'Financeurs',
      link: '/financeurs',
    },
    {
      label: 'Dépenses',
      link: '/depenses',
    },
    {
      label: 'Entrées/Sorties',
      link: '/entrees-sorties',
    },
    {
      label: 'Recettes comptables',
      link: '/recette-comptable',
    } /*,
    {
      label: 'Historiques',
      link: '/historiques'
    }*/,
    {
      label: 'Rapports',
      link: '/rapports',
    },
  ];

  private subscription: Subscription;

  constructor(
    private readonly auth: AuthService,
    private readonly isAdministratorGuardService: IsAdministratorGuardService,
    private readonly popupService: PopupService
  ) {}

  public ngOnInit(): void {
    this.user$ = this.auth.userObservable;
    this.subscription = this.user$.subscribe((user) => {
      this.user = user;
      if (user) {
        if (this.isAdministrator) {
          const menu = {
            label: 'Utilisateurs',
            link: '/utilisateurs',
          };
          this.menuItems.push(menu);
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public async logout(): Promise<void> {
    try {
      await this.auth.logout();
      const menu = {
        label: 'Utilisateurs',
        link: '/utilisateurs',
      };
      const index = this.menuItems.findIndex((p) => p.label === menu.label);
      if (index >= 0) {
        this.menuItems.splice(index, 1);
      }
    } catch (e) {
      console.error(e);

      this.popupService.error(e);
    }
  }

  /**
   * Indique si l'utilisateur est un administrateur.
   */
  public get isAdministrator(): boolean {
    return !!this.isAdministratorGuardService.isAdministrator();
  }
}
