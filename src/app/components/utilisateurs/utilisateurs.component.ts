import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Roles } from '../../models/roles';
import { Utilisateur } from '../../models/utilisateur';
import { IsAdministratorGuardService } from '../../services/authentication/is-administrator-guard.service';
import { SpinnerService } from '../../services/spinner.service';
import { UsersService } from '../../services/users.service';
import { GenericDialogComponent, IMessage } from '../../shared/components/generic-dialog/generic-dialog.component';
import { GenericTableCellType } from '../../shared/components/generic-table/globals/generic-table-cell-types';
import { EntitySelectBoxOptions } from '../../shared/components/generic-table/models/entity-select-box-options';
import { GenericTableFormError } from '../../shared/components/generic-table/models/generic-table-entity';
import { GenericTableEntityEvent } from '../../shared/components/generic-table/models/generic-table-entity-event';
import { GenericTableOptions } from '../../shared/components/generic-table/models/generic-table-options';
import { SelectBoxOption } from '../../shared/components/generic-table/models/SelectBoxOption';
import { PopupService } from '../../shared/services/popup.service';

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss']
})
export class UtilisateursComponent implements OnInit {


  @Output()
  public usersChange: EventEmitter<
    Utilisateur[]
    > = new EventEmitter<Utilisateur[]>();
  /**
   * Liste des utilisateurs
   */
  public utilisateurs: Utilisateur[] = [];
  /**
   * Liste des roles
   */
  private roles_user: SelectBoxOption<any>[] = [
    { id: Roles.Admin, label: Roles.Admin },
    { id: Roles.Consultant, label: Roles.Consultant },
  ];
  /**
   * Titre du tableau
   */
  public title = 'Utilisateurs';

  /**
   * Options du tableau
   */
  public options: GenericTableOptions<Utilisateur>;


  /**
   * Indique si le tableau est en lecture seule.
   */
  public get isReadOnly(): boolean {
    return !this.isAdministrator;
  }
  /**
   * Indique si l'utilisateur est un administrateur.
   */
  public get isAdministrator(): boolean {
    return !!this.isAdministratorGuardService.isAdministrator();
  }
  /**
   * Utilisateur par défaut utilisé lors de la création d'un nouvel utilisateur
   * @private
   */
  private defaultEntity: Utilisateur = {
    nom_u: null,
    prenom_u: null,
    email_u:null,
    initiales_u:null,
    active_u:true,
    role:Roles.Consultant,
  };

  /**
   * Mapping pour les noms des attributs d'un user.
   */
  private readonly namesMap = {
    nom_u: { code: 'nom_u', name: 'Nom' },
    prenom_u: { code: 'prenom_u', name: 'Prénom' },
    email_u: { code: 'email_u', name: 'Email' },
    initiales_u: { code: 'initiales_u', name: 'Initiales' },
    active_u: { code: 'active_u', name: 'Est actif' },
    role:{code:'role', name: 'Rôle'},
  };

  /**
   * Indique si le tableau peut-être modifié.
   */
  public get showActions(): boolean {
    return !!this.isAdministratorGuardService.isAdministrator();
  }

  constructor(
    private readonly isAdministratorGuardService: IsAdministratorGuardService,
    private readonly userService: UsersService,
    private readonly popupService: PopupService,
    private readonly dialog: MatDialog,
    private readonly spinnerSrv: SpinnerService
  ) { }

  public async ngOnInit() {
     try {
      this.initGenericTableOptions()
      await this.loadUtilisateurs();
      this.initDtOptions();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Charge les utilisateurs depuis le serveur.
   */
  async loadUtilisateurs(): Promise<Utilisateur[]> {
    try {
      this.spinnerSrv.show();
      this.utilisateurs = await this.userService.getAll();
       this.utilisateurs.forEach((user ) => {
        user.role = user.roles[0];
         })
    } catch (error) {
      console.error(error);
      this.popupService.error(
        'Impossible de charger les utilisateurs.'
      );
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }

  /**
   * Initialise les options de la table générique.
   */
  private initDtOptions(): void {
    const dataSource = this.utilisateurs;
    const rolesSelectBoxOption: EntitySelectBoxOptions<any> = {
      name: this.namesMap.role.code,
      values: this.roles_user,
    };
    const entitySelectBoxOptions = [
      rolesSelectBoxOption,
    ];
    this.options = Object.assign({}, this.options, {
      dataSource,
      entitySelectBoxOptions,
    });
  }

  private initGenericTableOptions(): void {
    this.options = {
      dataSource: this.utilisateurs,
      defaultEntity: this.defaultEntity,
      entityTypes: [
        {
          name: this.namesMap.nom_u.name,
          type: GenericTableCellType.TEXT,
          code: this.namesMap.nom_u.code,
        },
        {
          name: this.namesMap.prenom_u.name,
          type: GenericTableCellType.TEXT,
          code: this.namesMap.prenom_u.code,
        },
        {
          name: this.namesMap.email_u.name,
          type: GenericTableCellType.TEXT,
          code: this.namesMap.email_u.code,
        },
        {
          name: this.namesMap.initiales_u.name,
          type: GenericTableCellType.TEXT,
          code: this.namesMap.initiales_u.code,
        },
        {
          name: this.namesMap.active_u.name,
          type: GenericTableCellType.BOOLEAN,
          code: this.namesMap.active_u.code,
        },
        {
          name: this.namesMap.role.name,
          type: GenericTableCellType.SELECTBOX,
          code: this.namesMap.role.code,
        },
      ],
      entityPlaceHolders: [],
      entitySelectBoxOptions: [],
    };
  }

  public async onCreate(event: GenericTableEntityEvent<Utilisateur>) {
    console.log("Call onCreate ! ");

    try {
      let user = event?.entity;
      console.log("User to add : " , user);
      if (!user)
        throw new Error("L'utilisateur n'existe pas");
      if (this.validateForGenericTable(event)) {
        if(!this.checkUniqueEmail(user))
          this.popupService.error(
            'L\'email saisi existe déjà !');
        else
          if(!this.checkUniqueInitiales(user))
            this.popupService.error(
              'Les initiales saisis existent déjà !');
          else
            {
              user.roles = [];
              user.roles.push(user.role);
              delete user.role;
              user.password_u = this.generatePassword();
              const createdUser = await this.userService.add(
                user
              );
              user.role = user.roles[0];
              event.callBack(null);
              this.create(createdUser);
              const dialogRef = this.dialog.open(GenericDialogComponent, {
                data: {
                  header: 'Mot de passe du nouveau utilisateur',
                  content: `Le mot de passe de l'utilisateur que vous venez de créer
             avec l'email ${createdUser.email_u} est '${createdUser.password_u}' .`,
                  type: 'information',
                  action: {
                    name: 'ok',
                  },
                } as IMessage,
              });
              dialogRef
                .afterClosed()
                .subscribe(async (result) => {
                });

          }
      }
    } catch (error) {
      console.error(error);
      this.popupService.error(
        'Impossible de créer l\'utilisateur : ' + error.message
      );
    }

  }

  public async onChangePwd(event: GenericTableEntityEvent<Utilisateur>) {
    console.log("Call onChangePwd ! ");

    try {
      let user = event?.entity;
      console.log("User to add : " , user);
      if (!user)
        throw new Error("L'utilisateur n'existe pas");
      if (this.validateForGenericTable(event)) {
        const dialogRef = this.dialog.open(GenericDialogComponent, {
          data: {
            header: 'Changer le mot de passe de l\'utilisateur',
            content: `Voulez vous changer le mot de passe de l'utilisateur
             ${user.email_u} ? `,
            type: 'warning',
            action: {
              name: 'Confirmer',
            },
          } as IMessage,
        });
        dialogRef
          .afterClosed()
          .subscribe(async (result) => {
            console.log("Result " , result)
            // user.roles = [];
            // user.roles.push(user.role);
            // delete user.role;
            // user.password_u = this.generatePassword();
            // const modifiedUser = await this.userService.modify(
            //   user
            // );
            // user.role = user.roles[0];
            // event.callBack(null);
            // this.modify(modifiedUser);
            // const dialogRef = this.dialog.open(GenericDialogComponent, {
            //   data: {
            //     header: 'Mot de passe du nouveau utilisateur',
            //     content: `Le mot de passe de l'utilisateur que vous venez de créer
            //  avec l'email ${modifiedUser.email_u} est '${modifiedUser.password_u}' .`,
            //     type: 'information',
            //     action: {
            //       name: 'ok',
            //     },
            //   } as IMessage,
            // });
            // dialogRef
            //   .afterClosed()
            //   .subscribe(async (result) => {
            //   });
          });

      }
    } catch (error) {
      console.error(error);
      this.popupService.error(
        'Impossible de créer l\'utilisateur : ' + error.message
      );
    }

  }

  public async onEdit(event: GenericTableEntityEvent<Utilisateur>) {
    console.log("Call onEdit ! ");
    try {
      let user = event?.entity;
      console.log("User to modify : ", user);
      if (!user)
        throw new Error("L'utilisateur n'existe pas");
      if (this.validateForGenericTable(event)) {
        user.roles = [];
        user.roles.push(user.role);
        delete user.role;
        const modifiedUser = await this.userService.modify(
          user
        );
        user.role = user.roles[0];
        event.callBack(null);
        this.modify(modifiedUser);

      }
    } catch (error) {
      console.error(error);
      this.popupService.error(
        'Impossible de créer l\'utilisateur : ' + error.message
      );
    }
  }


  private generatePassword() : string{
    return 'P@ssword'+Math.floor(Math.random()*Math.floor(999999));
  }

  /**
   * Vérifie la validité du montant affecté en paramètre. Si le montant affecté est invalide, le tableau générique en est notifié.
   * @param gtEvent : encapsule un nouveau montant affecté ou un montant affecté modifié.
   */
  private validateForGenericTable(
    gtEvent: GenericTableEntityEvent<Utilisateur>
  ): boolean {
    if (!gtEvent) {
      throw new Error("Le paramètre 'gtEvent' est invalide");
    }

    try {
      const user = gtEvent?.entity;
      const formErrors: GenericTableFormError[] = [];

      this.verifForms(user, formErrors);
      if (formErrors.length > 0) {
        gtEvent.callBack({
          formErrors,
        });

        this.popupService.error('Veuillez vérifier vos données');
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.error(error);
      return true; // Problème inattendu : le serveur vérifiera les données
    }
  }

  /**
   * Vérifie le forms du montant affecté.
   * @param montant affecté : montant affecté à vérifier.
   * @param formErrors : liste des erreurs de validation.
   */
  private verifForms(user: Utilisateur, formErrors: GenericTableFormError[]): void {
    if (!user.email_u) {
      const error = {
        name: this.namesMap.email_u.code,
        message: 'L\'email de l\'utilisateur doit être défini.',
      };
      formErrors.push(error);
    }
    if (!user.initiales_u) {
      const error = {
        name: this.namesMap.initiales_u.code,
        message: 'Les initiales de l\'utilisateur doivent être défini.',
      };
      formErrors.push(error);
    }
  }

  private create(user: Utilisateur): void {
    this.utilisateurs.push(user);
    this.emitUsersChange();
  }
  private modify(user: Utilisateur): void {
    const index = this.utilisateurs.findIndex((u) => u.id_u === user.id_u);
    if (index >= 0) {
      this.utilisateurs[index] = user;
    }
  }
  public emitUsersChange(): void {
    this.usersChange.emit(this.utilisateurs);
  }

  private checkUniqueEmail(newUser: Utilisateur) : boolean{
    return this.utilisateurs.find(user => user.email_u === newUser.email_u ) == null;
  }
  private checkUniqueInitiales(newUser: Utilisateur) : boolean{
    return this.utilisateurs.find(user => user.initiales_u === newUser.initiales_u ) == null;
  }


}
