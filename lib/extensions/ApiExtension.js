"use strict";

var Class = require('ee-class');

/**
 * Extension for nunjucks to allow asynchronous API
 * calls and assignments to the actual context.
 *
 * The template syntax looks as follows:
 * {% api variable = apiMethod(args) %}
 *
 * {@link{http://mozilla.github.io/nunjucks/api.html#custom-tags}}
 */
var ApiExtension = {

    tags: null
    , api: null

    , init: function initialize(api){
        this.tags   = ['api'];
        this.api    = api;
    }

    , _parseVariableName: function(parser, nodes, lexer){

        // ensure that there there is a variable
        /*var target = parser.peekToken();
        if(target.type != lexer.TOKEN_SYMBOL){
            parser.fail(
                "api: expected variable name to assign api call to",
                target.lineno,
                target.colno);
        }*/

        return parser.parsePrimary(true);

    }

    , _skipAssignmentOperator: function(parser, nodes, lexer){

        // ensure that there is an assignment operator
        var operator = parser.peekToken();
        if(!parser.skipValue(lexer.TOKEN_OPERATOR, '=')) {
            parser.fail(
                'api: expected = in api tag',
                operator.lineno,
                operator.colno);
        }

    }

    , parse: function(parser, nodes, lexer) {

        var apiTag  = parser.nextToken();
        var target  = this._parseVariableName(parser, nodes, lexer);

        this._skipAssignmentOperator(parser, nodes, lexer);

        var fnc = parser.parsePrimary(),
            args = fnc.args

        var targetName      = new nodes.Literal( target.lineno, target.colno, target.value),
            functionName    = new nodes.Literal( fnc.name.lineno, fnc.name.colno, fnc.name.value);

        args.addChild(targetName);
        args.addChild(functionName);

        parser.advanceAfterBlockEnd(apiTag.value);

        // avoid having linebreaks after the api tag
        parser.dropLeadingWhitespace = true;

        // return the call extension which invokes the dispatcher
        return new nodes.CallExtensionAsync(this, 'dispatch', args);

    }

    /**
     * An dispatcher function which wraps the callbacks and delegates the call to the api.
     */
    , dispatch: function(){

        var argsArray   = Array.prototype.slice.call(arguments),
            context     = argsArray.shift(),
            callback    = argsArray.pop(),
            fnc         = argsArray.pop(),
            property    = argsArray.pop();

        // add the new callback to the arguments
        argsArray.push(this._createCallbackWrapper(context, property, callback));
        this.api.invoke(fnc, argsArray);

    }

    /**
     * Creates a callback which takes the return value of the api call and
     * binds it to the current rendering context (to keep the injection into the
     * context transparent to the api itself).
     *
     * @param context
     * @param target
     * @param callback
     * @returns {function(this:ApiExtension)}
     * @private
     */
    , _createCallbackWrapper: function(context, target, callback){

        return function(err, result){
            if(err){
                callback(err, null);
            }
            context.setVariable(target, result);
            callback(null, null);
        };

    }
};

module.exports = new Class(ApiExtension);