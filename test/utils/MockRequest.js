module.exports = function MockRequest(host, template, headers) {

    this.hostname       = host;
    this.template       = template;
    this.headers        = headers;


    this.getHeader = function(key, parse){
        return this.headers[key];
    }
};