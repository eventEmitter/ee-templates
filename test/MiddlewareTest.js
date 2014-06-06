var   assert                  = require('assert')
    , nunjucks                = require('nunjucks')
    , log                     = require('ee-log');

/**
 * We use a nunjucks environment for the tests, since this will be our rendering engine of choice.
 * The environments are injected from outside in a container. The HTML renderer chooses the environment based on
 * the current domain. During the tests we use only a single environment and can therefore use a mock container.
 */

var   TemplatingMiddleware    = require('../lib/TemplatingMiddleware')
    , loader                  = new nunjucks.FileSystemLoader('./test/contents/test.ch/templates')
    , env                     = new nunjucks.Environment(loader, {tags: {variableStart: '{$', variableEnd: '$}'}, dev: true})
    , container               = { get: function(key){ return env; }};

var   testUtils                 = require('./utils')
    , MockRequest               = testUtils.MockRequest
    , MockResponse              = testUtils.MockResponse
    , testNullPathRequest       = testUtils.testNullPathRequest;

describe('Middleware', function() {

    var   middleware        = new TemplatingMiddleware(container)

        , acceptHTML        = {'accept': [{key:'text', value: 'html'}]}
        , acceptPlaintext   = {'accept': [{key:'text', value: 'plain'}]}
        , acceptMultiple    = {'accept': [{key:'application', value: 'json'}, {key:'text', value: 'html'}]}
        , acceptNonsense    = {'accept': [{key:'application', value: 'nonsense'}]}

        , nullP             = '/null';


    describe('an unsatisfiable null path request', function(){
        var   nonsenseRequest  = new MockRequest('test.ch', '', acceptNonsense , nullP)
            , nonsenseResponse = new MockResponse();

        it('should bypass propagation and create a 406 error response', function(done){
            testNullPathRequest(middleware, nonsenseRequest, nonsenseResponse, 406, 'None of the requested accept formats can be served', null, done);
        });
    });

    describe('a null path request', function() {
        var   plainTextRequest  = new MockRequest('test.ch', '', acceptPlaintext, nullP)
            , plainTextResponse = new MockResponse();

        var   template      = 'test.nullPath.nunjuck.html'
            , htmlRequest   = new MockRequest('test.ch', template, acceptHTML, nullP)
            , htmlResponse  = new MockResponse();

        it('should bypass propagation and create appropriate response', function(done){
            testNullPathRequest(middleware, plainTextRequest, plainTextResponse, 200, '', 'text/plain; charset=utf-8', done);
        });

        it('should bypass propagation and render', function(done){
            testNullPathRequest(middleware, htmlRequest, htmlResponse, 200, '<h1>Nullpath</h1>', 'text/html; charset=utf-8', done);
        });
    });

    describe('request', function(){
        describe('text/html', function(){
            var   request   = new MockRequest('test.ch', 'test.nunjuck.html', acceptHTML)
                , response  = new MockResponse();

            var   requestLanguage   = new MockRequest('test.ch', 'test.language.nunjuck.html', acceptHTML)
                , responseLanguage  = new MockResponse();

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
                        assert.equal('text/html; charset=utf-8', response.contentType);
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
                        assert.equal('text/html; charset=utf-8', responseLanguage.contentType);
                        assert.equal(200, responseLanguage.status);
                    });

                    it('should set the content language correctly', function(){
                        assert.equal('it', responseLanguage.getHeader('content-language'));
                    });
                });
            });
        });

        describe('application/json', function(){
            var   requestJSONHTML   = new MockRequest('test.ch', 'test.nunjuck.html', acceptMultiple)
                , responseJSONHTML  = new MockResponse();

            middleware.request(requestJSONHTML, responseJSONHTML, function(){
                responseJSONHTML.render(200, 'en', {}, {test: 'succeeded'}, function(err){
                    it('if the request has an accept value of application/json it should render it as json, and ignore the template', function(){
                        assert.equal(err, null);
                        assert.equal('{"test":"succeeded"}', responseJSONHTML.data);
                    });
                    it('should set the content type and the status correctly', function(){
                        assert.equal('application/json; charset=utf-8', responseJSONHTML.contentType);
                        assert.equal(200, responseJSONHTML.status);
                    });
                });
            });
        });

        describe('text/plain', function(){
            var   requestPlaintext  = new MockRequest('test.ch', 'test.nunjuck.html', acceptPlaintext)
                , responsePlaintext = new MockResponse();

            middleware.request(requestPlaintext, responsePlaintext, function(){
                responsePlaintext.render(200, 'en', {}, {test: 'succeeded'}, function(err){
                    it('if the generated data is an object it should be rendered as json', function(){
                        assert(err==null);
                        assert.equal('{"test":"succeeded"}', responsePlaintext.data);
                    });

                    it('should set the content type and the status correctly', function(){
                        assert.equal('text/plain; charset=utf-8', responsePlaintext.contentType);
                        assert.equal(200, responsePlaintext.status);
                    });
                });
            });
        });

        describe('on errors', function(){
            var   errorRequest  = new MockRequest('test.ch', 'test.nunjuck.inexistent.html', acceptHTML)
                , errorResponse = new MockResponse();

            middleware.request(errorRequest, errorResponse, function(){
                errorResponse.render(200, 'en', {}, {test: 'succeeded'}, function(err){
                    it('if there happens an error during the rendering it is passed to the callback', function(){
                        assert(!!err);
                    });
                    it('on error the response is equivalent to a server error', function(){
                        assert.equal(errorResponse.status, 500);
                    });
                });
            });
        });
    });
});