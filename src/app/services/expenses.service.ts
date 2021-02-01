import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Depense } from '../models/depense';
import { CrudService } from './crud.service';
import { SpinnerService } from './spinner.service';

/**
 * Gère les requêtes relatives aux dépenses.
 */
@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
  /**
   * Url relative de l'API.
   */
  private readonly endPoint = '/api/expenses';

  /**
   * Effectue les appels au serveur d'API pour une entité donnée.
   */
  private readonly crudSrv: CrudService<Depense>;

  /**
   * TODO : bouchonnage !
   */
  private get expenses(): Depense[] {
    return JSON.parse(localStorage.getItem('debugExpensesService') || '[]') as Depense[];
  }

  /**
   * TODO : bouchonnage !
   */
  private set expenses(expenses: Depense[]) {
    localStorage.setItem('debugExpensesService', JSON.stringify(expenses || []));
  }

  /**
   * Effectue les appels au serveur d'API pour les dépenses.
   * @param http : permet d'effectuer les appels au serveur d'API.
   * @param spinnerSrv : gère le spinner/sablier.
   */
  constructor(
    http: HttpClient,
    spinnerSrv: SpinnerService) {
      this.crudSrv = new CrudService<Depense>(
        http,
        spinnerSrv,
        this.endPoint);
    }

  /**
   * Retourne les dépenses depuis le serveur.
   */
  public async getAll(): Promise<Depense[]> {
    return this.expenses.slice();
    return this.crudSrv.getAll();
  }

  /**
   * Retourne la dépense demandée depuis le serveur.
   * @param id : identifiant de la dépense demandée.
   */
  public async get(id: number): Promise<Depense> {
    return this.expenses.find(e => e.id_d === id) || null;
    return this.crudSrv.get(id);
  }

  /**
   * Transmet la dépense modifiée au serveur.
   * @param expense : dépense modifiée.
   */
  public async modify(expense: Depense): Promise<Depense> {
      const expenses = this.expenses;
      const index = expenses.findIndex(e => e.id_d === expense.id_d);
      if (index >= 0) {
        expenses[index] = expense;
        this.expenses = expenses;
      }
      return expense;
      return this.crudSrv.modify(
        expense,
        expense?.id_d);
  }

  /**
   * Transmet la nouvelle dépense au serveur.
   * @param expense : dépense à créer.
   */
  public async add(expense: Depense): Promise<Depense> {
      const expenses = this.expenses;
      expense.id_d = expenses.map(e => e.id_d).reduce((p, c) => Math.max(p, c), 0) + 1;
      expenses.push(expense);
      this.expenses = expenses;
      return expense;
      return await this.crudSrv
        .add(expense);
  }

  /**
   * Demande la suppression de la dépense au serveur.
   * @param expense : dépense à supprimer.
   */
  public async delete(expense: Depense): Promise<void> {
    const expenses = this.expenses;
    const index = expenses.findIndex(e => e.id_d === expense.id_d);
    if (index >= 0) {
      expenses.splice(index, 1);
      this.expenses = expenses;
    }
    return;
    const id = expense?.id_d || 0;
    return this.crudSrv.delete(id);
  }
}
