/*jslint indent:2, browser:true, plusplus:true, evil:true, devel:true, es5:true*/
/*global BrightTag, BTPrivacy, bt_log, emile, EventManager, Modernizr */

// eval is reserved word - jslint no like
BrightTag.safe_eval = BrightTag["eval"];

BrightTag.desktopStyles = ' ' +
  '#bt-privacy-header {               ' +
  '  width:100%;                      ' +
  '  min-width:1150px;                ' +
  '  top:0px;                         ' +
  '  left:0px;                        ' +
  '  position: relative;              ' +
  '  z-index: 100500;                 ' +
  '}                                  ' +
  '#bt-privacy-overlay {              ' +
  '  visibility:hidden;               ' +
  '  position:absolute;               ' +
  '  left:0px;                        ' +
  '  top:0px;                         ' +
  '  width:100%;                      ' +
  '  height:100%;                     ' +
  '  text-align:center;               ' +
  '  z-index:100500;                  ' +
  '}                                  ' +
  '#bt-privacy-matte {                ' +
  '  visibility:hidden;               ' +
  '  background:white;                ' +
  '  opacity:0.9;                     ' +
  '  display:block;                   ' +
  '  position:fixed;                  ' +
  '  top:0px;                         ' +
  '  left:0px;                        ' +
  '  width:100%;                      ' +
  '  height:0;                        ' +
  '  z-index:100500;                  ' +
  // filter for IE7, -ms-filter for IE8
  '  filter: alpha(opacity=90);       ' +
  '  -ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=90)";' +
  '}                                  ' +
  '#bt-privacy-footer {               ' +
  '  min-width:1000px;                ' +
  '  position: relative;              ' +
  '  z-index: 100500;                 ' +
  '  clear: both;                     ' +
  '}                                  ' +
  'body.bt-privacy-opted-out,         ' +
  'body.bt-privacy-implicit-opt-in,   ' +
  'body.bt-privacy-cookies-disabled { ' +
  '  margin:0px;                      ' +
  '  padding-top:0px;                 ' +
  '}';

BrightTag.mobileStyles = ' ' +
  '#bt-privacy-overlay {              ' +
  '  visibility:hidden;               ' +
  '  position:absolute;               ' +
  '  left:0px;                        ' +
  '  top:0px;                         ' +
  '  width:100%;                      ' +
  '  height:100%;                     ' +
  '  text-align:center;               ' +
  '  z-index:100500;                  ' +
  '}                                  ' +
  '#bt-privacy-matte {                ' +
  '  visibility:hidden;               ' +
  '  background:white;                ' +
  '  opacity:0.9;                     ' +
  '  display:block;                   ' +
  '  position:fixed;                  ' +
  '  top:0px;                         ' +
  '  left:0px;                        ' +
  '  width:100%;                      ' +
  '  height:0;                        ' +
  '  z-index:100500;                  ' +
  // filter for IE7, -ms-filter for IE8
  '  filter: alpha(opacity=90);       ' +
  '  -ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=90)";' +
  '}' +
  '#bt-privacy-footer {               ' +
  '  width: 300px;                     ' +
  '  margin-left: -150px;                    ' +
  '  bottom: 0;                       ' +
  '  left: 50%;                       ' +
  '  position: absolute;              ' +
  '  z-index: 100500;                 ' +
  '  clear: both;                     ' +
  '}                                  ' +
  'body {               ' +
  '  position: relative;                    ' +
  '  padding-bottom: 80px;                    ' +
  '}                                  ' +
  '#bt-privacy-header iframe, #bt-privacy-footer iframe {' +
  '  width: 100%;' +
  '  position: relative;' +
  '  z-index: 100500;' +
  '  clear: both;' +
  '}                                  ' +
  '#bt-privacy-header iframe, #bt-privacy-footer iframe {' +
  'width: 100%;' +
  'position: relative;' +
  'z-index: 100500;' +
  'clear: both;' +
  '} ';


//Stolen from jquery because I need it!
BrightTag.deepExtend = function (source, options) {
  "use strict";
  var name, src, copy, copyIsArray, clone, i,
    target = source,
    length = arguments.length,
    deep = false;

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== "object" && !BrightTag.Types.isFunction(target)) {
    target = {};
  }

  // Extend the base object
  for (name in options) {
    if (options.hasOwnProperty(name)) {
      src = target[name];
      copy = options[name];

      copyIsArray = BrightTag.Types.isArray(copy);
      // Recurse if we're merging plain objects or arrays
      if (copy && (BrightTag.Types.isObject(copy) || copyIsArray)) {
        if (copyIsArray) {
          copyIsArray = false;
          clone = src && BrightTag.Types.isArray(src) ? src : [];

        } else {
          clone = src && BrightTag.Types.isObject(src) ? src : {};
        }

        // Never move original objects, clone them
        target[name] = BrightTag.deepExtend(clone, copy);

      // Don't bring in undefined values
      } else if (copy !== undefined) {
        target[name] = copy;
      }
    }
  }
  // Return the modified object
  return target;
};

BrightTag.CookieController = (function (window, document) {
  'use strict';

  var defaultConfig = {
      'window': window,
      'document': document,
      'locale': 'en',
      'mobile': false,
      'workflow': 'implicit-opt-in',
      'host': 'privacy.thebrighttag.com/pandgv2/',
      'providers': {
        'notice_header': 'notice',
        'simple_notice': 'simple_notice',
        'opted_out': 'opted_out',
        'cookies_disabled': 'cookies_disabled',
        'opted_in': 'opted_in',
        'make_choice': 'make_choice',
        'explicit_choice': 'explicit_choice',
        'are_you_sure': 'are_you_sure',
        'cookies_required': 'cookies_required'
      },
      'containers': {
        // by default, create a div instead of using existing container
        'header': false,
        'footer': false
      }
    };

  // Cookies in the cookie jar are always fresh.
  // (BrightTag.HTTP.Cookie caches document.cookie internally; we don't.)
  function CookieJar(document) {
    this.get = function (name) {
      return new BrightTag.HTTP.Cookie(document).get(name);
    };

    this.set = function (name, value) {
      return new BrightTag.HTTP.Cookie(document).set(name, value, { path: "/" });
    };

    this.remove = function (name) {
      return new BrightTag.HTTP.Cookie(document).remove(name);
    };
  }

  function CookieView(config, triggerEvent, handleEvent) {
    var self = this,
      baseBodyClasses = config.document.body.className,
      providers = {
        'notice':                 { id: 'bt-privacy-header',  path: "/notice-banner.html",          style: 'notice',           bodyClass: 'bt-privacy-implicit-opt-in' },
        'simple_notice':          { id: 'bt-privacy-header',  path: "/simple-notice.html",          style: 'simple_notice',    bodyClass: 'bt-privacy-implicit-opt-in' },
        'opted_out':              { id: 'bt-privacy-header',  path: "/opted-out-banner.html",       style: 'opted_out',        bodyClass: 'bt-privacy-opted-out' },
        'cookies_disabled':       { id: 'bt-privacy-footer',  path: "/cookies-disabled.html",       style: 'cookies_disabled', bodyClass: 'bt-privacy-cookies-disabled' },
        'opted_in':               { id: 'bt-privacy-footer',  path: "/opted-in-banner.html",        style: 'opted_in' },
        'make_choice':            { id: 'bt-privacy-overlay', path: "/make-choice.html",            style: 'overlay' },
        'explicit_choice':        { id: 'bt-privacy-overlay', path: "/explicit-choice.html",        style: 'overlay' },
        'are_you_sure':           { id: 'bt-privacy-overlay', path: "/are-you-sure.html",           style: 'overlay' },
        'cookies_required':       { id: 'bt-privacy-overlay', path: "/cookies-required.html",       style: 'overlay' },
        'mobile_body':            { id: 'bt-privacy-overlay', path: "/mobile-choice.html",          style: 'overlay' },
        'mobile_notice':          { id: 'bt-privacy-header',  path: "/mobile-notice.html",          style: 'mobile_notice' },
        'mobile_footer':          { id: 'bt-privacy-footer',  path: "/mobile-footer.html",          style: 'opted_in' },
        'mobile_opted_out':       { id: 'bt-privacy-header',  path: "/mobile-opted-out.html",       style: 'opted_out',        bodyClass: 'bt-privacy-opted-out' },
        'mobile_explicit_choice': { id: 'bt-privacy-overlay', path: "/mobile-explicit-choice.html", style: 'mobile_overlay'}
      },
      styles = {
        notice: { width: "100%", height: "114px" },
        simple_notice: { width: "100%", height: ((config.locale === 'fr') ? "95px" : "70px") },
        opted_out: { width: "100%", height: "65px" },
        opted_out_mobile: { width: "100%", height: "50px" },
        cookies_disabled: { width: "100%", height: "88px" },
        opted_in: { width: "100%", height: "68px" },
        overlay: { width: "100%", height: "100%", minHeight: "700px", opacity: 1, visibility: "visible" },
        mobile_notice: { width: "100%", height: ((config.locale === 'en') ? "120px" : "150px"), visibility: "visible" },
        mobile_overlay: { width: "100%", height: "240px", opacity: 1, visibility: "visible"}
      };

    function animate(element, options, callback) {
      options = options || {};
      options.after = callback;
      options.duration = options.duration || 400; // milliseconds
      // pass the properties to emile
      emile(element, options);
    }

    function hide(provider, callback) {
      // can't hide something that's not showing
      if (!provider.socket) { callback(); return; }

      function remove(provider, callback) {
        provider.socket.destroy();
        delete provider.socket;
        callback();
      }

      var element = config.document.getElementById(provider.id);

      if (Modernizr.opacity) {
        // animate the element out before transitioning to the next state
        emile(element, 'opacity:0', { duration: 300 }, function () {
          remove(provider, callback);
        });
      } else {
        remove(provider, callback);
      }

    }

    function showOverlay() {
      var overlay = config.document.getElementById('bt-privacy-overlay'),
        matte = config.document.getElementById('bt-privacy-matte');
      matte.style.visibility = "visible";
      matte.style.height = "100%";
      overlay.style.visibility = "visible";
      overlay.scrollIntoView();
    }

    function hideOverlay() {
      var overlay = config.document.getElementById('bt-privacy-overlay'),
        matte = config.document.getElementById('bt-privacy-matte');
      overlay.style.visibility = "hidden";
      matte.style.visibility = "hidden";
      matte.style.height = "0";
    }

    function hideAll(fn) {
      var aggregator = {
        notifyStart : function (iterations, callback) {
          this.collectedResponses = 0;
          this.maxResponses = iterations;
          this.callback = callback;
        },
        notifyComplete : function () {
          this.collectedResponses++;
          if (this.collectedResponses === this.maxResponses) {
            this.callback();
          }
        }
      };

      // Object.keys added in ECMAScript 5. Not in IE7/8
      function getKeys(providers) {
        var provider, keys = [];
        for (provider in providers) {
          if (providers.hasOwnProperty(provider)) {
            keys.push(provider);
          }
        }
        return keys;
      }

      hideOverlay();
      aggregator.notifyStart(getKeys(providers).length, fn);
      BrightTag.each(providers, function (name, options) {
        hide(options, function () {
          aggregator.notifyComplete();
        });
      });
    }

    function updateCSS(provider) {
      var element = config.document.getElementById(provider.id);

      // clear any css set in hide()
      element.style.cssText = "";

      // treat the overlay as a modal dialog
      if (provider.style === 'overlay' || provider.style === "mobile_overlay") {
        showOverlay();
      } else if (provider.style === 'cookies_disabled' && config.locale === 'en') {
        // the cookies_disabled text is shorter in English than non-English languages
        element.firstChild.style.height = '70px';
        // prefer dynamically resizing the iframe: http://easyxdm.net/wp/2010/03/17/resize-iframe-based-on-content/
        // but document.body.scrollHeight is inconsistent across browsers, and can't find anything consistent.
      } else if (provider.style === 'opted_in' && config.locale === 'fr') {
        // the opted_in text is longer in French than non-English languages
        element.firstChild.style.height = '86px';
      }

      // activate css to zero out body margin so header banner is flush with window and page elements are pushed down
      if (provider.id === "bt-privacy-header") {
        config.document.body.className = baseBodyClasses + ' ' + provider.bodyClass;
      } else {
        config.document.body.className = baseBodyClasses;
      }
    }

    function display(provider) {
      provider.socket = new config.window.easyXDM.Socket({
        remote: 'https://' + config.host + config.locale + provider.path,
        props: { style: styles[provider.style] || {}, scrolling: "no" },
        container: provider.id,
        onMessage: function (message, origin) {
          if (message.indexOf('trigger:') === 0) {
            // first remove the 'trigger:' prefix
            triggerEvent(message.substring(8));
          } else {
            handleEvent(message);
          }
        },
        onReady: function () {
          provider.socket.postMessage(config.workflow);
        }
      });
      updateCSS(provider);
    }

    // @Nullable provider, @Nullable callback
    self.render = function (name, callback) {
      var provider = providers[name];
      hideAll(function () {
        if (provider) {
          display(provider);
        }
        if (callback) {
          callback();
        }
      });
    };
  }

  function CookieController(config) {

    var self = this,
      state, // opted_in, opted_out, no_cookie, or cookies_disabled
      cookies = new CookieJar(config.document),
      triggerEvent = new EventManager(config.window).trigger,
      handleEvent,
      render = new CookieView(config, triggerEvent, function (event) {
        handleEvent(event);
      }).render;

    handleEvent = function (event, callback) {
      switch (event) {
      case "notice_close":
        render(); // render nothing (aka close all)
        break;

      case "make_choice":
        render(config.providers.make_choice, callback);
        break;

      case "opted_in":
        if (state === 'no_cookie' || state === 'opted_out') {
          BTPrivacy.optIn(function (data) {
            state = 'opted_in';
            render(config.providers.opted_in, callback);
            cookies.set('btPrivacyRefreshOptIn', 1);
            location.reload();
          });
        } else {
          render(config.providers.opted_in, callback);
        }
        break;

      case "opted_out":
        if (state === 'no_cookie' || state === 'opted_in') {
          BTPrivacy.optOut(function (data) {
            state = 'opted_out';
            triggerEvent("bt-privacy-opt-in-banner-displayed");
            render(config.providers.opted_out, callback);
          });
        } else {
          triggerEvent("bt-privacy-opt-in-banner-displayed");
          render(config.providers.opted_out, callback);
        }
        break;

      case "are_you_sure":
        triggerEvent("bt-privacy-are-you-sure-dialog-displayed");
        render(config.providers.are_you_sure, callback);
        break;
      }
    };

    function handleRemoteState(remoteState) {
      var cookieName, cookie, visits;

      // store remote state as our initial state
      state = remoteState.toLowerCase();

      switch (remoteState) {

      case "OPTED_IN":
        handleEvent('opted_in');
        break;

      case "OPTED_OUT":
        handleEvent('opted_out');
        break;

      case "NO_COOKIE":
        if (config.workflow === "explicit-opt-in") {
          triggerEvent("bt-privacy-explicit-choice-dialog-displayed");
          render(config.providers.explicit_choice);
          break;
        }

        // Implicit OptIn Workflow
        cookieName = "btPrivacyVisits";
        cookie = cookies.get(cookieName);
        visits = cookie ? parseInt(cookie, 10) : 0;
        if (visits >= 2) {
          handleEvent('opted_in', function () {
            cookies.remove(cookieName);
            triggerEvent("bt-implicit-opt-in");
          });
        } else {
          render(config.providers.notice_header);
          cookies.set(cookieName, visits + 1);
          triggerEvent("bt-privacy-implicit-choice-banner-shown");
        }
        break;

      case "COOKIES_DISABLED":
        render(config.providers.cookies_disabled);
        break;

      }
    }

    function startFromRemoteState() {
      var cookieName = 'btPrivacyRefreshOptIn',
        cookie = cookies.get(cookieName);

      if (cookie) {
        cookies.remove(cookieName);
        triggerEvent("bt-privacy-opt-in-reload");
      }

      BTPrivacy.getPrivacySettings(function (data) {
        handleRemoteState(data.userPrivacyStatus);
      });
    }

    // For feature switching
    self.isOptedIn = function () {
      // treat cookies_disabled state and no_cookie state (in implicit mode) as opted_in
      return state === 'opted_in' || state === 'cookies_disabled' || (state === 'no_cookie' && config.workflow === 'implicit-opt-in');
    };

    // Execute the callback if the user is opted-in, otherwise show the cookies_required overlay
    self.checkOptInStatus = function (callback) {
      if (self.isOptedIn()) {
        if (callback) {
          callback();
        }
      } else {
        render(config.providers.cookies_required);
      }
    };

    // Go! Go! Go!
    startFromRemoteState();
  }

  function bootstrap(config) {
    function findCookieControllerScript() {
      var scriptRegex = /cookie-controller\.js|mrcookie\.(min\.)?js$/,
        scripts = config.document.getElementsByTagName("script"),
        script,
        i;
      for (i = (scripts.length - 1); i > -1; i--) {
        script = scripts[i];
        if (scriptRegex.test(script.src)) {
          return script;
        }
      }
      return false;
    }

    function configureSiteWithInnerText(script) {
      var configText = BrightTag.trim(script.innerHTML);
      if (configText.length === 0) {
        return;
      }

      function onerrorfn(e) {
        if (bt_log) {
          bt_log("configuration error: " + e);
        }
      }
      BrightTag.deepExtend(config, BrightTag.safe_eval("(\n" + configText + "\n)", onerrorfn));
      config.styles = (config.mobile) ? BrightTag.mobileStyles : BrightTag.desktopStyles;
    }

    // Crazy hack to create an inline style element in IE
    // http://stackoverflow.com/questions/875610/how-do-you-copy-an-inline-style-element-in-ie
    function createStyleElement(content) {
      var tmp = config.document.createElement('div');
      tmp.innerHTML = '<p>x</p><style>' + content + '</style>';
      return tmp.getElementsByTagName('style')[0];
    }

    function createElements() {
      var overlay = config.document.createElement('div'),
        header = config.document.createElement('div'),
        footer = config.document.createElement('div'),
        matte = config.document.createElement('div'),
        body = config.document.body, // this file is loaded by the body, so guaranteed to exist by now
        style = createStyleElement(config.styles);

      header.id = 'bt-privacy-header';
      overlay.id = 'bt-privacy-overlay';
      footer.id = 'bt-privacy-footer';
      matte.id = 'bt-privacy-matte';

      if (config.containers.header) {
        config.document.getElementById(config.containers.header).appendChild(header);
      } else {
        body.insertBefore(header, body.firstChild);
      }

      body.insertBefore(overlay, body.firstChild);
      body.insertBefore(matte, body.firstChild);
      body.insertBefore(style, body.firstChild);

      if (config.containers.footer) {
        config.document.getElementById(config.containers.footer).appendChild(footer);
      } else {
        body.appendChild(footer);
      }
    }

    var script = findCookieControllerScript();
    if (script) {
      configureSiteWithInnerText(script);
    }

    if (config.privacy) {
      BTPrivacy.configure(config.privacy);
    }

    createElements();

    return new CookieController(config);
  }
  return bootstrap(defaultConfig);
}(window, document));
