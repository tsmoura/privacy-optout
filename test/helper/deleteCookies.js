function deleteAllCookies() {
  var cookies = document.cookie.split(";"),
    i,
    cookie,
    eqPos,
    name;

  for (i = 0; i < cookies.length; i++) {
    cookie = cookies[i];
    eqPos = cookie.indexOf("=");
    name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}