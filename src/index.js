/* eslint strict:0 */
'use strict';

// const merge = require('lodash.merge');

/**
 * Hawk-ify PouchDB.
 * @module
 *
 * {@link https://github.com/hueniverse/hawk}
 * {@link https://github.com/request/request#requestoptions-callback}
 *
 * @see {@link https://github.com/pouchdb/pouchdb/issues/5322|cannot-wrap-pouchdb-ajax}
 * The intent of this package is to be able to provide runtime modification of ajax
 * requests.  This package's API expects to wrap the internal pouchdb-ajax function.
 * In the 5.4.x release, this capability was removed.  It is likely to be restored.
 * Hence, this package's API maintains the assumptions of wrapping, even if true wrapping
 * is not acheived until the closure of #5322.  Until then, `credentials` are simply
 * returned, and modify _all_ ajax requests as specified _once_ on initial call
 * to this package.  in the future, `credentials` can be a function or an object
 * to modify requests.
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
 * @param {Function} toWrap ajax function to wrap. generally, pouchdb-ajax
 * @param {Object|Function} credentials Hawk credentials. This can contain additional
 * properties besides `algorithm` and `key` to validate your signature. See
 * Hawk's documentation for further info.  If provided a function, the function
 * shall return the properties as described for the `credentials` object.
 * @param {string} credentials.algorithm
 * @param {string} credentials.id
 * @param {string} credentials.key
 * @returns {function} Restore PouchDB's original AJAX functionality by calling
 * this function.
 */
module.exports = function hawkifyPouchDB(toWrap, credentials) {
  if (typeof toWrap === 'undefined' || !(toWrap instanceof Function)) {
    throw new Error('Expected ajax function to wrap');
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

  const creds = credentials instanceof Function ? credentials() : credentials;
  return {
    hawk: {
      credentials: creds, // eslint-disable-line object-shorthand
    },
  };

  // @TODO, upon closure of #5322, restore this block and remove the return
  // block above
  // return function(options, callback) { // eslint-disable-line
    // const creds = credentials instanceof Function ? credentials() : credentials;
    // var hawkOpts = {
    //   hawk: {
    //     credentials: creds, // eslint-disable-line object-shorthand
    //   },
    // };
    // var ajaxOpts = merge({}, options, hawkOpts);
    // return toWrap(ajaxOpts, callback);
  // };
};
