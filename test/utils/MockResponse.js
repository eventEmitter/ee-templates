module.exports = function MockResponse(status, headers) {

    this.status     = status || 404;
    this.headers    = headers || {};
    this.contentType = null;
    this.isSent = false;
    this.data = null;

    this.getHeader = function(key, parse){
        return this.headers[key];
    };

    this.setHeaders = function(headers){
        this.headers = headers;
    };

    this.setHeader = function(key, value){
        this.headers[key] = value;
    };

    this.setContentType = function(type){
        this.contentType = type;
    };

    this.send = function(state, data){
        this.status = state;
        this.isSent = true;
        this.data = data;
    };
};