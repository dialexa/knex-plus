import IOrdering from "./ordering";

/**
 * @file
 * Pagination parameters
 *
 * @author Luke Gordon <luke@dialexa.com>
 * @copyright Dialexa 2018
 */

export default interface IPaginationParams {
  criteria?: object;
  page?: number;
  pageSize?: number;
  orderBy?: IOrdering[];
  fields?: string[];
}
