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
 * requests specifically to append hawk authentication/security headers.
 * This package's API expects to wrap the internal pouchdb-ajax function to acheive
 * the above. In the 5.4.x pouchdb release, this capability was removed.
 * It is likely to be restored. Hence, this package's API maintains the assumption
 * that pouchdb-ajax is wrappable.  It will not be truly wrappable is until the
 * closure of #5322.  Until then, hawk `credentials` are simply supplied on first call,
 * and will be used on each request.  In the future, `credentials` can be a function or an object
 * to modify requests, meaning the credentials can be dynamically updated.
 * Wrapping the ajax function is a desireable to trait such that we may _update_
 * the creditials in the event that the creditials expire!
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
 * @returns {function} pouchdb-ajax compatible function
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
