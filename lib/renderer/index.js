module.exports.AbstractRenderer = require('./AbstractRenderer');

module.exports.StringRenderer   = require('./StringRenderer');
module.exports.DefaultRenderer  = module.exports.StringRenderer

module.exports.JSONRenderer     = require('./JSONRenderer');
module.exports.HTMLRenderer     = require('./HTMLRenderer');
module.exports.Factory          = require('./Factory');