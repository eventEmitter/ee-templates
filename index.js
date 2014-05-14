"use strict";
// this is pretty strange stuff... i need to refactor this to resolve the dependencies
var log         = require('ee-log'),
    Class       = require('ee-class'),
    TemplatingMiddleware  = require('./lib/TemplatingMiddleware');

var dependencies = require('./dependencies');

var Middleware = new Class({
    inherits: TemplatingMiddleware
    , init: function initialize(){
        initialize.super.call(this, dependencies);
    }
});

module.exports = Middleware;