"use strict";

var Class = require('ee-class');

var DefaultRenderer = {
    render: function initialize(data, callback){
        try {
            var rendered = JSON.stringify(data.content);
            callback(null, rendered);
        } catch(e) {
            callback(e, null);
        }
    }
};

module.exports = new Class(DefaultRenderer);