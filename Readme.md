#EE-Templates
Templating integration for Nunjucks (Middleware)

##Middleware
The middleware can be hooked into the application stack and will append a `render(status, headers, data, callback)` method
to the original http response (or any kind of response which adheres to the interface defined for response in `ee-webserver`).
The renderer method contains a renderer resolved based on the accept headers, which renders the passed content into an
appropriate representation for the `http` protocol (properly supperted at the moment: `text/html` or `application/json`).

##Renderers
Currently there are only two supported renderers: HTML and JSON. The environments (`nunjucks`) are application specific
and need to be passed to the middleware.

###HTMLRenderer
The `HTMLRenderer` is a wrapper for nunjucks. It creates a new environment based on the domain of the request and loads
the template which has to be set on the request (in our case resolved by the `rewriting` middleware).

###DefaultRenderer
The `DefaultRenderer` uses `JSON.stringify` and converts the passed data to a string.

##Templating Extensions
The templating extensions originally provided by this package were moved to their own packages `ee-soa-extension-api` and
`ee-soa-extension-locale`. Since environments now are passed into the middleware, the dependency is removed and extensions
are directly attached by the running application.

##Todo

  - Add a better loader which allows loading the templates asynchronously
  - Improve handling of the mapping between the accept header and the renderer.

##Changelog

### v0.2.0

 - the `render` method of the response now directly writes the data back to the original response
 - the renderers now directly write their assigned content type to the response
 - the renderers directly create server errors if the rendering created an error
 - therefore the API has slightly changed from `render(data, callback)` to `render(status, headers, data, callback)`