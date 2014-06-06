/**
 * Package to collect test helpers and avoid pollution of the test files for better readability.
 */
var assert  = require('assert');

module.exports.MockRequest  = require('./MockRequest');
module.exports.MockResponse = require('./MockResponse');

module.exports.testNullPathRequest = function(middleware, request, response, status, data, contentType, done){
    response.on('sent', function() {
        try {
            assert.equal(response.status, status);
            assert.equal(response.data, data);
            assert.equal(response.contentType, contentType);
            done();
        } // never throw an error in this environment
        catch(err){
            done(err);
        }
    });
    middleware.request(request, response, function() {
        it('next should not be called', function() {
            assert(false);
        });
    });
}