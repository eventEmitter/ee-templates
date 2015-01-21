"use strict";

var   log         = require('ee-log')
    , Class       = require('ee-class')
    , argv        = require('ee-argv')
    , Types       = require('ee-types')
    , EventEmitter = require('ee-event-emitter')

    , RendererFactory = require('./RendererFactory');

/**
 * The renderers should now be able to render status dependent templates.
 * But there is a problem: if the renderer itself creates the error (as it happens with nunjucks) we have to re-render
 * the response (which could again trigger errors).
 */
var TemplatingMiddleware = module.exports = new Class({

      inherits      : EventEmitter
    , factory       : null
    , container     : null
    , environments  : null
    , nullPath      : '/null'

    , init: function initialize(environments){

        this.environments   = environments;
        this.factory        = new RendererFactory(environments);
        this.env            = 'dev';


        if (argv.has('testing'))    this.env = 'testing';
        if (argv.has('live'))       this.env = 'live';
        if (argv.has('staging'))    this.env = 'staging';
    }

    /**
     * Its now up to the rewriting to bind the default template to state 200.
     * For backwards compatibility we check if its already a string.
     */
    , createContext : function(request, content, status) {
        return {
              content  : content || ''
            , status   : status
            , template : this.resolveTemplate(request, status)
            , language : request.language
            , host     : request.hostname
            , path     : request.pathname
            , ip       : request.ip
            , env      : this.env
        };
    }

    , mergeHeaders : function(basic, additional){
        return Object.keys(additional || {}).reduce(function(target, key){
            target[key] = additional[key];
            return target;
        }, basic);
    }

    , createRenderingCallback : function(response, status, headers, callback){
        return function(err, content, type){
            // ensure the callback function
            var cb = Types.function(callback)
                        ? callback
                        : function(err) {
                            if (err) {
                                log.warn('Failed to render template:')
                                return log(err);
                            }
                        };

            if(err){
                response.setContentType('text/plain; charset=utf-8');
                response.send(500, err.message);
                return cb(err);
            }

            if(response.isSent) return log.wtf('Tried to send the response twice.');

            response.setContentType(type+'; charset=utf-8');
            response.setHeaders(headers);
            response.send(status, content);

            return cb();

        };
    }

    /**
     * Resolves the template if given by the rewrites.
     * For backwards compatibility we also handle simple strings.
     */
    , resolveTemplate: function(request, state){
        var template = request.template;
        if(template){
            if(Types.string(template))              return template;
            if(Types.function(template['resolve'])) return template.resolve(state);
            if(Types.string(template[state]))       return template[state];
            return template[200];
        }
        return template;
    }

    /**
     * @todo: simplify the rendering method signature by writing the necessary information on the response upfront
     */
    , request: function (request, response, next) {

        var   path        = request.pathname
            , lang        = request.language
            , renderer    = this.factory.createFromRequest(request)
            , baseHeaders = {
                'content-language' : lang
            };

        if(renderer === null) {
            response.setContentType('text/plain; charset=utf-8');
            return response.send(406, 'None of the requested accept formats can be served');
        }

        // interrupts middleware propagation
        if(path == this.nullPath){
            var   state     = 200
                , context   = this.createContext(request, '', state);
            return renderer.render(context, this.createRenderingCallback(response, state, baseHeaders));
        }

        response.render = function (status, language, headers, data, callback) {

            if(language){
                request.language = language;
                baseHeaders['content-language'] = language;
            }

            var   context       = this.createContext(request, data, status)
                , contentType   = headers['content-type'];

            delete headers['content-type'];

            headers = this.mergeHeaders(baseHeaders, headers);

            // check if the service has overwritten the content type and chose a new renderer
            if(contentType && contentType !== renderer.type){
                var newRenderer = this.factory.createFromContentType(contentType);
                if(newRenderer === null){
                    response.setContentType('text/plain; charset=utf-8');
                    return response.send(406, 'None of the requested accept formats can be served');
                }
                renderer = newRenderer;
            }

            renderer.render(context, this.createRenderingCallback(response, status, headers, callback));
        }.bind(this);

        next();
    }
});