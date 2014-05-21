"use strict";
var ospath = require('path');

var Class = require('ee-class');

var DefaultRenderer = require('./DefaultRenderer')
    , HTMLRenderer    = require('./HTMLRenderer');

/**
 *
 * todo: add cache
 */
var Factory = {

      dataPropertyName: null
    , container: null
    , environments: null

    , init: function initialize(container, dataPropertyName) {
        this.dataPropertyName   = dataPropertyName || 'data';
        this.container          = container;
    }

   /**
    * 1. Check for the content type, currently only
    * 2. Append a renderer to the response
    * 3. Create an internal request
    */
    , create: function(request){
        return this._createRenderer(request);
    }


    , _extractFormats: function(request){
        var accept     = request.getHeader('accept', true);

        var formats = accept.map(function(current){
            return current.key+'/'+current.value;
        });

        return formats;
    }

    , _createRenderer: function(request){
        var formats = this._extractFormats(request);
        var len         = formats.length
          , renderer    = null;

        for(var i=0;i<len;i++){
            var current = formats[i];

            switch(current){ // we need to preserve priority!
                case 'application/json':
                    return  new DefaultRenderer(current);
                case 'text/html':
                    return this._createHTMLRenderer(request);
            }
        }
        return new DefaultRenderer('application/json');
    }

    , _createHTMLRenderer: function(request){
        var host = request.hostname;
        return new HTMLRenderer(this.container.get(host), this.dataPropertyName);
    }
};

module.exports = new Class(Factory);