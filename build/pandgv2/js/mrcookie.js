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

/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-opacity-shiv-cssclasses-prefixes-load
 */
;



window.Modernizr = (function( window, document, undefined ) {

    var version = '2.6.2',

    Modernizr = {},

    enableClasses = true,

    docElement = document.documentElement,

    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    inputElem  ,


    toString = {}.toString,

    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),



    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName,



    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { 
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }


    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    function setCss( str ) {
        mStyle.cssText = str;
    }

    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    function is( obj, type ) {
        return typeof obj === type;
    }

    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }


    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                            if (elem === false) return props[i];

                            if (is(item, 'function')){
                                return item.bind(elem || obj);
                }

                            return item;
            }
        }
        return false;
    }



    tests['opacity'] = function() {
                setCssAll('opacity:.55');

                    return (/^0.55$/).test(mStyle.opacity);
    };


    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
                                    featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }



     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
                                              return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; 
     };


    setCss('');
    modElem = inputElem = null;

    ;(function(window, document) {
        var options = window.html5 || {};

        var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

        var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

        var supportsHtml5Styles;

        var expando = '_html5shiv';

        var expanID = 0;

        var expandoData = {};

        var supportsUnknownElements;

      (function() {
        try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
                    supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
                        (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
        } catch(e) {
          supportsHtml5Styles = true;
          supportsUnknownElements = true;
        }

      }());        function addStyleSheet(ownerDocument, cssText) {
        var p = ownerDocument.createElement('p'),
            parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

        p.innerHTML = 'x<style>' + cssText + '</style>';
        return parent.insertBefore(p.lastChild, parent.firstChild);
      }

        function getElements() {
        var elements = html5.elements;
        return typeof elements == 'string' ? elements.split(' ') : elements;
      }

          function getExpandoData(ownerDocument) {
        var data = expandoData[ownerDocument[expando]];
        if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
        }
        return data;
      }

        function createElement(nodeName, ownerDocument, data){
        if (!ownerDocument) {
            ownerDocument = document;
        }
        if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
        }
        if (!data) {
            data = getExpandoData(ownerDocument);
        }
        var node;

        if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
        } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
        } else {
            node = data.createElem(nodeName);
        }

                                    return node.canHaveChildren && !reSkip.test(nodeName) ? data.frag.appendChild(node) : node;
      }

        function createDocumentFragment(ownerDocument, data){
        if (!ownerDocument) {
            ownerDocument = document;
        }
        if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
        }
        data = data || getExpandoData(ownerDocument);
        var clone = data.frag.cloneNode(),
            i = 0,
            elems = getElements(),
            l = elems.length;
        for(;i<l;i++){
            clone.createElement(elems[i]);
        }
        return clone;
      }

        function shivMethods(ownerDocument, data) {
        if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
        }


        ownerDocument.createElement = function(nodeName) {
                if (!html5.shivMethods) {
              return data.createElem(nodeName);
          }
          return createElement(nodeName, ownerDocument, data);
        };

        ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
          'var n=f.cloneNode(),c=n.createElement;' +
          'h.shivMethods&&(' +
                    getElements().join().replace(/\w+/g, function(nodeName) {
              data.createElem(nodeName);
              data.frag.createElement(nodeName);
              return 'c("' + nodeName + '")';
            }) +
          ');return n}'
        )(html5, data.frag);
      }        function shivDocument(ownerDocument) {
        if (!ownerDocument) {
            ownerDocument = document;
        }
        var data = getExpandoData(ownerDocument);

        if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
          data.hasCSS = !!addStyleSheet(ownerDocument,
                    'article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
                    'mark{background:#FF0;color:#000}'
          );
        }
        if (!supportsUnknownElements) {
          shivMethods(ownerDocument, data);
        }
        return ownerDocument;
      }        var html5 = {

            'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video',

            'shivCSS': (options.shivCSS !== false),

            'supportsUnknownElements': supportsUnknownElements,

            'shivMethods': (options.shivMethods !== false),

            'type': 'default',

            'shivDocument': shivDocument,

            createElement: createElement,

            createDocumentFragment: createDocumentFragment
      };        window.html5 = html5;

        shivDocument(document);

    }(this, document));

    Modernizr._version      = version;

    Modernizr._prefixes     = prefixes;
    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                                                    (enableClasses ? ' js ' + classes.join(' ') : '');

    return Modernizr;

})(this, this.document);
/*yepnope1.5.4|WTFPL*/
(function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}})(this,document);
Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0));};
;
/**
 * Version of easyXDM patched by codyaray (http://github.com/codyaray)
 * Based upon **download version** of easyXDM-2.4.15.118
 *   https://github.com/downloads/oyvindkinsey/easyXDM/easyXDM-2.4.15.118.zip 
 * 
 * Reasons:
 *   HashTransport appears broken in easyXDM-2.4.16 
 *   config.props is ignored in easyXDM-2.4.15
 *   easyXDM-2.4.15 release commit also has broken HashTransport, but download works for some reason.
 *     https://github.com/oyvindkinsey/easyXDM/commit/b9fe4474a373a9b4aa044623d3403860b5748a13
 *
 * Changes:
 *   Patched easyXDM-2.4.15 download (with working HashTransport) to not override the config.props,
 *   manually applying commit f84366d4 by craveytrain (http://github.com/craveytrain). See
 *   https://github.com/oyvindkinsey/easyXDM/commit/f84366d47b69cb52523e86a15aef91552e7b0c4d
 */

/**
 * easyXDM
 * http://easyxdm.net/
 * Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function (window, document, location, setTimeout, decodeURIComponent, encodeURIComponent) {
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global JSON, XMLHttpRequest, window, escape, unescape, ActiveXObject */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

var global = this;
var channelId = Math.floor(Math.random() * 10000); // randomize the initial id in case of multiple closures loaded 
var emptyFn = Function.prototype;
var reURI = /^((http.?:)\/\/([^:\/\s]+)(:\d+)*)/; // returns groups for protocol (2), domain (3) and port (4) 
var reParent = /[\-\w]+\/\.\.\//; // matches a foo/../ expression 
var reDoubleSlash = /([^:])\/\//g; // matches // anywhere but in the protocol
var namespace = ""; // stores namespace under which easyXDM object is stored on the page (empty if object is global)
var easyXDM = {};
var _easyXDM = window.easyXDM; // map over global easyXDM in case of overwrite
var IFRAME_PREFIX = "easyXDM_";
var HAS_NAME_PROPERTY_BUG;
var useHash = false; // whether to use the hash over the query
var flashVersion; // will be set if using flash
var HAS_FLASH_THROTTLED_BUG;


// http://peter.michaux.ca/articles/feature-detection-state-of-the-art-browser-scripting
function isHostMethod(object, property){
    var t = typeof object[property];
    return t == 'function' ||
    (!!(t == 'object' && object[property])) ||
    t == 'unknown';
}

function isHostObject(object, property){
    return !!(typeof(object[property]) == 'object' && object[property]);
}

// end

// http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
function isArray(o){
    return Object.prototype.toString.call(o) === '[object Array]';
}

// end
function hasFlash(){
    try {
        var activeX = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
        flashVersion = Array.prototype.slice.call(activeX.GetVariable("$version").match(/(\d+),(\d+),(\d+),(\d+)/), 1);
        HAS_FLASH_THROTTLED_BUG = parseInt(flashVersion[0], 10) > 9 && parseInt(flashVersion[1], 10) > 0;
        activeX = null;
        return true;
    } 
    catch (notSupportedException) {
        return false;
    }
}

/*
 * Cross Browser implementation for adding and removing event listeners.
 */
var on, un;
if (isHostMethod(window, "addEventListener")) {
    on = function(target, type, listener){
        target.addEventListener(type, listener, false);
    };
    un = function(target, type, listener){
        target.removeEventListener(type, listener, false);
    };
}
else if (isHostMethod(window, "attachEvent")) {
    on = function(object, sEvent, fpNotify){
        object.attachEvent("on" + sEvent, fpNotify);
    };
    un = function(object, sEvent, fpNotify){
        object.detachEvent("on" + sEvent, fpNotify);
    };
}
else {
    throw new Error("Browser not supported");
}

/*
 * Cross Browser implementation of DOMContentLoaded.
 */
var domIsReady = false, domReadyQueue = [], readyState;
if ("readyState" in document) {
    // If browser is WebKit-powered, check for both 'loaded' (legacy browsers) and
    // 'interactive' (HTML5 specs, recent WebKit builds) states.
    // https://bugs.webkit.org/show_bug.cgi?id=45119
    readyState = document.readyState;
    domIsReady = readyState == "complete" || (~ navigator.userAgent.indexOf('AppleWebKit/') && (readyState == "loaded" || readyState == "interactive"));
}
else {
    // If readyState is not supported in the browser, then in order to be able to fire whenReady functions apropriately
    // when added dynamically _after_ DOM load, we have to deduce wether the DOM is ready or not.
    // We only need a body to add elements to, so the existence of document.body is enough for us.
    domIsReady = !!document.body;
}

function dom_onReady(){
    if (domIsReady) {
        return;
    }
    domIsReady = true;
    for (var i = 0; i < domReadyQueue.length; i++) {
        domReadyQueue[i]();
    }
    domReadyQueue.length = 0;
}


if (!domIsReady) {
    if (isHostMethod(window, "addEventListener")) {
        on(document, "DOMContentLoaded", dom_onReady);
    }
    else {
        on(document, "readystatechange", function(){
            if (document.readyState == "complete") {
                dom_onReady();
            }
        });
        if (document.documentElement.doScroll && window === top) {
            var doScrollCheck = function(){
                if (domIsReady) {
                    return;
                }
                // http://javascript.nwbox.com/IEContentLoaded/
                try {
                    document.documentElement.doScroll("left");
                }
                catch (e) {
                    setTimeout(doScrollCheck, 1);
                    return;
                }
                dom_onReady();
            };
            doScrollCheck();
        }
    }
    
    // A fallback to window.onload, that will always work
    on(window, "load", dom_onReady);
}
/**
 * This will add a function to the queue of functions to be run once the DOM reaches a ready state.
 * If functions are added after this event then they will be executed immediately.
 * @param {function} fn The function to add
 * @param {Object} scope An optional scope for the function to be called with.
 */
function whenReady(fn, scope){
    if (domIsReady) {
        fn.call(scope);
        return;
    }
    domReadyQueue.push(function(){
        fn.call(scope);
    });
}

/**
 * Returns an instance of easyXDM from the parent window with
 * respect to the namespace.
 *
 * @return An instance of easyXDM (in the parent window)
 */
function getParentObject(){
    var obj = parent;
    if (namespace !== "") {
        for (var i = 0, ii = namespace.split("."); i < ii.length; i++) {
            obj = obj[ii[i]];
        }
    }
    return obj.easyXDM;
}

/**
 * Removes easyXDM variable from the global scope. It also returns control
 * of the easyXDM variable to whatever code used it before.
 *
 * @param {String} ns A string representation of an object that will hold
 *                    an instance of easyXDM.
 * @return An instance of easyXDM
 */
function noConflict(ns){
    
    window.easyXDM = _easyXDM;
    namespace = ns;
    if (namespace) {
        IFRAME_PREFIX = "easyXDM_" + namespace.replace(".", "_") + "_";
    }
    return easyXDM;
}

/*
 * Methods for working with URLs
 */
/**
 * Get the domain name from a url.
 * @param {String} url The url to extract the domain from.
 * @return The domain part of the url.
 * @type {String}
 */
function getDomainName(url){
    return url.match(reURI)[3];
}

/**
 * Get the port for a given URL, or "" if none
 * @param {String} url The url to extract the port from.
 * @return The port part of the url.
 * @type {String}
 */
function getPort(url){
    return url.match(reURI)[4] || "";
}

/**
 * Returns  a string containing the schema, domain and if present the port
 * @param {String} url The url to extract the location from
 * @return {String} The location part of the url
 */
function getLocation(url){
    var m = url.toLowerCase().match(reURI);
    var proto = m[2], domain = m[3], port = m[4] || "";
    if ((proto == "http:" && port == ":80") || (proto == "https:" && port == ":443")) {
        port = "";
    }
    return proto + "//" + domain + port;
}

/**
 * Resolves a relative url into an absolute one.
 * @param {String} url The path to resolve.
 * @return {String} The resolved url.
 */
function resolveUrl(url){
    
    // replace all // except the one in proto with /
    url = url.replace(reDoubleSlash, "$1/");
    
    // If the url is a valid url we do nothing
    if (!url.match(/^(http||https):\/\//)) {
        // If this is a relative path
        var path = (url.substring(0, 1) === "/") ? "" : location.pathname;
        if (path.substring(path.length - 1) !== "/") {
            path = path.substring(0, path.lastIndexOf("/") + 1);
        }
        
        url = location.protocol + "//" + location.host + path + url;
    }
    
    // reduce all 'xyz/../' to just '' 
    while (reParent.test(url)) {
        url = url.replace(reParent, "");
    }
    
    return url;
}

/**
 * Appends the parameters to the given url.<br/>
 * The base url can contain existing query parameters.
 * @param {String} url The base url.
 * @param {Object} parameters The parameters to add.
 * @return {String} A new valid url with the parameters appended.
 */
function appendQueryParameters(url, parameters){
    
    var hash = "", indexOf = url.indexOf("#");
    if (indexOf !== -1) {
        hash = url.substring(indexOf);
        url = url.substring(0, indexOf);
    }
    var q = [];
    for (var key in parameters) {
        if (parameters.hasOwnProperty(key)) {
            q.push(key + "=" + encodeURIComponent(parameters[key]));
        }
    }
    return url + (useHash ? "#" : (url.indexOf("?") == -1 ? "?" : "&")) + q.join("&") + hash;
}


// build the query object either from location.query, if it contains the xdm_e argument, or from location.hash
var query = (function(input){
    input = input.substring(1).split("&");
    var data = {}, pair, i = input.length;
    while (i--) {
        pair = input[i].split("=");
        data[pair[0]] = decodeURIComponent(pair[1]);
    }
    return data;
}(/xdm_e=/.test(location.search) ? location.search : location.hash));

/*
 * Helper methods
 */
/**
 * Helper for checking if a variable/property is undefined
 * @param {Object} v The variable to test
 * @return {Boolean} True if the passed variable is undefined
 */
function undef(v){
    return typeof v === "undefined";
}

/**
 * A safe implementation of HTML5 JSON. Feature testing is used to make sure the implementation works.
 * @return {JSON} A valid JSON conforming object, or null if not found.
 */
var getJSON = function(){
    var cached = {};
    var obj = {
        a: [1, 2, 3]
    }, json = "{\"a\":[1,2,3]}";
    
    if (typeof JSON != "undefined" && typeof JSON.stringify === "function" && JSON.stringify(obj).replace((/\s/g), "") === json) {
        // this is a working JSON instance
        return JSON;
    }
    if (Object.toJSON) {
        if (Object.toJSON(obj).replace((/\s/g), "") === json) {
            // this is a working stringify method
            cached.stringify = Object.toJSON;
        }
    }
    
    if (typeof String.prototype.evalJSON === "function") {
        obj = json.evalJSON();
        if (obj.a && obj.a.length === 3 && obj.a[2] === 3) {
            // this is a working parse method           
            cached.parse = function(str){
                return str.evalJSON();
            };
        }
    }
    
    if (cached.stringify && cached.parse) {
        // Only memoize the result if we have valid instance
        getJSON = function(){
            return cached;
        };
        return cached;
    }
    return null;
};

/**
 * Applies properties from the source object to the target object.<br/>
 * @param {Object} target The target of the properties.
 * @param {Object} source The source of the properties.
 * @param {Boolean} noOverwrite Set to True to only set non-existing properties.
 */
function apply(destination, source, noOverwrite){
    var member;
    for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
            if (prop in destination) {
                member = source[prop];
                if (typeof member === "object") {
                    apply(destination[prop], member, noOverwrite);
                }
                else if (!noOverwrite) {
                    destination[prop] = source[prop];
                }
            }
            else {
                destination[prop] = source[prop];
            }
        }
    }
    return destination;
}

// This tests for the bug in IE where setting the [name] property using javascript causes the value to be redirected into [submitName].
function testForNamePropertyBug(){
    var form = document.body.appendChild(document.createElement("form")), input = form.appendChild(document.createElement("input"));
    input.name = IFRAME_PREFIX + "TEST" + channelId; // append channelId in order to avoid caching issues
    HAS_NAME_PROPERTY_BUG = input !== form.elements[input.name];
    document.body.removeChild(form);
}

/**
 * Creates a frame and appends it to the DOM.
 * @param config {object} This object can have the following properties
 * <ul>
 * <li> {object} prop The properties that should be set on the frame. This should include the 'src' property.</li>
 * <li> {object} attr The attributes that should be set on the frame.</li>
 * <li> {DOMElement} container Its parent element (Optional).</li>
 * <li> {function} onLoad A method that should be called with the frames contentWindow as argument when the frame is fully loaded. (Optional)</li>
 * </ul>
 * @return The frames DOMElement
 * @type DOMElement
 */
function createFrame(config){
    if (undef(HAS_NAME_PROPERTY_BUG)) {
        testForNamePropertyBug();
    }
    var frame;
    // This is to work around the problems in IE6/7 with setting the name property. 
    // Internally this is set as 'submitName' instead when using 'iframe.name = ...'
    // This is not required by easyXDM itself, but is to facilitate other use cases 
    if (HAS_NAME_PROPERTY_BUG) {
        frame = document.createElement("<iframe name=\"" + config.props.name + "\"/>");
    }
    else {
        frame = document.createElement("IFRAME");
        frame.name = config.props.name;
    }
    
    frame.id = frame.name = config.props.name;
    delete config.props.name;
    
    if (config.onLoad) {
        on(frame, "load", config.onLoad);
    }
    
    if (typeof config.container == "string") {
        config.container = document.getElementById(config.container);
    }
    
    if (!config.container) {
        // This needs to be hidden like this, simply setting display:none and the like will cause failures in some browsers.
        apply(frame.style, {
            position: "absolute",
            top: "-2000px"
        });
        config.container = document.body;
    }
    
    // HACK for some reason, IE needs the source set
    // after the frame has been appended into the DOM
    // so remove the src, and set it afterwards
    var src = config.props.src;
    delete config.props.src;
    
    // transfer properties to the frame
    apply(frame, config.props);
    
    frame.border = frame.frameBorder = 0;
    frame.allowTransparency = true;
    config.container.appendChild(frame);
    
    // HACK see above
    frame.src = src;
    config.props.src = src;
    
    return frame;
}

/**
 * Check whether a domain is allowed using an Access Control List.
 * The ACL can contain * and ? as wildcards, or can be regular expressions.
 * If regular expressions they need to begin with ^ and end with $.
 * @param {Array/String} acl The list of allowed domains
 * @param {String} domain The domain to test.
 * @return {Boolean} True if the domain is allowed, false if not.
 */
function checkAcl(acl, domain){
    // normalize into an array
    if (typeof acl == "string") {
        acl = [acl];
    }
    var re, i = acl.length;
    while (i--) {
        re = acl[i];
        re = new RegExp(re.substr(0, 1) == "^" ? re : ("^" + re.replace(/(\*)/g, ".$1").replace(/\?/g, ".") + "$"));
        if (re.test(domain)) {
            return true;
        }
    }
    return false;
}

/*
 * Functions related to stacks
 */
/**
 * Prepares an array of stack-elements suitable for the current configuration
 * @param {Object} config The Transports configuration. See easyXDM.Socket for more.
 * @return {Array} An array of stack-elements with the TransportElement at index 0.
 */
function prepareTransportStack(config){
    var protocol = config.protocol, stackEls;
    config.isHost = config.isHost || undef(query.xdm_p);
    useHash = config.hash || false;
    
    if (!config.props) {
        config.props = {};
    }
    if (!config.isHost) {
        config.channel = query.xdm_c;
        config.secret = query.xdm_s;
        config.remote = query.xdm_e;
        protocol = query.xdm_p;
        if (config.acl && !checkAcl(config.acl, config.remote)) {
            throw new Error("Access denied for " + config.remote);
        }
    }
    else {
        config.remote = resolveUrl(config.remote);
        config.channel = config.channel || "default" + channelId++;
        config.secret = Math.random().toString(16).substring(2);
        if (undef(protocol)) {
            if (getLocation(location.href) == getLocation(config.remote)) {
                /*
                 * Both documents has the same origin, lets use direct access.
                 */
                protocol = "4";
            }
            else if (isHostMethod(window, "postMessage") || isHostMethod(document, "postMessage")) {
                /*
                 * This is supported in IE8+, Firefox 3+, Opera 9+, Chrome 2+ and Safari 4+
                 */
                protocol = "1";
            }
            else if (config.swf && isHostMethod(window, "ActiveXObject") && hasFlash()) {
                /*
                 * The Flash transport superseedes the NixTransport as the NixTransport has been blocked by MS
                 */
                protocol = "6";
            }
            else if (navigator.product === "Gecko" && "frameElement" in window && navigator.userAgent.indexOf('WebKit') == -1) {
                /*
                 * This is supported in Gecko (Firefox 1+)
                 */
                protocol = "5";
            }
            else if (config.remoteHelper) {
                /*
                 * This is supported in all browsers that retains the value of window.name when
                 * navigating from one domain to another, and where parent.frames[foo] can be used
                 * to get access to a frame from the same domain
                 */
                config.remoteHelper = resolveUrl(config.remoteHelper);
                protocol = "2";
            }
            else {
                /*
                 * This is supported in all browsers where [window].location is writable for all
                 * The resize event will be used if resize is supported and the iframe is not put
                 * into a container, else polling will be used.
                 */
                protocol = "0";
            }
        }
    }
    config.protocol = protocol; // for conditional branching
    switch (protocol) {
        case "0":// 0 = HashTransport
            apply(config, {
                interval: 100,
                delay: 2000,
                useResize: true,
                useParent: false,
                usePolling: false
            }, true);
            if (config.isHost) {
                if (!config.local) {
                    // If no local is set then we need to find an image hosted on the current domain
                    var domain = location.protocol + "//" + location.host, images = document.body.getElementsByTagName("img"), image;
                    var i = images.length;
                    while (i--) {
                        image = images[i];
                        if (image.src.substring(0, domain.length) === domain) {
                            config.local = image.src;
                            break;
                        }
                    }
                    if (!config.local) {
                        // If no local was set, and we are unable to find a suitable file, then we resort to using the current window 
                        config.local = window;
                    }
                }
                
                var parameters = {
                    xdm_c: config.channel,
                    xdm_p: 0
                };
                
                if (config.local === window) {
                    // We are using the current window to listen to
                    config.usePolling = true;
                    config.useParent = true;
                    config.local = location.protocol + "//" + location.host + location.pathname + location.search;
                    parameters.xdm_e = config.local;
                    parameters.xdm_pa = 1; // use parent
                }
                else {
                    parameters.xdm_e = resolveUrl(config.local);
                }
                
                if (config.container) {
                    config.useResize = false;
                    parameters.xdm_po = 1; // use polling
                }
                config.remote = appendQueryParameters(config.remote, parameters);
            }
            else {
                apply(config, {
                    channel: query.xdm_c,
                    remote: query.xdm_e,
                    useParent: !undef(query.xdm_pa),
                    usePolling: !undef(query.xdm_po),
                    useResize: config.useParent ? false : config.useResize
                });
            }
            stackEls = [new easyXDM.stack.HashTransport(config), new easyXDM.stack.ReliableBehavior({}), new easyXDM.stack.QueueBehavior({
                encode: true,
                maxLength: 4000 - config.remote.length
            }), new easyXDM.stack.VerifyBehavior({
                initiate: config.isHost
            })];
            break;
        case "1":
            stackEls = [new easyXDM.stack.PostMessageTransport(config)];
            break;
        case "2":
            stackEls = [new easyXDM.stack.NameTransport(config), new easyXDM.stack.QueueBehavior(), new easyXDM.stack.VerifyBehavior({
                initiate: config.isHost
            })];
            break;
        case "3":
            stackEls = [new easyXDM.stack.NixTransport(config)];
            break;
        case "4":
            stackEls = [new easyXDM.stack.SameOriginTransport(config)];
            break;
        case "5":
            stackEls = [new easyXDM.stack.FrameElementTransport(config)];
            break;
        case "6":
            if (!flashVersion) {
                hasFlash();
            }
            stackEls = [new easyXDM.stack.FlashTransport(config)];
            break;
    }
    // this behavior is responsible for buffering outgoing messages, and for performing lazy initialization
    stackEls.push(new easyXDM.stack.QueueBehavior({
        lazy: config.lazy,
        remove: true
    }));
    return stackEls;
}

/**
 * Chains all the separate stack elements into a single usable stack.<br/>
 * If an element is missing a necessary method then it will have a pass-through method applied.
 * @param {Array} stackElements An array of stack elements to be linked.
 * @return {easyXDM.stack.StackElement} The last element in the chain.
 */
function chainStack(stackElements){
    var stackEl, defaults = {
        incoming: function(message, origin){
            this.up.incoming(message, origin);
        },
        outgoing: function(message, recipient){
            this.down.outgoing(message, recipient);
        },
        callback: function(success){
            this.up.callback(success);
        },
        init: function(){
            this.down.init();
        },
        destroy: function(){
            this.down.destroy();
        }
    };
    for (var i = 0, len = stackElements.length; i < len; i++) {
        stackEl = stackElements[i];
        apply(stackEl, defaults, true);
        if (i !== 0) {
            stackEl.down = stackElements[i - 1];
        }
        if (i !== len - 1) {
            stackEl.up = stackElements[i + 1];
        }
    }
    return stackEl;
}

/**
 * This will remove a stackelement from its stack while leaving the stack functional.
 * @param {Object} element The elment to remove from the stack.
 */
function removeFromStack(element){
    element.up.down = element.down;
    element.down.up = element.up;
    element.up = element.down = null;
}

/*
 * Export the main object and any other methods applicable
 */
/** 
 * @class easyXDM
 * A javascript library providing cross-browser, cross-domain messaging/RPC.
 * @version 2.4.15.118
 * @singleton
 */
apply(easyXDM, {
    /**
     * The version of the library
     * @type {string}
     */
    version: "2.4.15.118",
    /**
     * This is a map containing all the query parameters passed to the document.
     * All the values has been decoded using decodeURIComponent.
     * @type {object}
     */
    query: query,
    /**
     * @private
     */
    stack: {},
    /**
     * Applies properties from the source object to the target object.<br/>
     * @param {object} target The target of the properties.
     * @param {object} source The source of the properties.
     * @param {boolean} noOverwrite Set to True to only set non-existing properties.
     */
    apply: apply,
    
    /**
     * A safe implementation of HTML5 JSON. Feature testing is used to make sure the implementation works.
     * @return {JSON} A valid JSON conforming object, or null if not found.
     */
    getJSONObject: getJSON,
    /**
     * This will add a function to the queue of functions to be run once the DOM reaches a ready state.
     * If functions are added after this event then they will be executed immediately.
     * @param {function} fn The function to add
     * @param {object} scope An optional scope for the function to be called with.
     */
    whenReady: whenReady,
    /**
     * Removes easyXDM variable from the global scope. It also returns control
     * of the easyXDM variable to whatever code used it before.
     *
     * @param {String} ns A string representation of an object that will hold
     *                    an instance of easyXDM.
     * @return An instance of easyXDM
     */
    noConflict: noConflict
});

/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global console, _FirebugCommandLine,  easyXDM, window, escape, unescape, isHostObject, undef, _trace, domIsReady, emptyFn, namespace */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, isHostObject, isHostMethod, un, on, createFrame, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/** 
 * @class easyXDM.DomHelper
 * Contains methods for dealing with the DOM
 * @singleton
 */
easyXDM.DomHelper = {
    /**
     * Provides a consistent interface for adding eventhandlers
     * @param {Object} target The target to add the event to
     * @param {String} type The name of the event
     * @param {Function} listener The listener
     */
    on: on,
    /**
     * Provides a consistent interface for removing eventhandlers
     * @param {Object} target The target to remove the event from
     * @param {String} type The name of the event
     * @param {Function} listener The listener
     */
    un: un,
    /**
     * Checks for the presence of the JSON object.
     * If it is not present it will use the supplied path to load the JSON2 library.
     * This should be called in the documents head right after the easyXDM script tag.
     * http://json.org/json2.js
     * @param {String} path A valid path to json2.js
     */
    requiresJSON: function(path){
        if (!isHostObject(window, "JSON")) {
            // we need to encode the < in order to avoid an illegal token error
            // when the script is inlined in a document.
            document.write('<' + 'script type="text/javascript" src="' + path + '"><' + '/script>');
        }
    }
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

(function(){
    // The map containing the stored functions
    var _map = {};
    
    /**
     * @class easyXDM.Fn
     * This contains methods related to function handling, such as storing callbacks.
     * @singleton
     * @namespace easyXDM
     */
    easyXDM.Fn = {
        /**
         * Stores a function using the given name for reference
         * @param {String} name The name that the function should be referred by
         * @param {Function} fn The function to store
         * @namespace easyXDM.fn
         */
        set: function(name, fn){
            _map[name] = fn;
        },
        /**
         * Retrieves the function referred to by the given name
         * @param {String} name The name of the function to retrieve
         * @param {Boolean} del If the function should be deleted after retrieval
         * @return {Function} The stored function
         * @namespace easyXDM.fn
         */
        get: function(name, del){
            var fn = _map[name];
            
            if (del) {
                delete _map[name];
            }
            return fn;
        }
    };
    
}());
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, chainStack, prepareTransportStack, getLocation, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.Socket
 * This class creates a transport channel between two domains that is usable for sending and receiving string-based messages.<br/>
 * The channel is reliable, supports queueing, and ensures that the message originates from the expected domain.<br/>
 * Internally different stacks will be used depending on the browsers features and the available parameters.
 * <h2>How to set up</h2>
 * Setting up the provider:
 * <pre><code>
 * var socket = new easyXDM.Socket({
 * &nbsp; local: "name.html",
 * &nbsp; onReady: function(){
 * &nbsp; &nbsp; &#47;&#47; you need to wait for the onReady callback before using the socket
 * &nbsp; &nbsp; socket.postMessage("foo-message");
 * &nbsp; },
 * &nbsp; onMessage: function(message, origin) {
 * &nbsp;&nbsp; alert("received " + message + " from " + origin);
 * &nbsp; }
 * });
 * </code></pre>
 * Setting up the consumer:
 * <pre><code>
 * var socket = new easyXDM.Socket({
 * &nbsp; remote: "http:&#47;&#47;remotedomain/page.html",
 * &nbsp; remoteHelper: "http:&#47;&#47;remotedomain/name.html",
 * &nbsp; onReady: function(){
 * &nbsp; &nbsp; &#47;&#47; you need to wait for the onReady callback before using the socket
 * &nbsp; &nbsp; socket.postMessage("foo-message");
 * &nbsp; },
 * &nbsp; onMessage: function(message, origin) {
 * &nbsp;&nbsp; alert("received " + message + " from " + origin);
 * &nbsp; }
 * });
 * </code></pre>
 * If you are unable to upload the <code>name.html</code> file to the consumers domain then remove the <code>remoteHelper</code> property
 * and easyXDM will fall back to using the HashTransport instead of the NameTransport when not able to use any of the primary transports.
 * @namespace easyXDM
 * @constructor
 * @cfg {String/Window} local The url to the local name.html document, a local static file, or a reference to the local window.
 * @cfg {Boolean} lazy (Consumer only) Set this to true if you want easyXDM to defer creating the transport until really needed. 
 * @cfg {String} remote (Consumer only) The url to the providers document.
 * @cfg {String} remoteHelper (Consumer only) The url to the remote name.html file. This is to support NameTransport as a fallback. Optional.
 * @cfg {Number} delay The number of milliseconds easyXDM should try to get a reference to the local window.  Optional, defaults to 2000.
 * @cfg {Number} interval The interval used when polling for messages. Optional, defaults to 300.
 * @cfg {String} channel (Consumer only) The name of the channel to use. Can be used to set consistent iframe names. Must be unique. Optional.
 * @cfg {Function} onMessage The method that should handle incoming messages.<br/> This method should accept two arguments, the message as a string, and the origin as a string. Optional.
 * @cfg {Function} onReady A method that should be called when the transport is ready. Optional.
 * @cfg {DOMElement|String} container (Consumer only) The element, or the id of the element that the primary iframe should be inserted into. If not set then the iframe will be positioned off-screen. Optional.
 * @cfg {Array/String} acl (Provider only) Here you can specify which '[protocol]://[domain]' patterns that should be allowed to act as the consumer towards this provider.<br/>
 * This can contain the wildcards ? and *.  Examples are 'http://example.com', '*.foo.com' and '*dom?.com'. If you want to use reqular expressions then you pattern needs to start with ^ and end with $.
 * If none of the patterns match an Error will be thrown.  
 * @cfg {Object} props (Consumer only) Additional properties that should be applied to the iframe. This can also contain nested objects e.g: <code>{style:{width:"100px", height:"100px"}}</code>. 
 * Properties such as 'name' and 'src' will be overrided. Optional.
 */
easyXDM.Socket = function(config){
    
    // create the stack
    var stack = chainStack(prepareTransportStack(config).concat([{
        incoming: function(message, origin){
            config.onMessage(message, origin);
        },
        callback: function(success){
            if (config.onReady) {
                config.onReady(success);
            }
        }
    }])), recipient = getLocation(config.remote);
    
    // set the origin
    this.origin = getLocation(config.remote);
	
    /**
     * Initiates the destruction of the stack.
     */
    this.destroy = function(){
        stack.destroy();
    };
    
    /**
     * Posts a message to the remote end of the channel
     * @param {String} message The message to send
     */
    this.postMessage = function(message){
        stack.outgoing(message, recipient);
    };
    
    stack.init();
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, undef,, chainStack, prepareTransportStack, debug, getLocation */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/** 
 * @class easyXDM.Rpc
 * Creates a proxy object that can be used to call methods implemented on the remote end of the channel, and also to provide the implementation
 * of methods to be called from the remote end.<br/>
 * The instantiated object will have methods matching those specified in <code>config.remote</code>.<br/>
 * This requires the JSON object present in the document, either natively, using json.org's json2 or as a wrapper around library spesific methods.
 * <h2>How to set up</h2>
 * <pre><code>
 * var rpc = new easyXDM.Rpc({
 * &nbsp; &#47;&#47; this configuration is equal to that used by the Socket.
 * &nbsp; remote: "http:&#47;&#47;remotedomain/...",
 * &nbsp; onReady: function(){
 * &nbsp; &nbsp; &#47;&#47; you need to wait for the onReady callback before using the proxy
 * &nbsp; &nbsp; rpc.foo(...
 * &nbsp; }
 * },{
 * &nbsp; local: {..},
 * &nbsp; remote: {..}
 * });
 * </code></pre>
 * 
 * <h2>Exposing functions (procedures)</h2>
 * <pre><code>
 * var rpc = new easyXDM.Rpc({
 * &nbsp; ...
 * },{
 * &nbsp; local: {
 * &nbsp; &nbsp; nameOfMethod: {
 * &nbsp; &nbsp; &nbsp; method: function(arg1, arg2, success, error){
 * &nbsp; &nbsp; &nbsp; &nbsp; ...
 * &nbsp; &nbsp; &nbsp; }
 * &nbsp; &nbsp; },
 * &nbsp; &nbsp; &#47;&#47; with shorthand notation 
 * &nbsp; &nbsp; nameOfAnotherMethod:  function(arg1, arg2, success, error){
 * &nbsp; &nbsp; }
 * &nbsp; },
 * &nbsp; remote: {...}
 * });
 * </code></pre>

 * The function referenced by  [method] will receive the passed arguments followed by the callback functions <code>success</code> and <code>error</code>.<br/>
 * To send a successfull result back you can use
 *     <pre><code>
 *     return foo;
 *     </pre></code>
 * or
 *     <pre><code>
 *     success(foo);
 *     </pre></code>
 *  To return an error you can use
 *     <pre><code>
 *     throw new Error("foo error");
 *     </code></pre>
 * or
 *     <pre><code>
 *     error("foo error");
 *     </code></pre>
 *
 * <h2>Defining remotely exposed methods (procedures/notifications)</h2>
 * The definition of the remote end is quite similar:
 * <pre><code>
 * var rpc = new easyXDM.Rpc({
 * &nbsp; ...
 * },{
 * &nbsp; local: {...},
 * &nbsp; remote: {
 * &nbsp; &nbsp; nameOfMethod: {}
 * &nbsp; }
 * });
 * </code></pre>
 * To call a remote method use
 * <pre><code>
 * rpc.nameOfMethod("arg1", "arg2", function(value) {
 * &nbsp; alert("success: " + value);
 * }, function(message) {
 * &nbsp; alert("error: " + message + );
 * });
 * </code></pre>
 * Both the <code>success</code> and <code>errror</code> callbacks are optional.<br/>
 * When called with no callback a JSON-RPC 2.0 notification will be executed.
 * Be aware that you will not be notified of any errors with this method.
 * <br/>
 * <h2>Specifying a custom serializer</h2>
 * If you do not want to use the JSON2 library for non-native JSON support, but instead capabilities provided by some other library
 * then you can specify a custom serializer using <code>serializer: foo</code>
 * <pre><code>
 * var rpc = new easyXDM.Rpc({
 * &nbsp; ...
 * },{
 * &nbsp; local: {...},
 * &nbsp; remote: {...},
 * &nbsp; serializer : {
 * &nbsp; &nbsp; parse: function(string){ ... },
 * &nbsp; &nbsp; stringify: function(object) {...}
 * &nbsp; }
 * });
 * </code></pre>
 * If <code>serializer</code> is set then the class will not attempt to use the native implementation.
 * @namespace easyXDM
 * @constructor
 * @param {Object} config The underlying transports configuration. See easyXDM.Socket for available parameters.
 * @param {Object} jsonRpcConfig The description of the interface to implement.
 */
easyXDM.Rpc = function(config, jsonRpcConfig){
    
    // expand shorthand notation
    if (jsonRpcConfig.local) {
        for (var method in jsonRpcConfig.local) {
            if (jsonRpcConfig.local.hasOwnProperty(method)) {
                var member = jsonRpcConfig.local[method];
                if (typeof member === "function") {
                    jsonRpcConfig.local[method] = {
                        method: member
                    };
                }
            }
        }
    }
	
    // create the stack
    var stack = chainStack(prepareTransportStack(config).concat([new easyXDM.stack.RpcBehavior(this, jsonRpcConfig), {
        callback: function(success){
            if (config.onReady) {
                config.onReady(success);
            }
        }
    }]));
	
    // set the origin 
    this.origin = getLocation(config.remote);
	
    
    /**
     * Initiates the destruction of the stack.
     */
    this.destroy = function(){
        stack.destroy();
    };
    
    stack.init();
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, getLocation, appendQueryParameters, createFrame, debug, un, on, apply, whenReady, getParentObject, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.SameOriginTransport
 * SameOriginTransport is a transport class that can be used when both domains have the same origin.<br/>
 * This can be useful for testing and for when the main application supports both internal and external sources.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remote The remote document to communicate with.
 */
easyXDM.stack.SameOriginTransport = function(config){
    var pub, frame, send, targetOrigin;
    
    return (pub = {
        outgoing: function(message, domain, fn){
            send(message);
            if (fn) {
                fn();
            }
        },
        destroy: function(){
            if (frame) {
                frame.parentNode.removeChild(frame);
                frame = null;
            }
        },
        onDOMReady: function(){
            targetOrigin = getLocation(config.remote);
            
            if (config.isHost) {
                // set up the iframe
                // 
                apply(config.props, {
                    src: appendQueryParameters(config.remote, {
                        xdm_e: location.protocol + "//" + location.host + location.pathname,
                        xdm_c: config.channel,
                        xdm_p: 4 // 4 = SameOriginTransport
                    }),
                    name: IFRAME_PREFIX + config.channel + "_provider"
                });
                frame = createFrame(config);
                easyXDM.Fn.set(config.channel, function(sendFn){
                    send = sendFn;
                    setTimeout(function(){
                        pub.up.callback(true);
                    }, 0);
                    return function(msg){
                        pub.up.incoming(msg, targetOrigin);
                    };
                });
            }
            else {
                send = getParentObject().Fn.get(config.channel, true)(function(msg){
                    pub.up.incoming(msg, targetOrigin);
                });
                setTimeout(function(){
                    pub.up.callback(true);
                }, 0);
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global global, easyXDM, window, getLocation, appendQueryParameters, createFrame, debug, apply, whenReady, IFRAME_PREFIX, namespace, resolveUrl, getDomainName, HAS_FLASH_THROTTLED_BUG, getPort, query*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.FlashTransport
 * FlashTransport is a transport class that uses an SWF with LocalConnection to pass messages back and forth.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remote The remote domain to communicate with.
 * @cfg {String} secret the pre-shared secret used to secure the communication.
 * @cfg {String} swf The path to the swf file
 * @cfg {Boolean} swfNoThrottle Set this to true if you want to take steps to avoid beeing throttled when hidden.
 * @cfg {String || DOMElement} swfContainer Set this if you want to control where the swf is placed
 */
easyXDM.stack.FlashTransport = function(config){
    var pub, // the public interface
 frame, send, targetOrigin, swf, swfContainer;
    
    function onMessage(message, origin){
        setTimeout(function(){
            pub.up.incoming(message, targetOrigin);
        }, 0);
    }
    
    /**
     * This method adds the SWF to the DOM and prepares the initialization of the channel
     */
    function addSwf(domain){
        // the differentiating query argument is needed in Flash9 to avoid a caching issue where LocalConnection would throw an error.
        var url = config.swf + "?host=" + config.isHost;
        var id = "easyXDM_swf_" + Math.floor(Math.random() * 10000);
        
        // prepare the init function that will fire once the swf is ready
        easyXDM.Fn.set("flash_loaded" + domain.replace(/[\-.]/g, "_"), function(){
            easyXDM.stack.FlashTransport[domain].swf = swf = swfContainer.firstChild;
            var queue = easyXDM.stack.FlashTransport[domain].queue;
            for (var i = 0; i < queue.length; i++) {
                queue[i]();
            }
            queue.length = 0;
        });
        
        if (config.swfContainer) {
            swfContainer = (typeof config.swfContainer == "string") ? document.getElementById(config.swfContainer) : config.swfContainer;
        }
        else {
            // create the container that will hold the swf
            swfContainer = document.createElement('div');
            
            // http://bugs.adobe.com/jira/browse/FP-4796
            // http://tech.groups.yahoo.com/group/flexcoders/message/162365
            // https://groups.google.com/forum/#!topic/easyxdm/mJZJhWagoLc
            apply(swfContainer.style, HAS_FLASH_THROTTLED_BUG && config.swfNoThrottle ? {
                height: "20px",
                width: "20px",
                position: "fixed",
                right: 0,
                top: 0
            } : {
                height: "1px",
                width: "1px",
                position: "absolute",
                overflow: "hidden",
                right: 0,
                top: 0
            });
            document.body.appendChild(swfContainer);
        }
        
        // create the object/embed
        var flashVars = "callback=flash_loaded" + domain.replace(/[\-.]/g, "_") + "&proto=" + global.location.protocol + "&domain=" + getDomainName(global.location.href) + "&port=" + getPort(global.location.href) + "&ns=" + namespace;
        swfContainer.innerHTML = "<object height='20' width='20' type='application/x-shockwave-flash' id='" + id + "' data='" + url + "'>" +
        "<param name='allowScriptAccess' value='always'></param>" +
        "<param name='wmode' value='transparent'>" +
        "<param name='movie' value='" +
        url +
        "'></param>" +
        "<param name='flashvars' value='" +
        flashVars +
        "'></param>" +
        "<embed type='application/x-shockwave-flash' FlashVars='" +
        flashVars +
        "' allowScriptAccess='always' wmode='transparent' src='" +
        url +
        "' height='1' width='1'></embed>" +
        "</object>";
    }
    
    return (pub = {
        outgoing: function(message, domain, fn){
            swf.postMessage(config.channel, message.toString());
            if (fn) {
                fn();
            }
        },
        destroy: function(){
            try {
                swf.destroyChannel(config.channel);
            } 
            catch (e) {
            }
            swf = null;
            if (frame) {
                frame.parentNode.removeChild(frame);
                frame = null;
            }
        },
        onDOMReady: function(){
            
            targetOrigin = config.remote;
            
            // Prepare the code that will be run after the swf has been intialized
            easyXDM.Fn.set("flash_" + config.channel + "_init", function(){
                setTimeout(function(){
                    pub.up.callback(true);
                });
            });
            
            // set up the omMessage handler
            easyXDM.Fn.set("flash_" + config.channel + "_onMessage", onMessage);
            
            config.swf = resolveUrl(config.swf); // reports have been made of requests gone rogue when using relative paths
            var swfdomain = getDomainName(config.swf);
            var fn = function(){
                // set init to true in case the fn was called was invoked from a separate instance
                easyXDM.stack.FlashTransport[swfdomain].init = true;
                swf = easyXDM.stack.FlashTransport[swfdomain].swf;
                // create the channel
                swf.createChannel(config.channel, config.secret, getLocation(config.remote), config.isHost);
                
                if (config.isHost) {
                    // if Flash is going to be throttled and we want to avoid this
                    if (HAS_FLASH_THROTTLED_BUG && config.swfNoThrottle) {
                        apply(config.props, {
                            position: "fixed",
                            right: 0,
                            top: 0,
                            height: "20px",
                            width: "20px"
                        });
                    }
                    // set up the iframe
                    apply(config.props, {
                        src: appendQueryParameters(config.remote, {
                            xdm_e: getLocation(location.href),
                            xdm_c: config.channel,
                            xdm_p: 6, // 6 = FlashTransport
                            xdm_s: config.secret
                        }),
                        name: IFRAME_PREFIX + config.channel + "_provider"
                    });
                    frame = createFrame(config);
                }
            };
            
            if (easyXDM.stack.FlashTransport[swfdomain] && easyXDM.stack.FlashTransport[swfdomain].init) {
                // if the swf is in place and we are the consumer
                fn();
            }
            else {
                // if the swf does not yet exist
                if (!easyXDM.stack.FlashTransport[swfdomain]) {
                    // add the queue to hold the init fn's
                    easyXDM.stack.FlashTransport[swfdomain] = {
                        queue: [fn]
                    };
                    addSwf(swfdomain);
                }
                else {
                    easyXDM.stack.FlashTransport[swfdomain].queue.push(fn);
                }
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, getLocation, appendQueryParameters, createFrame, debug, un, on, apply, whenReady, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.PostMessageTransport
 * PostMessageTransport is a transport class that uses HTML5 postMessage for communication.<br/>
 * <a href="http://msdn.microsoft.com/en-us/library/ms644944(VS.85).aspx">http://msdn.microsoft.com/en-us/library/ms644944(VS.85).aspx</a><br/>
 * <a href="https://developer.mozilla.org/en/DOM/window.postMessage">https://developer.mozilla.org/en/DOM/window.postMessage</a>
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remote The remote domain to communicate with.
 */
easyXDM.stack.PostMessageTransport = function(config){
    var pub, // the public interface
 frame, // the remote frame, if any
 callerWindow, // the window that we will call with
 targetOrigin; // the domain to communicate with
    /**
     * Resolves the origin from the event object
     * @private
     * @param {Object} event The messageevent
     * @return {String} The scheme, host and port of the origin
     */
    function _getOrigin(event){
        if (event.origin) {
            // This is the HTML5 property
            return getLocation(event.origin);
        }
        if (event.uri) {
            // From earlier implementations 
            return getLocation(event.uri);
        }
        if (event.domain) {
            // This is the last option and will fail if the 
            // origin is not using the same schema as we are
            return location.protocol + "//" + event.domain;
        }
        throw "Unable to retrieve the origin of the event";
    }
    
    /**
     * This is the main implementation for the onMessage event.<br/>
     * It checks the validity of the origin and passes the message on if appropriate.
     * @private
     * @param {Object} event The messageevent
     */
    function _window_onMessage(event){
        var origin = _getOrigin(event);
        if (origin == targetOrigin && event.data.substring(0, config.channel.length + 1) == config.channel + " ") {
            pub.up.incoming(event.data.substring(config.channel.length + 1), origin);
        }
    }
    
    return (pub = {
        outgoing: function(message, domain, fn){
            callerWindow.postMessage(config.channel + " " + message, domain || targetOrigin);
            if (fn) {
                fn();
            }
        },
        destroy: function(){
            un(window, "message", _window_onMessage);
            if (frame) {
                callerWindow = null;
                frame.parentNode.removeChild(frame);
                frame = null;
            }
        },
        onDOMReady: function(){
            targetOrigin = getLocation(config.remote);
            if (config.isHost) {
                // add the event handler for listening
                var waitForReady = function(event){  
                    if (event.data == config.channel + "-ready") {
                        // replace the eventlistener
                        callerWindow = ("postMessage" in frame.contentWindow) ? frame.contentWindow : frame.contentWindow.document;
                        un(window, "message", waitForReady);
                        on(window, "message", _window_onMessage);
                        setTimeout(function(){
                            pub.up.callback(true);
                        }, 0);
                    }
                };
                on(window, "message", waitForReady);
                
                // set up the iframe
                apply(config.props, {
                    src: appendQueryParameters(config.remote, {
                        xdm_e: getLocation(location.href),
                        xdm_c: config.channel,
                        xdm_p: 1 // 1 = PostMessage
                    }),
                    name: IFRAME_PREFIX + config.channel + "_provider"
                });
                frame = createFrame(config);
            }
            else {
                // add the event handler for listening
                on(window, "message", _window_onMessage);
                callerWindow = ("postMessage" in window.parent) ? window.parent : window.parent.document;
                callerWindow.postMessage(config.channel + "-ready", targetOrigin);
                
                setTimeout(function(){
                    pub.up.callback(true);
                }, 0);
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, getLocation, appendQueryParameters, createFrame, debug, apply, query, whenReady, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.FrameElementTransport
 * FrameElementTransport is a transport class that can be used with Gecko-browser as these allow passing variables using the frameElement property.<br/>
 * Security is maintained as Gecho uses Lexical Authorization to determine under which scope a function is running.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remote The remote document to communicate with.
 */
easyXDM.stack.FrameElementTransport = function(config){
    var pub, frame, send, targetOrigin;
    
    return (pub = {
        outgoing: function(message, domain, fn){
            send.call(this, message);
            if (fn) {
                fn();
            }
        },
        destroy: function(){
            if (frame) {
                frame.parentNode.removeChild(frame);
                frame = null;
            }
        },
        onDOMReady: function(){
            targetOrigin = getLocation(config.remote);
            
            if (config.isHost) {
                // set up the iframe
                apply(config.props, {
                    src: appendQueryParameters(config.remote, {
                        xdm_e: getLocation(location.href),
                        xdm_c: config.channel,
                        xdm_p: 5 // 5 = FrameElementTransport
                    }),
                    name: IFRAME_PREFIX + config.channel + "_provider"
                });
                frame = createFrame(config);
                frame.fn = function(sendFn){
                    delete frame.fn;
                    send = sendFn;
                    setTimeout(function(){
                        pub.up.callback(true);
                    }, 0);
                    // remove the function so that it cannot be used to overwrite the send function later on
                    return function(msg){
                        pub.up.incoming(msg, targetOrigin);
                    };
                };
            }
            else {
                // This is to mitigate origin-spoofing
                if (document.referrer && getLocation(document.referrer) != query.xdm_e) {
                    window.top.location = query.xdm_e;
                }
                send = window.frameElement.fn(function(msg){
                    pub.up.incoming(msg, targetOrigin);
                });
                pub.up.callback(true);
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, undef, getLocation, appendQueryParameters, resolveUrl, createFrame, debug, un, apply, whenReady, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.NameTransport
 * NameTransport uses the window.name property to relay data.
 * The <code>local</code> parameter needs to be set on both the consumer and provider,<br/>
 * and the <code>remoteHelper</code> parameter needs to be set on the consumer.
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String} remoteHelper The url to the remote instance of hash.html - this is only needed for the host.
 * @namespace easyXDM.stack
 */
easyXDM.stack.NameTransport = function(config){
    
    var pub; // the public interface
    var isHost, callerWindow, remoteWindow, readyCount, callback, remoteOrigin, remoteUrl;
    
    function _sendMessage(message){
        var url = config.remoteHelper + (isHost ? "#_3" : "#_2") + config.channel;
        callerWindow.contentWindow.sendMessage(message, url);
    }
    
    function _onReady(){
        if (isHost) {
            if (++readyCount === 2 || !isHost) {
                pub.up.callback(true);
            }
        }
        else {
            _sendMessage("ready");
            pub.up.callback(true);
        }
    }
    
    function _onMessage(message){
        pub.up.incoming(message, remoteOrigin);
    }
    
    function _onLoad(){
        if (callback) {
            setTimeout(function(){
                callback(true);
            }, 0);
        }
    }
    
    return (pub = {
        outgoing: function(message, domain, fn){
            callback = fn;
            _sendMessage(message);
        },
        destroy: function(){
            callerWindow.parentNode.removeChild(callerWindow);
            callerWindow = null;
            if (isHost) {
                remoteWindow.parentNode.removeChild(remoteWindow);
                remoteWindow = null;
            }
        },
        onDOMReady: function(){
            isHost = config.isHost;
            readyCount = 0;
            remoteOrigin = getLocation(config.remote);
            config.local = resolveUrl(config.local);
            
            if (isHost) {
                // Register the callback
                easyXDM.Fn.set(config.channel, function(message){
                    if (isHost && message === "ready") {
                        // Replace the handler
                        easyXDM.Fn.set(config.channel, _onMessage);
                        _onReady();
                    }
                });
                
                // Set up the frame that points to the remote instance
                remoteUrl = appendQueryParameters(config.remote, {
                    xdm_e: config.local,
                    xdm_c: config.channel,
                    xdm_p: 2
                });
                apply(config.props, {
                    src: remoteUrl + '#' + config.channel,
                    name: IFRAME_PREFIX + config.channel + "_provider"
                });
                remoteWindow = createFrame(config);
            }
            else {
                config.remoteHelper = config.remote;
                easyXDM.Fn.set(config.channel, _onMessage);
            }
            // Set up the iframe that will be used for the transport
            
            callerWindow = createFrame({
                props: {
                    src: config.local + "#_4" + config.channel
                },
                onLoad: function onLoad(){
                    // Remove the handler
                    var w = callerWindow || this;
                    un(w, "load", onLoad);
                    easyXDM.Fn.set(config.channel + "_load", _onLoad);
                    (function test(){
                        if (typeof w.contentWindow.sendMessage == "function") {
                            _onReady();
                        }
                        else {
                            setTimeout(test, 50);
                        }
                    }());
                }
            });
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, getLocation, createFrame, debug, un, on, apply, whenReady, IFRAME_PREFIX*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.HashTransport
 * HashTransport is a transport class that uses the IFrame URL Technique for communication.<br/>
 * <a href="http://msdn.microsoft.com/en-us/library/bb735305.aspx">http://msdn.microsoft.com/en-us/library/bb735305.aspx</a><br/>
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The transports configuration.
 * @cfg {String/Window} local The url to the local file used for proxying messages, or the local window.
 * @cfg {Number} delay The number of milliseconds easyXDM should try to get a reference to the local window.
 * @cfg {Number} interval The interval used when polling for messages.
 */
easyXDM.stack.HashTransport = function(config){
    var pub;
    var me = this, isHost, _timer, pollInterval, _lastMsg, _msgNr, _listenerWindow, _callerWindow;
    var useParent, _remoteOrigin;
    
    function _sendMessage(message){
        if (!_callerWindow) {
            return;
        }
        var url = config.remote + "#" + (_msgNr++) + "_" + message;
        ((isHost || !useParent) ? _callerWindow.contentWindow : _callerWindow).location = url;
    }
    
    function _handleHash(hash){
        _lastMsg = hash;
        pub.up.incoming(_lastMsg.substring(_lastMsg.indexOf("_") + 1), _remoteOrigin);
    }
    
    /**
     * Checks location.hash for a new message and relays this to the receiver.
     * @private
     */
    function _pollHash(){
        if (!_listenerWindow) {
            return;
        }
        var href = _listenerWindow.location.href, hash = "", indexOf = href.indexOf("#");
        if (indexOf != -1) {
            hash = href.substring(indexOf);
        }
        if (hash && hash != _lastMsg) {
            _handleHash(hash);
        }
    }
    
    function _attachListeners(){
        _timer = setInterval(_pollHash, pollInterval);
    }
    
    return (pub = {
        outgoing: function(message, domain){
            _sendMessage(message);
        },
        destroy: function(){
            window.clearInterval(_timer);
            if (isHost || !useParent) {
                _callerWindow.parentNode.removeChild(_callerWindow);
            }
            _callerWindow = null;
        },
        onDOMReady: function(){
            isHost = config.isHost;
            pollInterval = config.interval;
            _lastMsg = "#" + config.channel;
            _msgNr = 0;
            useParent = config.useParent;
            _remoteOrigin = getLocation(config.remote);
            if (isHost) {
                apply(config.props, {
                    src: config.remote,
                    name: IFRAME_PREFIX + config.channel + "_provider"
                });
                if (useParent) {
                    config.onLoad = function(){
                        _listenerWindow = window;
                        _attachListeners();
                        pub.up.callback(true);
                    };
                }
                else {
                    var tries = 0, max = config.delay / 50;
                    (function getRef(){
                        if (++tries > max) {
                            throw new Error("Unable to reference listenerwindow");
                        }
                        try {
                            _listenerWindow = _callerWindow.contentWindow.frames[IFRAME_PREFIX + config.channel + "_consumer"];
                        } 
                        catch (ex) {
                        }
                        if (_listenerWindow) {
                            _attachListeners();
                            pub.up.callback(true);
                        }
                        else {
                            setTimeout(getRef, 50);
                        }
                    }());
                }
                _callerWindow = createFrame(config);
            }
            else {
                _listenerWindow = window;
                _attachListeners();
                if (useParent) {
                    _callerWindow = parent;
                    pub.up.callback(true);
                }
                else {
                    apply(config, {
                        props: {
                            src: config.remote + "#" + config.channel + new Date(),
                            name: IFRAME_PREFIX + config.channel + "_consumer"
                        },
                        onLoad: function(){
                            pub.up.callback(true);
                        }
                    });
                    _callerWindow = createFrame(config);
                }
            }
        },
        init: function(){
            whenReady(pub.onDOMReady, pub);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.ReliableBehavior
 * This is a behavior that tries to make the underlying transport reliable by using acknowledgements.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The behaviors configuration.
 */
easyXDM.stack.ReliableBehavior = function(config){
    var pub, // the public interface
 callback; // the callback to execute when we have a confirmed success/failure
    var idOut = 0, idIn = 0, currentMessage = "";
    
    return (pub = {
        incoming: function(message, origin){
            var indexOf = message.indexOf("_"), ack = message.substring(0, indexOf).split(",");
            message = message.substring(indexOf + 1);
            
            if (ack[0] == idOut) {
                currentMessage = "";
                if (callback) {
                    callback(true);
                }
            }
            if (message.length > 0) {
                pub.down.outgoing(ack[1] + "," + idOut + "_" + currentMessage, origin);
                if (idIn != ack[1]) {
                    idIn = ack[1];
                    pub.up.incoming(message, origin);
                }
            }
            
        },
        outgoing: function(message, origin, fn){
            currentMessage = message;
            callback = fn;
            pub.down.outgoing(idIn + "," + (++idOut) + "_" + message, origin);
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, debug, undef, removeFromStack*/
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.QueueBehavior
 * This is a behavior that enables queueing of messages. <br/>
 * It will buffer incoming messages and dispach these as fast as the underlying transport allows.
 * This will also fragment/defragment messages so that the outgoing message is never bigger than the
 * set length.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The behaviors configuration. Optional.
 * @cfg {Number} maxLength The maximum length of each outgoing message. Set this to enable fragmentation.
 */
easyXDM.stack.QueueBehavior = function(config){
    var pub, queue = [], waiting = true, incoming = "", destroying, maxLength = 0, lazy = false, doFragment = false;
    
    function dispatch(){
        if (config.remove && queue.length === 0) {
            removeFromStack(pub);
            return;
        }
        if (waiting || queue.length === 0 || destroying) {
            return;
        }
        waiting = true;
        var message = queue.shift();
        
        pub.down.outgoing(message.data, message.origin, function(success){
            waiting = false;
            if (message.callback) {
                setTimeout(function(){
                    message.callback(success);
                }, 0);
            }
            dispatch();
        });
    }
    return (pub = {
        init: function(){
            if (undef(config)) {
                config = {};
            }
            if (config.maxLength) {
                maxLength = config.maxLength;
                doFragment = true;
            }
            if (config.lazy) {
                lazy = true;
            }
            else {
                pub.down.init();
            }
        },
        callback: function(success){
            waiting = false;
            var up = pub.up; // in case dispatch calls removeFromStack
            dispatch();
            up.callback(success);
        },
        incoming: function(message, origin){
            if (doFragment) {
                var indexOf = message.indexOf("_"), seq = parseInt(message.substring(0, indexOf), 10);
                incoming += message.substring(indexOf + 1);
                if (seq === 0) {
                    if (config.encode) {
                        incoming = decodeURIComponent(incoming);
                    }
                    pub.up.incoming(incoming, origin);
                    incoming = "";
                }
            }
            else {
                pub.up.incoming(message, origin);
            }
        },
        outgoing: function(message, origin, fn){
            if (config.encode) {
                message = encodeURIComponent(message);
            }
            var fragments = [], fragment;
            if (doFragment) {
                // fragment into chunks
                while (message.length !== 0) {
                    fragment = message.substring(0, maxLength);
                    message = message.substring(fragment.length);
                    fragments.push(fragment);
                }
                // enqueue the chunks
                while ((fragment = fragments.shift())) {
                    queue.push({
                        data: fragments.length + "_" + fragment,
                        origin: origin,
                        callback: fragments.length === 0 ? fn : null
                    });
                }
            }
            else {
                queue.push({
                    data: message,
                    origin: origin,
                    callback: fn
                });
            }
            if (lazy) {
                pub.down.init();
            }
            else {
                dispatch();
            }
        },
        destroy: function(){
            destroying = true;
            pub.down.destroy();
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, undef, debug */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.VerifyBehavior
 * This behavior will verify that communication with the remote end is possible, and will also sign all outgoing,
 * and verify all incoming messages. This removes the risk of someone hijacking the iframe to send malicious messages.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} config The behaviors configuration.
 * @cfg {Boolean} initiate If the verification should be initiated from this end.
 */
easyXDM.stack.VerifyBehavior = function(config){
    var pub, mySecret, theirSecret, verified = false;
    
    function startVerification(){
        mySecret = Math.random().toString(16).substring(2);
        pub.down.outgoing(mySecret);
    }
    
    return (pub = {
        incoming: function(message, origin){
            var indexOf = message.indexOf("_");
            if (indexOf === -1) {
                if (message === mySecret) {
                    pub.up.callback(true);
                }
                else if (!theirSecret) {
                    theirSecret = message;
                    if (!config.initiate) {
                        startVerification();
                    }
                    pub.down.outgoing(message);
                }
            }
            else {
                if (message.substring(0, indexOf) === theirSecret) {
                    pub.up.incoming(message.substring(indexOf + 1), origin);
                }
            }
        },
        outgoing: function(message, origin, fn){
            pub.down.outgoing(mySecret + "_" + message, origin, fn);
        },
        callback: function(success){
            if (config.initiate) {
                startVerification();
            }
        }
    });
};
/*jslint evil: true, browser: true, immed: true, passfail: true, undef: true, newcap: true*/
/*global easyXDM, window, escape, unescape, undef, getJSON, debug, emptyFn, isArray */
//
// easyXDM
// http://easyxdm.net/
// Copyright(c) 2009-2011, Øyvind Sean Kinsey, oyvind@kinsey.no.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

/**
 * @class easyXDM.stack.RpcBehavior
 * This uses JSON-RPC 2.0 to expose local methods and to invoke remote methods and have responses returned over the the string based transport stack.<br/>
 * Exposed methods can return values synchronous, asyncronous, or bet set up to not return anything.
 * @namespace easyXDM.stack
 * @constructor
 * @param {Object} proxy The object to apply the methods to.
 * @param {Object} config The definition of the local and remote interface to implement.
 * @cfg {Object} local The local interface to expose.
 * @cfg {Object} remote The remote methods to expose through the proxy.
 * @cfg {Object} serializer The serializer to use for serializing and deserializing the JSON. Should be compatible with the HTML5 JSON object. Optional, will default to JSON.
 */
easyXDM.stack.RpcBehavior = function(proxy, config){
    var pub, serializer = config.serializer || getJSON();
    var _callbackCounter = 0, _callbacks = {};
    
    /**
     * Serializes and sends the message
     * @private
     * @param {Object} data The JSON-RPC message to be sent. The jsonrpc property will be added.
     */
    function _send(data){
        data.jsonrpc = "2.0";
        pub.down.outgoing(serializer.stringify(data));
    }
    
    /**
     * Creates a method that implements the given definition
     * @private
     * @param {Object} The method configuration
     * @param {String} method The name of the method
     * @return {Function} A stub capable of proxying the requested method call
     */
    function _createMethod(definition, method){
        var slice = Array.prototype.slice;
        
        return function(){
            var l = arguments.length, callback, message = {
                method: method
            };
            
            if (l > 0 && typeof arguments[l - 1] === "function") {
                //with callback, procedure
                if (l > 1 && typeof arguments[l - 2] === "function") {
                    // two callbacks, success and error
                    callback = {
                        success: arguments[l - 2],
                        error: arguments[l - 1]
                    };
                    message.params = slice.call(arguments, 0, l - 2);
                }
                else {
                    // single callback, success
                    callback = {
                        success: arguments[l - 1]
                    };
                    message.params = slice.call(arguments, 0, l - 1);
                }
                _callbacks["" + (++_callbackCounter)] = callback;
                message.id = _callbackCounter;
            }
            else {
                // no callbacks, a notification
                message.params = slice.call(arguments, 0);
            }
            if (definition.namedParams && message.params.length === 1) {
                message.params = message.params[0];
            }
            // Send the method request
            _send(message);
        };
    }
    
    /**
     * Executes the exposed method
     * @private
     * @param {String} method The name of the method
     * @param {Number} id The callback id to use
     * @param {Function} method The exposed implementation
     * @param {Array} params The parameters supplied by the remote end
     */
    function _executeMethod(method, id, fn, params){
        if (!fn) {
            if (id) {
                _send({
                    id: id,
                    error: {
                        code: -32601,
                        message: "Procedure not found."
                    }
                });
            }
            return;
        }
        
        var success, error;
        if (id) {
            success = function(result){
                success = emptyFn;
                _send({
                    id: id,
                    result: result
                });
            };
            error = function(message, data){
                error = emptyFn;
                var msg = {
                    id: id,
                    error: {
                        code: -32099,
                        message: message
                    }
                };
                if (data) {
                    msg.error.data = data;
                }
                _send(msg);
            };
        }
        else {
            success = error = emptyFn;
        }
        // Call local method
        if (!isArray(params)) {
            params = [params];
        }
        try {
            var result = fn.method.apply(fn.scope, params.concat([success, error]));
            if (!undef(result)) {
                success(result);
            }
        } 
        catch (ex1) {
            error(ex1.message);
        }
    }
    
    return (pub = {
        incoming: function(message, origin){
            var data = serializer.parse(message);
            if (data.method) {
                // A method call from the remote end
                if (config.handle) {
                    config.handle(data, _send);
                }
                else {
                    _executeMethod(data.method, data.id, config.local[data.method], data.params);
                }
            }
            else {
                // A method response from the other end
                var callback = _callbacks[data.id];
                if (data.error) {
                    if (callback.error) {
                        callback.error(data.error);
                    }
                }
                else if (callback.success) {
                    callback.success(data.result);
                }
                delete _callbacks[data.id];
            }
        },
        init: function(){
            if (config.remote) {
                // Implement the remote sides exposed methods
                for (var method in config.remote) {
                    if (config.remote.hasOwnProperty(method)) {
                        proxy[method] = _createMethod(config.remote[method], method);
                    }
                }
            }
            pub.down.init();
        },
        destroy: function(){
            for (var method in config.remote) {
                if (config.remote.hasOwnProperty(method) && proxy.hasOwnProperty(method)) {
                    delete proxy[method];
                }
            }
            pub.down.destroy();
        }
    });
};
global.easyXDM = easyXDM;
})(window, document, location, window.setTimeout, decodeURIComponent, encodeURIComponent);

// emile.js (c) 2009 Thomas Fuchs
// Licensed under the terms of the MIT license.

(function(emile, container){
  var parseEl = document.createElement('div'),
    props = ('backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth '+
    'borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize '+
    'fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight '+
    'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft '+
    'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' ');

  function interpolate(source,target,pos){ return (source+(target-source)*pos).toFixed(3); }
  function s(str, p, c){ return str.substr(p,c||1); }
  function color(source,target,pos){
    var i = 2, j, c, tmp, v = [], r = [];
    while(j=3,c=arguments[i-1],i--)
      if(s(c,0)=='r') { c = c.match(/\d+/g); while(j--) v.push(~~c[j]); } else {
        if(c.length==4) c='#'+s(c,1)+s(c,1)+s(c,2)+s(c,2)+s(c,3)+s(c,3);
        while(j--) v.push(parseInt(s(c,1+j*2,2), 16)); }
    while(j--) { tmp = ~~(v[j+3]+(v[j]-v[j+3])*pos); r.push(tmp<0?0:tmp>255?255:tmp); }
    return 'rgb('+r.join(',')+')';
  }
  
  function parse(prop){
    var p = parseFloat(prop), q = prop.replace(/^[\-\d\.]+/,'');
    return isNaN(p) ? { v: q, f: color, u: ''} : { v: p, f: interpolate, u: q };
  }
  
  function normalize(style){
    var css, rules = {}, i = props.length, v;
    parseEl.innerHTML = '<div style="'+style+'"></div>';
    css = parseEl.childNodes[0].style;
    while(i--) if(v = css[props[i]]) rules[props[i]] = parse(v);
    return rules;
  }  
  
  container[emile] = function(el, style, opts, after){
    el = typeof el == 'string' ? document.getElementById(el) : el;
    opts = opts || {};
    var target = normalize(style), comp = el.currentStyle ? el.currentStyle : getComputedStyle(el, null),
      prop, current = {}, start = +new Date, dur = opts.duration||200, finish = start+dur, interval,
      easing = opts.easing || function(pos){ return (-Math.cos(pos*Math.PI)/2) + 0.5; };
    for(prop in target) current[prop] = parse(comp[prop]);
    interval = setInterval(function(){
      var time = +new Date, pos = time>finish ? 1 : (time-start)/dur;
      for(prop in target)
        el.style[prop] = target[prop].f(current[prop].v,target[prop].v,easing(pos)) + target[prop].u;
      if(time>finish) { clearInterval(interval); opts.after && opts.after(); after && setTimeout(after,1); }
    },10);
  }
})('emile', this);
/*jslint indent:2, browser:true, devel:true */
/*global BrightTag, bt_log */

function EventManager(window) {
  'use strict';

  // TODO: replace with BrightTag.jQueryLoader
  this.trigger = function (name) {
    var jQueryRef, event;
    if (typeof BrightTag !== "undefined" && BrightTag.jQuery) {
      //use BT jquery if possible
      jQueryRef = BrightTag.jQuery;
    } else if (window.jQuery) {
      //use global otherwise
      jQueryRef = window.jQuery;
    } else {
      return false;
    }
    try {
      event = jQueryRef.Event(name);
      jQueryRef('body').trigger(event);
      return true;
    } catch (e) {
      //stuff broke
      return false;
    }
  };
}

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

