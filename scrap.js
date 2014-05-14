var Segments = new Class({

    inherits: Array

    , init: function(parts){
        parts = parts || [];
        this.pushAll(parts);
    }

    , last: function(){
        return this[this.length-1];
    }

    , first: function(){
        return this[0];
    }

    , push: function(element){
        if(!(element instanceof Segment)){
            element = new Segment(element);
        }
        Array.prototype.push.call(this, element);
    }

    , pushAll: function(collection){
        var len = collection.length;
        for(var i=0; i<len;i++){
            this.push(collection[i]);
        }
    }
});

var Segment = new Class({

    _value: null

    , value: {
        get: function(){
            return this._value;
        }
    }

    , init: function(value){
        this._value = value;
    }

    , isNumeric: function(){
        return !isNaN(parseFloat(this.value)) && isFinite(this.value);
    }

    , toString: function(){
        return this.value.toString();
    }
});

var UrlObject = new Class({

    _subdomains: null
    , _segments: null

    , PROTOCOL_PATTERN: /(\d*)\:\/\/.+/

    , PATH_SEPARATOR:   '/'
    , DOMAIN_SEPARATOR: '.'

    , subdomains: {
        get: function(){
            return this.getSubdomains();
        }
    }

    , segments: {
        get: function(){
            return this.getSegments();
        }
    }

    , init: function(urlstring){
        urlstring = this._sanitizeUrl(urlstring);
        var parsed = url.parse(urlstring, true);
        for(var name in parsed){
            this[name] = parsed[name];
        }
        //this._sanitize();
    }
    , _sanitizeUrl: function(urlstring){
        return urlstring;
    }
    , _sanitize: function(){
        if(this.protocol[this.protocol.length-1] == ':'){
            this.protocol = this.protocol.substring(0, this.protocol.length-1);
        }
    }

    , getSubdomains: function(){
        this._subdomains = this._subdomains || this.host.split(this.DOMAIN_SEPARATOR);
        return this._subdomains;
    }

    , getSubdomain: function(level){
        var domains = this.getSubdomains()
        return domains.length >= level ? domains[domains.length - level] : null;
    }

    , getTLD: function(){
        return this.getSubdomains().slice(-1).shift();
    }

    , getSegments: function(){
        this._segments = this._segments || new Segments(this.pathname.split(this.PATH_SEPARATOR));
        return this._segments;
    }

    , getSegment: function(position){
        return (this.getSegments().length < position) ? null : this.getSegments()[position];
    }

    , getQueryParam: function(key, option){
        return this.query[key] || option;
    }
});

var segments = new Segments();
segments.pushAll([1, 2, 3]);
log(segments.first().isNumeric());

var parsed = new UrlObject('http://some.where.com/index.php/dings/bums?do=dont&id=10');
log(parsed.getQueryParam('dodo', null));
log(parsed.getTLD());
log(parsed.getSubdomain(3));
log(parsed.subdomains[0]);
log(parsed.segments[2].toString());