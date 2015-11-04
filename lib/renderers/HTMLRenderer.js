"use strict";

var Class   = require('ee-class'),
    Types   = require('ee-types'),
    log     = require('ee-log');

var AbstractRenderer = require('./AbstractRenderer');

/**
 * The renderer should be able to intersect the propagation?
 *
 * @todo: template loading and rendering should be separated
 * @todo: remove the try catch block as soon as we are sure the rendering does not throw errors anymore (nunjucks)
 * @todo: try to find a better solution for the data assignment!!
 */
var HTMLRenderer = module.exports = new Class({

      inherits: AbstractRenderer
    , container: null

    , init: function initialize(container, dataPropertyName) {
        initialize.super.call(this, 'text', 'html');
        this.container      = container;
        this.propertyName   = dataPropertyName;
    }

    , resolveTemplate: function(template, status){
        if(template && !Types.string(template)){
            template = Types.string(template[status]) ? template[status] : template[200];
        }
        return template;
    }

    , render: function(data, callback) {

        var   env       = this.container.get(data.host)
            , ctx       = {};

        if(!!this.propertyName){
            ctx[this.propertyName] = data.content;
        } else {
            ctx = data.content;
        }

        ctx.language  = data.language;
        ctx.languages = data.languages;
        ctx.hostname  = data.host;
        ctx.env       = data.env;
        ctx.ip        = data.ip;
        ctx.status    = data.status;
        ctx.path      = data.path;
        ctx.query     = data.query;

        // need to remove leading slash
        if (typeof data.template === 'string' && data.template.length && data.template[0] === '/') data.template = data.template.substr(1);

        try {
            env.render(data.template, ctx, function(err, content){
                return callback(err, content, this.type);
            }.bind(this));
        } catch(error){
            if(error.code == 'EISDIR'){
                error.code = 'NOT_FOUND';
                error.message = 'Template not found';
            }
            callback(error, null, this.type);
        }
    }
});
