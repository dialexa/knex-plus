import { expect } from 'chai';
import { camelCase, snakeCase } from '../change-case';

describe('camelCase', () => {
  it('should not camel case a falsey value (pt 1)', () => {
    const result = camelCase(undefined);

    expect(result).to.be.undefined;
  });

  it('should not camel case a falsey value (pt 2)', () => {
    const result = camelCase(false);

    expect(result).to.equal(false);
  });

  it('should not camel case an * value', () => {
    const result = camelCase('*');

    expect(result).to.equal('*');
  });

  it('should camel case a string', () => {
    const result = camelCase('test_me');

    expect(result).to.equal('testMe');
  });

  it('should camel case each element of an array', () => {
    const result = camelCase(['test_a', 'test_b', 'test_c']);

    expect(result).to.deep.equal(['testA', 'testB', 'testC']);
  });

  it('should camel case each key of an object', () => {
    const now = new Date();

    const result = camelCase({
      id: 1,
      created_at: now,
      updated_at: now
    });

    expect(result).to.deep.equal({
      id: 1,
      createdAt: now,
      updatedAt: now
    });
  });
});

describe('snakeCase', () => {
  it('should not snake case a falsey value (pt 1)', () => {
    const result = snakeCase(undefined);

    expect(result).to.equal(undefined);
  });

  it('should not snake case a falsey value (pt 2)', () => {
    const result = snakeCase(false);

    expect(result).to.equal(false);
  });

  it('should not snake case an * value', () => {
    const result = snakeCase('*');

    expect(result).to.equal('*');
  });

  it('should snake case a string', () => {
    const result = snakeCase('testMe');

    expect(result).to.equal('test_me');
  });

  it('should snake case each element of an array', () => {
    const result = snakeCase(['testA', 'testB', 'testC']);

    expect(result).to.deep.equal(['test_a', 'test_b', 'test_c']);
  });

  it('should snake case each key of an object', () => {
    const now = new Date();

    const result = snakeCase({
      id: 1,
      createdAt: now,
      updatedAt: now
    });

    expect(result).to.deep.equal({
      id: 1,
      created_at: now,
      updated_at: now
    });
  });
});
