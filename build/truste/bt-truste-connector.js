/*jslint indent: 2, plusplus: true*/
/*global BrightTag, console*/

var BTPrivacy = (function () {
  'use strict';

  var glue = {
    callbacks: {},
    config: {
      host: BrightTag.instance.host + "/api/privacy/",
      siteId: BrightTag.instance.site,
      timeout: 5000
    }
  };

  //overwrite configs if we need to.
  glue.configure = function (config) {
    var opt;

    for (opt in config) {
      if (config.hasOwnProperty(opt)) {
        glue.config[opt] = config[opt];
      }
    }
  };

  function randomName(minLength) {
    var alphabet = 'abcdefghijklmnopqrstuvwxyz',
      chars = alphabet.split(''),
      str = '',
      i;

    for (i = 0; i < minLength; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }

    return (typeof glue.callbacks[str] === 'undefined') ? str : randomName(minLength + 1);
  }

  function fFactory(callback) {
    function func(data) {
      callback(data);
    }

    var fnname = randomName(2);

    glue.callbacks[fnname] = func;

    return fnname;
  }

  function generateNamedCallback(callback) {
    var nameFunction = fFactory(callback);
    return "BTPrivacy.callbacks." + nameFunction;
  }

  glue.addJsonpScript = function (url) {
    var script = document.createElement('script');
    script.src = url;
    script.type = "text/javascript";
    document.body.appendChild(script);
  };

  function getPageParam(url) {
    var ret;

    if (glue.config.sendpageurl === true) {
      if (typeof glue.config.pageurl === "string") {
        ret = glue.config.pageurl;
      } else {
        ret = document.URL;
      }
    }

    return ret;
  }

  function cookiesDisabled() {
    var btc = new BrightTag.HTTP.Cookie(document),
      now = (new Date()).getTime();

    btc.set('testCookies', 'enabled', { expires: now + 1000 });

    return btc.get('testCookies') !== "enabled";
  }

  function wrapCallback(callback) {
    return function (data) {
      clearTimeout(glue.timeoutHandle);

      if (data && data.cookies) {
        BTPrivacy.cookieSetter(document, data.cookies);
      }

      if (callback) {
        callback(data);
      }
    };
  }

  function getTokenCookies() {
    var btc = new BrightTag.HTTP.Cookie(document);
    return {
      btpstkn: btc.get("btpstkn")
    };
  }

  function bootstrapCall(callback, path, cookiesToAppendToQueryString, error) {
    callback = wrapCallback(callback);

    var callbackName = generateNamedCallback(callback),
      url = "//" + glue.config.host + glue.config.siteId + path;

    url = new BrightTag.HTTP.URL(url)
      .appendParam('callback', callbackName)
      .appendParam('page', getPageParam(url))
      .appendParams(cookiesToAppendToQueryString)
      .toString();

    glue.timeoutHandle = setTimeout(function () {
      var fnName = callbackName.substr(callbackName.lastIndexOf('.') + 1, callbackName.length);

      delete glue.callbacks[fnName];

      if (error) {
        error();
      }
    }, glue.config.timeout);

    glue.addJsonpScript(url);
  }

  //Wrappers for API calls
  glue.getPrivacySettings = function (callback, error) {
    var btc = new BrightTag.HTTP.Cookie(document),
      cookies = {};

    if (cookiesDisabled()) {
      bootstrapCall(callback, "/ct?cookiesDisabled=true", cookies, error);
    } else {
      btc.findEach("btps.", function (key, value) { cookies[key] = value; });

      bootstrapCall(callback, "/ct", cookies, error);
    }
  };

  glue.optIn = function (callback, error) {
    bootstrapCall(callback, "/choice/opted_in", getTokenCookies(), error);
  };

  glue.functional = function (callback, error) {
    bootstrapCall(callback, "/choice/functional", getTokenCookies(), error);
  };

  glue.required = function (callback, error) {
    bootstrapCall(callback, "/choice/required", getTokenCookies(), error);
  };

  glue.optOut = function (callback, error) {
    bootstrapCall(callback, "/choice/opted_out", getTokenCookies(), error);
  };

  return glue;
}());

if (typeof exports !== 'undefined') {
  exports.BTPrivacy = BTPrivacy;
}

/*jslint indent: 2, plusplus: true*/
/*global BTPrivacy, BrightTag*/

BTPrivacy.cookieSetter = function (document, directives) {
  'use strict';

  var btc = new BrightTag.HTTP.Cookie(document),
    i,
    directive,
    options,
    now;

  for (i = 0; i < directives.length; i++) {
    directive = directives[i];

    now = (new Date()).getTime();

    options = {
      path: directive.path,
      expires: directive.maxAge < 0 ? "0" : now + directive.maxAge * 1000,
      secure: directive.secure,
      version: directive.version
    };

    btc.set(directive.name, directive.value, options);
  }
};

/*jslint indent: 2, plusplus: true, vars: true, browser: true*/
/*global BTPrivacy, BrightTag, truste*/

/* WATCH OUT: requires btprivacy.core.js, tag.js and the truste concent manager to be loaded in order to function properly */

BTPrivacy.modalIntegration = (function () {
  'use strict';
  var connector = {},
    domain = "",
    endpointMap = {
      0: 'optOut',
      1: 'required',
      2: 'functional',
      3: 'optIn'
    },
    lastStatus;

  function subscribe(callback) {
    var apiObject = {
        PrivacyManagerAPI: {
          action: "getConsent",
          timestamp: new Date().getTime()
        }
      },
      json = JSON.stringify(apiObject);

    window.top.postMessage(json, "*");
    if (window.addEventListener) {
      window.addEventListener("message", callback, false);
    } else if (window.attachEvent) {
      //IE fallback
      window.attachEvent('onmessage', callback);
    }
    //else: we do nothing.
  }

  function getSliderPosition() {
    return truste.cma.callApi('getConsentDecision', domain);
  }

  function callAndUpdate(endpoint, cacheValue) {
    lastStatus = cacheValue;
    BTPrivacy[endpoint]();
  }

  function passStatus() {
    var decision = getSliderPosition().consentDecision,
      endpoint = endpointMap[decision];

    //ignore if we would be duplicating a previous call we made
    if (decision !== lastStatus && endpoint) {
      callAndUpdate(endpoint, decision);
    }
  }

  connector.init = function (config) {
    lastStatus = false;

    //required
    domain = config.domain;

    //optional
    if (config.endpointMap) {
      endpointMap = config.endpointMap;
    }

    //pass along config settings to core
    BTPrivacy.configure(config);

    //tagserve will error out if you don't get settings before setting them
    BTPrivacy.getPrivacySettings(function () {
      subscribe(passStatus);
    });
  };

  return connector;
}());
