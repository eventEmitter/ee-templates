module.exports = function MockRequest(host, template, headers, path) {

    this.hostname       = host;
    this.template       = template;
    this.headers        = headers;
    this.pathname       = path;


    this.getHeader = function(key, parse){
        return this.headers[key];
    }
};