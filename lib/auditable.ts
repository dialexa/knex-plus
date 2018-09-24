/**
 * @file
 * A flexible & lightweight repository class powered by Knex
 *
 * @author Luke Gordon <luke@dialexa.com>
 * @copyright Dialexa 2018
 */

import * as Knex from "knex";
import Repository from "./repository";

export default class AuditableRepository<T> extends Repository<T> {
  private col;
  constructor(knex: Knex, table: string, col?: string) {
    super(knex, table);
    // Updated at column
    this.col = col || "updatedAt";
  }

  public async update<S>(criteria: S, data: object): Promise<boolean> {
    const updates = Object.assign({}, data, { [this.col]: new Date() });

    return super.update<S>(criteria, updates);
  }

  public async updateAll<S>(criteria: S, data: object): Promise<number> {
    const updates = Object.assign({}, data, { [this.col]: new Date() });

    return super.updateAll<S>(criteria, updates);
  }
}
