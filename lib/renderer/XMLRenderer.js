"use strict";

var Class               = require('ee-class')
    , Types             = require('ee-types')
    , log               = require('ee-log')
    , AbstractRenderer  = require('./AbstractRenderer')
    , js2xml            = require('js2xmlparser');

var XMLRenderer = {
      inherits: AbstractRenderer

    , init: function initialize(type, subtype) {
        type = type || 'text';
        subtype = subtype || 'xml';
        initialize.super.call(this, type, subtype);
    }

    , render: function(data, callback) {
        var content = data.content;

        if (Types.string(content)) {
            return callback(null, content, this.type);
        }

        var parsed;
        try {
            parsed = js2xml('root', content, {useCDATA:true, wrapArray: {enabled: true}});
        } catch (err){
            return callback(err, null, this.type);
        }
        callback(null, parsed, this.type);
    }
};

module.exports = new Class(XMLRenderer);