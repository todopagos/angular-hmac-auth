(function () {
  'use strict';

  angular.module('hmacAuthInterceptor',[])

  .factory('hmacInterceptor', function() {

    var _host;
    var _secret;
    var _accessId;

    var host = function(){
      return typeof(_host) === 'function' ? _host() : _host;
    };

    var secret = function(){
      return typeof(_secret) === 'function' ? _secret() : _secret;
    };

    var apiKey = function(){
      return typeof(_accessId) === 'function' ? _accessId() : _accessId;
    };

    var setHost = function(value){
      _host = value;
    };

    var setSecret = function(value){
      _secret = value;
    };

    var setAccessId = function(value){
      _accessId = value;
    };

    var authorizationToken = function(){
      return 'APIAuth '+ apiKey() + ':XXX'
    };

    var request = function(config){
      config.headers['Authorization'] = authorizationToken();

      console.debug(config);
      return config;
    };

    return {
      setHost: setHost,
      setAccessId: setAccessId,
      setSecret: setSecret,
      request: request
    };

  });

})();
