var renderer    = require('./lib/renderer');

module.exports = {
    rootFolder: 'contents'
    , templateFolder: 'templates'
    , nunjucks: {
        tags: {
            variableStart: '{$',
            variableEnd: '$}'
        }
    }
    , renderers: {
          'text/html':  renderer.HTMLRenderer
        , 'default':    renderer.DefaultRenderer
    }
};