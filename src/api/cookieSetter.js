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