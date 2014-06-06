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
        try {
            var rendered = JSON.stringify(data.content);
            callback(null, rendered, this.type);
        } catch(e) {
            callback(e, null);
        }
    }
};

module.exports = new Class(JSONRenderer);