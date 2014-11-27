'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('my app', function() {
  var appBaseURL = 'http://localhost:8000/app';

  var selectDropdownbyNum = function ( el, optionNum ) {
    var ret;
    if (optionNum){
      var options = el.element(by.tagName('option')).then(function(options){
          ret = options[optionNum];
      });
    }
    return ret;
  };


  browser.get('index.html');

  it('should automatically redirect to /view1 when location hash/fragment is empty', function() {
    expect(browser.getLocationAbsUrl()).toMatch("/");
  });



  describe('index.html load', function() {
    var parentWindowHandle = browser.getWindowHandle(); // save the current window handle.
    afterEach(function() {
      browser.executeScript('window.close()');
      browser.switchTo().window(parentWindowHandle); // Switch back to parent window.
    });

    beforeEach(function() {
      browser.get('index.html');
    });

    it('should ng-app be there', function() {
      expect(element.all(by.css('[ng-app] p')).first().getText()).toMatch('app');
    });

    it('1-should open a new window if wnp-name="popupWindow" link is clicked.', function() {
      element( by.css('[wnp-name="popupWindow"]') ).click().then(function() {
        browser.getAllWindowHandles().then(function (handles) {
            var newWindowHandle = handles[1];
            browser.switchTo().window(newWindowHandle).then(function () {
              expect(browser.getCurrentUrl()).toMatch(appBaseURL+'/views/popupWindow.html#/sampleOne');
            });
        }); 
      });

    });

    // it('2-should open a new window if wnp-name="popupWindow" link is clicked.', function() {
    //   element( by.css('[wnp-name="popupWindow"]') ).click().then(function() {
    //     expect(browser.driver.getCurrentUrl()).toMatch(appBaseURL + '/views/popupWindow.html#/sampleOne');
    //   });
    // });
  });    
  



  describe('Type in a input and click on a wnp-popup link.', function() {
    var parentWindowHandle = browser.getWindowHandle(); // save the current window handle.
    afterEach(function() {
      browser.switchTo().window(newWindowHandle);
      browser.executeScript('window.close()');
      browser.switchTo().window(parentWindowHandle); // Switch back to parent window.
    });

    var newWindowHandle;
    var parentInpElem;
    var parentCtrlDivElem;
    beforeEach(function() {
      browser.get('index.html');
      parentCtrlDivElem = element( by.css('[ng-controller="parentController"]') );
      parentInpElem = element( by.model('rnParentData.dat') );
      parentInpElem.sendKeys('123').then(function() {
        element( by.css('[wnp-name="popupWindow"]') ).click(); 
      });
      
//browser.pause();
      browser.getAllWindowHandles().then(function (handles) {
        newWindowHandle = handles[1];
      });
    });


    it('Then the popup window mathing input field sould be the same.', function() {
      browser.switchTo().window(newWindowHandle).then(function () {
        expect( element( by.css('[wnp-model="item_one"]') ).getAttribute('value')).toMatch('123');
      });
    });
    it('Then the popup window mathing input field sould be the same, second time too.', function() {
      browser.switchTo().window(newWindowHandle).then(function () {
        expect( element( by.css('[wnp-model="item_one"]') ).getAttribute('value')).toMatch('123');
      });
    });

    describe('Type something to the Child input field', function() {
      it('The Parent input field should be updated', function() {
        var childElem;
        browser.switchTo().window(newWindowHandle).then(function () {
          
          childElem = element( by.css('[wnp-model="item_one"]') );
          expect(childElem.getAttribute('value')).toMatch('123');
          childElem.sendKeys('5566');
          expect(childElem.getAttribute('value')).toMatch('1235566');

          browser.switchTo().window(parentWindowHandle); // Switch back to parent window.

          expect(childElem.getAttribute('value')).toMatch( parentInpElem.getAttribute('value'));
          expect(parentInpElem.getAttribute('value')).toMatch('1235566');
        });
      });
    });

    describe('Change the Child select field to bgColor red.', function() {
      it('The Parent BackGround color should change to  red', function() {
        var childSelectElem;
        var optionElem;
        browser.switchTo().window(newWindowHandle).then(function () {
          childSelectElem = element( by.css('[wnp-model="item_three"]') );
          optionElem = childSelectElem.element(by.tagName('option'));
//          optionElem = selectDropdownbyNum(childSelectElem, 0);
          childSelectElem.click().then(function() {
            optionElem.click();  
          });
          
          browser.switchTo().window(parentWindowHandle); // Switch back to parent window.
          expect(parentCtrlDivElem.getAttribute('style')).toMatch('background-color: red;');

        });
      });
    });


  });

});
