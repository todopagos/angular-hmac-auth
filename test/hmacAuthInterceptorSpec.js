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
    });

    it('includes the hmacInterceptor', function () {
      expect(httpProvider.interceptors).toContain('hmacInterceptor');
    });

    describe('with matching host', function(){

      describe('using a string', function(){

        it('intercepts the request', function(){
          httpBackend.whenGET('http://test.com').respond();
          httpBackend.expectGET('http://test.com', function(headers) {
            return angular.isDefined(headers['X_HMAC_AUTHORIZATION']);
          });
          http.get('http://test.com');
          httpBackend.flush();
        });
      });

      describe('using a regex', function(){

        it('intercepts the request', function(){
          hmacInterceptor.host = /t.{2}t/i;

          httpBackend.whenGET('http://test.com').respond();
          httpBackend.expectGET('http://test.com', function(headers) {
            return angular.isDefined(headers['X_HMAC_AUTHORIZATION']);
          });
          http.get('http://test.com');
          httpBackend.flush();
        });
      });

      describe('and endpont not included in whitelist', function(){

        var methods = ['GET', 'HEAD', 'PATCH', 'JSONP'];

        for(var i = 0; i < methods.length; i++){

          describe(methods[i], function(){

            beforeEach(function(){
              httpBackend.when(methods[i], 'http://test.com').respond();
            });

            afterEach(function(){
              httpBackend.flush();
            });

            it('uses the existing Content-Type header if given', function(){
              httpBackend.expect(methods[i], 'http://test.com', null, function(headers){
                return headers['X_HMAC_CONTENT_TYPE'] == 'text/plain';
              });
              http({
                method: methods[i],
                url: 'http://test.com',
                headers: { 'Content-Type': 'text/plain' },
              });
            })

            it('sets an empty X_HMAC_CONTENT_TYPE if Content-Type not present', function(){
              httpBackend.expect(methods[i], 'http://test.com', null, function(headers){
                return headers['X_HMAC_CONTENT_TYPE'] == '';
              });
              http({
                method: methods[i],
                url: 'http://test.com',
                headers: { 'Content-Type': null }
              });
            });

            it('calculates the correct contentMD5 for an empty body', function(){
              httpBackend.expect(methods[i], 'http://test.com', null, function(headers){
                return headers['X_HMAC_CONTENT_MD5'] == "1B2M2Y8AsgTpgAmY7PhCfg==";
              });
              http({
                method: methods[i],
                url: 'http://test.com'
              });
            })

            it('uses the existing Content-MD5 header value if given', function(){
              httpBackend.expect(methods[i], 'http://test.com', null, function(headers){
                return headers['X_HMAC_CONTENT_MD5'] == "1B2M2Y8AsgTpgAmY7PhCfg==";
              });
              http({
                method: methods[i],
                url: 'http://test.com',
                headers: { 'Content-MD5': '1B2M2Y8AsgTpgAmY7PhCfg==' }
              });
            })

            it('calculates a X_HMAC_DATE if DATE header not present', function(){
              httpBackend.expect(methods[i], 'http://test.com', null, function(headers){
                return angular.isDefined(headers['X_HMAC_DATE']);
              });
              http({
                method: methods[i],
                url: 'http://test.com'
              });
            });

            it('uses the existing DATE header value if given', function(){
              httpBackend.expect(methods[i], 'http://test.com', null, function(headers){
                return headers['X_HMAC_DATE'] == "Mon, 23 Jan 1984 03:29:56 GMT";
              });
              http({
                method: methods[i],
                url: 'http://test.com',
                headers: { 'Date': "Mon, 23 Jan 1984 03:29:56 GMT" }
              });
            });

            it('apropiately signs the request', function(){
              httpBackend.when(methods[i], 'http://test.com/resource.xml').respond();
              httpBackend.expect(methods[i], 'http://test.com/resource.xml', null, function(headers){
                return headers['X_HMAC_AUTHORIZATION'] == "APIAuth 3752df6b0ff34f61b51bdfb48c9dc994a27ed8eca8e9aafc67a6623b4ae7daa1:oFVW3M1nOaMvxAsbZ2VcN2fZYSo=";
              });
              http({
                method: methods[i],
                url: 'http://test.com/resource.xml',
                headers: {
                  'Content-Type': 'text/plain',
                  'Content-MD5': 'e59ff97941044f85df5297e1c302d260',
                  'Date': "Mon, 23 Jan 1984 03:29:56 GMT"
                }
              });
            });

          });

        }; // End for

        var methods = ['POST', 'PUT' , 'PATCH'];

        for(var i = 0; i < methods.length; i++){

          describe(methods[i], function(){

            beforeEach(function(){
              httpBackend.when(methods[i], 'http://test.com').respond();
            });

            afterEach(function(){
              httpBackend.flush();
            });

            it('uses the existing Content-Type header if given', function(){
              httpBackend.expect(methods[i], 'http://test.com', null, function(headers){
                return headers['X_HMAC_CONTENT_TYPE'] == 'text/plain';
              });
              http({
                method: methods[i],
                url: 'http://test.com',
                headers: { 'Content-Type': 'text/plain' },
                data: null
              });
            })

            it('sets an empty X_HMAC_CONTENT_TYPE if Content-Type not present', function(){
              httpBackend.expect(methods[i], 'http://test.com', null, function(headers){
                return headers['X_HMAC_CONTENT_TYPE'] == '';
              });
              http({
                method: methods[i],
                url: 'http://test.com',
                headers: { 'Content-Type': null },
                data: null
              });
            });

            it('calculates the correct contentMD5 for an empty body', function(){
              httpBackend.expect(methods[i], 'http://test.com', null, function(headers){
                return headers['X_HMAC_CONTENT_MD5'] == "1B2M2Y8AsgTpgAmY7PhCfg==";
              });
              http({
                method: methods[i],
                url: 'http://test.com'
              });
            })

            it('calculates the correct contentMD5 for a non empty body', function(){
              httpBackend.expect(methods[i], 'http://test.com', 'hello\nworld', function(headers){
                return headers['X_HMAC_CONTENT_MD5'] == "kZXQvrKoieG+Be1rsZVINw==";
              });
              http({
                method: methods[i],
                url: 'http://test.com',
                data: 'hello\nworld'
              });
            })

            it('uses the existing Content-MD5 header value if given', function(){
              httpBackend.expect(methods[i], 'http://test.com', 'hello\nworld', function(headers){
                return headers['X_HMAC_CONTENT_MD5'] == "1B2M2Y8AsgTpgAmY7PhCfg==";
              });
              http({
                method: methods[i],
                url: 'http://test.com',
                headers: { 'Content-MD5': '1B2M2Y8AsgTpgAmY7PhCfg==' },
                data: 'hello\nworld'
              });
            })

            it('calculates a X_HMAC_DATE if DATE header not present', function(){
              httpBackend.expect(methods[i], 'http://test.com', null, function(headers){
                return angular.isDefined(headers['X_HMAC_DATE']);
              });
              http({
                method: methods[i],
                url: 'http://test.com'
              });
            });

            it('uses the existing DATE header value if given', function(){
              httpBackend.expect(methods[i], 'http://test.com', null, function(headers){
                return headers['X_HMAC_DATE'] == "Mon, 23 Jan 1984 03:29:56 GMT";
              });
              http({
                method: methods[i],
                url: 'http://test.com',
                headers: { 'Date': "Mon, 23 Jan 1984 03:29:56 GMT" },
                data: null
              });
            });

            it('apropiately signs the request', function(){
              httpBackend.when(methods[i], 'http://test.com/resource.xml').respond();
              httpBackend.expect(methods[i], 'http://test.com/resource.xml', null, function(headers){
                return headers['X_HMAC_AUTHORIZATION'] == "APIAuth 3752df6b0ff34f61b51bdfb48c9dc994a27ed8eca8e9aafc67a6623b4ae7daa1:oFVW3M1nOaMvxAsbZ2VcN2fZYSo=";
              });
              http({
                method: methods[i],
                url: 'http://test.com/resource.xml',
                headers: {
                  'Content-Type': 'text/plain',
                  'Content-MD5': 'e59ff97941044f85df5297e1c302d260',
                  'Date': "Mon, 23 Jan 1984 03:29:56 GMT"
                },
                data: null
              });
            });

          });

        }; // End for

      });

      describe('and endpont included in whitelist', function(){

        beforeEach(function(){
          httpBackend.whenGET('http://test.com/unsigned').respond();
        });

        afterEach(function(){
          http.get('http://test.com/unsigned');
          httpBackend.flush();
        });

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

      beforeEach(function(){
        httpBackend.whenGET('http://test.com').respond();
      });

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
