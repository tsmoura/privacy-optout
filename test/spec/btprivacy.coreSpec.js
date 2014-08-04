describe('BT Privacy', function () {
  beforeEach(function () {
    BTPrivacy.configure({
      host: "s.thefakebrighttag.com/",
      siteId: 'jasminetest'
    });

    deleteAllCookies();
  });

  it('should be able to override config values', function () {
    BTPrivacy.configure({
      host: "k.thebrighttag.com/"
    });
    
    expect(BTPrivacy.config.host).toEqual("k.thebrighttag.com/");
  });

  it('should invoke the callback for getPrivacySettings when it is successfully called', function () {
    spyOn(BTPrivacy, "addJsonpScript").andCallFake(function(url) {
      var jsonp = new BrightTag.HTTP.URL(url),
        callback = jsonp.param('callback');
      
      var fnName = callback.substr(callback.lastIndexOf('.') + 1, callback.length);
      
      if (BTPrivacy.callbacks[fnName]) {
        BTPrivacy.callbacks[fnName]();
      }
    });
    
    var callbacks = {
      logX: function() {
        console.log('x');
      }
    };
    
    spyOn(callbacks, 'logX');
    BTPrivacy.getPrivacySettings(callbacks.logX);
    expect(callbacks.logX).toHaveBeenCalled();
  });
  
  it('should append a query string, page, set to the value of the host page, to the jsonp url if the sendpageurl is set to true', function () {
    BTPrivacy.configure({
      sendpageurl: true
    });
    
    function fakeCall(url) {
      var jsonp = new BrightTag.HTTP.URL(url),
        callback = jsonp.param('callback');
      
      expect(document.URL).toEqual(jsonp.param('page'));
      
      var fnName = callback.substr(callback.lastIndexOf('.') + 1, callback.length);

      if (BTPrivacy.callbacks[fnName]) {
        BTPrivacy.callbacks[fnName]();
      }
    }

    spyOn(BTPrivacy, "addJsonpScript").andCallFake(fakeCall);
    BTPrivacy.getPrivacySettings(function() {});
    expect(BTPrivacy.addJsonpScript).toHaveBeenCalled();
  });
  
  it('should append a query string, page, set to the encoded value of pageurl, to the jsonp url if the sendpageurl is set to true and pageurl is set as a string', function () {
    BTPrivacy.configure({
      sendpageurl: true,
      pageurl: 'http://google.com'
    });
    
    function fakeCall(url) {
      var jsonp = new BrightTag.HTTP.URL(url),
        callback = jsonp.param('callback');
      
      expect('http://google.com').toEqual(jsonp.param('page'));
      
      var fnName = callback.substr(callback.lastIndexOf('.') + 1, callback.length);

      if (BTPrivacy.callbacks[fnName]) {
        BTPrivacy.callbacks[fnName]();
      }
    }

    spyOn(BTPrivacy, "addJsonpScript").andCallFake(fakeCall);
    BTPrivacy.getPrivacySettings(function() {});
    expect(BTPrivacy.addJsonpScript).toHaveBeenCalled();
  });

  describe('Cookies', function() {
    it('should append any first party cookies starting with \'btps.\' to the jsonp url when getPrivacySettings is called', function() {
      document.cookie = "cookie1=value1;"
      document.cookie = "btps.test=value;"
      document.cookie = "btps.test1=value1;"
      document.cookie = "bbtpstkn=weq;"
      document.cookie = "cookie3=value1;"
    
      function fakeCall(url) {
        var jsonp = new BrightTag.HTTP.URL(url),
          callback = jsonp.param('callback');

        expect('value').toEqual(jsonp.param('btps.test'));
        expect('value1').toEqual(jsonp.param('btps.test1'));
        
        var fnName = callback.substr(callback.lastIndexOf('.') + 1, callback.length);

        if (BTPrivacy.callbacks[fnName]) {
          BTPrivacy.callbacks[fnName]();
        }
      }

      spyOn(BTPrivacy, "addJsonpScript").andCallFake(fakeCall);
      BTPrivacy.getPrivacySettings(function() {});
      expect(BTPrivacy.addJsonpScript).toHaveBeenCalled();
    });

    it('should append the first party cookie, bbtpstkn, to the jsonp url when optIn is called', function() {
      document.cookie = "cookie1=value1;"
      document.cookie = "btps.test=value;"
      document.cookie = "btps.test1=value1;"
      document.cookie = "btpstkn=btpstknisset;"
      document.cookie = "cookie3=value1;"
    
      function fakeCall(url) {
        var jsonp = new BrightTag.HTTP.URL(url),
          callback = jsonp.param('callback');

        expect('btpstknisset').toEqual(jsonp.param('btpstkn'));
        
        var fnName = callback.substr(callback.lastIndexOf('.') + 1, callback.length);

        if (BTPrivacy.callbacks[fnName]) {
          BTPrivacy.callbacks[fnName]();
        }
      }

      spyOn(BTPrivacy, "addJsonpScript").andCallFake(fakeCall);
      BTPrivacy.optIn(function() {});
      expect(BTPrivacy.addJsonpScript).toHaveBeenCalled();
    });
  
    it('should append the first party cookie, bbtpstkn, to the jsonp url when optOut is called', function() {
      document.cookie = "cookie1=value1;"
      document.cookie = "btps.test=value;"
      document.cookie = "btps.test1=value1;"
      document.cookie = "btpstkn=btpstknisset;"
      document.cookie = "cookie3=value1;"
    
      function fakeCall(url) {
        var jsonp = new BrightTag.HTTP.URL(url),
          callback = jsonp.param('callback');

        expect('btpstknisset').toEqual(jsonp.param('btpstkn'));
        
        var fnName = callback.substr(callback.lastIndexOf('.') + 1, callback.length);

        if (BTPrivacy.callbacks[fnName]) {
          BTPrivacy.callbacks[fnName]();
        }
      }

      spyOn(BTPrivacy, "addJsonpScript").andCallFake(fakeCall);
      BTPrivacy.optOut(function() {});
      expect(BTPrivacy.addJsonpScript).toHaveBeenCalled();
    });
  });

  describe('Timeout', function(){
    it('should timeout requests to jsonp after x seconds and call and error callback', function() {
      jasmine.Clock.useMock();
      BTPrivacy.configure({
        timeout: 1000
      });
      
      var callbacks = {
        success: function () {
          console.log('success called')
        },
        failure: function() {
          console.log('failure called')
        }
      }
      
      function fakeCall(url) {
        setTimeout(function() {
          var jsonp = new BrightTag.HTTP.URL(url),
            callback = jsonp.param('callback');
            
          var fnName = callback.substr(callback.lastIndexOf('.') + 1, callback.length);

          if (BTPrivacy.callbacks[fnName]) {
            BTPrivacy.callbacks[fnName]();
          }
        }, 2000);
      }

      spyOn(callbacks, 'success');
      spyOn(callbacks, 'failure');
      spyOn(BTPrivacy, "addJsonpScript").andCallFake(fakeCall);
      BTPrivacy.getPrivacySettings(callbacks.success, callbacks.failure);
      expect(BTPrivacy.addJsonpScript).toHaveBeenCalled();

      jasmine.Clock.tick(2001);
      expect(callbacks.success).not.toHaveBeenCalled();
      expect(callbacks.failure).toHaveBeenCalled();
    });
    
    it('should behave properly if a failure callback is not supplied', function() {
      jasmine.Clock.useMock();
      BTPrivacy.configure({
        timeout: 1000
      });
      
      var callbacks = {
        success: function () {
          console.log('success called')
        }
      }
      
      function fakeCall(url) {
        setTimeout(function() {
          var jsonp = new BrightTag.HTTP.URL(url),
            callback = jsonp.param('callback');
            
          var fnName = callback.substr(callback.lastIndexOf('.') + 1, callback.length);

          if (BTPrivacy.callbacks[fnName]) {
            BTPrivacy.callbacks[fnName]();
          }
        }, 2000);
      }

      spyOn(callbacks, 'success');
      spyOn(BTPrivacy, "addJsonpScript").andCallFake(fakeCall);
      BTPrivacy.getPrivacySettings(callbacks.success);
      expect(BTPrivacy.addJsonpScript).toHaveBeenCalled();

      jasmine.Clock.tick(2001);
      expect(callbacks.success).not.toHaveBeenCalled();
    });
  });
});
