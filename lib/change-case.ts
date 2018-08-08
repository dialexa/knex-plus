import _camelCase from 'lodash.camelcase';
import _mapKeys from 'lodash.mapkeys';
import _snakeCase from 'lodash.snakecase';

const transform = (data: any, fn: Function) : any => {
  if (!data || data === '*') { return data; }
  if (Array.isArray(data)) { return data.map(d => transform(d, fn)); }
  if (typeof data === 'object') { return _mapKeys(data, (_, k) => fn(k)); }

  return fn(data);
}

export const camelCase = (data: any) : any => transform(data, _camelCase);

export const snakeCase = (data: any) : any => transform(data, _snakeCase);
