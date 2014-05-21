"use strict";

var Class = require('ee-class');

var HTMLRenderer = {

    env: null

    , init: function initialize(env, dataPropertyName) {
        this.env = env;
        this.propertyName = dataPropertyName;
    }

    , render: function(data, callback){
        /**
         * todo: remove the try catch block as soon as we are sure the rendering does not throw errors anymore (nunjucks)
         * todo: try to find a better solution for the data assignment!!
         */
        var ctx = {};
        if(!!this.propertyName){
            ctx[this.propertyName] = data.content;
        } else {
            ctx = data.content;
        }

        try {
            this.env.render(data.template, ctx, function(err, content){
                return callback(err, content, 'text/html');
            });
        } catch(error){
            callback(error, null);
        }
    }
};

module.exports = new Class(HTMLRenderer);