var assert                  = require('assert'),
    nunjucks                = require('nunjucks');

var TemplatingMiddleware    = require('../lib/TemplatingMiddleware');

var MockRequest             = require('./utils/MockRequest'),
    MockResponse            = require('./utils/MockResponse');

var loader  = new nunjucks.FileSystemLoader('./test/contents/test.ch/templates'),
    env     = new nunjucks.Environment(loader, {tags: {variableStart: '{$', variableEnd: '$}'}, dev: true});

var container = {
    get: function(key){
        return env;
    }
};

describe('Middleware', function(){
    describe('request', function(){

        var middleware = new TemplatingMiddleware(container);

        describe('text/html', function(){
            var request = new MockRequest('test.ch', 'test.nunjuck.html',
                {'accept': [
                    {key:'text', value: 'html'}
                ]}
            );

            var requestLanguage = new MockRequest('test.ch', 'test.language.nunjuck.html',
                {'accept': [
                    {key:'text', value: 'html'}
                ]}
            );

            var response = new MockResponse();
            var responseLanguage = new MockResponse();

            middleware.request(request, response, function(){
                it('should append a rendering method to the response', function(){
                    assert('render' in response);
                });

                response.render(200, 'en', {}, {ciao: 'Hallo'}, function(err){
                    it('which resolves the template and renders it', function(){
                        assert.equal(err, null);
                        assert.equal('Hallo: Test succeeded.', response.data);
                    });

                    it('should set the content type and the status correctly', function(){
                        assert.equal('text/html; charset=utf8', response.contentType);
                        assert.equal(200, response.status);
                    });
                });
            });

            middleware.request(requestLanguage, responseLanguage, function(){
                it('should append a rendering method to the response', function(){
                    assert('render' in responseLanguage);
                });

                responseLanguage.render(200, 'it', {}, {ciao: 'Hallo'}, function(err){
                    it('which resolves the template and renders it with the language available', function(){
                        assert.equal(err, null);
                        assert.equal('Hallo: Test succeeded in it.', responseLanguage.data);
                    });

                    it('should set the content type and the status correctly', function(){
                        assert.equal('text/html; charset=utf8', responseLanguage.contentType);
                        assert.equal(200, responseLanguage.status);
                    });

                    it('should set the content language correctly', function(){
                        assert.equal('it', responseLanguage.getHeader('content-language'));
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

            var response1 = new MockResponse();

            middleware.request(request1, response1, function(){
                response1.render(200, 'en', {}, {test: 'succeeded'}, function(err){
                    it('if the request has an accept value of application/json it should render it as json, and ignore the template', function(){
                        assert.equal(err, null);
                        assert.equal('{"test":"succeeded"}', response1.data);
                    });
                    it('should set the content type and the status correctly', function(){
                        assert.equal('application/json; charset=utf8', response1.contentType);
                        assert.equal(200, response1.status);
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

            var response1 = new MockResponse();

            middleware.request(request1, response1, function(){
                response1.render(200, 'en', {}, {test: 'succeeded'}, function(err){
                    it('if the request has another accept type it should fallback to json', function(){
                        assert(err==null);
                        assert.equal('{"test":"succeeded"}', response1.data);
                    });

                    it('should set the content type and the status correctly', function(){
                        assert.equal('application/json; charset=utf8', response1.contentType);
                        assert.equal(200, response1.status);
                    });
                });
            });
        });

        describe('on errors', function(){
            var request1 = new MockRequest('test.ch', 'test.nunjuck.inexistent.html',
                {'accept': [
                    {key:'text', value: 'html'}
                ]}
            );

            var response1 = new MockResponse();

            middleware.request(request1, response1, function(){
                response1.render(200, 'en', {}, {test: 'succeeded'}, function(err){
                    it('if there happens an error during the rendering it is passed to the callback', function(){
                        assert(!!err);
                    });
                    it('on error the response is equivalent to a server error', function(){
                        assert.equal(response1.status, 500);
                    });
                });
            });
        });
    });
});