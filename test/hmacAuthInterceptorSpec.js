'use strict';

beforeEach(function(){
  angular.module('hmacAuthInterceptor')
  .config(['$httpProvider', function($httpProvider){
    // Add the interceptor
    $httpProvider.interceptors.push('hmacInterceptor');
  }]);
});

describe('HMAC Auth Interceptor Module', function(){

  var httpProvider;
  var hmacInterceptor;

  beforeEach(function(){
    module('hmacAuthInterceptor', function($httpProvider){
      // Save the httpProvider
      httpProvider = $httpProvider;
    });

    inject(function(_hmacInterceptor_){
      // Save the interceptor
      hmacInterceptor = _hmacInterceptor_;
    });
  });

  describe('hmacInterceptor Tests', function(){

    it('should be defined', function(){
      expect(hmacInterceptor).toBeDefined();
    });

    describe('Default Configurations', function(){

      it('should have a default host', function(){
        expect(hmacInterceptor.host).toBe('');
      });

      it('should have a default whitelist', function(){
        expect(hmacInterceptor.whitelist).toEqual([]);
      });

      it('should have a default accessId', function(){
        expect(hmacInterceptor.accessId).toBe('');
      });

      it('should have a default secretKey', function(){
        expect(hmacInterceptor.secretKey).toBe('');
      });

      it('should have a default headers[contentType]', function(){
        expect(hmacInterceptor.headers.contentType).toBe('X_HMAC_CONTENT_TYPE');
      });

      it('should have a default headers[contentMD5]', function(){
        expect(hmacInterceptor.headers.contentMD5).toBe('X_HMAC_CONTENT_MD5');
      });

      it('should have a default headers[date]', function(){
        expect(hmacInterceptor.headers.date).toBe('X_HMAC_DATE');
      });

      it('should have a default headers[authorization]', function(){
        expect(hmacInterceptor.headers.authorization).toBe('X_HMAC_AUTHORIZATION');
      });

    }); // End Default Configurations

    describe('Set & Get Configurations', function(){

      it('should properly set & get the host', function(){
        hmacInterceptor.host = 'HOST';
        expect(hmacInterceptor.host).toBe('HOST');
      });

      it('should properly set & get the whitelist', function(){
        hmacInterceptor.whitelist = 'WHITELIST';
        expect(hmacInterceptor.whitelist).toBe('WHITELIST');
      });

      it('should properly set & get the accessId', function(){
        hmacInterceptor.accessId = 'ACCESSID';
        expect(hmacInterceptor.accessId).toBe('ACCESSID');
      });

      it('should properly set & get the secretKey', function(){
        hmacInterceptor.secretKey = 'SECRETKEY';
        expect(hmacInterceptor.secretKey).toBe('SECRETKEY');
      });

      it('should properly set & get the headers[contentType]', function(){
        hmacInterceptor.headers.contentType = 'Content-Type';
        expect(hmacInterceptor.headers.contentType).toBe('Content-Type');
      });

      it('should properly set & get the headers[contentMD5]', function(){
        hmacInterceptor.headers.contentMD5 = 'Content-MD5';
        expect(hmacInterceptor.headers.contentMD5).toBe('Content-MD5');
      });

      it('should properly set & get the headers[date]', function(){
        hmacInterceptor.headers.date = 'Date';
        expect(hmacInterceptor.headers.date).toBe('Date');
      });

      it('should properly set & get the headers[authorization]', function(){
        hmacInterceptor.headers.authorization = 'Authorization';
        expect(hmacInterceptor.headers.authorization).toBe('Authorization');
      });

      it("should properly get a configuration value if it's a function", function(){
        hmacInterceptor.host = function() { return 'HOST' };
        expect(hmacInterceptor.host).toBe('HOST');
      });

    }); // End Set & Get Configurations

  });

  describe('HTTP Tests', function(){

    var http;
    var httpBackend;

    beforeEach(function(){
      // Configure the Interceptor
      hmacInterceptor.host = 'test.com';
      hmacInterceptor.whitelist = '/unsigned';
      hmacInterceptor.accessId = '3752df6b0ff34f61b51bdfb48c9dc994a27ed8eca8e9aafc67a6623b4ae7daa1';
      hmacInterceptor.secretKey = 'eb8725fa89da4f7f39ebcbf767c44a527bea098320983304e4f316b2e8532c0a';

      inject(function(_$httpBackend_, _$http_){
        // Save the $http & $httpBackend
        http = _$http_;
        httpBackend = _$httpBackend_;
      });

      httpBackend.whenGET('http://test.com').respond();
      httpBackend.whenGET('http://test.com/unsigned').respond();
    });

    beforeEach(function(){
      //httpBackend.whenGET('http://test.com');
      //httpBackend.whenGET('http://test.com/unsigned');
    });

    it('includes the hmacInterceptor', function () {
      expect(httpProvider.interceptors).toContain('hmacInterceptor');
    });

    describe('with matching host', function(){

      afterEach(function(){
        http.get('http://test.com');
        http.get('http://test.com/unsigned');
        httpBackend.flush();
      });

      describe('using a string', function(){

        it('intercepts the request', function(){
          httpBackend.expectGET('http://test.com', function(headers) {
            return angular.isDefined(headers['X_HMAC_AUTHORIZATION']);
          });
        });
      });

      describe('using a regex', function(){

        it('intercepts the request', function(){
          hmacInterceptor.host = /t.{2}t/i;

          httpBackend.expectGET('http://test.com', function(headers) {
            return angular.isDefined(headers['X_HMAC_AUTHORIZATION']);
          });
        });
      });

      describe('and endpont not included in whitelist', function(){

        describe('GET', function(){

        });

        describe('POST', function(){

        });

        describe('PUT', function(){

        });

        describe('DELETE', function(){

        });
      });

      describe('and endpont included in whitelist', function(){

        describe('using a string', function(){

          it('it should not intercept the request', function(){
            httpBackend.expectGET('http://test.com/unsigned', function(headers) {
              return angular.isUndefined(headers['X_HMAC_AUTHORIZATION']);
            });
          });
        });

        describe('using an array', function(){

          it('it should not intercept the request', function(){
            hmacInterceptor.whitelist = ['/example', '/unsigned'];

            httpBackend.expectGET('http://test.com/unsigned', function(headers) {
              return angular.isUndefined(headers['X_HMAC_AUTHORIZATION']);
            });
          });
        });

      });

    }); // End with matching host

    describe('with mismatching host', function(){

      afterEach(function(){
        http.get('http://test.com');
        httpBackend.flush();
      });

      describe('using a string', function(){

        it('does not intercept the request', function(){
          hmacInterceptor.host = 'example.com';

          httpBackend.expectGET('http://test.com', function(headers) {
            return angular.isUndefined(headers['X_HMAC_AUTHORIZATION']);
          });
        });
      });

      describe('using a regex', function(){

        it('does not intercept the request', function(){
          hmacInterceptor.host = /t.t/i;

          httpBackend.expectGET('http://test.com', function(headers) {
            return angular.isUndefined(headers['X_HMAC_AUTHORIZATION']);
          });
        });
      });

    }); // End with mismatching host

  }); // End HTTP Tests

}); // End hmacinterceptor Tests
