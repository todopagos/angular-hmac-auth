(function () {
  'use strict';

  angular.module('hmacAuthInterceptor',[])

  .factory('hmacInterceptor', function() {

    var _host;
    var _whitelist;
    var _accessId;
    var _secretKey;

    var host = function(){
      return typeof(_host) === 'function' ? _host() : _host;
    };

    var secretKey = function(){
      return typeof(_secretKey) === 'function' ? _secretKey() : _secretKey;
    };

    var accessId = function(){
      return typeof(_accessId) === 'function' ? _accessId() : _accessId;
    };

    var whitelist = function(){
      return [].concat(typeof(_whitelist) === 'function' ? _whitelist() : _whitelist);
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

    var authorizationToken = function(){
      return 'APIAuth '+ accessId() + ':XXX'
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

        if(!isWhitelist) config.headers['Authorization'] = authorizationToken();
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

  });


})();
