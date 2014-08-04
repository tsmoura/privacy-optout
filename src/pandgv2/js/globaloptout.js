$(function() {
  var Localizations = {
      "opt-in": {
        "english": "Do you want to refuse cookies on P&amp;G sites?",
        "en_na": "Do you want to refuse cookies on P&amp;G sites?",
        "french": "Voulez-vous refuser les cookies pour les sites de P&amp;G?",
        "fc_na" : "Voulez-vous refuser les cookies pour les sites de P&amp;G?",
        "span_amer_na": "&#x00bf;Desea rechazar las cookies de los sitios web de P&amp;G?",
        "german": "M&ouml;chten Sie keine Cookies auf den Webseiten von P&amp;G?",
        "italian": "Vuoi rifiutare i cookies nei siti P&amp;G?",
        "dutch": "Wilt u cookies weigeren op P&amp;G-websites?",
        "latvian": "Vai v&#x0113;laties atteikties no s&#x012b;kdatn&#x0113;m P&amp;G vietn&#x0113;s?",
        "lithuanian": "Ar norite atsisakyti slapuk&#x0173; P&amp;G svetain&#x0117;se?"
      },
      "opt-out": {
        "english": "Cookies are turned off for P&amp;G sites.",
        "en_na": "Cookies are turned off for P&amp;G sites.",
        "french": "Les cookies sont d&eacute;sactiv&eacute;s pour les sites de P&amp;G.",
        "fc_na" : "Les cookies sont d&eacute;sactiv&eacute;s pour les sites de P&amp;G.",
        "span_amer_na": "Se han desactivado las cookies para los sitios web de P&amp;G",
        "german": "Cookies sind f&uuml;r P&amp;G-Webseiten deaktiviert.",
        "italian": "I cookies sono disattivati per i siti P&amp;G.",
        "dutch": "Cookies zijn uitgeschakeld voor P&amp;G-websites.",
        "latvian": "P&amp;G vietn&#x0113;s s&#x012b;kdatnes ir izsl&#x0113;gtas",
        "lithuanian": "P&amp;G svetain&#x0117;ms slapukai i&#x0161;jungti"
      },
      "click-opt-in": {
        "english": "Click Here",
        "en_na": "Click Here",
        "french": "Cliquez ici",
        "fc_na" : "Cliquez ici",
        "span_amer_na": "Haga clic aqu&iacute;.",
        "german": "Klicken Sie hier",
        "italian": "Fai clic qui",
        "dutch": "Klik hier",
        "latvian": "Noklik&#x0161;&#x0137;iniet &#x0161;eit",
        "lithuanian": "Spustel&#x0117;kite &#x010d;ia"
      },
      "click-opt-out": {
        "english": "To allow cookies, Click Here",
        "en_na": "To allow cookies, Click Here",
        "french": "Pour autoriser les cookies, cliquez ici.",
        "fc_na" : "Pour autoriser les cookies, cliquez ici.",
        "span_amer_na": "Para permitir las cookies, haga clic aqu&iacute;.",
        "german": "Klicken Sie hier, um Cookies zuzulassen.",
        "italian": "Per accettare i cookies, fai clic qui",
        "dutch": "Om cookies te accepteren, klik hier",
        "latvian": "Ja v&#x0113;laties at&#x013c;aut s&#x012b;kdatnes, noklik&#x0161;&#x0137;iniet &#x0161;eit.",
        "lithuanian": "Nor&#x0117;dami leisti naudoti slapukus, spustel&#x0117;kite &#x010d;ia"
      },
      "cookie-disabled" : {
        "english": "Your web browser does not allow Additional Cookies.",
        "en_na": "Your web browser does not allow Additional Cookies.",
        "french": "Votre navigateur n'autorise pas de cookies suppl&eacute;mentaires.",
        "fc_na" : "Votre navigateur n'autorise pas de cookies suppl&eacute;mentaires.",
        "span_amer_na": "Su navegador web no permite cookies adicionales.",
        "german": "Ihr Webbrowser verhindert das Ausf&uuml;hren von zus&auml;tzlichen Cookies.",
        "italian": "Il web browser non accetta Cookies aggiuntivi.",
        "dutch": "Uw webbrowser accepteert geen additionele cookies.",
        "latvian": "J&#x016b;su t&#x012b;mek&#x013c;a p&#x0101;rl&#x016b;kprogramma neat&#x013c;auj papildu s&#x012b;kdatnes.",
        "lithuanian": "J&#x016b;s&#x0173; tinklo nar&#x0161;ykl&#x0117; neleid&#x017e;ia naudoti papildom&#x0173; slapuk&#x0173;."
      }
    },
    locale = window.location.pathname.split('/')[3],
    optOutEl = $('.opt-out'),
    clickEl = $('.related-content-teaser');

  function updateFromPrivacySettings(el) {
    BTPrivacy.getPrivacySettings(function(data) {
      var msg;
      switch (data.userPrivacyStatus) {
        case 'OPTED_IN':
          msg = getOptedInMsg();
          break;
        case 'NO_COOKIE':
        case 'OPTED_OUT':
          msg = getOptedOutMsg();
          break;
        case 'COOKIES_DISABLED':
          msg = getCookieDisabledMsg();
          break;
      };
      el.html(msg);
    });
  }

  updateFromPrivacySettings(optOutEl);

  function handleClick(clickEl, selector, func, optOutEl, msg)  {
    clickEl.delegate(selector, 'click', function() {
      BTPrivacy[func]();
      optOutEl.html(msg);
    });
  }

  handleClick(clickEl, '.click-opt-out', 'optOut', optOutEl, getOptedOutMsg());
  handleClick(clickEl, '.click-opt-in', 'optIn', optOutEl, getOptedInMsg());

  function getOptedOutMsg() {
    return Localizations['opt-out'][locale] +
      '<p><a href="#" class="click-opt-in" title="">' + Localizations['click-opt-out'][locale] + '</a></p>';
  }

  function getOptedInMsg() {
    return Localizations['opt-in'][locale] +
      '<p><a href="#" class="click-opt-out" title="">' + Localizations['click-opt-in'][locale] + '</a></p>';
  }

  function getCookieDisabledMsg() {
    return Localizations['cookie-disabled'][locale] + '<p>';
  }

});


