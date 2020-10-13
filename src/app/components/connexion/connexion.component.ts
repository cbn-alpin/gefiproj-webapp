import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { UserLogin } from 'src/app/services/user-login';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss']
})
export class ConnexionComponent implements OnInit {
  constructor(private auth: AuthService) { }

  /**
   * Initialisation du composant.
   */
  async ngOnInit(): Promise<void> {
    try { // todo test !!
      const sampleUser: UserLogin = {
        login: 'nom test',
        password: 'pass test'
      };

      console.log(await this.auth.login(sampleUser));
    } catch (error) {
      console.error(error);
    }
  }
}
