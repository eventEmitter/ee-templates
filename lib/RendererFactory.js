"use strict";

var Class = require('ee-class');

var rendering = require('./renderers');

var RendererFactory = module.exports = new Class({

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
    /**
     * Returns the first renderer matching the accept header (or null).
     * @param request
     */
    , createFromRequest: function(request){

        var   formats   = this._extractFormats(request);

        for(var i = 0; i<formats.length ; i++) {
            var   format    = formats[i]
                , renderer  = this._getByContentType(format.supertype, format.subtype);

            if(renderer) return renderer;
        }

        return null;
    }

    , createFromContentType: function(contentType){

        var   splitTypes    = contentType.split('/')
            , supertype     = splitTypes.shift()
            , subtype       = splitTypes.shift();

        return this._getByContentType(supertype, subtype);
    }

    , _getByContentType: function(supertype, subtype){
        if(supertype in this.renderers && subtype in this.renderers[supertype]){
            return this.renderers[supertype][subtype];
        }
        return null;
    }

    , create: function(request, type, subtype) {
        return this._createRenderer(request, type, subtype);
    }


    , _extractFormats: function(request){
        var acceptHeaders = request.getHeader('accept', true);
        return acceptHeaders.map(function(current) {

                var   supertype   = (current.key == '*') ? 'all' : current.key
                    , subtype     = (current.value == '*') ? 'all' : current.value;

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
});