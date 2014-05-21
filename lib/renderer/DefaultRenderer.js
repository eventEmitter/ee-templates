"use strict";

var Class = require('ee-class');

var DefaultRenderer = {

    /**
     * todo this will be used in future to determine which renderer to use
     */
    contentTypes: ['application/json']
    , type: null

    , init: function(type){
        this.type = type;
    }

    , render: function initialize(data, callback){
        try {
            var rendered = JSON.stringify(data.content);
            callback(null, rendered, this.type);
        } catch(e) {
            callback(e, null);
        }
    }
};

module.exports = new Class(DefaultRenderer);