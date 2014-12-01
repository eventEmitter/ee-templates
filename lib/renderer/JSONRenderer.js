"use strict";

var Class   = require('ee-class'),
    Types   = require('ee-types'),
    log     = require('ee-log');

var AbstractRenderer = require('./AbstractRenderer');

var JSONRenderer = {

      inherits: AbstractRenderer

    , init: function initialize() {
        initialize.super.call(this, 'application', 'json');
    }

    , render: function (data, callback) {
        var rendered;
        try {
            rendered = JSON.stringify(data.content);
        } catch(e) {
            return callback(e, null);
        }
        callback(null, rendered, this.type);
    }
};

module.exports = new Class(JSONRenderer);