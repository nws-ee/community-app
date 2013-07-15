define(['mifosX', 'angular-mocks'], {
  configure: function(scenarioName) {
    require(["test/testHelper", "test/scenarios/" + scenarioName + "_scenario"], function(testHelper, scenario) {
      mifosX.ng.application.config(function($provide) {
        $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
        $provide.decorator('$httpBackend', function($delegate) {
          var proxy = function(method, url, data, callback, headers) {
            var interceptor = function(returnCode, responseData, responseHeaders) {
              var self = this, args = arguments;
              var match = responseHeaders.match(/MifosX-Scenario-Delay: (\d+)/);
              if (match) {
                setTimeout(function() { callback.apply(self, args); }, match[1]);
              } else {
                callback.apply(self, args);
              }
            };
            return $delegate.call(this, method, url, data, interceptor, headers);
          };
          _.each(_.keys($delegate), function(key) {proxy[key] = $delegate[key];});
          return proxy;
        });
      }).run(function($httpBackend, $log) {
        $log.warn("Running test scenario: " + scenarioName);
        $httpBackend.when("GET", /\.html$/).passThrough();
        scenario.stubServer(new testHelper.FakeServer($httpBackend));
      });
      angular.bootstrap(document, ["MifosX_Application"]);
    });
  }
});