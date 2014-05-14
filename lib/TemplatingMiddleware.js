var log         = require('ee-log'),
    Class       = require('ee-class'),
    EventEmitter = require('ee-event-emitter');

var extensions  = require('./extensions'),
    renderer    = require('./renderer');

var TemplatingMiddleware = new Class({

    inherits: EventEmitter
    , factory: null

    , init: function initialize(container){
        this.container = container;
        this.factory = new renderer.Factory(container);
    }

    , request: function (request, response, next) {
        /**
         * todo: ensure that the template is set and create an error response if not!
         */
        var template    = request.template;

        var renderer = this.createRenderer(request);

        response.render = function (data, callback) {
            var context = {content: data, template: template};
            renderer.render(context, callback);
        };

        next();
    }

    , createRenderer: function(request){
        return this.factory.create(request);
    }
});

module.exports = TemplatingMiddleware;