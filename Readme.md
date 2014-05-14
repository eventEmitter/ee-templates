#EE-Templates
Templating integration for Nunjucks (Middleware)

##Middleware
The middleware can be hooked into the application stack and will append a `render(data, callback)` method to the response
which contains a renderer based on the request's accept content type.

##Renderers
Currently there are only two supported renderers: HTML and JSON. Both are resolved, set up and cached by a factory.

###HTMLRenderer
The `HTMLRenderer` is a wrapper for nunjucks. It creates a new environment based on the domain of the request and loads
the template which has to be set on the request (in our case resolved by the `rewriting` middleware.

###DefaultRenderer
The `DefaultRenderer` uses `JSON.stringify` and converts the passed data to a string.

##Extensions
The templating provides the following (asynchronous extensions to nunjucks).

###LocaleExtension
The locale extensions allows the integration of a translator service. Use it in your template as follows:

    {% locale "key", name=value, .. namen=valuen %}

The parameters result in a dictionary of key value pairs (see signature parsing of Nunjucks). The extension takes a
locales object, a default language ('en') and a languageKey ('language') on initialization.

Locales is an object which is able to load a resource by `key` and `language` and interpolates the given dictionary
into the resulting string and must implement a `get(key, language, parameters)` method.

    var locales = {
        get: function(key, language, parameters){
            // load resource which belongs to key in the specified language
            // inject the parameters
            // return the localized string
        }
    }

    var ext = new LocaleExtension(locales, 'de');

    environment.addExtension('Locale', ext);

In your template:

    {% locale "say.hello.to", username=user.name %}

The language to be used is determined by a lookup to the rendering context (accessing the `languageKey`) with a fallback
to the default language. To change the language used by the extension you could.

  - set it explicitly in your template `{% set language="en" %}`
  - pass it to your rendering context `env.render("template.html", { language: 'en' }`

If the language property is already in use, you can change the lookup by passing another key to the extension on initialization.

    var ext = new LocaleExtension(locales, 'de', 'lang');

###API
The api extension provides a wrapping mechanism for an asynchronous get and set in your templates.

    {% api user = getUser() %}
    <!-- from now on the user is available /-->
    Hello {{ user.username }}

The extension takes an api object which needs to be able to dispatch the invocation, based on the method name and a parameters array.

    var api     = {
        invoke: function(methodName, parameters){
            this[methodName].apply(parameters);
        }

        getUser: function(args... , callback){
            // do something asynchronous
            callback(err, user);
        }
    }
    var apiExt = new ApiExtension(api);

The dispatching is necessary to keep the logic which binds the result to the rendering context away from the API. It also
allows the API to react in generic ways.

#Todo

  - Implement the api
  - Append the locale service
  - Add a better mechanism to resolve paths
  - Add a better loader which allows loading the templates asynchronously
  - The api needs to be loaded on a per domain base