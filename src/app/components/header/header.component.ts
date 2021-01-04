import { Component, OnInit } from '@angular/core';

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
export class HeaderComponent implements OnInit {

  menuItems: MenuItem[] = [
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
    },
    {
      label: 'Connexion',
      link: '/connexion',
      icon: 'account_circle'
    },
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
