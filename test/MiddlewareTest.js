var assert                  = require('assert');

var TemplatingMiddleware    = require('../lib/TemplatingMiddleware'),
    container               = require('../dependencies');

var MockRequest             = require('./utils/MockRequest');

/**
 * Modify the config to fit the test environment.
 */

container.get('config').set('rootFolder', 'test/contents');

describe('Middleware', function(){
    describe('request', function(){

        var middleware = new TemplatingMiddleware(container);

        describe('text/html', function(){
            var request = new MockRequest('test.ch', 'test.nunjuck.html',
                {'accept': [
                    {key:'text', value: 'html'}
                ]}
            );

            var response = {};
            middleware.request(request, response, function(){
                it('should append a rendering method to the response', function(){
                    assert('render' in response);
                });

                response.render({ciao: 'Hallo'}, function(err, result){
                    it('which resolves the template and renders it', function(){
                        assert(err==null);
                        assert.equal('Hallo: Test succeeded.', result);
                    });
                });
            });
        });

        describe('application/json', function(){
            var request1 = new MockRequest('test.ch', 'test.nunjuck.html',
                {'accept': [
                    {key:'application', value: 'json'},
                    {key:'text', value: 'html'}
                ]}
            );

            var response1 = {};

            middleware.request(request1, response1, function(){
                response1.render({test: 'succeeded'}, function(err, result){
                    it('if the request has an accept value of application/json it should render it as json, and ignore the template', function(){
                        assert(err==null);
                        assert.equal('{"test":"succeeded"}', result);
                    });
                });
            });
        });

        describe('text/plain', function(){
            var request1 = new MockRequest('test.ch', 'test.nunjuck.html',
                {'accept': [
                    {key:'text', value: 'plain'}
                ]}
            );

            var response1 = {};

            middleware.request(request1, response1, function(){
                response1.render({test: 'succeeded'}, function(err, result){
                    it('if the request has another accept type it should fallback to json', function(){
                        assert(err==null);
                        assert.equal('{"test":"succeeded"}', result);
                    });
                });
            });
        });
    });
});