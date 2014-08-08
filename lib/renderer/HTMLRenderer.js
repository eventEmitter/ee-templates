"use strict";

var Class   = require('ee-class'),
    Types   = require('ee-types'),
    log     = require('ee-log');

var AbstractRenderer = require('./AbstractRenderer');

/**
 * The renderer should be able to intersect the propagation?
 */
var HTMLRenderer = {

      inherits: AbstractRenderer
    , container: null

    , init: function initialize(container, dataPropertyName) {
        initialize.super.call(this, 'text', 'html');
        this.container      = container;
        this.propertyName   = dataPropertyName;
    }

    /**
     * todo: remove the try catch block as soon as we are sure the rendering does not throw errors anymore (nunjucks)
     * todo: try to find a better solution for the data assignment!!
     */
    , render: function(data, callback) {
        var env = this.container.get(data.host);
        var ctx = {};
        if(!!this.propertyName){
            ctx[this.propertyName] = data.content;
        }
        else {
            ctx = data.content;
        }

        ctx.language = data.language;
        ctx.hostname = data.host;
        ctx.env      = data.env;

        try {
            env.render(data.template, ctx, function(err, content){
                log(err);
                // Template not found errors and functional errors -> 500
                return callback(err, content, this.type);
            }.bind(this));
        } catch(error){
            // EISDIR, no template was set ... -> 404
            // Template, render error (there was a syntax error in the template)
            callback(error, null);
        }
    }
};

module.exports = new Class(HTMLRenderer);