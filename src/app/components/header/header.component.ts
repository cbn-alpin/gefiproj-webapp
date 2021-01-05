import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../../services/authentication/auth.service";
import {Observable, Subscription} from "rxjs";
import {Utilisateur} from "../../models/utilisateur";

export interface MenuItem {
  label: string;
  link?:string;
  icon?: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  public user$: Observable<Utilisateur>;
  public user: Utilisateur;

  public readonly menuItems: MenuItem[] = [
    {
      label: 'Accueil',
      link: '/home',
      icon: 'home'
    },
    {
      label: 'Financeurs',
      link: '/financeurs'
    },
    {
      label: 'Dépenses',
      link: '/depenses'
    },
    {
      label: 'Rapports',
      link: '/rapports'
    },
    {
      label: 'Utilisateurs',
      link: '/utilisateurs'
    },
    {
      label: 'Démo table (dév)',
      link: '/tabledemo'
    }
  ];

  private subscription: Subscription;

  constructor(
    private readonly auth: AuthService
  ) { }

  public ngOnInit(): void {
    this.user$ = this.auth.userObservable;
    this.subscription = this.user$.subscribe((user) => {
      this.user = user;
    })
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public logout(): void {
    console.log('LOGOUT');
    this.auth.logout();
  }

}
