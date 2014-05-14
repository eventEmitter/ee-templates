"use strict";

var log         = require('ee-log'),
    Class       = require('ee-class'),
    EventEmitter = require('ee-event-emitter'),
    nunjucks    = require('nunjucks');

var extensions  = require('./lib/extensions'),
    renderer    = require('./lib/renderer'),
    Container   = require('./lib/utils/Container'),
    config      = require('./config');

/**
 * todo: implement them!
 */
var api = {
    invoke: function(name, args){
        this[name].apply(this, args);
    }

    , getUser: function(callback){
        callback(null, {name:'fucker'});
    }
};

var locales = {
    get: function(key, language, parameters){
        return language+" : "+key;
    }
};

module.exports = new Container({
    nunjucks:               require('nunjucks')
    , nunjucksBaseContext:  {}
    , nunjucksExtensions:   {
        ApiExtension:       new extensions.ApiExtension(api),
        LocaleExtension:    new extensions.LocaleExtension(locales)
    }
    , config:               new Container(config)
});