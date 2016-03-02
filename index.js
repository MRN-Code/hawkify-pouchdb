'use strict';

/**
 * Hawk-ify PouchDB.
 * @module
 *
 * {@link https://github.com/hueniverse/hawk}
 * {@link https://github.com/request/request#requestoptions-callback}
 *
 * @example
 * const PouchDB = require('pouchdb');
 * const hawkifyPouchDB = require('hawkify-pouchdb');
 * const myCredentials = {
 *   algorithm: 'sha256',
 *   key: 'abdcef1234567890',
 *   user: 'Bob',
 * };
 *
 * hawkifyPouchDB(PouchDB, myCredentials);
 *
 * const myDb = new PouchDB('db-name');
 *
 * @param {PouchDB} PouchDB
 * @param {Object} credentials Hawk credentials. This can contain additional
 * properties besides `algorithm` and `key` to validate your signature. See
 * Hawk's documentation for further info.
 * @param {string} credentials.algorithm
 * @param {string} credentials.id
 * @param {string} credentials.key
 * @returns {function} Restore PouchDB's original AJAX functionality by calling
 * this function.
 */
module.exports = function hawkifyPouchDB(PouchDB, credentials) {
    if (typeof PouchDB === 'undefined' || !(PouchDB instanceof Function)) {
        throw new Error('Expected PouchDB');
    }

    if (
        typeof credentials === 'undefined' ||
        !(credentials instanceof Object)
    ) {
        throw new Error('Expected Hawk credentials');
    }

    if (!credentials.algorithm) {
        throw new Error('Expected Hawk credentials to include algorithm');
    }

    if (!credentials.id) {
        throw new Error('Expected Hawk credentials to include ID');
    }

    if (!credentials.key) {
        throw new Error('Expected Hawk credentials to include key');
    }

    const pouchDBAjax = PouchDB.utils.ajax;

    PouchDB.utils.ajax = function(options, callback) {
        options.hawk = {
            credentials: credentials,
        };

        return pouchDBAjax(options, callback);
    };

    return function restore() {
        PouchDB.utils.ajax = pouchDBAjax;
    };
};
