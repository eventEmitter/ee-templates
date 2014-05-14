"use strict";
var ospath = require('path');

var Class = require('ee-class');

var DefaultRenderer = require('./DefaultRenderer')
    , HTMLRenderer    = require('./HTMLRenderer');

var Factory = {

    rendererCache: null
    , container: null

    , init: function initialize(container) {
        this.container = container;
        this.rendererCache = {
            items: {}
            , get: function(key){
                return this.has(key) ? this.items[key] : null;
            }

            , set: function(key, value){
                this.items[key] = value;
            }

            , has: function(key){
                return this.items.hasOwnProperty(key);
            }
        };
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
          , renderer  = null;

        for(var i=0;i<len;i++){
            var current = formats[i];

            switch(current){ // we need to preserve priority!
                case 'application/json':
                    return  new DefaultRenderer();
                case 'text/html':
                    return this._createHTMLRenderer(request);
            }
        }
        return new DefaultRenderer();
    }

    , _createHTMLRenderer: function(request){
        var host = request.hostname,
            cacheKey = host+'html';

        if(this.rendererCache.has(cacheKey)){
            return this.rendererCache.get(cacheKey);
        }

        var nunjucks    = this.container.get('nunjucks'),
            config      = this.container.get('config');

        var path     = ospath.resolve(config.get('rootFolder'), host, config.get('templateFolder'));
        var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path), config.get('nunjucks'));

        if(this.container.has('nunjucksExtensions')){
            var extensions = this.container.get('nunjucksExtensions');
            for(var name in extensions){
                env.addExtension(name, extensions[name]);
            }
        }

        var renderer = new HTMLRenderer(env);
        this.rendererCache.set(cacheKey, renderer);
        return renderer;
    }
};

module.exports = new Class(Factory);