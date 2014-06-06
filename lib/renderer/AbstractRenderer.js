"use strict";

var   Class = require('ee-class')
    , Types = require('ee-types')
    , log   = require('ee-log');

var AbstractRenderer = {

      supertype: null
    , subtype: null
    , type: {
        get: function(){
            return this.supertype+'/'+this.subtype;
        }
      }

    , init: function (supertype, subtype) {
        this.supertype  = supertype;
        this.subtype    = subtype;
      }

    , render: function(data, callback){
        throw new Error('Uninmplemented Render Method');
      }
};

module.exports = new Class(AbstractRenderer);