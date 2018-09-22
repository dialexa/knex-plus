/**
 * @file
 * Ordering of paginated results
 *
 * @author Luke Gordon <luke@dialexa.com>
 * @copyright Dialexa 2018
 */

export default interface IOrdering {
  field: string;
  direction?: "ASC" | "DESC";
}
