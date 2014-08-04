# Privacy SDK - Shhhh!

This is a javascript wrapper around our Privacy API.

## Install

The build script requires node.js (>= 0.8.0). For example,

    nvm use 0.8.0

You can now build the API with this command:

    node ./bin/build.js --deploy

Note that the `--deploy` flag means "don't translate anything as gettext isn't present on this machine".

## Usage

The Privacy SDK exists as `btprivacy.js`. It expects to be loaded alongside (or through) BrightTag's tag.js.

`btprivacy.js` exposes a simple API for retrieving and setting a user's privacy settings:

* `BTPrivacy.getPrivacySettings` - retrieve a user's privacy settings
* `BTPrivacy.optIn` - user selects to opt in
* `BTPrivacy.optOut` - user selects to opt out
* `BTPrivacy.required` - user selects to opt in to required tags only
* `BTPrivacy.functional` - user selects to opt in to functional and required tags

### Configuration

Out of the box, `btprivacy.js` will use the tag.js configuration, but all configuration options can be set/overridden as follows:

    BTPrivacy.configure({ 
      host: "s.thebrighttag.com/api/privacy/", // defaults to tag.js host + /api/privacy/
      siteId: "carerunner1",                   // defaults to tag.js site
      sendpageurl: true,                       // optional, defaults to false
      pageurl: bt_data_escaped('page domain')  // optional
    });

The `sendpageurl` option tells the privacy library to use a custom URL (`pageurl`) instead of `document.URL` in the call
to the Privacy API. This was designed for sites where each "page" in the BrightTag configuration is really an independent
website (e.g., P&G), and scopes the user's privacy choice accordingly.

### Retrieve a user's privacy settings

To retrieve the user's privacy settings, call

    BTPrivacy.getPrivacySettings(function (data) {
      alert("You're " + data.userPrivacyStatus);
    });

where `data` looks like

    {
        "doNotTrack": false, 
        "privacyOptOutPage": [
            {
                "name": "Media Armor", 
                "optOutLink": "http://copilot.mediaarmor.com/optout", 
                "policyLink": "http://www.mediaarmor.com/privacy-policy", 
                "productCategory": "Advertising"
            }
        ], 
        "userPrivacyStatus": "OPTED_IN"
    }

The value for `userPrivacyStatus` must be one of (`OPTED_IN`, `OPTED_OUT`, `NO_COOKIE`, or `COOKIES_DISABLED`). Similarly,
the value for `productCategory` must be one of ("Advertising", "Functional", or "Required") currently.

### User selects to opt in

    BTPrivacy.optIn(function () {
      alert("You're opted in!")
    });

The success callbacks may also accept the same data parameter as above:

    BTPrivacy.optIn(function (data) {
      alert("You're " + data.userPrivacyStatus);
    });

All API calls also accept a second callback in case of errors:

    BTPrivacy.optIn(function () {
      alert("You're opted in!")
    }, function() {
      alert("ERROR!");
    });

### User selects to opt out

    BTPrivacy.optOut(function () {
      alert("You're opted out!");
    });

### User selects to opt in to required tags only

    BTPrivacy.required(function () {
      alert("You're opted in for required stuff!");
    });

### User selects to opt in to functional and required tags

    BTPrivacy.functional(function () {
      alert("You're opted in for functional stuff!");
    });
