'use strict';

describe('Factory: wnpUtil', function () {
  var wnpUtil;
  var scope = {};

  // -- load the Main module --
  beforeEach(module('windowsPopup'));

  // -- Inject needed services --
  beforeEach(inject(function ($injector) {
    wnpUtil = $injector.get('wnpUtil');
  }));
  describe('wnpUtil.setToScope & wnpUtil.getFromScope', function() {
    it ("Should put the value to scope when the name has a dot in it", function() {
      wnpUtil.setToScope(scope, 'input.data', 'value123');
      expect(scope.input.data).toEqual('value123');
    });

    it ("Should get the value from scope when the name has a dot in it", function() {
      scope.input.data = 'val321';
      var val = wnpUtil.getFromScope(scope, 'input.data');
      expect(scope.input.data).toEqual(val);
    });

  });
});



describe('Factory: wnpToChild', function () {;
  var scope;
  var wnpUtil;
  var wnpToChild;

  // load the Main testing module
  beforeEach(module('windowsPopup'));

  // -- Inject needed services --
  beforeEach(inject(function ($injector, $rootScope) {
    scope            = $rootScope.$new();
    wnpUtil          = $injector.get('wnpUtil');
    wnpToChild = $injector.get('wnpToChild');
  }));
  describe('addOneSharedModel & applyAndGetDataForChild', function() {

    it ("Should have latest data when adding Model Data to Child Window.", function() {

      // -- Add value to scope --
      scope.testValue = "1234";
      // -- Add this 'wnpToChild' factory --
      wnpToChild.addOneSharedModel(scope, 'bindText', 'testValue');
      // -- Data may change, simulate that ::
      scope.testValue = 'ChangedD';

      var sharedData = wnpToChild.applyAndGetDataForChild(true);
      expect( sharedData.DATA.bindText.data ).toEqual('ChangedD'); 
 
      // --- Add one more 
      scope.secondTestValue = 'value_2';
      scope.testValue = 'Changed-Again';
      wnpToChild.addOneSharedModel(scope, 'bindTextSecond', 'secondTestValue');
      sharedData = wnpToChild.applyAndGetDataForChild(false);
      expect( sharedData.DATA.bindText.data ).toEqual('Changed-Again'); 
      expect( sharedData.DATA.bindTextSecond.data ).toEqual('value_2'); 
    });

  });
});




describe('Factory: wnpFromParent', function () {
  var scope;
  var wnpToChild;
  var windowMock;
  var wnpFromParent;
  var injector;

  // load the controller's module
  beforeEach(module('windowsPopup'));
  // -- Create Mocks --
  beforeEach(function() {
    windowMock = {};
    windowMock.opener = {};

    module(function ($provide) {
      $provide.value('$window', windowMock);
    });

  });
  // -- Inject needed services --
  beforeEach(inject(function ($injector, $rootScope) {
    injector         = $injector;
    scope            = $rootScope.$new();  
    wnpToChild = $injector.get('wnpToChild');
    scope.testValue = "1234";
    wnpToChild.addOneSharedModel(scope, 'bindText', 'testValue');
  }));
  describe('Child window should get the SharedData', function() { 

    it ('Browsers should find sharedData, in window.opener object', function() {
      // --- Set Data for the Child Window --
      windowMock.opener.$$$shareData = wnpToChild.applyAndGetDataForChild(true);

      // --- Inject here, the 'window' object must be set ---
      wnpFromParent = injector.get('wnpFromParent');

      expect(wnpFromParent.isData).toEqual(true);
      var inputData = wnpFromParent.get();
      expect( inputData.bindText.data).toEqual('1234');
      expect( inputData.bindText.name).toEqual('bindText');      
    });

    it ('No SharedData set, should be no data for Child.', function() {
      // --- NO Set Data for the Child Window --

      // --- Inject here, the 'window' object must be set ---
      wnpFromParent = injector.get('wnpFromParent');

      expect(wnpFromParent.isData).toEqual(false);
      var inputData = wnpFromParent.shareData;
      expect( inputData ).toBeUndefined();
    });  
  });
});





describe('Factory: wnpOpenService', function () {
  var wnpToChild;
  var wnpOpenService;
  var windowMock;

  // -- load the Main module --
  beforeEach(module('windowsPopup'));

  // --- Craete Mocks ---
  beforeEach(function() {
    windowMock = {};
    windowMock.open = function(url, wnpName, specs, bl) {
      console.log('window.open() is called for '+wnpName);
      this.closed = false;
      return this;
    };
    windowMock.close = function(wnpName) {
      console.log('window.close() is called for '+wnpName);
      this.closed = true;
    };    
    windowMock.blur  = function() {};
    windowMock.focus = function() {};
    windowMock.alert = function(msg) {
      console.log(msg);
    } 
    module(function ($provide) {
      $provide.value('$window', windowMock);
    });
  });

  // --- Inject services ---
  beforeEach(inject(function ($injector) {
    wnpOpenService     = $injector.get('wnpOpenService');
    wnpToChild = $injector.get('wnpToChild');

    spyOn(windowMock, 'alert').and.callThrough();
    spyOn(windowMock, 'open').and.callThrough();
    spyOn(windowMock, 'close').and.callThrough();
//    spyOn(windowMock, 'open').and.returnValue(windowMock);
  }));
  describe('wnpOpenService.popWdwfnc', function() {

    it ("Should call $window.open() method, if not opened yet.", function() {
      var ret = wnpOpenService.popWdwfnc('dummy.html', 'winname', 'specs', 'true', function() {} ); 
      expect( windowMock.open ).toHaveBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1);
      expect( ret ).toEqual( true );
      // --- No data was set to Child --
//      expect( windowMock.$$$shareData ).toBeFalsy();
      // --- There should be one open windows ---
      expect(wnpOpenService.popWindows.winname.popWdw).toBe(windowMock); 
    });
    it ("wnp-toggle-open-close=true, Second Time Should call $window.close() method, using same Window name.", function() {
      var wnpToggleOpenClose = true;
      var ret = wnpOpenService.popWdwfnc('dummy.html', 'winname', 'specs', wnpToggleOpenClose, function() {} ); 
      expect( windowMock.open ).toHaveBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1);
      expect( windowMock.close.calls.count() ).toBe(0);
      expect( ret ).toEqual( true );

      ret = wnpOpenService.popWdwfnc('dummy.html', 'winname', 'specs', wnpToggleOpenClose, function() {} ); 
//      expect( windowMock.open ).not.toHaveNotBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1); // --- From the previous call ---
      expect( windowMock.close ).toHaveBeenCalled();
      expect( windowMock.close.calls.count() ).toBe(1);
      expect( ret ).toEqual( false );

      // --- Now should be able to ropen the window --
      ret = wnpOpenService.popWdwfnc('dummy.html', 'winname', 'specs', wnpToggleOpenClose, function() {} ); 
      expect( windowMock.open.calls.count() ).toBe(2);
      expect( ret ).toEqual( true );
    });

    it ("wnp-toggle-open-close=false, Second Time Should NOT call $window.open() method, using same Window name.", function() {
      var wnpToggleOpenClose = false;
      var ret = wnpOpenService.popWdwfnc('dummy.html', 'winname', 'specs', wnpToggleOpenClose, function() {} ); 
      expect( windowMock.open ).toHaveBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1);
      expect( windowMock.alert.calls.count() ).toBe(0);
      expect( windowMock.close.calls.count() ).toBe(0);
      expect( ret ).toEqual( true );

      ret = wnpOpenService.popWdwfnc('dummy.html', 'winname', 'specs', wnpToggleOpenClose, function() {} ); 
//      expect( windowMock.open ).not.toHaveNotBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1);
      expect( windowMock.alert.calls.count() ).toBe(1);
      expect( windowMock.close.calls.count() ).toBe(0);

      expect( ret ).toEqual( false );
    });
    it ("wnp-toggle-open-close=true, Different Window name Should call $window.open() method.", function() {
      var wnpToggleOpenClose = true;
      var ret = wnpOpenService.popWdwfnc('dummy.html', 'winname', 'specs', wnpToggleOpenClose, function() {} ); 
      expect( windowMock.open ).toHaveBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1);
      expect( windowMock.close.calls.count() ).toBe(0);
      expect( ret ).toEqual( true );

      ret = wnpOpenService.popWdwfnc('dummy.html', 'winname_2', 'specs', wnpToggleOpenClose, function() {} ); 
//      expect( windowMock.open ).not.toHaveNotBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(2);
      expect( windowMock.close.calls.count() ).toBe(0);
      expect( ret ).toEqual( true );
    });

  });
});





describe('Directive: wnpPopup; testing click functionality', function () {
  var wnpOpenService;
  var wnpConfig;
  var scope = {};
  var element;
  var clsIconWinLinkName;
  var clsIconOpenWinName;
  var iconElem;

  // load the controller's module
  beforeEach(module('windowsPopup'));
  // -- Inject needed services --
  beforeEach(inject(function ($injector, $compile, $rootScope) {
    scope = $rootScope.$new();
    wnpOpenService = $injector.get('wnpOpenService');
    wnpConfig   = $injector.get('wnpConfig');

    element = angular.element('<wnp-popup url="views/popupWindow.html" \
     width="500" \
     height="500" \
     wnp-name="popupWindow" \
     second-click-colse="true">Testing</wnp-popup>');   

    $compile(element)(scope);

//    scope.$digest();

    spyOn(wnpOpenService, 'popWdwfnc').and.returnValue(true);

    clsIconWinLinkName = wnpConfig.popupLinkCssClass;
    clsIconOpenWinName = wnpConfig.winOpenSignCssClass;
    iconElem = element.children('span');
  }));

  describe('wnpPopup ...', function() {
    it ('Should have cursor:pointer css.', function() {

    });

    it ('Should keep the link text', function() {
      expect( element.text() ).toEqual( 'Testing' );
    });

    it ('Should have icon class added.', function() {
      expect(element.children('span').hasClass( clsIconWinLinkName )).toBe(true);
    });
 
    it ('Should have a bind clicked event attached to the element.', function() {
      expect( wnpOpenService.popWdwfnc.calls.count() ).toBe(0);
 //     browserTrigger(element, 'click');
      element.triggerHandler('click');
      expect( wnpOpenService.popWdwfnc).toHaveBeenCalled();
      expect( wnpOpenService.popWdwfnc.calls.count() ).toBe(1);
    });

 //    it ('Should the Window link and Open Window icon class toggle when the link is clicked.', function() {
 //      expect( wnpOpenService.popWdwfnc.calls.count() ).toBe(0);
 //      expect( iconElem.hasClass( clsIconWinLinkName )).toBe(true);
 //      expect( iconElem.hasClass( clsIconOpenWinName )).toBe(false);
 // //     browserTrigger(element, 'click');
 //      element.triggerHandler('click');
 //      expect( wnpOpenService.popWdwfnc).toHaveBeenCalled();
 //      expect( wnpOpenService.popWdwfnc.calls.count() ).toBe(1);
 //      expect( iconElem.hasClass( clsIconWinLinkName )).toBe(false);
 //      expect( iconElem.hasClass( clsIconOpenWinName )).toBe(true);
 //    });
  });
});




describe('Directive: wnpPopup; default parameter passings', function () {
  var wnpOpenServiceMock;
  var wnpConfig;
  var scope = {};
  var element;
  // --- parameter values for the popWdwfnc() method call ---
  var url;
  var winName;
  var specsText;
  var wnpToggleOpenClose;
  var wnpAutoUpdate;
  var wnpTitle;
  var closingFnc;

  // load the controller's module
  beforeEach(module('windowsPopup'));

  // --- Craete Mocks ---
  beforeEach(function() {
    wnpOpenServiceMock = {};
    wnpOpenServiceMock.popWdwfnc = function( urlPar, winNamePar, specsTextPar, wnpToggleOpenClosePar, wnpAutoUpdatePar, CONFIG ) {
      console.log('popWdwfnc() was called');
      url              = urlPar;
      winName          = winNamePar;
      specsText        = specsTextPar;
      wnpToggleOpenClose = wnpToggleOpenClosePar;
      wnpAutoUpdate     = wnpAutoUpdatePar;
      wnpTitle         = CONFIG.wnpTitle;
      closingFnc       = CONFIG.wnpOnClose;
    };
    module(function ($provide) {
      $provide.value('wnpOpenService', wnpOpenServiceMock);
    });
  });
  // -- Inject needed services --
  beforeEach(inject(function ($injector, $compile, $rootScope) {
    scope = $rootScope.$new();    
    wnpConfig = $injector.get('wnpConfig');
    element = angular.element('<wnp-popup wnp-name="defaultWin">Testing parameters</wnp-popup>');   
    $compile(element)(scope);
//    scope.$digest();

    spyOn(wnpOpenServiceMock, 'popWdwfnc').and.callThrough();
  }));

  describe('wnpPopup, we should get the right parameters', function() {

    it ('Should get the default parameter values when calling popWdwfnc()', function() {
      element.triggerHandler('click');

      var defaultParams = wnpConfig.getDefaultWindowParams();
      expect( url ).toEqual( defaultParams.url );
      expect( winName ).toEqual( defaultParams.wnpName );
      
      console.log(specsText);      
      var buildSpec = 'width='+defaultParams.specs.width+',';
      buildSpec += 'height='+defaultParams.specs.height+',';
      buildSpec += 'left='+defaultParams.specs.left+',';
      buildSpec += 'top='+defaultParams.specs.top+',';
      buildSpec += 'location='+defaultParams.specs.location+',';
      buildSpec += 'channelmode='+defaultParams.specs.channelmode+',';
      buildSpec += 'fullscreen='+defaultParams.specs.fullscreen+',';
      buildSpec += 'menubar='+defaultParams.specs.menubar+',';
      buildSpec += 'resizable='+defaultParams.specs.resizable+',';
      buildSpec += 'scrollbars='+defaultParams.specs.scrollbars+',';
      buildSpec += 'status='+defaultParams.specs.status+',';
      buildSpec += 'titlebar='+defaultParams.specs.titlebar+',';
      buildSpec += 'toolbar='+defaultParams.specs.toolbar;
      expect( specsText ).toEqual( buildSpec );

      expect( wnpToggleOpenClose ).toEqual( defaultParams.wnpToggleOpenClose );
      expect( wnpAutoUpdate ).toEqual( defaultParams.wnpAutoUpdate );
      expect( wnpTitle ).toEqual( 'Testing parameters' );
    });
  });
});



describe('Directive: wnpPopup; pre-defined window parameter passings', function () {
  var wnpOpenServiceMock;
  var wnpConfig;
  var scope = {};
  var element;
  // --- parameter values for the popWdwfnc() method call ---
  var url;
  var winName;
  var specsText;
  var wnpToggleOpenClose;
  var wnpAutoUpdate;
  var wnpTitle;
  var closingFnc;

  // load the controller's module
  beforeEach(module('windowsPopup'));

  // --- Craete Mocks ---
  beforeEach(function() {
    wnpOpenServiceMock = {};
    wnpOpenServiceMock.popWdwfnc = function( urlPar, winNamePar, specsTextPar, wnpToggleOpenClosePar, wnpAutoUpdatePar, CONFIG ) {
      console.log('popWdwfnc() was called');
      url              = urlPar;
      winName          = winNamePar;
      specsText        = specsTextPar;
      wnpToggleOpenClose = wnpToggleOpenClosePar;
      wnpAutoUpdate    = wnpAutoUpdatePar;
      wnpTitle         = CONFIG.wnpTitle;
      closingFnc       = CONFIG.wnpOnClose;
    };
    module(function ($provide) {
      $provide.value('wnpOpenService', wnpOpenServiceMock);
    });
  });
  // -- Inject needed services --
  beforeEach(inject(function ($injector, $compile, $rootScope) {
    scope = $rootScope.$new();    
    wnpConfig = $injector.get('wnpConfig');
    element = angular.element('<wnp-popup wnp-name="winOne">Testing Pre-defined Win</wnp-popup>');   
    $compile(element)(scope);
//    scope.$digest();

    spyOn(wnpOpenServiceMock, 'popWdwfnc').and.callThrough();
  }));

  describe('wnpPopup, we should get the right parameters', function() {

    it ('Should get the default parameter values when calling popWdwfnc()', function() {
      element.triggerHandler('click');

      var defaultParams = wnpConfig.getDefaultWindowParams();
      var preDefWindowP = wnpConfig.getPreWindow('winOne');

      expect( url ).toEqual( preDefWindowP.url );
      expect( winName ).toEqual( 'winOne' );
      
//      console.log(specsText);      
      var buildSpec = 'width='+preDefWindowP.specs.width+',';
      buildSpec += 'height='+preDefWindowP.specs.height+',';
      buildSpec += 'left='+defaultParams.specs.left+',';
      buildSpec += 'top='+defaultParams.specs.top+',';
      buildSpec += 'location='+defaultParams.specs.location+',';
      buildSpec += 'channelmode='+defaultParams.specs.channelmode+',';
      buildSpec += 'fullscreen='+defaultParams.specs.fullscreen+',';
      buildSpec += 'menubar='+defaultParams.specs.menubar+',';
      buildSpec += 'resizable='+defaultParams.specs.resizable+',';
      buildSpec += 'scrollbars='+defaultParams.specs.scrollbars+',';
      buildSpec += 'status='+defaultParams.specs.status+',';
      buildSpec += 'titlebar='+defaultParams.specs.titlebar+',';
      buildSpec += 'toolbar='+defaultParams.specs.toolbar;
      expect( specsText ).toEqual( buildSpec );

      expect( wnpToggleOpenClose ).toEqual( preDefWindowP.wnpToggleOpenClose );
      expect( wnpAutoUpdate ).toEqual( preDefWindowP.wnpAutoUpdate );
      expect( wnpTitle ).toEqual( preDefWindowP.wnpTitle );
    });
  });
});






describe('Directive: wnpPopup; attributes window parameter passings', function () {
  var wnpOpenServiceMock;
  var wnpConfig;
  var scope = {};
  var element;
  // --- parameter values for the popWdwfnc() method call ---
  var url;
  var winName;
  var specsText;
  var wnpToggleOpenClose;
  var wnpAutoUpdate;
  var wnpTitle;
  var closingFnc;

  // load the controller's module
  beforeEach(module('windowsPopup'));

  // --- Craete Mocks ---
  beforeEach(function() {
    wnpOpenServiceMock = {};
    wnpOpenServiceMock.popWdwfnc = function( urlPar, winNamePar, specsTextPar, wnpToggleOpenClosePar, wnpAutoUpdatePar, CONFIG) {
      console.log('popWdwfnc() was called');
      url              = urlPar;
      winName          = winNamePar;
      specsText        = specsTextPar;
      wnpToggleOpenClose = wnpToggleOpenClosePar;
      wnpAutoUpdate    = wnpAutoUpdatePar;
      wnpTitle         = CONFIG.wnpTitle;
      closingFnc       = CONFIG.wnpOnClose;
      return true;
    };
    module(function ($provide) {
      $provide.value('wnpOpenService', wnpOpenServiceMock);
    });
  });
  // -- Inject needed services --
  beforeEach(inject(function ($injector, $compile, $rootScope) {
    scope = $rootScope.$new();    
    wnpConfig = $injector.get('wnpConfig');
    element = angular.element('<wnp-popup wnp-name="winOne" url="testUrl" wnp-title="testwnpTitle" \
      wnp-toggle-open-close="testTrue" \
      wnp-auto-update="testwnpAutoUpdate"  \
      width="testWidth" \
      height="testheight" \
      left="testLeft" \
      top="testTop" \
      location="testLocation" \
      channelmode="testChannelmode" \
      fullscreen="testFullscreen" \
      menubar="testMenubar" \
      resizable="testResizable" \
      scrollbars="testScrollbars" \
      status="testStatus" \
      titlebar="testTitlebar" \
      toolbar="testToolbar" \
      >Testing Pre-defined Win</wnp-popup>');
    $compile(element)(scope);
//    scope.$digest();

    spyOn(wnpOpenServiceMock, 'popWdwfnc').and.callThrough();
  }));

  describe('wnpPopup, we should get the right parameters', function() {

    it ('Should get the default parameter values when calling popWdwfnc()', function() {
      element.triggerHandler('click');

      var defaultParams = wnpConfig.getDefaultWindowParams();
      var preDefWindowP = wnpConfig.getPreWindow('winOne');

      expect( url ).toEqual( 'testUrl' );
      expect( winName ).toEqual( 'winOne' );
      
//      console.log(specsText);      
      var buildSpec = 'width=testWidth,';
      buildSpec += 'height=testheight,';
      buildSpec += 'left=testLeft,';
      buildSpec += 'top=testTop,';
      buildSpec += 'location=testLocation,';
      buildSpec += 'channelmode=testChannelmode,';
      buildSpec += 'fullscreen=testFullscreen,';
      buildSpec += 'menubar=testMenubar,';
      buildSpec += 'resizable=testResizable,';
      buildSpec += 'scrollbars=testScrollbars,';
      buildSpec += 'status=testStatus,';
      buildSpec += 'titlebar=testTitlebar,';
      buildSpec += 'toolbar=testToolbar';
      expect( specsText ).toEqual( buildSpec );

      expect( wnpToggleOpenClose ).toEqual( 'testTrue' );
      expect( wnpAutoUpdate ).toEqual( 'testwnpAutoUpdate' );
      expect( wnpTitle ).toEqual( 'testwnpTitle' );

    });
  });
});



describe('Directive: wnpPopup; attributes window parameter passings', function () {
  var wnpOpenServiceMock;
  var wnpConfig;
  var scope = {};
  var element;
  // --- parameter values for the popWdwfnc() method call ---
  var url;
  var winName;
  var specsText;
  var wnpToggleOpenClose;
  var wnpAutoUpdate;
  var wnpTitle;
  var closingFnc;

  // load the controller's module
  beforeEach(module('windowsPopup'));

  // --- Craete Mocks ---
  beforeEach(function() {
    wnpOpenServiceMock = {};
    wnpOpenServiceMock.popWdwfnc = function( urlPar, winNamePar, specsTextPar, wnpToggleOpenClosePar, wnpAutoUpdatePar, CONFIG ) {
      console.log('popWdwfnc() was called');
      url              = urlPar;
      winName          = winNamePar;
      specsText        = specsTextPar;
      wnpToggleOpenClose = wnpToggleOpenClosePar;
      wnpAutoUpdate    = wnpAutoUpdatePar;
      wnpTitle         = CONFIG.wnpTitle;
      closingFnc       = CONFIG.wnpOnClose;
    };
    module(function ($provide) {
      $provide.value('wnpOpenService', wnpOpenServiceMock);
    });
  });
  // -- Inject needed services --
  beforeEach(inject(function ($injector, $compile, $rootScope) {
    scope = $rootScope.$new();    
    wnpConfig = $injector.get('wnpConfig');
    element = angular.element('<wnp-popup  url="testUrl" wnp-title="testwnpTitle" \
      wnp-toggle-open-close="testTrue" \
      wnp-auto-update="testwnpAutoUpdate"  \
      width="testWidth" \
      height="testheight" \
      left="testLeft" \
      top="testTop" \
      location="testLocation" \
      channelmode="testChannelmode" \
      fullscreen="testFullscreen" \
      menubar="testMenubar" \
      resizable="testResizable" \
      scrollbars="testScrollbars" \
      status="testStatus" \
      titlebar="testTitlebar" \
      toolbar="testToolbar" \
      >Testing Pre-defined Win</wnp-popup>');
    $compile(element)(scope);
//    scope.$digest();

    spyOn(wnpOpenServiceMock, 'popWdwfnc').and.callThrough();
  }));

  describe('wnpPopup, wnpName is NOT specified, but we we still should->', function() {

    it ('Should get the default parameter values when calling popWdwfnc()', function() {
      element.triggerHandler('click');

      var defaultParams = wnpConfig.getDefaultWindowParams();
      var preDefWindowP = wnpConfig.getPreWindow('winOne');

      expect( url ).toEqual( 'testUrl' );
      expect( winName ).toEqual( defaultParams.wnpName );
      
//      console.log(specsText);      
      var buildSpec = 'width=testWidth,';
      buildSpec += 'height=testheight,';
      buildSpec += 'left=testLeft,';
      buildSpec += 'top=testTop,';
      buildSpec += 'location=testLocation,';
      buildSpec += 'channelmode=testChannelmode,';
      buildSpec += 'fullscreen=testFullscreen,';
      buildSpec += 'menubar=testMenubar,';
      buildSpec += 'resizable=testResizable,';
      buildSpec += 'scrollbars=testScrollbars,';
      buildSpec += 'status=testStatus,';
      buildSpec += 'titlebar=testTitlebar,';
      buildSpec += 'toolbar=testToolbar';
      expect( specsText ).toEqual( buildSpec );

      expect( wnpToggleOpenClose ).toEqual( 'testTrue' );
      expect( wnpAutoUpdate ).toEqual( 'testwnpAutoUpdate' );
      expect( wnpTitle ).toEqual( 'testwnpTitle' );

    });
  });
});




describe('Directive: wnpPopup; attributes window parameter passings with interpolation', function () {
  var wnpOpenServiceMock;
  var wnpConfig;
  var scope = {};
  var element;
  // --- parameter values for the popWdwfnc() method call ---
  var url;
  var winName;
  var specsText;
  var wnpToggleOpenClose;
  var wnpAutoUpdate;
  var wnpTitle;
  var closingFnc;

  // load the controller's module
  beforeEach(module('windowsPopup'));

  // --- Craete Mocks ---
  beforeEach(function() {
    wnpOpenServiceMock = {};
    wnpOpenServiceMock.popWdwfnc = function( urlPar, winNamePar, specsTextPar, wnpToggleOpenClosePar, wnpAutoUpdatePar, CONFIG) {
      console.log('popWdwfnc() was called');
      url              = urlPar;
      winName          = winNamePar;
      specsText        = specsTextPar;
      wnpToggleOpenClose = wnpToggleOpenClosePar;
      wnpAutoUpdate    = wnpAutoUpdatePar;
      wnpTitle         = CONFIG.wnpTitle;
      closingFnc       = CONFIG.wnpOnClose;
      return true;
    };
    module(function ($provide) {
      $provide.value('wnpOpenService', wnpOpenServiceMock);
    });
  });
  // -- Inject needed services --
  beforeEach(inject(function ($injector, $compile, $rootScope) {
    scope = $rootScope.$new(); 
    wnpConfig = $injector.get('wnpConfig');
    element = angular.element('<wnp-popup url="{{testUrl}}" wnp-title="{{testwnpTitle}}" \
      wnp-toggle-open-close="{{testToogleOpen}}" \
      wnp-auto-update="{{testwnpAutoUpdate}}"  \
      width="{{testWidth}}" \
      height="{{testheight}}" \
      left="{{testLeft}}" \
      top="{{testTop}}" \
      location="{{testLocation}}" \
      channelmode="{{testChannelmode}}" \
      fullscreen="{{testFullscreen}}" \
      menubar="{{testMenubar}}" \
      resizable="{{testResizable}}" \
      scrollbars="{{testScrollbars}}" \
      status="{{testStatus}}" \
      titlebar="{{testTitlebar}}" \
      toolbar="{{testToolbar}}" \
      wnp-on-open="wnpOnOpen(wnpName)" \
      wnp-on-close="wnpOnClose(wnpName)" \
      >Testing Pre-defined Win</wnp-popup>');
    scope.wnpOnOpen = function(name) {
      console.log('Open ('+name+') was called.')
    };
    scope.wnpOnClose = function(name) {
      console.log('Close ('+name+') was called.')
    };
    scope.testToogleOpen = 'true'; // -- So clicking again will close --
    spyOn(scope, 'wnpOnOpen').and.callThrough();
    spyOn(scope, 'wnpOnClose').and.callThrough();

    $compile(element)(scope);
    scope.$digest();

    spyOn(wnpOpenServiceMock, 'popWdwfnc').and.callThrough();
  }));


  describe('wnpPopup, wnpName is NOT specified, but we we still should->', function() {
    it ('Should get the default parameter values when calling popWdwfnc()', function() {
      scope.testUrl = 'testUrl';
      scope.testwnpTitle = 'testwnpTitle';
      scope.testToogleOpen = 'testTrue';
      scope.testwnpAutoUpdate = 'testAuto';
      scope.testWidth = 'testW';
      scope.testheight = 'testH';
      scope.testLeft = 'testL';
      scope.testTop = 'testT';
      scope.testLocation = 'testL';
      scope.testChannelmode = 'testCh';
      scope.testFullscreen = 'testFull';
      scope.testMenubar = 'testM';
      scope.testResizable = 'testR';
      scope.testScrollbars = 'testSc';
      scope.testStatus = 'testStat';
      scope.testTitlebar = 'testTitl';
      scope.testToolbar = 'testTool';

      element.triggerHandler('click');

      var defaultParams = wnpConfig.getDefaultWindowParams();
      var preDefWindowP = wnpConfig.getPreWindow('winOne');

      expect( url ).toEqual( 'testUrl' );
      expect( winName ).toEqual( defaultParams.wnpName );
      
//      console.log(specsText);      
      var buildSpec = 'width=testW,';
      buildSpec += 'height=testH,';
      buildSpec += 'left=testL,';
      buildSpec += 'top=testT,';
      buildSpec += 'location=testL,';
      buildSpec += 'channelmode=testCh,';
      buildSpec += 'fullscreen=testFull,';
      buildSpec += 'menubar=testM,';
      buildSpec += 'resizable=testR,';
      buildSpec += 'scrollbars=testSc,';
      buildSpec += 'status=testStat,';
      buildSpec += 'titlebar=testTitl,';
      buildSpec += 'toolbar=testTool';
      expect( specsText ).toEqual( buildSpec );

      expect( wnpToggleOpenClose ).toEqual( 'testTrue' );
      expect( wnpAutoUpdate ).toEqual( 'testAuto' );
      expect( wnpTitle ).toEqual( 'testwnpTitle' );

    });
  });
});





describe('Directive: wnpModel', function () {
  var wnpFromParent;
  var wnpToChild;
  var wnpUtil;
  var wnpOpenService;
  var scopeParent = {};
  var scopeChild = {};
  var elementParent;
  var elementChild;
  var compile;
  var window;
  var timeout;

  // load the controller's module
  beforeEach(module('windowsPopup'));
  // -- Inject needed services --
  beforeEach(inject(function ($injector, $compile, $rootScope, $window, $timeout) {
    timeout = $timeout;
    window = $window;
    scopeParent = $rootScope;
    scopeChild  = $rootScope.$new(true);
    wnpUtil  = $injector.get('wnpUtil');
    wnpFromParent  = $injector.get('wnpFromParent');
    wnpToChild     = $injector.get('wnpToChild');
    wnpOpenService = $injector.get('wnpOpenService');
   
    spyOn(wnpToChild, 'addOneSharedModel').and.callThrough();

    elementParent = angular.element('<input type="text" wnp-model="item_one" ng-model="parentData" />');
    $compile(elementParent)(scopeParent);
//    scopeParent.$digest();
    
    // elementChild = angular.element('<input type="text" wnp-model="item_one" ng-model="ChildData" />');
    // $compile(elementChild)(scopeChild);
    // scopeChild.$digest();

    // -- To compile the child later below --
    compile = $compile;
  }));

  describe('wnpModel ...', function() {
    it('Should call wnpToChild.addOneSharedModel', function(){
      // --- Add parentData scope value ---
      expect( wnpToChild.addOneSharedModel).toHaveBeenCalled();
      expect( wnpToChild.addOneSharedModel.calls.count() ).toBe(1);
    });

    it('Should get the data from Parent scope to the Child scope.', function(){
      // --- Add parentData scope value ---
      scopeParent.parentData = "123";
      expect( wnpToChild.addOneSharedModel).toHaveBeenCalled();

      // -- Simulate the open window click by calling setDataToChild --
      var CONFIG = {};
      CONFIG.wnpTitle = 'TestTitle';
      CONFIG.wnpOnOpen = function(){ console.log('closing fnc. called'); };
      wnpFromParent.setDataToChild(false, CONFIG);
      expect( wnpFromParent.isData ).toBeFalsy();
      expect( window.$$$shareData.DATA ).toBeTruthy();
      expect( window.$$$shareData.CONFIG ).toBeTruthy();
      expect( window.opener ).toBeFalsy();
      // --- Move shared data to window.opener --

      window.opener = {};
      window.opener.$$$shareData = window.$$$shareData;
      window.$$$shareData = null;
      expect( window.opener.$$$shareData.DATA ).toBeTruthy();
      expect( window.opener.$$$shareData.CONFIG ).toBeTruthy();
      expect( window.opener.$$$shareData.CONFIG.wnpTitle ).toEqual('TestTitle');

      wnpFromParent.isData = true;
      spyOn(wnpFromParent, 'get').and.returnValue( window.opener.$$$shareData.DATA );
      spyOn(wnpFromParent, 'getWnpTitle').and.returnValue( window.opener.$$$shareData.CONFIG.wnpTitle );

      // -- Simulate Child window rendering --
      elementChild = angular.element('<input type="text" wnp-model="item_one" ng-model="ChildData" />');
      compile(elementChild)(scopeChild);
//      scopeChild.$digest();

      expect( wnpFromParent.get).toHaveBeenCalled();
      expect( wnpFromParent.isData ).toBeTruthy();
      expect( scopeChild.ChildData ).toEqual("123");

      // timeout(function() {
      //   // -- Change the Child ---
      //   scopeChild.ChildData = "NewVal";
      //   scopeChild.$digest();
      //   // -- Parent should change too --
      //   expect( scopeParent.parentData ).toEqual("NewVal");
      //   console.log(scopeParent.parentData);              
      // }, 500);
      // timeout.flush();

    });

  });
});

