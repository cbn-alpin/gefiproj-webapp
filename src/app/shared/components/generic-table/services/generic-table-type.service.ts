import { Injectable } from '@angular/core';
import { GenericTableCellType } from '../globals/generic-table-cell-types';
import { GenericTableOptions } from '../models/generic-table-options';

@Injectable({
  providedIn: 'root',
})
export class GenericTableTypeService<T> {
  constructor() {}

  public isString(options: GenericTableOptions<T>, entityName: any): boolean {
    return (
      options.entityTypes?.find((entity) => entity.code === entityName).type ===
      GenericTableCellType.TEXT
    );
  }

  public isTextarea(options: GenericTableOptions<T>, entityName: any): boolean {
    return (
      options.entityTypes?.find((entity) => entity.code === entityName).type ===
      GenericTableCellType.TEXTAREA
    );
  }

  public isNumber(options: GenericTableOptions<T>, entityName: any): boolean {
    return (
      options.entityTypes?.find((entity) => entity.code === entityName).type ===
      GenericTableCellType.NUMBER
    );
  }

  public isBoolean(options: GenericTableOptions<T>, entityName: any): boolean {
    return (
      options.entityTypes?.find((entity) => entity.code === entityName).type ===
      GenericTableCellType.BOOLEAN
    );
  }

  public isDate(options: GenericTableOptions<T>, entityName: any): boolean {
    return (
      options.entityTypes?.find((entity) => entity.code === entityName).type ===
      GenericTableCellType.DATE
    );
  }

  public isCurrency(options: GenericTableOptions<T>, entityName: any): boolean {
    return (
      options.entityTypes?.find((entity) => entity.code === entityName).type ===
      GenericTableCellType.CURRENCY
    );
  }

  public isSelectBox(
    options: GenericTableOptions<T>,
    entityName: any
  ): boolean {
    return (
      options.entityTypes?.find((entity) => entity.code === entityName).type ===
      GenericTableCellType.SELECTBOX
    );
  }
}
