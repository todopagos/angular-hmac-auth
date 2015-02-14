(function () {
  'use strict';

  angular.module('hmacAuthInterceptor',['hmacAuthInterceptorSigner'])

  .factory('hmacInterceptor',['hmacSigner', function(hmacSigner) {

    var configurations = {
      host: '',
      whitelist: [],
      accessId: '',
      secretKey: '',
      headers: {
        contentType: 'X_HMAC_CONTENT_TYPE',
        contentMD5: 'X_HMAC_CONTENT_MD5',
        date: 'X_HMAC_DATE',
        authorization: 'X_HMAC_AUTHORIZATION'
      }
    }

    var getConfig = function(field, isHeader) {
      isHeader = typeof(isHeader) !== 'undefined' ? isHeader : false;
      var value = isHeader ?  configurations[headers][field] : configurations[field];
      return angular.isFunction(value) ? value() : value;
    };

    var setConfig = function(field, value, isHeader) {
      isHeader = typeof(isHeader) !== 'undefined' ? isHeader : false;
      isHeader ? configurations[headers][field] = value : configurations[field] = value;
    };

    var request = function(config){
      if(config.url.search(getConfig('host')) > -1) {

        var isWhitelist = false;
        var whitelistArray = [].concat(getConfig('whitelist'));

        for (var i = 0; i < whitelistArray.length; i++) {
          if(config.url.search(whitelistArray[i]) > -1){
            isWhitelist = true;
            break;
          }
        }

        if(!isWhitelist) hmacSigner.sign(config, getConfig('accessId'), getConfig('secretKey'), configurations.headers);
      }

      return config;
    };

    return {
      set host(v) { setConfig('host', v) },
      set whitelist(v) { setConfig('whitelist', v) },
      set accessId(v) { setConfig('accessId', v) },
      set secretKey(v) { setConfig('secretKeyt', v) },
      headers: {
         set contentType(v) { setConfig('contentType', v, true) },
         set contentMD5(v) { setConfig('contentMD5', v, true) },
         set date(v) { setConfig('date', v, true) },
         set authorization(v) { setConfig('authorization', v, true) }
      },
      request: request
    };

  }]);

  angular.module('hmacAuthInterceptorSigner',[]).factory('hmacSigner', function() {

    var sign = function(request, accessId, secretKey, headersConfig){
      setCustomHeaders(request, headersConfig);
      setAuthorizationHeader(request, accessId, secretKey, headersConfig);
    };

    var setCustomHeaders = function(request, headersConfig){
      setHeader(request, headersConfig.contentType, contentType(request));
      setHeader(request, headersConfig.contentMD5, contentMD5(request));
      setHeader(request, headersConfig.date, timestamp());
    };

    var setAuthorizationHeader = function(request, accessId, secretKey, headersConfig){
      var message = canonicalString(request, headersConfig);
      var value = 'APIAuth ' + accessId + ':' + signature(message, secretKey);
      setHeader(request, headersConfig.authorization, value);
    };

    var signature = function(message, secretKey){
      return CryptoJS.HmacSHA1(message, secretKey).toString(CryptoJS.enc.Base64);
    };

    var canonicalString = function(request, headersConfig){
      return [
        getHeader(request, headersConfig.contentType),
        getHeader(request, headersConfig.contentMD5),
        relativeURI(request),
        getHeader(request, headersConfig.date)
      ].join(',');
    };

    var timestamp = function(){
      return new Date().toUTCString();
    };

    var contentType = function(request){
      return getHeader(request, 'Content-Type');
    }

    var relativeURI = function(request){
      return request.url.replace(/^(?:\/\/|[^\/]+)*/, "");
    };

    var contentMD5 = function(request){
      var content = body(request);
      return CryptoJS.MD5(content).toString(CryptoJS.enc.Base64);
    };

    var body = function(request){
      var data  = request.data;
      return angular.isObject(data) ? angular.toJson(data) : data || '';
    };

    var getHeader = function(request, field){
      return request.headers[field];
    };

    var setHeader = function(request, field, value){
      return request.headers[field] = value;
    };

    return {
      sign: sign
    };

  });

})();
