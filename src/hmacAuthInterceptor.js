(function () {
  'use strict';

  angular.module('hmacAuthInterceptor',['hmacAuthInterceptorSigner'])

  .factory('hmacInterceptor',['hmacSigner', function(hmacSigner) {

    var _host;
    var _whitelist;
    var _accessId;
    var _secretKey;

    var host = function(){
      return angular.isFunction(_host) ? _host() : _host;
    };

    var secretKey = function(){
      return angular.isFunction(_secretKey) ? _secretKey() : _secretKey;
    };

    var accessId = function(){
      return angular.isFunction(_accessId) ? _accessId() : _accessId;
    };

    var whitelist = function(){
      return [].concat(angular.isFunction(_whitelist) ? _whitelist() : _whitelist);
    };

    var setHost = function(value){
      _host = value;
    };

    var setWhitelist = function(value){
      _whitelist = value;
    };

    var setSecretKey = function(value){
      _secretKey = value;
    };

    var setAccessId = function(value){
      _accessId = value;
    };

    var request = function(config){
      if(config.url.search(host()) > -1) {

        var isWhitelist = false;
        var whitelistArray = whitelist();
        var whitelistLength = whitelistArray.length;

        for (var i = 0; i < whitelistLength; i++) {
          if(config.url.search(whitelistArray[i]) > -1){
            isWhitelist = true;
            break;
          }
        }

        if(!isWhitelist) hmacSigner.sign(config, accessId(), secretKey());
      }

      return config;
    };

    return {
      setHost: setHost,
      setWhitelist: setWhitelist,
      setAccessId: setAccessId,
      setSecretKey: setSecretKey,
      request: request
    };

  }]);

  angular.module('hmacAuthInterceptorSigner',[]).factory('hmacSigner', function() {

    var sign = function(request, accessId, secretKey){
      var headers = request.headers;
      headers['Content-Type'] = contentType(request);
      headers['Content-MD5'] = contentMD5(request);
      headers['HMAC-Date'] = dateUTC();
      headers['Authorization'] = 'APIAuth ' + accessId + ':' + signature(canonicalString(request), secretKey);
    };

    var signature = function(canonicalString, secretKey){
      return CryptoJS.HmacSHA1(canonicalString, secretKey).toString(CryptoJS.enc.Base64);
    };

    var canonicalString = function(request){
      var contentType = request.headers['Content-Type'];
      var contentMD5 = request.headers['Content-MD5'];
      var requestURI = requestRelativeURI(request);
      var timestamp = request.headers['HMAC-Date'];

      return [contentType, contentMD5, requestURI, timestamp].join(',');
    };

    var dateUTC = function(){
      return new Date().toUTCString();
    };

    var contentType = function(request){
      return request.headers['Content-Type'].replace('utf-8', 'UTF-8');
    }

    var requestRelativeURI = function(request){
      return request.url.replace(/^(?:\/\/|[^\/]+)*/, "");
    };

    var contentMD5 = function(request){
      var data = request.data;
      data = angular.isDefined(data) ? (angular.isString(data) ? data : angular.toJson(data)) : '';
      return CryptoJS.MD5(data).toString(CryptoJS.enc.Base64);
    };

    return {
      sign: sign
    };

  });

})();
