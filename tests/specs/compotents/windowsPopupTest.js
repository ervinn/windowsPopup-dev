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
      expect( sharedData.bindText.data ).toEqual('ChangedD'); 
 
      // --- Add one more 
      scope.secondTestValue = 'value_2';
      scope.testValue = 'Changed-Again';
      wnpToChild.addOneSharedModel(scope, 'bindTextSecond', 'secondTestValue');
      sharedData = wnpToChild.applyAndGetDataForChild(false);
      expect( sharedData.bindText.data ).toEqual('Changed-Again'); 
      expect( sharedData.bindTextSecond.data ).toEqual('value_2'); 
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
    windowMock.open = function(url, name, specs, bl) {
      console.log('window.open() is called for '+name);
      this.closed = false;
      return this;
    };
    windowMock.close = function(name) {
      console.log('window.close() is called for '+name);
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
    it ("second-click-close=true, Second Time Should call $window.close() method, using same Window name.", function() {
      var secondclickclose = true;
      var ret = wnpOpenService.popWdwfnc('dummy.html', 'winname', 'specs', secondclickclose, function() {} ); 
      expect( windowMock.open ).toHaveBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1);
      expect( windowMock.close.calls.count() ).toBe(0);
      expect( ret ).toEqual( true );

      ret = wnpOpenService.popWdwfnc('dummy.html', 'winname', 'specs', secondclickclose, function() {} ); 
//      expect( windowMock.open ).not.toHaveNotBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1); // --- From the previous call ---
      expect( windowMock.close ).toHaveBeenCalled();
      expect( windowMock.close.calls.count() ).toBe(1);
      expect( ret ).toEqual( false );

      // --- Now should be able to ropen the window --
      ret = wnpOpenService.popWdwfnc('dummy.html', 'winname', 'specs', secondclickclose, function() {} ); 
      expect( windowMock.open.calls.count() ).toBe(2);
      expect( ret ).toEqual( true );
    });

    it ("second-click-close=false, Second Time Should NOT call $window.open() method, using same Window name.", function() {
      var secondclickclose = false;
      var ret = wnpOpenService.popWdwfnc('dummy.html', 'winname', 'specs', secondclickclose, function() {} ); 
      expect( windowMock.open ).toHaveBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1);
      expect( windowMock.alert.calls.count() ).toBe(0);
      expect( windowMock.close.calls.count() ).toBe(0);
      expect( ret ).toEqual( true );

      ret = wnpOpenService.popWdwfnc('dummy.html', 'winname', 'specs', secondclickclose, function() {} ); 
//      expect( windowMock.open ).not.toHaveNotBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1);
      expect( windowMock.alert.calls.count() ).toBe(1);
      expect( windowMock.close.calls.count() ).toBe(0);

      expect( ret ).toEqual( false );
    });
    it ("second-click-close=true, Different Window name Should call $window.open() method.", function() {
      var secondclickclose = true;
      var ret = wnpOpenService.popWdwfnc('dummy.html', 'winname', 'specs', secondclickclose, function() {} ); 
      expect( windowMock.open ).toHaveBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1);
      expect( windowMock.close.calls.count() ).toBe(0);
      expect( ret ).toEqual( true );

      ret = wnpOpenService.popWdwfnc('dummy.html', 'winname_2', 'specs', secondclickclose, function() {} ); 
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
     name="popupWindow" \
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

    it ('Should the Window link and Open Window icon class toggle when the link is clicked.', function() {
      expect( wnpOpenService.popWdwfnc.calls.count() ).toBe(0);
      expect( iconElem.hasClass( clsIconWinLinkName )).toBe(true);
      expect( iconElem.hasClass( clsIconOpenWinName )).toBe(false);
 //     browserTrigger(element, 'click');
      element.triggerHandler('click');
      expect( wnpOpenService.popWdwfnc).toHaveBeenCalled();
      expect( wnpOpenService.popWdwfnc.calls.count() ).toBe(1);
      expect( iconElem.hasClass( clsIconWinLinkName )).toBe(false);
      expect( iconElem.hasClass( clsIconOpenWinName )).toBe(true);
    });
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
  var secondClickclose;
  var autoUpdate;
  var closingFnc;

  // load the controller's module
  beforeEach(module('windowsPopup'));

  // --- Craete Mocks ---
  beforeEach(function() {
    wnpOpenServiceMock = {};
    wnpOpenServiceMock.popWdwfnc = function( urlPar, winNamePar, specsTextPar, secondClickclosePar, autoUpdatePar, closingFncPar ) {
      console.log('popWdwfnc() was called');
      url              = urlPar;
      winName          = winNamePar;
      specsText        = specsTextPar;
      secondClickclose = secondClickclosePar;
      autoUpdate       = autoUpdatePar;
      closingFnc       = closingFncPar;
    };
    module(function ($provide) {
      $provide.value('wnpOpenService', wnpOpenServiceMock);
    });
  });
  // -- Inject needed services --
  beforeEach(inject(function ($injector, $compile, $rootScope) {
    scope = $rootScope.$new();    
    wnpConfig = $injector.get('wnpConfig');
    element = angular.element('<wnp-popup name="defaultWin">Testing parameters</wnp-popup>');   
    $compile(element)(scope);
//    scope.$digest();

    spyOn(wnpOpenServiceMock, 'popWdwfnc').and.callThrough();
  }));

  describe('wnpPopup, we should get the right parameters', function() {

    it ('Should get the default parameter values when calling popWdwfnc()', function() {
      element.triggerHandler('click');

      var defaultParams = wnpConfig.getDefaultWindowParams();
      expect( url ).toEqual( defaultParams.url );
      expect( winName ).toEqual( defaultParams.name );
      
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

      expect( secondClickclose ).toEqual( defaultParams.secondClickclose );
      expect( autoUpdate ).toEqual( defaultParams.autoUpdate );
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
  var secondClickclose;
  var autoUpdate;
  var closingFnc;

  // load the controller's module
  beforeEach(module('windowsPopup'));

  // --- Craete Mocks ---
  beforeEach(function() {
    wnpOpenServiceMock = {};
    wnpOpenServiceMock.popWdwfnc = function( urlPar, winNamePar, specsTextPar, secondClickclosePar, autoUpdatePar, closingFncPar ) {
      console.log('popWdwfnc() was called');
      url              = urlPar;
      winName          = winNamePar;
      specsText        = specsTextPar;
      secondClickclose = secondClickclosePar;
      autoUpdate       = autoUpdatePar;
      closingFnc       = closingFncPar;
    };
    module(function ($provide) {
      $provide.value('wnpOpenService', wnpOpenServiceMock);
    });
  });
  // -- Inject needed services --
  beforeEach(inject(function ($injector, $compile, $rootScope) {
    scope = $rootScope.$new();    
    wnpConfig = $injector.get('wnpConfig');
    element = angular.element('<wnp-popup name="winOne">Testing Pre-defined Win</wnp-popup>');   
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

      expect( secondClickclose ).toEqual( preDefWindowP.secondClickclose );
      expect( autoUpdate ).toEqual( preDefWindowP.autoUpdate );
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
  var secondClickclose;
  var autoUpdate;
  var closingFnc;

  // load the controller's module
  beforeEach(module('windowsPopup'));

  // --- Craete Mocks ---
  beforeEach(function() {
    wnpOpenServiceMock = {};
    wnpOpenServiceMock.popWdwfnc = function( urlPar, winNamePar, specsTextPar, secondClickclosePar, autoUpdatePar, closingFncPar ) {
      console.log('popWdwfnc() was called');
      url              = urlPar;
      winName          = winNamePar;
      specsText        = specsTextPar;
      secondClickclose = secondClickclosePar;
      autoUpdate       = autoUpdatePar;
      closingFnc       = closingFncPar;
    };
    module(function ($provide) {
      $provide.value('wnpOpenService', wnpOpenServiceMock);
    });
  });
  // -- Inject needed services --
  beforeEach(inject(function ($injector, $compile, $rootScope) {
    scope = $rootScope.$new();    
    wnpConfig = $injector.get('wnpConfig');
    element = angular.element('<wnp-popup name="winOne" url="testUrl" \
      second-click-close="testTrue" \
      auto-update="testAutoUpdate"  \
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

      expect( secondClickclose ).toEqual( 'testTrue' );
      expect( autoUpdate ).toEqual( 'testAutoUpdate' );

    });
  });
});







describe('Directive: wnpModel', function () {
  var wnpFromParent;
  var wnpToChild;
  var wnpUtil;
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
    wnpFromParent = $injector.get('wnpFromParent');
    wnpToChild  = $injector.get('wnpToChild');
   
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
      wnpFromParent.setDataToChild( function(){ console.log('closing fnc. called')} );
      expect( wnpFromParent.isData ).toBeFalsy();
      expect( window.$$$shareData ).toBeTruthy();
      expect( window.opener ).toBeFalsy();
      // --- Move shared data to window.opener --

      window.opener = {};
      window.opener.$$$shareData = window.$$$shareData;
      window.$$$shareData = null;
      wnpFromParent.isData = true;
      spyOn(wnpFromParent, 'get').and.returnValue( window.opener.$$$shareData );

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

