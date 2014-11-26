'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('my app', function() {

  browser.get('index.html');

  it('should automatically redirect to /view1 when location hash/fragment is empty', function() {
    expect(browser.getLocationAbsUrl()).toMatch("/");
  });

  describe('index.html load', function() {
    beforeEach(function() {
      browser.get('index.html');
    });
    
    it('should ng-app be there', function() {
      expect(element.all(by.css('[ng-app] p')).first().getText()).toMatch('app');
    });

    it('should first wnp-popup link click open a window, the second close it.', function() {
      element( by.css('[wnp-name="popupWindow"]') ).click();
      element( by.css('[wnp-name="popupWindow"]') ).click();
    });

    
  });

});
