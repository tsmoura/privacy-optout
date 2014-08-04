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
