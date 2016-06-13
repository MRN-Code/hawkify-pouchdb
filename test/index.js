/* eslint strict:0 */
'use strict';

// require('./error-util')
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-adapter-memory'));
const ajax = require('pouchdb-ajax');
const hawk = require('hawk');
const hawkifyPouchDB = require('../src/index.js');
const http = require('http');
const merge = require('lodash.merge');
const sinon = require('sinon');
const tape = require('tape');

tape('argument errors', t => {
  t.throws(hawkifyPouchDB, 'without args');
  t.throws(hawkifyPouchDB.bind(null, ajax), 'without credentials');
  t.throws(
    hawkifyPouchDB.bind(null, ajax, {}),
    'without valid credentials'
  );
  t.throws(
    hawkifyPouchDB.bind(null, ajax, {
      algorithm: 'hey',
      id: 'hey',
    }),
    'without credentials key'
  );
  t.throws(
    hawkifyPouchDB.bind(null, ajax, {
      algorithm: 'hey',
      key: 'hey',
    }),
    'without credentials ID'
  );
  t.throws(
    hawkifyPouchDB.bind(null, ajax, {
      id: 'hey',
      key: 'hey',
    }),
    'without credentials algorithm'
  );
  t.end();
});

tape('integration', t => {
  function credentialsFunc(id, callback) {
    callback(null, {
      algorithm: 'sha256',
      key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn',
      user: 'Steve',
    });
  }

  const dbName = 'my-database';
  const doc1 = {
    _id: 'doc-1',
    _rev: 'abcdef',
    title: 'Heroes',
  };
  const doc2 = {
    _id: 'doc-2',
    _rev: '1234567890',
    title: 'Golden Years',
  };
  const doc3 = {
    _id: 'doc-3',
    _rev: 'ghijkl',
    title: 'The Man Who Sold the World',
  };

  const hostname = 'localhost';
  const id = 'dh37fgj492je';
  const port = 5985;
  const stub = sinon.stub();

  function handler(req, res) {
    const response = stub(arguments); // eslint-disable-line prefer-rest-params
    const statusCode = response[0];
    const responseBody = JSON.stringify(response[1]);

    hawk.server.authenticate(
      req,
      credentialsFunc,
      {},
      (err, credentials, artifacts) => {
        const headers = {
          'Content-Type': 'application/json',
        };
        const payload = !err ?
          responseBody :
          JSON.stringify({
            error: 'unauthorized',
            reason: 'Authentication failed',
          });
        const header = hawk.server.header(
          credentials,
          artifacts,
          {
            payload: payload, // eslint-disable-line object-shorthand
            contentType: headers['Content-Type'],
          }
        );

        headers['Server-Authorization'] = header;

        res.writeHead(!err ? statusCode : 401, headers);
        res.end(payload);
      }
    );
  }

  const server = http.createServer(handler);

  const bulkDocsResponse = [doc1, doc2, doc3].map(d => { // eslint-disable-line arrow-body-style
    return {
      ok: true,
      id: d._id,
      rev: d._rev,
    };
  });

  // PouchDB makes initial call to /my-database/
  stub.onCall(0).returns([200, [doc1, doc2]]);

  // GET doc1
  stub.onCall(1).returns([200, doc1]);

  // PouchDB POSTs to `_bulk_docs` with doc3
  stub.onCall(2).returns([201, bulkDocsResponse]);

  t.test('server setup', st => server.listen(port, st.end));
  t.test('sends credentials', st => {
    st.plan(2);
    credentialsFunc(null, (err, credentials) => { // eslint-disable-line consistent-return
      if (err) {
        return t.end(err);
      }

      const newCredentials = merge({}, credentials, {
        id: id, // eslint-disable-line object-shorthand
      });

      delete newCredentials.user;

      const db = new PouchDB(
        `http://${hostname}:${port}/${dbName}`,
        { ajax: hawkifyPouchDB(ajax, newCredentials) }
      );
      db.get(doc1._id)
        .then(response => {
          st.ok(response, 'validates “get”');
          return db.put(doc3);
        })
        .then(response => {
          st.ok(response, 'validates “put”');
        })
        .catch(t.end);
    });
  });
  t.test('server teardown', st => server.close(st.end));
});
