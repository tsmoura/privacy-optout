var brighttagModal = {
  loadData : function(data){
    var self = this;
    //Slide-out panel
    var $modal = jQuery('#bt-modal');
    var $overlay = jQuery('#bt-overlay');
    // jQuery(window.parent.document).find("#bt-modal-iframe").remove();
    jQuery(".bt-expand").live("click", function(e){
      e.preventDefault();
      jQuery("div.bt-hidden").slideToggle(200, function(){
        jQuery("a.bt-expand").toggleClass("open");
      });
    });

    // determine the state passed down from tagserve
    var state = self.determineState(data);
    self.clientInfo["vendorPrivacyInfo"] = data.vendorPrivacyInfo;

    //Button events
    jQuery("a.bt-action-intro").live("click", function(e){
      e.preventDefault();
      self.opt("OPTED_IN", function() {
        jQuery("div.bt-panel:visible").fadeOut(200, function(){
          jQuery("div.bt-success-opt-in").fadeIn(200);
        });
      } );
    });
    jQuery("a.bt-action-notification").live("click", function(e){
      e.preventDefault();
      self.btNotificationView();
    });
    jQuery("a.bt-action-empty").live("click", function(e){ e.preventDefault(); self.btEmptyView(); });
    jQuery("a.bt-action-confirm").live("click", function(e){  e.preventDefault(); self.btConfirmView(); });
    jQuery("a.bt-action-success").live("click", function(e) {
      e.preventDefault();
      self.opt("OPTED_OUT", function() {
        jQuery("div.bt-panel:visible").fadeOut(200, function(){
          jQuery("div.bt-success").fadeIn(200);
        });
      });
    });
    jQuery("a.bt-action-sorry").live("click", function(e){ e.preventDefault(); self.btSorryView(); });
    jQuery("a.bt-action-what").live("click", function(e){ e.preventDefault();  self.btWhatView(); });
    jQuery("a.bt-action-close").live("click", function(e){ e.preventDefault(); self.closeModal($modal, $overlay); });

    self.setupModals($modal, $overlay);

    //Setup jSON content, and load template
    self.renderContent(state);
  },
  determineState: function(data) {
    switch(data.userPrivacyStatus) {
      case "NO_COOKIE":
      case "OPTED_IN":
        return "bt-intro";
      case "OPTED_OUT":
        return "bt-notification";
    }
  },
  init : function() {
    var self = this;
    self.clientInfo = $.parseJSON($('script[src$="privacy-dialog.js"]').text());
    if (!self.clientInfo.host) {
      self.clientInfo.host = "s.thebrighttag.com";
    }    
    jQuery.getJSON("//" + self.clientInfo.host + "/api/privacy/" + self.clientInfo.siteId +"?callback=?", function(data) {
      self.loadData(data);
    });
  },    
  opt: function(command, success) {
    var self = this;
    jQuery.getJSON("//" + self.clientInfo.host + "/api/privacy/" +
        self.clientInfo.siteId + "/choice/" + command + "?callback=?", success);
  },
  pickDialog: function() {
    var self = this;
  },
  renderContent: function(state){

    jQuery("#bt-modal").html($("#bt-template").tmpl(this.clientInfo));

    //Hide panels, show first
    jQuery("div.bt-panel").hide();
    jQuery("." + state).show();
  },
  btIntroView: function(){
    //Notifcation View
    // console.log("This is where the intro view will happen");

    jQuery("div.bt-panel:visible").fadeOut(200, function(){
      jQuery("div.bt-intro").fadeIn(200);
    });
  },
  btNotificationView: function(){
    //Notifcation View
    // console.log("This is where the notification view will happen");

    jQuery("div.bt-panel:visible").fadeOut(200, function(){
      jQuery("div.bt-notification").fadeIn(200);
    });
  },
  btEmptyView: function(){
    //Empty View
    // console.log("This is where the empty view will happen");

    jQuery("div.bt-panel:visible").fadeOut(200, function(){
      jQuery("div.bt-empty").fadeIn(200);
    });
  },
  btConfirmView: function(){
    //Confirm View
    // console.log("This is where the confim view will happen");

    jQuery("div.bt-panel:visible").fadeOut(200, function(){
      jQuery("div.bt-confirm").fadeIn(200);
    });
  },
  btSorryView: function(){
    //Sorry View
    // console.log("This is where the sorry view will happen");

    jQuery("div.bt-panel:visible").fadeOut(200, function(){
      jQuery("div.bt-sorry").fadeIn(200);
    });
  },
  btWhatView: function(){
    //What View
    // console.log("This is where the what view will happen");

    jQuery("div.bt-panel:visible").fadeOut(200, function(){
      jQuery("div.bt-what").fadeIn(200);
    });
  },
  setupModals: function($modal, $overlay){
    var self = this;
    var $close = jQuery('a.bt-close, a.bt-cancel', $modal);

    // set overlay height
    var docHeight = jQuery(document).height();
    $overlay.css({ height : docHeight });

    //fade in modal
    $overlay.fadeTo('fast',.5,function(){
      // center modal
      $modal.css("top", (jQuery(window).height() - 200) / 2+jQuery(window).scrollTop() + "px");
      $modal.css("left", (jQuery(window).width() - $modal.width() ) / 2+jQuery(window).scrollLeft() + "px");

      //fade in modal
      $modal.fadeIn('slow');
    });

    // overlay close
    $overlay.click(function(){
      self.closeModal($modal, $overlay);
    });

    // close
    $close.live("click", function(e){
      e.preventDefault();
      self.closeModal($modal, $overlay);
    });
  },
  closeModal: function($modal, $overlay){
    $modal.fadeOut('slow',function(){
      $overlay.fadeOut('fast', function(){
        window.setTimeout(function() {
          jQuery(window.parent.document).find("#bt-iframe-wrapper").remove();
        },1);
      });
    });
  }
};

jQuery(function() { brighttagModal.init(); });
