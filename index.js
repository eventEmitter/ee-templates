"use strict";
/**
 * todo: create a wrapping renderer which preprocesses data, so the internal renderers do not have to take care of the
 *          passed data and all the request specific data handling
 *
 *
 * Group renderers:
 *
 *  renderers = {
 *
 *      application: {
 *          json:   rendererJson
 *          xml:    rendererXML
 *          all:    rendererDefault
 *      }
 *
 *      image: {
 *          png:    rendererDefault
 *          jpg:    rendererDefault
 *          jpeg:   rendererDefault
 *          png:    rendererDefault
 *          webp:   rendererDefault
 *          tiff:   rendererDefault
 *          all:    rendererDefault
 *      }
 *
 *      text: {
 *          plain:  rendererDefault
 *          xml:    rendererXML
 *          we need to be able to determine the rendering based on the domain
 *          html:   rendererHTML (+ a version without nunjucks)
 *          all:    rendererDefault
 *      }
 *
 *      all: {
 *          all: rendererDefault
 *      }
 *  }
 */
var log         = require('ee-log'),
    Class       = require('ee-class'),
    TemplatingMiddleware  = require('./lib/TemplatingMiddleware');

module.exports = TemplatingMiddleware;