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
