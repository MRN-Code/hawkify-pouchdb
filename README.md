# Hawkify PouchDB

_Make PouchDB HTTP requests use hawk authentication._

Sign your PouchDB requests with a [hawk](https://www.npmjs.com/package/hawk) `Authorization` header. This plugin works in conjunction with [MRN-Code/nodeapi](https://github.com/MRN-Code/nodeapi) and [MRN-Code/coinstac-storage-proxy](https://github.com/MRN-Code/coinstac-storage-proxy) to ensure clients using PouchDB are authenticated.

## Installation

Make sure you have [Node.js](https://nodejs.org/) (`4.2.x` or greater) and NPM installed. To use _hawkify-pouchdb_ in your project, run:

```shell
npm install hawkify-pouchdb --save
```

## Use

This plugin works by altering PouchDB’s internal request system. _hawkify-pouchdb_ exports a single function which expects two arguments:

1. `PouchDB`: The PouchDB constructor.
2. `credentials`: A valid hawk credentials object with `algorithm`, `id` and `key` properties. Example:

  ```js
  {
    algorithm: 'sha256',
    id: 'abcdef',
    key: '1234567890',
  }
  ```

  See [hawk’s source code](https://github.com/hueniverse/hawk) for further documentation.

## Example

```js
const PouchDB = require('pouchdb');
const hawkifyPouchDB = require('hawkify-pouchdb');
const myCredentials = {
  algorithm: 'sha256',
  id: 'abcdef',
  key: '1234567890',
};

hawkifyPouchDB(PouchDB, myCredentials);

const myDb = new PouchDB('http://localhost:5984/my-database/');

myDb.get('my-doc-id')
  .then(response => {
    // Request was valid
  })
  .catch(error => {
    // Error, potentially due to invalid credentials
  });
```

## Development

To work on _hawkify-pouchdb_, clone this repository and run `npm install` in the directory to install its dependencies.

* **Style:** This plugin adheres to the [Airbnb JavaScript style guide](https://github.com/airbnb/javascript) via [ESLint](http://eslint.org/). Run `npm run lint` to lint the files.
* **Tests:** This plugin uses [tape](https://www.npmjs.com/package/tape) for testing. Run `npm test` to run the tests.

## License

MIT. See [LICENSE](./LICENSE).
