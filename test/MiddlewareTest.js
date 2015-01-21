var   assert                  = require('assert')
    , nunjucks                = require('nunjucks')
    , log                     = require('ee-log');

/**
 * We use a nunjucks environment for the tests, since this will be our rendering engine of choice.
 * The environments are injected from outside in a container. The HTML renderer chooses the environment based on
 * the current domain. During the tests we use only a single environment and can therefore use a mock container.
 */

var   testUtils                 = require('./utils')
    , MockRequest               = testUtils.MockRequest
    , MockResponse              = testUtils.MockResponse
    , testNullPathRequest       = testUtils.testNullPathRequest;

var   TemplatingMiddleware    = require('../lib/TemplatingMiddleware')
    , env                     = testUtils.NunjucksTestEnvironment
    , container               = { get: function(key){ return env; }};

describe('Middleware', function() {

    var   middleware        = new TemplatingMiddleware(container)

        , acceptHTML        = {'accept': [{key:'text', value: 'html'}]}
        , acceptPlaintext   = {'accept': [{key:'text', value: 'plain'}]}
        , acceptCSV         = {'accept': [{key:'text', value: 'csv'}]}
        , acceptXML         = {'accept': [{key:'text', value: 'xml'}]}
        , acceptAppXML      = {'accept': [{key:'application', value: 'xml'}]}
        , acceptMultiple    = {'accept': [{key:'application', value: 'json'}, {key:'text', value: 'html'}]}
        , acceptNonsense    = {'accept': [{key:'application', value: 'nonsense'}]}

        , nullP             = '/null';

    var complexObject       = {
          name: function(){
            return 'wayne';
          }
        , firstName: 'john'
        , age: 200
        , beatsChuckNorris: true
        , friends: [
            {
                fullname: "chuck norris"
                , id: 1
            }
            , {
                fullname: "captain future"
                , id: 3
            }
        ]
        , sexRatio: 100.3
    };


    describe('an unsatisfiable request', function(){
        var   nonsenseRequest  = new MockRequest('test.ch', '', acceptNonsense , nullP)
            , nonsenseResponse = new MockResponse();

        var   nonsenseRequestWithPath  = new MockRequest('test.ch', '', acceptNonsense , '/patho')
            , nonsenseResponseWithPath = new MockResponse();

        it('should bypass propagation and create a 406 error response on null paths', function(done){
            testNullPathRequest(middleware, nonsenseRequest, nonsenseResponse, 406, 'None of the requested accept formats can be served', 'text/plain; charset=utf-8', done);
        });

        it('should bypass propagation and create a 406 error response', function(done){
            testNullPathRequest(middleware, nonsenseRequestWithPath, nonsenseResponseWithPath, 406, 'None of the requested accept formats can be served', 'text/plain; charset=utf-8', done);
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

            var   requestHeader   = new MockRequest('test.ch', 'test.nunjuck.html', acceptHTML)
                , responseHeader  = new MockResponse();

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

            middleware.request(requestHeader, responseHeader, function(){
                it('should append a rendering method to the response', function(){
                    assert('render' in responseHeader);
                });

                var headers = {};
                headers['content-type'] = 'application/json';
                it('if the service sets a content-type header the rendering should respect that but not set the wrong type', function(done){
                    responseHeader.render(200, 'it', headers, {ciao: 'Hallo'}, function(err){
                            assert.equal('{"ciao":"Hallo"}', responseHeader.data);
                            done(err);
                    });
                });
            });
        });

        describe('text/html with status codes', function(){

            var   request   = new MockRequest('test.ch', {'300' : 'test.nunjuck.html', }, acceptHTML, '/')
                , response  = new MockResponse();

            var   requestWithResolver   = new MockRequest('test.ch', {
                    resolve: function(state){
                        if(state == 404) return 'test.404.nunjuck.html';
                    }
                }, acceptHTML, '/uuuh')
                , responseWithResolver  = new MockResponse();

            var   requestWithFallback   = new MockRequest('test.ch', {'200' : 'test.fallback.nunjuck.html' }, acceptHTML, '/')
                , responseWithFallback  = new MockResponse();

            var   requestWithoutTemplate   = new MockRequest('test.ch', {}, acceptHTML, '/')
                , responseWithoutTemplate  = new MockResponse();


            middleware.request(request, response, function(){
                it('should append a rendering method to the response', function(){
                    assert('render' in response);
                });

                response.render(300, 'en', {}, {ciao: 'Hallo'}, function(err){
                    it('which resolves the template assigned to the state and renders it', function(){
                        assert.equal(err, null);
                        assert.equal('Hallo: Test succeeded.', response.data);
                    });

                    it('should set the content type and the status correctly', function(){
                        assert.equal('text/html; charset=utf-8', response.contentType);
                        assert.equal(300, response.status);
                    });
                });
            });

            middleware.request(requestWithResolver, responseWithResolver, function(){
                responseWithResolver.render(404, 'en', {}, {name: 'Jonny'}, function(err){
                    it('should call the resolve method on the template if present and pass the status code', function(){
                        assert.equal(err, null);
                        assert.equal('404 : Oooh Jonny you broke the internet.', responseWithResolver.data);
                    });

                    it('should set the content type and the status correctly', function(){
                        assert.equal('text/html; charset=utf-8', responseWithResolver.contentType);
                        assert.equal(404, responseWithResolver.status);
                    });
                });
            });

            middleware.request(requestWithFallback, responseWithFallback, function(){
                responseWithFallback.render(404, 'en', {}, {name: 'Jonny'}, function(err){
                    it('should call the resolve method on the template if present', function(){
                        assert.equal(err, null);
                        assert.equal('Fallum Backum.', responseWithFallback.data);
                    });

                    it('should set the content type and the status correctly', function(){
                        assert.equal('text/html; charset=utf-8', responseWithFallback.contentType);
                        assert.equal(404, responseWithFallback.status);
                    });
                });
            });

            middleware.request(requestWithoutTemplate, responseWithoutTemplate, function(){
                responseWithoutTemplate.render(200, 'en', {}, {name: 'Jonny'}, function(err){
                    it('creates an error if there is no template present', function(){
                        assert(err);
                    });

                    it('and sets an error state', function(){
                        assert.equal('text/plain; charset=utf-8', responseWithoutTemplate.contentType);
                        assert.equal(500, responseWithoutTemplate.status);
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

        describe('text/xml', function(){
            var   requestXML   = new MockRequest('test.ch', '', acceptXML)
                , responseXML  = new MockResponse();

            middleware.request(requestXML, responseXML, function(){
                it('should append a rendering method to the response', function(){
                    assert('render' in responseXML);
                });

                var expected = '<?xmlversion="1.0"encoding="UTF-8"?><root><name><![CDATA[wayne]]></name><firstName><![CDATA[john]]></firstName><age><![CDATA[200]]></age><beatsChuckNorris><![CDATA[true]]></beatsChuckNorris><friends><fullname><![CDATA[chucknorris]]></fullname><id><![CDATA[1]]></id></friends><friends><fullname><![CDATA[captainfuture]]></fullname><id><![CDATA[3]]></id></friends><sexRatio><![CDATA[100.3]]></sexRatio></root>';

                it('should create xml', function(done){
                    responseXML.render(200, 'it', {}, complexObject, function(err){
                        assert.equal(expected, responseXML.data.replace(/\s*/g, ''));
                        done(err);
                    });
                });

                it('and set the content type accordingly', function(){
                    assert.equal('text/xml; charset=utf-8', responseXML.contentType);
                    assert.equal(200, responseXML.status);
                });
            });
        });

        describe('application/xml', function(){
            var   requestXML   = new MockRequest('test.ch', '', acceptAppXML)
                , responseXML  = new MockResponse();

            middleware.request(requestXML, responseXML, function(){
                it('should append a rendering method to the response', function(){
                    assert('render' in responseXML);
                });

                var expected = '<?xmlversion="1.0"encoding="UTF-8"?><root><name><![CDATA[wayne]]></name><firstName><![CDATA[john]]></firstName><age><![CDATA[200]]></age><beatsChuckNorris><![CDATA[true]]></beatsChuckNorris><friends><fullname><![CDATA[chucknorris]]></fullname><id><![CDATA[1]]></id></friends><friends><fullname><![CDATA[captainfuture]]></fullname><id><![CDATA[3]]></id></friends><sexRatio><![CDATA[100.3]]></sexRatio></root>';

                it('should create xml', function(done){
                    responseXML.render(200, 'it', {}, complexObject, function(err){
                        assert.equal(expected, responseXML.data.replace(/\s*/g, ''));
                        done(err);
                    });
                });

                it('and set the content type accordingly', function(){
                    assert.equal('application/xml; charset=utf-8', responseXML.contentType);
                    assert.equal(200, responseXML.status);
                });
            });
        });

        describe('text/csv', function(){
            var   requestCSV   = new MockRequest('test.ch', '', acceptCSV)
                , responseCSV  = new MockResponse();

            middleware.request(requestCSV, responseCSV, function(){
                it('should append a rendering method to the response', function(){
                    assert('render' in responseCSV);
                });

                var expected = 'name,friends,age,sexy,bag\nJohn,"[""Chuck"",""Arnold""]",100,false,"{""full"":false}"\nBetty,"[""Jenna"",""Gina""]",20,true,"{""full"":true}"';

                it('should fail if csv contains functions', function(done){
                    responseCSV.render(200, 'it', {}, complexObject, function(err){
                        assert(err);
                        assert.equal(responseCSV.status, 500);
                        responseCSV.isSent = false;
                        done();
                    });
                });

                it('should fail if csv contains literals', function(done){
                    responseCSV.render(200, 'it', {}, [ null, 'one', 1, true, null ], function(err){
                        assert(err);
                        assert.equal(responseCSV.status, 500);
                        responseCSV.isSent = false;
                        done();
                    });
                });

                it('should skip buffers', function(done){
                    responseCSV.render(200, 'it', {}, new Buffer('hello world'), function(err){
                        assert.equal(responseCSV.data, 'hello world');
                        assert.equal(200, responseCSV.status);
                        responseCSV.isSent = false;
                        done(err);
                    });
                });

                it('should skip strings as well', function(done){
                    responseCSV.render(200, 'it', {}, 'hello world', function(err){
                        assert.equal(responseCSV.data, 'hello world');
                        assert.equal(200, responseCSV.status);
                        responseCSV.isSent = false;
                        done(err);
                    });
                });

                it('should create csvs if possible', function(done){
                    responseCSV.render(200, 'it', {}, [
                        {
                              name      : 'John'
                            , friends   : ['Chuck', 'Arnold']
                            , age       : 100
                            , sexy      : false
                            , bag       : { full: false }
                        }
                        ,
                        {
                              name      : 'Betty'
                            , friends   : ['Jenna', 'Gina']
                            , age       : 20
                            , sexy      : true
                            , bag       : { full: true }
                        }
                    ], function(err){
                        assert.equal(responseCSV.data, expected);
                        assert.equal(200, responseCSV.status);
                        responseCSV.isSent = false;
                        done(err);
                    });
                });

                it('and set the content type accordingly', function(){
                    assert.equal('text/csv; charset=utf-8', responseCSV.contentType);
                    assert.equal(200, responseCSV.status);
                });
            });
        });

        describe('on errors', function(){
            var   errorRequest  = new MockRequest('test.ch', 'test.nunjuck.inexistent.html', acceptHTML)
                , errorResponse = new MockResponse();

            middleware.request(errorRequest, errorResponse, function(){
                errorResponse.render(200, 'en', {}, {test: 'succeeded'}, function(err){
                    it('if there happens an error during the rendering it is passed to the callback', function(){
                        assert(err);
                    });
                    it('on error the response is equivalent to a server error', function(){
                        assert.equal(errorResponse.status, 500);
                    });
                });
            });
        });
    });
});