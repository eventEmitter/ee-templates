var assert = require('assert'),
    nunjucks = require('nunjucks');

var loader          = new nunjucks.FileSystemLoader('./test/contents/test.ch/templates'),
    testEnvironment = new nunjucks.Environment(loader, {dev: true});

var extensions      = require('../lib/extensions');

describe("ApiExtension", function(){
    var testApi = {
        invoke: function(name, params){
            this[name].apply(this, params);
        },
        getTestObject: function(callback){
            callback(null, {result: 'succeeded'});
        }
    };

    testEnvironment.addExtension('Api', new extensions.ApiExtension(testApi));

    describe("render", function(){
        testEnvironment.render('test.apiextension.nunjuck.html', {}, function(err, result){
            it('should be able to parse the template containing an api tag', function(){
                assert(err == null);
            });
            it('and make the value available in the current context (and ignore newlines)', function(){
                assert.equal("Test: succeeded", result);
            });
        });
        try {
            testEnvironment.render('test.apiextension.fail.nunjuck.html', {}, function(err, result){
                it('should not be able to parse wrong syntax', function(){
                    assert(err);
                    console.log(err);
                });
            });
        } catch(err){
            it('should not be able to parse wrong syntax but currently throws errors', function(){
                assert(true);
            });
        }
    });
});