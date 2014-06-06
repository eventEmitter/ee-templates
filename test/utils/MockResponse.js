var   Class         = require('ee-class')
    , EventEmitter  = require('ee-event-emitter');

module.exports = new Class({

    inherits: EventEmitter
    , status: null
    , headers: null

    , init: function initialize(status, headers){
        this.status     = status || 404;
        this.headers    = headers || {};
        this.contentType = null;
        this.isSent = false;
        this.data = null;
    }

    , getHeader: function(key, parse){
        return this.headers[key];
    }

    , setHeaders: function(headers){
        this.headers = headers;
    }

    , setHeader: function(key, value){
        this.headers[key] = value;
    }

    , setContentType: function(type){
        this.contentType = type;
    }

    , send: function(state, data){
        this.status = state;
        this.isSent = true;
        this.data = data;
        this.emit('sent');
    }
});