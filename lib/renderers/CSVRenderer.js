"use strict";

var   Class   = require('ee-class')
    , types   = require('ee-types')
    , log     = require('ee-log')
    , csv     = require('fast-csv');


var AbstractRenderer = require('./AbstractRenderer');

var CSVRenderer = module.exports = new Class({

      inherits: AbstractRenderer

    , init: function initialize() {
        initialize.super.call(this, 'text', 'csv');
    }

    , render: function (data, callback) {
        var content = data.content;
        if(types.string(content) || types.buffer(content)){
            return callback(null, content, this.type);
        }

        try {
            content = this._sanitizeContent(content);
        } catch(err) {
            return callback(err);
        }

        csv.writeToString(
              content
            , { headers : true }
            , function(err, data){
                if(err) return callback(err);
                callback(null, data, this.type);
            }.bind(this)
        );
    }

    , _sanitizeContent: function(content){
        if(!types.array(content)){
            content = [content];
        }
        return content.map(this._sanitizeRow.bind(this));
    }

    , _sanitizeRow: function(row, index){
        if(row && row.toString() == "[object Object]"){
            return Object.keys(row).reduce(this._sanitizeCell.bind(this), row);
        }
        throw new Error('Invalid CSV content at row '+index);
    }

    , _sanitizeCell: function(row, key, index){
        var value = row[key];
        if(types.function(value)) throw new Error('Function found in CSV data at key "'+key+'" in row '+index);
        if(types.string(value) || types.buffer(value)) return row;

        try {
            row[key] = JSON.stringify(value);
            return row;
        } catch (err) {
            throw new Error('Unserializable data found in CSV data at key "'+key+'" in row '+index+' ('+err.message+')');
        }
    }
});