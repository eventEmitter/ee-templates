"use strict";

var Class = require('ee-class');

var rendering = require('./index');

/**
 * todo: add cache
 */
var Factory = {

      dataPropertyName: null
    , container: null
    , environments: null

    , init: function initialize(container, dataPropertyName) {
        this.dataPropertyName   = dataPropertyName || 'data';
        this.container          = container;
        this.renderers          = this._createRenderers();
    }

    , _createRenderers: function(){
        return {
            application: {
                  json  : new rendering.JSONRenderer()
                , xml   : new rendering.XMLRenderer('application', 'xml')
                , all   : new rendering.DefaultRenderer('application', 'json')
            }
            , image: {
                  png   : new rendering.DefaultRenderer('image', 'png')
                , jpg   : new rendering.DefaultRenderer('image', 'jpg')
                , jpeg  : new rendering.DefaultRenderer('image', 'jpeg')
                , webp  : new rendering.DefaultRenderer('image', 'webp')
                , tiff  : new rendering.DefaultRenderer('image', 'tiff')
                , all   : new rendering.DefaultRenderer('image', '*')
            }

            , text: {
                  plain : new rendering.DefaultRenderer('text', 'plain')
                , xml   : new rendering.XMLRenderer()
                , csv   : new rendering.CSVRenderer()
                , html  : new rendering.HTMLRenderer(this.container, this.dataPropertyName)
                , all   : new rendering.DefaultRenderer('text', '*')
            }
            , all: {
                all     : new rendering.DefaultRenderer('*', '*')
            }
        };
    }

    , create: function(request, type, subtype) {
        return this._createRenderer(request, type, subtype);
    }


    , _extractFormats: function(request){
        var acceptHeaders = request.getHeader('accept', true);
        return acceptHeaders.map(function(current) {
                var supertype = (current.key == '*') ? 'all' : current.key,
                    subtype = (current.value == '*') ? 'all' : current.value;

                return { supertype: supertype, subtype: subtype };
            });
    }

    , _createRenderer: function(request, type, subtype){
        var formats     = this._extractFormats(request);

        var   len         = formats.length
            , renderer    = null
            , renderers = this.renderers;

        // get requested renderer
        if(type && subtype){
            if(type in renderers && subtype in renderers[type]){
                return renderers[type][subtype];
            }
            return null;
        }

        // get first matching renderer
        for(var i = 0; i<len ; i++) {
            var format = formats[i];
            if(format.supertype in renderers){
                if(format.subtype in renderers[format.supertype]){
                    renderer = renderers[format.supertype][format.subtype];
                    break;
                }
            }
        }

        return renderer;
    }
};

module.exports = new Class(Factory);