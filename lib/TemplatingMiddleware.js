var log         = require('ee-log'),
    Class       = require('ee-class'),
    EventEmitter = require('ee-event-emitter');

var extensions  = require('./extensions'),
    rendering   = require('./renderer');

var TemplatingMiddleware = new Class({

      inherits: EventEmitter
    , factory: null
    , container: null
    , environments: null
    , nullPath: '/null'

    , init: function initialize(environments){
        this.environments   = environments;
        this.factory        = new rendering.Factory(environments);
    }

    , request: function (request, response, next) {
        // if type and subtypes are set, then try to get an appropriate renderer
        //    if the returned renderer is null, then send a 406
        // if not, then get the first renderer which matches the accept headers of the request

        // getRenderer(request, type, subtype)

        var path        = request.pathname,
            template    = request.template || '',
            renderer    = this.createRenderer(request),
            language    = request.language;

        if(renderer === null){
            return response.send(406, 'None of the requested accept formats can be served');
        }

        if(path == this.nullPath){
            var context  = {content: '', template: template, language:language, host: request.hostname};

            renderer.render(context, function(err, content, type){

                // if the renderer created an error send it back to the client
                if(err){
                    return this.send(500, err.message);
                }

                // otherwise set the passed headers and content type
                this.setContentType(type+'; charset=utf-8');
                this.setHeader('content-language', language);

                // and send it back to the client
                this.send(200, content);
            }.bind(response));

            // bypass the middleware propagation
            return;
        }

        /**
         * todo: simplify this interface!
         * proposal:
         *
         * function render(internalResponse, callback){
         *      the headers can be taken from the internal response
         *      the content type too if set
         *      the status mapping has to be done upfront simplified
         *      the language is determined by a middleware and should be available
         * }
         */

        response.render = function (status, language, headers, data, callback) {
            // create a context which should be sufficient for all renderers
            var context = {content: data, template: template, language:language, host: request.hostname};
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

    , createRenderer: function(request, type, subtype){
        return this.factory.create(request, type, subtype);
    }
});

module.exports = TemplatingMiddleware;