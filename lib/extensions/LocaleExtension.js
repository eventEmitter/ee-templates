"use strict";

var Class = require('ee-class');

/**
 * Extension for nunjucks to allow asynchronous locale integration.
 *
 * The template syntax looks as follows:
 * {% locale "say.hello.to", username=user.name %}
 *
 * {@link{http://mozilla.github.io/nunjucks/api.html#custom-tags}}
 */
var LocaleExtension = {

    tags:       null
    , locales:  null
    , defaultLanguage:  null
    , languageKey:      null

    , init: function initialize(locales, defaultLanguage, languageKey) {
        this.tags       = ['locale'];
        this.locales    = locales;
        this.languageKey = languageKey || 'language';
        this.defaultLanguage = defaultLanguage || 'en';
    }

    , parse: function(parser, nodes, lexer) {
        // locale tag
        var tok     = parser.nextToken();
        var args    = parser.parseSignature(null, true);
        parser.advanceAfterBlockEnd(tok.value);

        return new nodes.CallExtensionAsync(this, 'run', args);
    }

    , run: function(context, key, parameters, callback){
        var language = context.lookup(this.languageKey) || this.defaultLanguage,
            localized = this.locales.get(key, language, parameters);
        callback(null, localized);
    }
};

module.exports = new Class(LocaleExtension);