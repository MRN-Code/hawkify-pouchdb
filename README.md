# Hawkify PouchDB

_Make PouchDB HTTP requests use hawk authentication._

Sign your PouchDB requests with a [hawk](https://www.npmjs.com/package/hawk) `Authorization` header. This plugin works in conjunction with [MRN-Code/nodeapi](https://github.com/MRN-Code/nodeapi) and [MRN-Code/coinstac-storage-proxy](https://github.com/MRN-Code/coinstac-storage-proxy) to ensure clients using PouchDB are authenticated.

## Example:

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

## License

MIT. See [LICENSE](./LICENSE).
