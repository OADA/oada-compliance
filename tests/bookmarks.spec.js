/* Copyright 2015 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var Promise = require('bluebird');
var expect = require('chai').expect;
var debug = require('debug')('oada-conformance:bookmarks.spec');

var assert = require('chai').assert;
require('chai').use(require('chai-as-promised'));

var auth = require('./auth.js');
var resources = require('./resources.js');
var config = require('../config.js').get('bookmarks');

var Formats = require('oada-formats');
var formats = new Formats();
var packs = require('../config.js').get('options:oadaFormatsPackages') || [];
packs.forEach(function(pack) {
    formats.use(require(pack));
});

describe('bookmarks', function() {

    before('need token for login ' + config.login, function() {
        var self = this;

        return auth.getAuth(config.login).then(function(token) {
            self.token = token;
        });
    });

    it('should be valid', function() {
        var bookmarks = resources.get('bookmarks', this.token);

        return formats
            .model('application/vnd.oada.bookmarks.1+json')
            .call('validate', bookmarks.get('body'));
    });

    // TODO: Is this required? Maybe the previous test handles this?
    xit('should be a resource', function() {
        var bookmarks = resources.get('bookmarks', this.token).get('body');
        var id = bookmarks.get('_id');

        return assert.eventually
            .ok(id, '/boomarks should have an `_id` field')
            .then(function(id) {
                var resource = resources.get(id, this.token).get('body');

                return Promise.join(bookmarks, resource,
                    function(bookmarks, resource) {
                        expect(resource).to.deep.equal(bookmarks);
                    });
            });
    });

    it('should support getting subdocuments', function() {
        var SUB_TIMEOUT = 100; // Add to timeout for each subdocument?
        var self = this;

        return resources.getAll('bookmarks', this.token, function(id, res) {
            // TODO: Check schema?
            expect(res).to.have.property('body');

            // Increase timeout
            self.timeout(self.timeout() + SUB_TIMEOUT);

            // Only validate resources at their root
            var cLocation = res.res.headers['content-location'];
            if (cLocation && cLocation.match(/^.*\/resources\/[^\/]+\/?$/) &&
                    !res.request.url.match(/_meta$/)) {
                return formats
                    .model(res.type)
                    .call('validate', res.body)
                    .catch(Formats.MediaTypeNotFoundError, function(e) {
                        debug('Model for ' + e.message + ' not found');
                    })
                    .catch(Formats.ValidationError, function(e) {
                        debug(res.request.url + ' had validation error: ' +
                                e.message);

                        // How to do this without killing the whole operation?
                        //throw e;
                    });
            }
        });
    });

    xit('should have CORS enabled');
});

