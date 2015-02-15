Angular HMAC Auth Interceptor Module
============================

This is an Angular HTTP Interceptor for 
[HMAC Authentication](http://en.wikipedia.org/wiki/Hash-based_message_authentication_code).

The Interceptor will sign your requests on the client side so the server can authenticate them. It was made to integrate and play smoothly with [ApiAuth Gem](https://github.com/mgomes/api_auth), but it may probably adapt to your needs, if not please feel free to contibute and help it evolve :).

## How it works

1. A canonical string is first created using the request's HTTP headers as follows:
  
        canonicalString = 'X_HMAC_CONTENT_TYPE,X_HMAC_CONTENT_MD5,relativeURI,X_HMAC_DATE';

  - `X_HMAC_CONTENT_TYPE` is a copy of the request's `Content-type`, if `Content-Type` is not present, then a blank string is used in it's place.
  - `X_HMAC_CONTENT_MD5` is a Base64 encoded MD5 Hash of the request's `body`, if `body` is not present, then a blank string is used in it's place. 
  - `relativeURI` is the request's relative url.
  - `X_HMAC_DATE` is an *RFC 1123* timestamp.

2. The cannonical string is then used to create the request's signature which is a Base64 encoded SHA1 HMAC, using the client's private `secretKey`.

3. This signature is then added in the `X_HMAC_AUTHORIZATION` HTTP header as follows:

        X_HMAC_AUTHORIZATION = APIAuth 'client accessId':'signature from step 2'

5. On the server side, the SHA1 HMAC is computed in the same way using the
request's headers and the client's `secretKey`, which is known to only
the client and the server but can be looked up on the server using the client's
`accessId` that was attached in the header. The `accessId` can be any integer or
string that uniquely identifies the client.

## Install

You can install this package locally with bower.

### bower
```shell
# To get the latest stable version use:
$ bower install angular-hmac-auth

# To get the most recent, last committed-to-master version use:
$ bower install angular-hmac-auth#master 

# To save the bower package into the project’s bower.json dependencies use:
$ bower install angular-hmac-auth --save

# Later, you can easily update with:
$ bower update
```   


Once installed, you can start using the package by simply adding a `<script>` tag to your HTML markup.
```html
<!-- Angular HMAC Auth Interceptor -->
<script src="[bower_components]/angular-hmac-auth/src/hmacAuthInterceptor.js"></script>
```

Since this package depends on [`CryptoJS`](https://github.com/sytelus/CryptoJS) in order to work properly you will also need to add the following to your to your HTML markup.
```html
<!-- Angular HMAC Auth Interceptor Dependencies -->
<script src="[bower_components]/cryptojslib/rollups/md5.js"></script>
<script src="[bower_components]/cryptojslib/rollups/hmac-sha1.js"></script>
<script src="[bower_components]/cryptojslib/components/enc-base64-min.js"></script>
```

> Please note that Angular HMAC Auth Interceptor Module requires **Angular 1.2.x** or higher.


## Usage
```javascript
// Include the iterceptor as a dependency of your app
angular.module('app', ['hmacAuthInterceptor'])

.config(['$httpProvider', function($httpProvider){
  // Add the interceptor
  $httpProvider.interceptors.push('hmacInterceptor');
])

.run(['hmacInterceptor', function(hmacInterceptor){
  // Configure the interceptor
  hmacInterceptor.host = 'localhost:3000';
  hmacInterceptor.whitelist = '/authenticate';
  hmacInterceptor.accessId = '3752df6b0ff34f61b51bdfb48c9dc994a27ed8eca8e9aafc67a6623b4ae7daa1';
  hmacInterceptor.secretKey = 'eb8725fa89da4f7f39ebcbf767c44a527bea098320983304e4f316b2e8532c0a';
}]);
```

## Configurations

### Default
```javascript
{
  host: '',         // { String | Regex | function() }
  whitelist: [],    // { String | Regex | Array | function() }
  accessId: '',     // { String | function() }
  secretKey: '',    // { String | function() }
  headers: {
    contentType: 'X_HMAC_CONTENT_TYPE',     // { String }
    contentMD5: 'X_HMAC_CONTENT_MD5',       // { String }
    date: 'X_HMAC_DATE',                    // { String }
    authorization: 'X_HMAC_AUTHORIZATION'   // { String }
  }
}
```

The interceptor allows some basic configurations:
- `host`: Server's host to which requests need to be signed.
- `whitelist`: Server's endpoints that don't require signing.
- `accessId`: Client's `accessId`.
- `secretKey`: Client's private `secretKey` used for signing.

You can also configure the header fields used to send the data to the server as follows:
```javascript 
hmacInterceptor.headers.authorization = 'Authorization';
```

## Author

* [Andres Pache](https://github.com/andres99x/)

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
