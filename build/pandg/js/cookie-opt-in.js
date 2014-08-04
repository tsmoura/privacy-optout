/*
 *  ----------------------------------------------------------------------
 *  Copyright (c) 2012 BrightTag
 *  ----------------------------------------------------------------------
 *
 *  The script anticipates JSONP output values formatted as follows:
 *  
 *  OptIn.change({"user":"1","state":{"state":"opted_in"}})
 *  OptIn.change({"user":"2","state":{"state":"opted_out"}})
 *  OptIn.change({"user":"3","state":"make_choice"})
 *  
 */

// The OptIn object
var OptIn = {
  
  optedIn: false,
  
  localhost: (typeof BTPrivacyEnv !== "undefined") ? BTPrivacyEnv : "//privacy.thebrighttag.com/pandg/css/",
  // The paths on the remote server configured to receive and send user values
  remoteGetPath: '/get_user_state.php?user=',
  remoteSetPath: '/set_user_state.php?user=',
  
  // The external URL for more information on cookies
  moreInfoPath: 'http://www.pg.com/en_US/privacy/english/cookie_notice.shtml',
  
  html: document.getElementsByTagName( 'html' )[0],
  body: document.getElementsByTagName( 'body' )[0],
  
  // The greater of the values for the BODY and HTML elements' width and height
  
  bodyWidth: function() {
    return ( this.html.scrollWidth > this.body.scrollWidth ) ? this.html.scrollWidth : this.body.scrollWidth;
  },
  
  bodyHeight: function() {
    return ( this.html.scrollHeight > this.body.scrollHeight ) ? this.html.scrollHeight : this.body.scrollHeight;
  },
  
  // The number of pixels to append to the bottom of the Body element
  bodyPadding: 60,
  
  // The default time in milliseconds during which animations will run
  defaultDuration: 400,
  
  // The current state of our page. This should always equal userState, except for the brief period of time between reading the userState from the remoteHost, and finishing the transitions from the current state to the new userState.
  pageState: null,
  
  // The user's current opt-in state. This is read from the remoteHost in getInitialState
  userState: null,
  
  // Receives property set for user's existing or chosen state
  nextState: null,

  // Each property set contains the style properties and values (in pixels, except for opacity) for each page/option state
  // make_choice:   user needs to choose a privacy setting or has decided to revisit his or her choice; page is visible beneath matte but is prevented from interacting with it
  // are_you_sure:  user needs to confirm her opt-out; page is visible beneath matte but is prevented from interacting with it
  // opted_out:     user has opted-out; user can interact with page, which is visible below an intrusive horizontal element that encourages user to opt-in
  // opted_in:      user has opted-in; user can interact with page, which is visible above an unintrusive horizontal element that enables user to opt-out
  propertySets: {

    cookie_header_settings: {
      intro: 'We use cookies to give you the best experience of our website. By browsing you agree to our use of cookies.',
      more_info: 'Find out more about cookies',
      action_button: 'Change cookie settings'
    },

    make_choice: {
      modal: true,
      top: 120,
      left: 120,
      width: 662,
      height: 603,
      paddingTop: 0,
      opacity: 0.9,
      header:     'Change cookie settings',
      intro:      '<p>We don&rsquo;t mean the chocolate chip kind, these digital &ldquo;cookies&rdquo; give you a more personal website experience by tracking what you click on. Approved cookies have always been there, but we need to make sure you understand what they&rsquo;re about.</p>',
      more_info:  'Find out more about cookies',
      choice_yes: 'Yes, allow cookies and continue',
      choice_no:  'No, turn cookies off'
    },

    make_choice_simple: {
      modal: true,
      top: 120,
      left: 120,
      width: 662,
      height: 250,
      paddingTop: 0,
      opacity: 0.9,
      header:     'Change cookie settings',
      intro:      '<p>We don\'t mean the chocolate chip kind, these digital \'cookies\' give you a more personal website experience by tracking what you click on.  Approved cookies have always been there and help us give you freebies, offers and other things we know you\'ll love.</p>',
      more_info:  'Find out more about cookies',
      choice_yes: 'Keep cookies turned on',
      choice_no:  'Turn cookies off'
    },

    cookies_required: {
      modal: true,
      top: 120,
      left: 120,
      width: 662,
      height: 340,
      paddingTop: 0,
      opacity: 0.9,
      header:     'Oops, your cookies are turned off',
      intro:      '<p>Please allow cookies to register or log in to your account.</p>' +
                  '<p><strong>Without cookies you can\'t:</strong></p>' +
                  '<ul>' +
                  '<li>Become a registered member or log in' +
                  '<li>Post comments or ratings' +
                  '<li>Order free samples and print money-off coupons' +
                  '<li>See information that\'s tailored to you' +
                  '</ul>',
      more_info:  'Find out more about cookies',
      choice_yes: 'Allow cookies and continue',
      choice_no:  'Cancel'
    },

    opted_out: {
      modal: false,
      top: 0,
      left: 0,
      width: '100%',
      height: 57,
      paddingTop: 57,
      opacity: 0,
      header:     'Turn cookies on for a better website experience',
      more_info:  'Find out more about cookies',
      choice_yes: 'Allow cookies',
      choice_no:  'Deny cookies'
    },

    opted_in: {
      modal: false,
      top: 0,
      left: 0,
      width: '1000px',
      bottom: 0,
      height: 57,
      paddingTop: 0,
      opacity: 0,
      header:     'Good news! Your cookies are turned on. <span>This means you are enjoying the best personalised experience.</span>',
      more_info:  'Find out more about cookies',
      choice_yes: 'Yes, allow cookies and continue',
      choice_no:  'No, turn cookies off'
    },

    implicit_opt_in: {
      modal: false,
      top: 0,
      left: 0,
      width: '100%',
      height: 57,
      paddingTop: 57,
      opacity: 0,
      header:     'Turn cookies on for a better website experience',
      more_info:  'Find out more about cookies',
      choice_yes: 'Allow cookies',
      choice_no:  'Deny cookies'
    },
    
    //disabled footer
    disabled_footer: {
      modal: false,
      top: 0,
      left: 0,
      width: '1000px',
      bottom: 0,
      height: 57,
      paddingTop: 0,
      opacity: 0,
      header:     '<span>We use cookies to give you the best experience of our website. By browsing you agree to our use of cookies.</span>',
      more_info:  'Find out more about cookies',
      choice_yes: 'Yes, allow cookies and continue',
      choice_no:  'No, turn cookies off'
      
      
    }
    
  },
  
  // OptIn.includeCSS()
  // Appends OptIn CSS to Body element
  includeCSS: function() {
  
    // link to stylesheet containing basic styles
    document.write( '<link rel="stylesheet" type="text/css" media="screen" href="' + OptIn.localhost + 'opt-in.css" />' );
    
    // conditional IE 9 gradient fix: IE 7/8 use filter-based gradients, IE 9 gets a special SVG
    document.write( '<!--[if gte IE 9]><style type="text/css">#opt-in-chooser,#opt-in-chooser #opt-in-update div,#opt-in-chooser #opt-in-content #opt-in-main{filter: none;}</style><![endif]-->' );
  },
  
  // OptIn.createElements()
  // creates and appends to <body> the necessary elements
  createElements: function() {
    
    var self = this;
  
    this.matte = document.createElement( 'div' );
    this.matte.id = 'opt-in-matte';

    this.headerBannerSettings = document.createElement('div');
    this.headerBannerSettings.id = 'opt-in-header-settings';

    this.headerBannerSettings.container = document.createElement('div');
    this.headerBannerSettings.container.id = 'opt-in-header-container';
    this.headerBannerSettings.appendChild( this.headerBannerSettings.container );

    this.headerBannerSettings.lcap = document.createElement('div');
    this.headerBannerSettings.lcap.id = 'opt-in-header-lcap';
    this.headerBannerSettings.container.appendChild( this.headerBannerSettings.lcap );

    this.headerBannerSettings.bodycontent = document.createElement('div');
    this.headerBannerSettings.bodycontent.id = 'opt-in-header-content';
    this.headerBannerSettings.container.appendChild( this.headerBannerSettings.bodycontent );

    this.headerBannerSettings.intro = document.createElement('p');
    this.headerBannerSettings.intro.id = 'opt-in-header-intro';
    this.headerBannerSettings.bodycontent.appendChild( this.headerBannerSettings.intro );

    this.headerBannerSettings.actions = document.createElement('div');
    this.headerBannerSettings.actions.id = 'opt-in-header-actions';
    this.headerBannerSettings.bodycontent.appendChild( this.headerBannerSettings.actions );
    
    this.headerBannerSettings.actionbutton = document.createElement('div');
    this.headerBannerSettings.actionbutton.id = 'opt-in-header-action-btn';
    this.headerBannerSettings.actions.appendChild( this.headerBannerSettings.actionbutton );
    this.headerBannerSettings.actionbutton.onclick = function() {
      self.hideHeaderBanner();
      OptIn.change( {'state':'make_choice'});
    };
    
    this.headerBannerSettings.learnmore = document.createElement('div');
    this.headerBannerSettings.learnmore.id = 'opt-in-header-learn-more';
    this.headerBannerSettings.actions.appendChild( this.headerBannerSettings.learnmore );
    this.headerBannerSettings.learnmore.onclick = function() {
      OptIn.publishCustomEvent("bt-privacy-find-out-more");
      window.open( self.moreInfoPath,'_blank' );
    };

    this.headerBannerSettings.close = document.createElement('div');
    this.headerBannerSettings.close.id = 'opt-in-header-close';
    this.headerBannerSettings.close.innerHTML = "close";
    this.headerBannerSettings.bodycontent.appendChild( this.headerBannerSettings.close );
    this.headerBannerSettings.close.onclick = function() {
      self.hideHeaderBanner();
    };

    this.headerBannerSettings.rcap = document.createElement('div');
    this.headerBannerSettings.rcap.id = 'opt-in-header-rcap';
    this.headerBannerSettings.container.appendChild( this.headerBannerSettings.rcap );

    this.chooser = document.createElement( 'div' );
    this.chooser.id = 'opt-in-chooser';
    
    this.chooser.content = document.createElement( 'div' );
    this.chooser.content.id = 'opt-in-content';
  
    this.chooser.header = document.createElement( 'header' );
    this.chooser.header.h1 = document.createElement( 'h1' );
    this.chooser.header.appendChild( this.chooser.header.h1 );
  
    this.chooser.update = document.createElement( 'div' );
    this.chooser.update.id = 'opt-in-update';
    
    this.chooser.update.div = document.createElement( 'div' );
    this.chooser.update.div.onclick = function() {
      OptIn.change( {'state':'make_choice'});
    };
    
    this.chooser.update.div.innerHTML = '<p>Change Cookie Settings</p>';
    this.chooser.update.appendChild( this.chooser.update.div );
    
    this.chooser.main = document.createElement( 'div' );
    this.chooser.main.id = 'opt-in-main';
    
    this.chooser.main.intro = document.createElement( 'div' );
    this.chooser.main.intro.id = 'opt-in-intro';
    
    this.chooser.main.cookieIntro = document.createElement( 'div');
    this.chooser.main.cookieIntro.id = 'opt-in-cookie-intro';
    
    this.chooser.main.cookieIntro.cookieIntroHeader = document.createElement( 'h3' );
    this.chooser.main.cookieIntro.cookieIntroHeader.innerHTML = 'Cookies allow you to:';
    this.chooser.main.cookieIntro.appendChild( this.chooser.main.cookieIntro.cookieIntroHeader );
    
    this.chooser.main.cookieIntro.list = document.createElement( 'ul');
    this.chooser.main.cookieIntro.list.innerHTML = '<li>Become a registered member to log in</li>' +
                                              '<li>Post comments or ratings</li>' +
                                              '<li>Print off money saving coupons</li>' +
                                              '<li>See information that&rsquo;s tailored to you</li>';
    this.chooser.main.cookieIntro.appendChild( this.chooser.main.cookieIntro.list );

    this.chooser.main.howCookiesWork = document.createElement( 'h3' );
    this.chooser.main.howCookiesWork.innerHTML = 'How cookies work:';
    
    this.chooser.main.illustrated = document.createElement( 'ul' );
    this.chooser.main.illustrated.id = 'opt-in-illustrated';
    this.chooser.main.illustrated.innerHTML = '<li class="one">When you click on a link about certain products</li>' +
                                              '<li class="two">We get an idea of the things you&rsquo;d be interested in</li>' +
                                              '<li class="three">So we&rsquo;ll be able to give you more relevant coupons and information</li>';
    
    this.chooser.main.findOutMore = document.createElement( 'p' );
    this.chooser.main.findOutMore.id = 'opt-in-find-out-more';
    this.chooser.main.findOutMore.onclick = function() {
      OptIn.publishCustomEvent("bt-privacy-find-out-more");
      window.open( self.moreInfoPath,'_blank' );
    };
    
    this.chooser.choices = document.createElement( 'ul' );
    this.chooser.choices.className = 'opt-in-user-selection';
    this.chooser.choices.id = 'opt-in-user-selection';
    
    this.chooser.choices.no = document.createElement( 'li' );
    this.chooser.choices.no.className = 'opt-in-user-declines';
    this.chooser.choices.no.onclick = function() {
      OptIn.sendOptOut();
    };
    
    this.chooser.choices.yes = document.createElement( 'li' );
    this.chooser.choices.yes.className = 'opt-in-user-accepts';
    this.chooser.choices.yes.onclick = function() {
      OptIn.sendOptIn(false);
    };

    this.chooser.choices.appendChild( this.chooser.choices.no );
    this.chooser.choices.appendChild( this.chooser.choices.yes );

    // inside main

    this.chooser.main.choices = document.createElement( 'ul' );
    this.chooser.main.choices.className = 'opt-in-user-selection';
    this.chooser.main.choices.id = 'opt-in-user-selection-main';
    
    this.chooser.main.choices.yes = document.createElement( 'li' );
    this.chooser.main.choices.yes.className = 'opt-in-user-accepts';
    this.chooser.main.choices.yes.onclick = function() {
      //header button opt in.
      OptIn.sendOptIn(true);
    };

    this.chooser.main.choices.appendChild( this.chooser.main.choices.yes );

    // put the elements together, in the right order
        
    this.chooser.main.appendChild( this.chooser.main.intro );
    this.chooser.main.appendChild( this.chooser.main.cookieIntro );
    this.chooser.main.appendChild( this.chooser.main.choices );
    this.chooser.main.appendChild( this.chooser.main.howCookiesWork );
    this.chooser.main.appendChild( this.chooser.main.illustrated );
    this.chooser.main.appendChild( this.chooser.main.findOutMore );

    this.chooser.content.appendChild( this.chooser.header );
    this.chooser.content.appendChild( this.chooser.update );
    this.chooser.content.appendChild( this.chooser.main );
    this.chooser.content.appendChild( this.chooser.choices );
    
    this.chooser.appendChild( this.chooser.content );
    
  },
  
  // OptIn.getRemoteState()
  // creates and appends script with initial JSONP call to Body element
  getRemoteState: function() {

    if(OptIn.docCookies.hasItem('btPrivacyRefreshOptIn')){
      OptIn.docCookies.removeItem("btPrivacyRefreshOptIn");
      OptIn.publishCustomEvent("bt-privacy-opt-in-reload");
    }
    
    BTPrivacy.getPrivacySettings(function (data) {
      OptIn.handleState(data.userPrivacyStatus);
    });
  },
  
  handleState: function (state) {
    switch (state) {
      case "OPTED_IN":
        OptIn.displayOptIn();
        break;

      case "OPTED_OUT":
        OptIn.change({"state":"opted_out"});
        OptIn.publishCustomEvent("bt-privacy-opt-in-banner-displayed");
        OptIn.optedIn = false;
        break;

      case "NO_COOKIE":
        var cookieName = "btPrivacyVisits";
        if (OptIn.docCookies.hasItem(cookieName)) {
          var visits = parseInt(OptIn.docCookies.getItem(cookieName)) + 1;
          OptIn.docCookies.setItem(cookieName, visits, null, "/");
          if (visits >= 3) {
            BTPrivacy.optIn(function (data) {
              OptIn.publishCustomEvent("bt-implicit-opt-in");
              OptIn.displayOptIn();
              OptIn.docCookies.removeItem(cookieName);
            });
          } else {
            this.createHeaderBannerSettings();
          }
        } else {
          OptIn.docCookies.setItem('btPrivacyVisits', 1, null, "/");
          this.createHeaderBannerSettings();
        }
        break;

      case "COOKIES_DISABLED":
        OptIn.change({"state":"disabled_footer"});

        //Not really but we want things to behaive like it is.
        OptIn.optedIn = true;
        break;
    }
  },
  
  //Cookie writer pulled from MDN, code is in public domain.
  docCookies: {
    getItem: function (sKey) {
      if (!sKey || !this.hasItem(sKey)) { return null; }
      return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
    },
    /**
    * docCookies.setItem(sKey, sValue, vEnd, sPath, sDomain, bSecure)
    *
    * @argument sKey (String): the name of the cookie;
    * @argument sValue (String): the value of the cookie;
    * @optional argument vEnd (Number, String, Date Object or null): the max-age in seconds (e.g., 31536e3 for a year) or the
    *  expires date in GMTString format or in Date Object format; if not specified it will expire at the end of session; 
    * @optional argument sPath (String or null): e.g., "/", "/mydir"; if not specified, defaults to the current path of the current document location;
    * @optional argument sDomain (String or null): e.g., "example.com", ".example.com" (includes all subdomains) or "subdomain.example.com"; if not
    * specified, defaults to the host portion of the current document location;
    * @optional argument bSecure (Boolean or null): cookie will be transmitted only over secure protocol as https;
    * @return undefined;
    **/
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/.test(sKey)) { return; }
      var sExpires = "";
      if (vEnd) {
        switch (typeof vEnd) {
          case "number": sExpires = "; max-age=" + vEnd; break;
          case "string": sExpires = "; expires=" + vEnd; break;
          case "object": if (vEnd.hasOwnProperty("toGMTString")) { sExpires = "; expires=" + vEnd.toGMTString(); } break;
        }
      }
      document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
    },
    removeItem: function (sKey) {
      if (!sKey || !this.hasItem(sKey)) { return; }
      var oExpDate = new Date();
      oExpDate.setDate(oExpDate.getDate() - 1);
      document.cookie = escape(sKey) + "=; expires=" + oExpDate.toGMTString() + "; path=/";
    },
    hasItem: function (sKey) { return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie); }
  },
  
  // OptIn.animate()
  // wraps a call to emile so that we can 1. set a default duration for animations and 2. proxy the functions used as our "after" callback to reset the value of this.
  animate: function(element, options) {

    options = options || {};
    
    if (options.after) { options.after = this.proxy(options.after); }
    
    // IE needs help.
    // We've already processed the callback (options.after), and its presence here will only confuse IE, so we should get rid of it.
    // We need to set style properties.
    // Once we've done that, we're done.
    if ( this.isIE ) {
      delete options.after;
      for( var prop in options )
        if ( options.hasOwnProperty(prop) ) element.style[prop] = options[prop];
      return;
    }
    
    options.duration = options.duration || this.defaultDuration;
    
    // pass the properties to emile
    emile(element, options);
  },
  // OptIn.proxy()
  // emile's callbacks have the value of 'this' set to the options object. Unfortunate! We use this proxy method to re-set the value of self to be our singleton OptIn object.
    proxy: function(fn) {
    var self = this;
    return (function() { return fn.apply(self); });
  },
  
  // OptIn.identifyIE()
  // appends .msie_old to <html> element if browser is IE 7/8 and class does not already exist
  // because IE 7/8 is ignorant of CSS opacity and is otherwise obstinate
  identifyIE: function() {
    if ( !navigator.appVersion.match(/MSIE [7-8]/) ) return;
    this.isIE = true;
    if ( !this.html.className.match(/msie_old/) ) this.html.className += ' msie_old';
  },
  
  // OptIn.preparePage()
  // pads viewport bottom to accommodate opt-in bar
  // appends matte and chooser divs to <body>
  preparePage: function() {
    // viewport height hack: set height of <body> to the greater scrollHeight of <html> and <body>, plus a predefined number of pixels
    // ahem
    if ( !this.isIE ) {
      this.body.style.height = ( this.bodyHeight + this.bodyPadding ) + 'px';
    }
    
    // append OptIn.matte and OptIn.chooser to <body>
    this.body.appendChild( this.matte );
    this.body.appendChild( this.chooser );
  },
  
  // OptIn.change( data )
  // the center of it all
  change: function( data ) {
    // null userState = first run
    if (this.userState == null) this.preparePage();

    // user either has already chosen a privacy setting (JSONP data exists) or needs to choose
    this.userState = data.state || 'make_choice';
    this.nextState = this.propertySets[data.state] || this.propertySets.opted_out; // this.propertySets.opted_out is default
    
    // transition between states
    this.transition();
  },
  
  // OptIn.transition()
  // initiates transition chain
  // activates opt-in styles by appending a className to the HTML element
  transition: function() {
    this.transitionChooserAndMatte();
    this.transitionText();
    if ( !this.html.className.match(/opt-in-is-active/) ) this.html.className += ' opt-in-is-active';
  },
  
  // OptIn.transitionText()
  // replaces element content as specified in each state's property set
  transitionText: function() {
    this.chooser.header.h1.innerHTML = this.nextState.header;
    this.chooser.main.intro.innerHTML = this.nextState.intro;
    this.chooser.main.findOutMore.innerHTML = this.nextState.more_info;
    this.chooser.main.choices.yes.innerHTML = this.nextState.choice_yes;
    this.chooser.choices.yes.innerHTML = this.nextState.choice_yes;
    this.chooser.choices.no.innerHTML = this.nextState.choice_no;

  },
  
  // OptIn.transitionChooserAndMatte()
  // Animates the opacity of the chooser and the matte during transitions between states
  // The chooser is faded out during transitions
  // if the opacity is greater than 0, the matte is set to display:block to prevent users from interacting with page elements prior to choosing an option
  // if the opacity is 0, the user has made a choice is free to interact with the page
  transitionChooserAndMatte: function() {
    this.animate( this.chooser, { opacity: 0 } );
    if ( this.nextState.opacity == 0 ) {
      var matte = this.matte;
      setTimeout( function() { matte.style.display = 'none'; }, 500 );  // tiny delay, to let the opacity to animate to zero
    } else {
      this.matte.style.display = 'block';
    }

    this.animate( this.matte, {opacity: this.nextState.opacity, after: this.transitionChooserHeightAndModalityAndBodyPadding() } );
    this.animate( this.chooser, { opacity: 1 } );
  },
  
  // OptIn.transitionChooserHeightAndBodyPadding()
  // these happen in parallel
  transitionChooserHeightAndModalityAndBodyPadding: function() {
    this.transitionChooserHeightAndModality();
    this.transitionBodyPadding();
  },
  
  // OptIn.transitionChooserHeightAndModality()
  // animates the height of the chooser
  // and gets the ball rolling on the modality changes
  transitionChooserHeightAndModality: function() {
    this.animate( this.chooser, {height: this.nextState.height + 'px'} );
    this.transitionModality();
  },
  
  // OptIn.transitionBodyPadding()
  // animates the paddingTop of the <body>
  transitionBodyPadding: function() {
    this.animate( this.body, {paddingTop: this.nextState.paddingTop + 'px', after: this.finishTransition() });
  },
  
  // OptIn.transitionModality()
  // sets the position and animates the width of the chooser
  // "modality" here indicates a modal, as opposed to a bar
  transitionModality: function() {
    var newLeft = 0, newWidth = this.nextState.width;
    
    if ( this.nextState.modal ) {
      newLeft = ( this.bodyWidth() - this.nextState.width ) / 2;
    }
    
    // newWidth is either a unitless integer (e.g., 90) or a string with a built-in unit ('100%')
    // in this case, we need to set the integers as strings, and affix the unit
    if ( typeof newWidth !== 'string' ) {
      newWidth = newWidth.toString();
      if ( newWidth.substr(-1) !== '%' ) newWidth += 'px';
    }
    
    this.chooser.style.top = this.nextState.top + 'px';
    this.chooser.style.left = newLeft + 'px';
    this.chooser.style.width = newWidth;
  },
  
  // OptIn.finishTransition()
  // apply the state's className to <html>
  // finally, scroll to top if the user opted-out or must make a choice
  finishTransition: function() {
    
    // remove old state's className
    this.html.className = this.html.className.replace( ' ' + this.pageState, '' );
    
    // add new state's className
    this.html.className += ' ' + this.userState;

    // set pageState to match userState
    this.pageState = this.userState;
    
    // scroll to top
    if ( this.pageState == 'make_choice' ) this.body.scrollIntoView();
  },
  
  createHeaderBannerSettings: function(showOptions) {
    OptIn.publishCustomEvent("bt-privacy-implicit-choice-banner-shown");
    this.headerBannerSettings.intro.innerHTML = this.propertySets.cookie_header_settings.intro;
    this.headerBannerSettings.actionbutton.innerHTML = this.propertySets.cookie_header_settings.action_button;
    this.headerBannerSettings.learnmore.innerHTML = this.propertySets.cookie_header_settings.more_info;
    this.body.insertBefore(this.headerBannerSettings,this.body.firstChild);
  },
  
  createHeaderNoThirdParty: function() {
    this.headerBannerSettings.intro.innerHTML = this.propertySets.cookie_header_settings.intro;
    this.headerBannerSettings.actionbutton.className = "btHiddenButton";
    this.headerBannerSettings.learnmore.innerHTML = this.propertySets.cookie_header_settings.more_info;
    this.headerBannerSettings.learnmore.className = "btSoloLearnmore";
    this.body.insertBefore(this.headerBannerSettings,this.body.firstChild);
  },
  
  sendOptIn: function (refresh) {
    BTPrivacy.optIn(function (data) {
      var oldOptIn = OptIn.optedIn;
      OptIn.displayOptIn();
      if (refresh && !oldOptIn) {
        OptIn.docCookies.setItem('btPrivacyRefreshOptIn', 1, null, "/");
        location.reload();
      }
    });
  },
  
  displayOptIn: function () {
    OptIn.change({"state":"opted_in"});
    OptIn.optedIn = true;
  },
  
  sendOptOut: function () {
    BTPrivacy.optOut(function (data) {
      OptIn.change({"state":"opted_out"});
      OptIn.publishCustomEvent("bt-privacy-opt-in-banner-displayed");
      OptIn.optedIn = false;
    });
  },
  checkOptInStatus : function(callback) {
    if (OptIn.optedIn) {
      callback();
    } else {
      OptIn.change({"state":"cookies_required"});
    }
  },

  publishCustomEvent: function (name) {
    var jQueryRef;
    if (BrightTag.jQuery) { 
      //use BT jquery if possible
      jQueryRef = BrightTag.jQuery;
    } else if (window.jQuery) {
      //use global otherwise
      jQueryRef = window.jQuery;
    } else {
      return false;
    }
    try {
      var event = jQueryRef.Event(name);
      jQueryRef('body').trigger(event);
    }
    catch (e) {
      //stuff broke
    }
  },
  
  hideHeaderBanner: function() {
    if ( navigator.appVersion.match(/MSIE [7-8]/) ) {
      this.animate( this.headerBannerSettings, { display: 'none' });
    } else {
      this.animate( this.headerBannerSettings, { opacity: 0, after: function() {
        this.animate( this.headerBannerSettings, { height: '0px' });
      }} );
    }
  },

  // OptIn.start()
  // Creates initial required elements
  // Determines (via JSONP) and sets an initial user state
  start: function() {
    this.includeCSS();
    this.identifyIE();
    this.createElements();
    this.getRemoteState();
  }
};

// GO! GO! GO!
OptIn.start();

// emile.js, for simple animations
// using forked version (https://github.com/ded/emile/) for native css transitions

/*!
  * emile.js (c) 2009 - 2011 Thomas Fuchs
  * Licensed under the terms of the MIT license.
  */
!function(a){function A(a,b){a=typeof a=="string"?document.getElementById(a):a,b=z(b);var c={duration:b.duration,easing:b.easing,after:b.after};delete b.duration,delete b.easing,delete b.after;if(e&&typeof c.easing!="function")return y(a,b,c);var d=q(b,function(a,b){a=r(a);return p(a)in h&&g.test(b)?[a,b+"px"]:[a,b]});x(a,d,c)}function z(a){var b={};for(var c in a)b[c]=a[c],c=="after"&&delete a[c];return b}function y(a,b,c){var d=[],f=[],i=c.duration||1e3,j=c.easing||"ease-out",k="";i=i+"ms",a.addEventListener(l,function m(){a.setAttribute("style",k),c.after&&c.after(),a.removeEventListener(l,m,!0)},!0),setTimeout(function(){var c;for(c in b)b.hasOwnProperty(c)&&d.push(r(c)+" "+i+" "+j);for(c in b){var f=p(c)in h&&g.test(b[c])?b[c]+"px":b[c];b.hasOwnProperty(c)&&(a.style[p(c)]=f)}k=a.getAttribute("style"),d=d.join(","),a.style[e+"Transition"]=d},10)}function x(a,b,c,d){c=c||{};var e=w(b),f=a.currentStyle?a.currentStyle:getComputedStyle(a,null),g={},h=+(new Date),i,j=c.duration||200,k=h+j,l,m=c.easing||function(a){return-Math.cos(a*Math.PI)/2+.5};for(i in e)g[i]=v(f[i]);l=setInterval(function(){var b=+(new Date),f,i=b>k?1:(b-h)/j;for(f in e)a.style[f]=e[f].f(g[f].v,e[f].v,m(i))+e[f].u;b>k&&(clearInterval(l),c.after&&c.after(),d&&setTimeout(d,1))},10)}function w(a){var c,d={},e=k.length,f;b.innerHTML='<div style="'+a+'"></div>',c=b.childNodes[0].style;while(e--)(f=c[k[e]])&&(d[k[e]]=v(f));return d}function v(a){var b=parseFloat(a),c=a?a.replace(/^[\-\d\.]+/,""):a;return isNaN(b)?{v:c,f:u,u:""}:{v:b,f:s,u:c}}function u(a,b,c){var d=2,e,f,g,h=[],i=[];while((e=3)&&(f=arguments[d-1])&&d--)if(t(f,0)=="r"){f=f.match(/\d+/g);while(e--)h.push(~~f[e])}else{f.length==4&&(f="#"+t(f,1)+t(f,1)+t(f,2)+t(f,2)+t(f,3)+t(f,3));while(e--)h.push(parseInt(t(f,1+e*2,2),16))}while(e--)g=~~(h[e+3]+(h[e]-h[e+3])*c),i.push(g<0?0:g>255?255:g);return"rgb("+i.join(",")+")"}function t(a,b,c){return a.substr(b,c||1)}function s(a,b,c){return(a+(b-a)*c).toFixed(3)}function r(a){if(a.toUpperCase()===a)return a;return a.replace(/([a-zA-Z0-9])([A-Z])/g,function(a,b,c){return b+"-"+c}).toLowerCase()}function q(a,b){return o(a,function(a,c){var d=b?b(c,a):[c,a];return d[0]+":"+d[1]+";"}).join("")}function p(a){return a.replace(/-(.)/g,function(a,b){return b.toUpperCase()})}function o(a,b,c){var d=[],e;for(e in a)d.push(b.call(c,a[e],e,a));return d}var b=document.createElement("div"),c=["webkit","Moz","O"],d=3,e,f,g=/\d+$/,h={},i="backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color fontWeight lineHeight opacity outlineColor zIndex",j="top bottom left right borderWidth borderBottomWidth borderLeftWidth borderRightWidth borderTopWidth borderSpacing borderRadius marginBottom marginLeft marginRight marginTop width height maxHeight maxWidth minHeight minWidth paddingBottom paddingLeft paddingRight paddingTop fontSize wordSpacing textIndent letterSpacing outlineWidth outlineOffset",k=(i+" "+j).split(" ");while(d--)f=c[d],b.style.cssText="-"+f.toLowerCase()+"-transition-property:opacity;",typeof b.style[f+"TransitionProperty"]!="undefined"&&(e=f);var l=/^w/.test(e)?"webkitTransitionEnd":"transitionend";for(var m=j.split(" "),n=m.length;n--;)h[m[n]]=1;var B=a.emile;A.noConflict=function(){a.emile=B;return this},a.emile=A}(this)