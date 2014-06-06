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

    , render: function(data, callback){
        var content = data.content;
        try {
            var parsed = js2xml('root', content, {useCDATA:true});
            callback(null, parsed, this.type);
        } catch(err) {
            return callback(err, null, this.type);
        }
    }
};

module.exports = new Class(XMLRenderer);