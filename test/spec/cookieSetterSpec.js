describe('BT Privacy Cookie Setter', function () {
  beforeEach(function () {
    deleteAllCookies();
  });

  it('should set simple cookies supplied in a directives array', function () {
    var directives = [
      {
        name: "cookie1",
        value: "value1"
      }, {
        name: "cookie2",
        value: "value2"
      }
    ];

    BTPrivacy.cookieSetter(document, directives);

    expect(document.cookie).toEqual("cookie1=value1; cookie2=value2");
  });
  
  it('should not override existing, unrelated cookies', function () {
    document.cookie = "cookie3=value3;"
    
    var directives = [
      {
        name: "cookie1",
        value: "value1"
      }, {
        name: "cookie2",
        value: "value2"
      }
    ];

    BTPrivacy.cookieSetter(document, directives);

    expect(document.cookie).toEqual("cookie3=value3; cookie1=value1; cookie2=value2");
  });
  
  it('should override existing cookies', function () {
    document.cookie = "cookie1=value2;"
    
    var directives = [
      {
        name: "cookie1",
        value: "value1"
      }, {
        name: "cookie2",
        value: "value2"
      }
    ];

    BTPrivacy.cookieSetter(document, directives);

    expect(document.cookie).toEqual("cookie1=value1; cookie2=value2");
  });
  
  it('should add the maxAge directive correctly', function () {

    var directives = [
      {
        name: "cookie1",
        value: "value1",
        options: {
          maxAge: -1
        }
      }, {
        name: "cookie2",
        value: "value2",
        options: {
          maxAge: 3600
        }
      }
    ];

    BTPrivacy.cookieSetter(document, directives);

    expect(document.cookie).toEqual("cookie1=value1; cookie2=value2");
  });
  
});