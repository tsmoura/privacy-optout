/*jslint indent:2, browser:true */

window.Connector = (function (window) {
  'use strict';

  var defaultConfig = {
      workflow: 'implicit-opt-in'
    },
    api = {
      config: defaultConfig
    },
    socket = new window.easyXDM.Socket({
      onMessage: function (message, origin) {
        api.config.workflow = message;
      }
    });

  api.publish = function (message) {
    socket.postMessage(message);
  };

  api.trigger = function (event) {
    api.publish('trigger:' + event);
  };

  return api;
}(window));
