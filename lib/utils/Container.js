"use strict";

var Class = require('ee-class');

var Container = {

    items: null

    , init: function(items){
        this.items = items || {};
    }

    , push: function(key, value){
        this.get(key).push(value);
        return this;
    }

    , extend: function(key, name, value){
        this.get(key)[name] = value;
        return this
    }

    , set: function(key, value){
        this.items[key] = value;
        return this;
    }

    , get: function(key){
        return this.items[key];
    }

    , has: function(key){
        return this.items.hasOwnProperty(key);
    }
};

module.exports = new Class(Container);