"use strict";

var   Class   = require('ee-class')
    , Types   = require('ee-types')
    , log     = require('ee-log');

var AbstractRenderer = require('./AbstractRenderer');

var StringRenderer = {

      inherits: AbstractRenderer

    , render: function initialize(data, callback) {
        var stringified;

        if(Types.string(data.content) || Types.buffer(data.content)) {
            stringified = data.content;
        } else {
            try {
                stringified = JSON.stringify(data.content);
            } catch(e) {
                return callback(e, null);
            }
        }
        callback(null, stringified, this.type);
    }
};

module.exports = new Class(StringRenderer);