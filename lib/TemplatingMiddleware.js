var log         = require('ee-log'),
    Class       = require('ee-class'),
    EventEmitter = require('ee-event-emitter');

var extensions  = require('./extensions'),
    renderer    = require('./renderer');

var TemplatingMiddleware = new Class({

    inherits: EventEmitter
    , factory: null
    , container: null
    , environments: null

    , init: function initialize(environments){
        this.environments   = environments;
        this.factory        = new renderer.Factory(environments);
    }

    , request: function (request, response, next) {

        // to set the template to and empty string will trigger a rendering error for text/html, which is fine
        var template    = request.template || '',
            renderer    = this.createRenderer(request);

        response.render = function (status, language, headers, data, callback) {
            // create a context which should be sufficient for all renderers
            var context = {content: data, template: template, language:language};
            // apply the rendering
            renderer.render(context, function(err, content, type){

                // if the renderer created an error send it back to the client
                if(err){
                    this.send(500, err.message);
                    return callback(err);
                }

                // otherwise set the passed headers and content type
                this.setContentType(type+'; charset=utf-8');
                this.setHeaders(headers || {});
                this.setHeader('content-language', language);

                // and send it back to the client
                this.send(status, content);
                callback();
            }.bind(this));
        }.bind(response);

        next();
    }

    , createRenderer: function(request){
        return this.factory.create(request);
    }
});

module.exports = TemplatingMiddleware;