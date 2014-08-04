# P&G Privacy Dialog

## Default Usage

You can easily add MrCookie to your page with

    <script type="text/javascript" src="//privacy.thebrighttag.com/pandgv2/js/mrcookie.js"></script>

This uses the default configuration with English language and the implicit opt-in workflow.

## Custom Usage

To use a custom header and French language:

    <script type="text/javascript" src="//privacy.thebrighttag.com/pandgv2/js/mrcookie.js">
        {
          locale: 'fr',
          providers: { 'notice_header': 'simple_notice' }
        }
    </script>

## Advanced Usage

An advanced setup might look like this:

    <script type="text/javascript" src="//privacy.thebrighttag.com/pandgv2/js/mrcookie.js">
        {
          locale: 'nl',
          workflow: 'explicit-opt-in',
          privacy: {
            sendpageurl: true,
            pageurl: "[[Page Domain]]"
          },
          containers: {
              header: "cookie-consent-header",
              footer: "cookie-consent-footer"
          }
        }
    </script>

This configuration uses the Dutch (Netherlands) language, an explicit opt-in workflow, page-scoped privacy cookies, and
existing containers/divs on the page to position the header and footer privacy banners.
