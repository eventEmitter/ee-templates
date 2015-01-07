"use strict";

var Class   = require('ee-class'),
    Types   = require('ee-types'),
    log     = require('ee-log');

/**
 * This renderer will take care of all the type management, determine the content types and delegate
 * to an appropriate renderer.
 */
var RequestRenderer = {
    render: function(request, response, callback, next){
        var   template    = request.template || ''
            , host        = request.hostname;
    }
};

module.exports = new Class(RequestRenderer);