'use strict';

const hawkifyPouchDB = require('./index.js');
const PouchDB = require('pouchdb');
const nock = require('nock');
const sinon = require('sinon');
const tape = require('tape');

function getValidCredentials() {
    return {
        algorithm: 'sha256',
        id: 'test-ID',
        key: 'most-unique-key',
        user: 'Most Premium User',
    };
}

tape('argument errors', t => {
    t.throws(hawkifyPouchDB, 'without args');
    t.throws(hawkifyPouchDB.bind(null, PouchDB), 'without credentials');
    t.throws(
        hawkifyPouchDB.bind(null, PouchDB, {}),
        'without valid credentials'
    );
    t.throws(
        hawkifyPouchDB.bind(null, PouchDB, {
            algorithm: 'hey',
            id: 'hey',
        }),
        'without credentials key'
    );
    t.throws(
        hawkifyPouchDB.bind(null, PouchDB, {
            algorithm: 'hey',
            key: 'hey',
        }),
        'without credentials ID'
    );
    t.throws(
        hawkifyPouchDB.bind(null, PouchDB, {
            id: 'hey',
            key: 'hey',
        }),
        'without credentials algorithm'
    );
    t.end();
});

tape('restores AJAX', t => {
    const originalAjax = PouchDB.utils.ajax;
    const restore = hawkifyPouchDB(PouchDB, getValidCredentials());

    t.ok(restore instanceof Function, 'returns restore function');
    restore();
    t.equal(PouchDB.utils.ajax, originalAjax, 'restores original AJAX');
    t.end();
});

tape('passes credentials', t => {
    t.plan(2);

    const ajaxSpy = sinon.spy(PouchDB.utils, 'ajax');
    const credentials = getValidCredentials();
    const dbPath = '/my-database'
    const host = 'http://localhost:5984';

    const restore = hawkifyPouchDB(PouchDB, credentials);

    nock(host).post(dbPath).reply(200);

    PouchDB.utils.ajax({
        body: {
            _id: 1,
            _rev: 2,
            my: 'prop',
        },
        method: 'POST',
        uri: host + dbPath,
    }, function(err, res) {
        if (err) {
            return t.end(err);
        }

        t.ok(ajaxSpy.called, 'calls AJAX'),
        t.deepEqual(ajaxSpy.firstCall.args[0].hawk, credentials, 'passes credentials');

        restore();
        ajaxSpy.restore();
    });
});
