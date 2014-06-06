"use strict";

var   Class   = require('ee-class')
    , Types   = require('ee-types')
    , log     = require('ee-log');

var AbstractRenderer = require('./AbstractRenderer');

var StringRenderer = {

      inherits: AbstractRenderer

    , render: function initialize(data, callback) {
        try {
            if(Types.string(data.content) || Types.buffer(data.content)) {
                return callback(null, data.content, this.type);
            }

            return callback(null, JSON.stringify(data.content), this.type);
        } catch(e) {
            callback(e, null);
        }
    }
};

module.exports = new Class(StringRenderer);