"use strict";

var Class = require('ee-class');

var HTMLRenderer = {
    env: null

    , init: function initialize(env) {
        this.env = env;
    }

    , render: function(data, callback){
        /**
         * todo: remove the try catch block as soon as we are sure the rendering does not throw errors anymore (nunjucks)
         */
        try {
            this.env.render(data.template, data.content, callback);
        } catch(error){
            callback(error, null);
        }
    }
};

module.exports = new Class(HTMLRenderer);