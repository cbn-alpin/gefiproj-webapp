import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Roles } from '../../models/roles';
import { Utilisateur } from '../../models/utilisateur';
import { IsAdministratorGuardService } from '../../services/authentication/is-administrator-guard.service';
import { SpinnerService } from '../../services/spinner.service';
import { UsersService } from '../../services/users.service';
import {
  GenericDialogComponent,
  IMessage,
} from '../../shared/components/generic-dialog/generic-dialog.component';
import { GenericTableCellType } from '../../shared/components/generic-table/globals/generic-table-cell-types';
import { EntitySelectBoxOptions } from '../../shared/components/generic-table/models/entity-select-box-options';
import { GenericTableFormError } from '../../shared/components/generic-table/models/generic-table-entity';
import { GenericTableEntityEvent } from '../../shared/components/generic-table/models/generic-table-entity-event';
import { GenericTableOptions } from '../../shared/components/generic-table/models/generic-table-options';
import { SelectBoxOption } from '../../shared/components/generic-table/models/SelectBoxOption';
import { SortInfo } from '../../shared/components/generic-table/models/sortInfo';
import { PopupService } from '../../shared/services/popup.service';
import { basicSort } from '../../shared/tools/utils';

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.scss'],
})
export class UtilisateursComponent implements OnInit {
  @Output()
  public usersChange: EventEmitter<Utilisateur[]> = new EventEmitter<
    Utilisateur[]
  >();
  /**
   * Liste des utilisateurs
   */
  public utilisateurs: Utilisateur[] = [];
  /**
   * Liste des roles
   */
  private rolesUser: SelectBoxOption<any>[] = [
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
   * Indique le trie courant.
   */
  private sortInfo: SortInfo;
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
    email_u: null,
    initiales_u: null,
    active_u: true,
    role: Roles.Consultant,
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
    role: { code: 'role', name: 'Rôle' },
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
  ) {}
  public async ngOnInit(): Promise<void> {
    try {
      this.initGenericTableOptions();
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
      this.utilisateurs.forEach((user) => {
        user.role = user.roles[0];
      });
    } catch (error) {
      console.error(error);
      this.popupService.error('Impossible de charger les utilisateurs.');
      return Promise.reject(error);
    } finally {
      this.spinnerSrv.hide();
    }
  }
  /**
   * Initialise les options de la table générique.
   */
  private initDtOptions(): void {
    const rolesSelectBoxOption: EntitySelectBoxOptions<any> = {
      name: this.namesMap.role.code,
      values: this.rolesUser,
    };
    const entitySelectBoxOptions = [rolesSelectBoxOption];
    this.options = Object.assign({}, this.options, {
      dataSource: basicSort(this.utilisateurs, this.sortInfo),
      entitySelectBoxOptions,
    });
  }
  /**
   * Initialise les options de la table générique.
   */
  private initGenericTableOptions(): void {
    this.options = {
      dataSource: this.utilisateurs,
      defaultEntity: this.defaultEntity,
      entityTypes: [
        {
          name: this.namesMap.nom_u.name,
          type: GenericTableCellType.TEXT,
          code: this.namesMap.nom_u.code,
          sortEnabled: true,
          isMandatory: true,
        },
        {
          name: this.namesMap.prenom_u.name,
          type: GenericTableCellType.TEXT,
          code: this.namesMap.prenom_u.code,
          sortEnabled: true,
          isMandatory: true,
        },
        {
          name: this.namesMap.email_u.name,
          type: GenericTableCellType.TEXT,
          code: this.namesMap.email_u.code,
          sortEnabled: true,
          isMandatory: true,
        },
        {
          name: this.namesMap.initiales_u.name,
          type: GenericTableCellType.TEXT,
          code: this.namesMap.initiales_u.code,
          sortEnabled: true,
          isMandatory: true,
        },
        {
          name: this.namesMap.active_u.name,
          type: GenericTableCellType.BOOLEAN,
          code: this.namesMap.active_u.code,
          sortEnabled: true,
          isMandatory: true,
        },
        {
          name: this.namesMap.role.name,
          type: GenericTableCellType.SELECTBOX,
          code: this.namesMap.role.code,
          sortEnabled: true,
          isMandatory: true,
        },
      ],
      entityPlaceHolders: [],
      entitySelectBoxOptions: [],
      sortName: this.namesMap.initiales_u.name,
      sortDirection: 'asc',
      idPropertyName: this.namesMap.initiales_u.code,
    };
  }
  /**
   * Un user a été ajouté dans le tableau.
   * @param event : encapsule le user à ajouter.
   */
  public async onCreate(
    event: GenericTableEntityEvent<Utilisateur>
  ): Promise<void> {
    const create = true;
    try {
      const user = event?.entity;
      if (!user) {
        throw new Error("L'utilisateur n'existe pas");
      }
      if (this.validateForGenericTable(event, create)) {
        user.roles = [];
        user.roles.push(user.role);
        delete user.role;
        user.password_u = this.generatePassword();
        const createdUser = await this.userService.add(user);
        createdUser.role = createdUser.roles[0];
        event.callBack(null);
        this.create(createdUser);
        const dialogRef = this.dialog.open(GenericDialogComponent, {
          data: {
            header: `Mot de passe du nouvel utilisateur ${user.email_u}`,
            content: `Le mot de passe de l'utilisateur que vous venez de créer
            avec l'email <strong>${user.email_u}</strong> est : <strong>${user.password_u}</strong> .`,
            type: 'information',
            action: {
              name: 'Fermer',
            },
            showCancel: false,
          } as IMessage,
        });
        dialogRef.afterClosed().subscribe(async (result) => {});
        this.refreshDataTable();
      }
    } catch (error) {
      console.error(error);
      this.popupService.error(error);
    }
  }
  /**
   * Le mot de passe d'un user a été modifié dans le tableau.
   * @param event : encapsule le user à modifier.
   */
  public async onChangePwd(
    event: GenericTableEntityEvent<Utilisateur>
  ): Promise<void> {
    try {
      const user = event?.entity;
      if (!user) {
        throw new Error("L'utilisateur n'existe pas");
      }
      user.new_password = this.generatePassword();

      const dialogRef = this.dialog.open(GenericDialogComponent, {
        data: {
          header: `Changer le mot de passe de l'utilisateur ${user.email_u}`,
          content: `Voulez vous changer le mot de passe de l'utilisateur
             <strong>${user.email_u}</strong> à <strong> ${user.new_password} </strong> ? `,
          type: 'warning',
          action: {
            name: 'Confirmer',
          },
        } as IMessage,
      });
      dialogRef.afterClosed().subscribe(async (result) => {
        if (result) {
          user.roles = [];
          user.roles.push(user.role);
          delete user.role;
          delete user.password_u;
          await this.userService.modifyPwd(user);
          user.role = user.roles[0];
          event.callBack(null);
          this.popupService.success(
            "Le mot de passe de l'utilisateur " +
              user.email_u +
              ' a été modifié.'
          );
        }
      });
    } catch (error) {
      console.error(error);
      this.popupService.error(error);
    }
  }
  /**
   * Un user a été modifié dans le tableau.
   * @param event : encapsule le user à modifier.
   */
  public async onEdit(
    event: GenericTableEntityEvent<Utilisateur>
  ): Promise<void> {
    const create = false;
    try {
      const user = event?.entity;
      if (!user) {
        throw new Error("L'utilisateur n'existe pas");
      }
      if (this.validateForGenericTable(event, create)) {
        user.roles = [];
        user.roles.push(user.role);
        delete user.role;
        const modifiedUser = await this.userService.modify(user);
        modifiedUser.role = modifiedUser.roles[0];
        event.callBack(null);
        this.modify(modifiedUser);
        this.refreshDataTable();
      }
    } catch (error) {
      console.error(error);
      this.popupService.error(error);
    }
  }
  /**
   * Génère un mot de passe
   */
  private generatePassword(): string {
    const passes = ['P@ssword', 'P@assCode', 'KeyWord@'];
    return (
      passes[Math.floor(Math.random() * Math.floor(3))] +
      Math.floor(Math.random() * Math.floor(999999))
    );
  }
  /**
   * Vérifie la validité du user en paramètre. Si le user est invalide, le tableau générique en est notifié.
   * @param gtEvent : encapsule un nouvel user ou un user modifié.
   * @param create : savoir s'il s'agit d'une création ou d'une modification
   */
  private validateForGenericTable(
    gtEvent: GenericTableEntityEvent<Utilisateur>,
    create: boolean
  ): boolean {
    if (!gtEvent) {
      throw new Error("Le paramètre 'gtEvent' est invalide");
    }
    try {
      const user = gtEvent?.entity;
      const formErrors: GenericTableFormError[] = [];
      if (create) {
        this.verifFormsCreate(user, formErrors);
      } else {
        this.verifFormsModify(user, formErrors);
      }
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
   * Vérifie le forms du user.
   * @param user : user à vérifier.
   * @param formErrors : liste des erreurs de validation.
   */
  private verifForms(
    user: Utilisateur,
    formErrors: GenericTableFormError[]
  ): void {
    const emailRegex = '^[A-Za-z0-9\\.\\+-]+@[A-Za-z0-9\\.-]+\\.[a-zA-Z]*$';
    if (!user.nom_u) {
      const error = {
        name: this.namesMap.nom_u.code,
        message: "Le nom de l'utilisateur doit être défini.",
      };
      formErrors.push(error);
    }
    if (!user.prenom_u) {
      const error = {
        name: this.namesMap.prenom_u.code,
        message: "Le prénom de l'utilisateur doit être défini.",
      };
      formErrors.push(error);
    }
    if (!user.email_u) {
      const error = {
        name: this.namesMap.email_u.code,
        message: "L'email de l'utilisateur doit être défini.",
      };
      formErrors.push(error);
    } else {
      if (!new RegExp(emailRegex).test(user.email_u)) {
        const error = {
          name: this.namesMap.email_u.code,
          message: "L'email de l'utilisateur n'est pas valide.",
        };
        formErrors.push(error);
      }
    }
    if (!user.initiales_u) {
      const error = {
        name: this.namesMap.initiales_u.code,
        message: "Les initiales de l'utilisateur doivent être définis.",
      };
      formErrors.push(error);
    }
    if (!user.role) {
      const error = {
        name: this.namesMap.role.code,
        message: "Le rôle de l'utilisateur doit être défini.",
      };
      formErrors.push(error);
    }
  }
  /**
   * La vérification des champs du tableau lors d'une création
   * @param user : l'utilisateur créé.
   * @param formErrors : liste des erreurs de validation.
   */
  private verifFormsCreate(
    user: Utilisateur,
    formErrors: GenericTableFormError[]
  ): void {
    this.verifForms(user, formErrors);
    if (!this.checkUniqueEmailCreate(user)) {
      const error = {
        name: this.namesMap.email_u.code,
        message: "L'email saisi existe déjà !",
      };
      formErrors.push(error);
    }
    if (!this.checkUniqueInitialesCreate(user)) {
      const error = {
        name: this.namesMap.initiales_u.code,
        message: 'Les initiales saisis existent déjà !',
      };
      formErrors.push(error);
    }
  }
  /**
   * La vérification des champs du tableau lors d'une modification
   * @param user : l'utilisateur modifié.
   * @param formErrors : liste des erreurs de validation.
   */
  private verifFormsModify(
    user: Utilisateur,
    formErrors: GenericTableFormError[]
  ): void {
    this.verifForms(user, formErrors);
    if (!this.checkUniqueEmailModify(user)) {
      const error = {
        name: this.namesMap.email_u.code,
        message: "L'email saisi existe déjà !",
      };
      formErrors.push(error);
    }
    if (!this.checkUniqueInitialesModify(user)) {
      const error = {
        name: this.namesMap.initiales_u.code,
        message: 'Les initiales saisis existent déjà !',
      };
      formErrors.push(error);
    }
  }
  /**
   * L'ajout de l'utilisateur créé dans le tableau Utilisateur[]
   * @param user : l'utilisateur crée.
   */
  private create(user: Utilisateur): void {
    this.utilisateurs.push(user);
    this.emitUsersChange();
  }
  /**
   * La modification de l'utilisateur modifié dans le tableau Utilisateur[]
   * @param user : l'utilisateur modifié.
   */
  private modify(user: Utilisateur): void {
    const index = this.utilisateurs.findIndex((u) => u.id_u === user.id_u);
    if (index >= 0) {
      this.utilisateurs[index] = user;
    }
  }
  public emitUsersChange(): void {
    this.usersChange.emit(this.utilisateurs);
  }
  /**
   * Vérifier l'unicité de l'email du user créé
   * @param newUser : l'utilisateur crée.
   */
  private checkUniqueEmailCreate(newUser: Utilisateur): boolean {
    return (
      this.utilisateurs.find((user) => user.email_u === newUser.email_u) == null
    );
  }
  /**
   * Vérifier l'unicité des initiales du user créé
   * @param newUser : l'utilisateur crée.
   */
  private checkUniqueInitialesCreate(newUser: Utilisateur): boolean {
    return (
      this.utilisateurs.find(
        (user) => user.initiales_u === newUser.initiales_u
      ) == null
    );
  }
  /**
   * Vérifier l'unicité de l'email du user modifié
   * @param newUser : l'utilisateur modifié.
   */
  private checkUniqueEmailModify(newUser: Utilisateur): boolean {
    return (
      this.utilisateurs.find(
        (user) => user.id_u !== newUser.id_u && user.email_u === newUser.email_u
      ) == null
    );
  }
  /**
   * Vérifier l'unicité des initiales du user modifié
   * @param newUser : l'utilisateur modifié.
   */
  private checkUniqueInitialesModify(newUser: Utilisateur): boolean {
    return (
      this.utilisateurs.find(
        (user) =>
          user.id_u !== newUser.id_u && user.initiales_u === newUser.initiales_u
      ) == null
    );
  }

  /**
   * Le trie du tableau a changé.
   * @param sort : défini le trie à appliquer.
   */
  public onSortChanged(sort: SortInfo): void {
    try {
      if (sort) {
        this.sortInfo = sort;
        this.refreshDataTable();
      }
    } catch (error) {
      console.error(error);
    }
  }

  private refreshDataTable(): void {
    this.options = {
      ...this.options,
      dataSource: basicSort(this.utilisateurs, this.sortInfo),
    };
  }
}
