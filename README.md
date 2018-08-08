# Knex+

[![NPM Version][version-img]][version-url]
[![Build Status][build-img]][build-url]
[![Coverage Status][coverage-img]][coverage-url]

This library is meant to serve as an extremely lightweight layer on top of Knex for software developer quality of life purposes.  It's not meant to be extensive, support associations (belongs to, has many), etc.  If you are looking for something like that, please refer to some of the following:

* [http://docs.sequelizejs.com/](http://docs.sequelizejs.com/)
* [http://bookshelfjs.org/](http://bookshelfjs.org/)
* [https://github.com/typeorm/typeorm](https://github.com/typeorm/typeorm)

## Basic Usage

The repository class can be initialized like so:

```javascript
import { Repository } from 'knex-plus';

const repository = new Repository(knex, 'users');
```

The constructor takes a knex object (which can be a **transaction**) and a table name.

The repository method signatures [can be found here](https://github.com/dialexa/repository/blob/master/dist/repository.d.ts)

## Additional

### Type Checking

The repository can be initialized with an interface if using typescript for type checking on returned records like so:

```typescript
import { Repository } from 'knex-plus';

interface IUser {
  id?: string,
  email: string,
  createdAt: Date,
  updatedAt?: Date
}

const repository = new Repository<IUser>(knex, 'users');
```

---

### Auditability

This library includes a class `AuditableRepository` that will automatically update an `updatedAt` column if desired.  The class constructor is identical to `Repository` and can be initialized like so:

```javascript
import { AuditableRepository } from 'knex-plus';

const repository = new AuditableRepository(knex, 'users');
```

If you want to customize the `updatedAt` column, you can do so:

```javascript
import { AuditableRepository } from 'knex-plus';

const repository = new AuditableRepository(knex, 'users', 'modifiedAt');
```

<!-- Badge URLs -->
[build-img]:https://travis-ci.org/dialexa/knex-plus.svg?branch=master
[build-url]:https://travis-ci.org/dialexa/knex-plus
[version-img]:https://badge.fury.io/js/%40dialexa%2Fknex-plus.svg
[version-url]:https://badge.fury.io/js/%40dialexa%2Fknex-plus
[coverage-img]:https://coveralls.io/repos/dialexa/relish/badge.svg?branch=master&service=github
[coverage-url]:https://coveralls.io/github/dialexa/relish?branch=master
