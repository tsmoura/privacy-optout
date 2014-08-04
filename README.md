# Privacy API and Hosted Dialogs

We offer a hosted privacy-optout dialog for clients like P&G. This uses our Privacy API.

## Install

### Setup an Apache vhost

Setup an Apache vhost. Don't forget to change the email and paths.

    <VirtualHost *:80>
       ServerAdmin you@thebrighttag.com
       DocumentRoot /path/to/dev/brighttag/privacy-optout/build
       ServerName privacy.local.thebrighttag.com
       CustomLog /var/log/apache2/privacy.local.thebrighttag.com.log combined

       <Directory "/path/to/dev/brighttag/privacy-optout/build">
         Options Indexes MultiViews +FollowSymLinks
         AllowOverride All
         Order allow,deny
         Allow from all
       </Directory>
    </VirtualHost>

Add an entry in your /etc/hosts file:

    127.0.0.1 privacy.local.thebrighttag.com

Don't forget to restart apache.

    sudo apachectl restart

### Install gettext

To build the localized privacy dialogs, you'll also need to install gettext.

    brew install gettext

You may see some linker problems with this, but it still seems to work fine. However, you'll need to manually
add `gettext` to your path. You can add this in `~/.bash_profile`, for example:

    PATH=/usr/local/Cellar/gettext/0.18.1.1/bin/:$PATH
    export PATH

or you can try this:

    brew link --force gettext

## Usage

The `privacy-optout` project includes the privacy API wrapper (`btprivacy.js`) and hosted dialogs for various clients. This
README only covers features applicable to all clients (e.g., build info and translations). More information can be found in
the READMEs in each subdirectory.

### Building the static files

The build script requires node.js (>= 0.8.0). For example,

    nvm use 0.8.0

Now you can build the dialogs (and SDK) with:

    node ./bin/build.js

### Adding a Translation

To add a new translation, append a language abbreviation (e.g., 'pt') to the `TRANSLATIONS` constant for the right module
(e.g., pandgv2) in `bin/build.js`. Then run

    node ./bin/build.js messages

This will create a new template like `./locale/{module}/{language}/LOCALE_MESSAGES/messages.po` awaiting your translation.

Don't forget to [encode the translated strings](http://www.unicodetools.com/unicode/convert-to-html.php),
as `gettext` doesn't handle non-ASCII characters well. 

Once you've finished your translation, just build the files normally again with

    node ./bin/build.js

You should see a new output file like `./build/{module}/{language}` according to how you defined
the `TRANSLATIONS` configuration in `build.js`.
