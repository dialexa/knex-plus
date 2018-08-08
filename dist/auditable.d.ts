import Knex from 'knex';
import Repository from './repository';
export default class AuditableRepository<T> extends Repository<T> {
    private col;
    constructor(knex: Knex, table: string, col?: string);
    /**
     *
     * Updates the first database record that matches the provided criteria
     *
     * @param criteria the database record being updated must satisfy
     * @param data changes to apply to the matching database record
     *
     * @returns true if a database record was updated, false otherwise
     * @throws if a record update violates a database constraint
     */
    update(criteria: object, data: object): Promise<boolean>;
    /**
     *
     * Updates all database records that match the provided criteria
     *
     * @param criteria all updated records must satisfy
     * @param data changes to apply to records that match the provided criteria
     *
     * @returns the # of records updated in the database
     * @throws if a record update violates a database constraint
     */
    updateAll(criteria: object, data: object): Promise<number>;
}
