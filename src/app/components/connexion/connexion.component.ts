import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { UserLogin } from 'src/app/services/authentication/user-login';
import { PopupService } from '../../shared/services/popup.service';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss'],
})
export class ConnexionComponent implements OnInit {
  public emailFormControl: FormControl;
  public pwdFormControl: FormControl;
  public emailMatcher: ErrorStateMatcher;
  public pwdMatcher: ErrorStateMatcher;

  constructor(
    private readonly authSrv: AuthService,
    private readonly popupService: PopupService
  ) {}

  /**
   * Initialisation du composant.
   */
  async ngOnInit(): Promise<void> {
    this.emailFormControl = new FormControl('', [
      Validators.required,
      Validators.email,
    ]);
    this.pwdFormControl = new FormControl('', [Validators.required]);
    this.emailMatcher = new MyErrorStateMatcher();
    this.pwdMatcher = new MyErrorStateMatcher();
  }

  public async onLogin(): Promise<void> {
    try {
      if (this.emailFormControl.valid && this.pwdFormControl.valid) {
        const sampleUser: UserLogin = {
          login: this.emailFormControl.value,
          password: this.pwdFormControl.value,
        };
        await this.authSrv.login(sampleUser);

        const isAuth = this.authSrv.isAuthenticated();
        if (!isAuth) {
          this.popupService.error(
            "Ce login n'est pas valide : utilisateur inactif ou sans rôle."
          );
        }
      }
    } catch (error) {
      this.popupService.error('E-mail/Mot de passe non valide');
    }
  }
}

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}
