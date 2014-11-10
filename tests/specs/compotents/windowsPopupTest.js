'use strict';

describe('Factory: winPopUtil', function () {
  var winPopUtil;
  var scope = {};

  // -- load the Main module --
  beforeEach(module('windowsPopup'));

  // -- Inject needed services --
  beforeEach(inject(function ($injector) {
    winPopUtil = $injector.get('winPopUtil');
  }));
  describe('winPopUtil.setToScope & winPopUtil.getFromScope', function() {
    it ("Should put the value to scope when the name has a dot in it", function() {
      winPopUtil.setToScope(scope, 'input.data', 'value123');
      expect(scope.input.data).toEqual('value123');
    });

    it ("Should get the value from scope when the name has a dot in it", function() {
      scope.input.data = 'val321';
      var val = winPopUtil.getFromScope(scope, 'input.data');
      expect(scope.input.data).toEqual(val);
    });

  });
});



describe('Factory: parentSharedData', function () {;
  var scope;
  var winPopUtil;
  var parentSharedData;

  // load the Main testing module
  beforeEach(module('windowsPopup'));

  // -- Inject needed services --
  beforeEach(inject(function ($injector, $rootScope) {
    scope            = $rootScope.$new();
    winPopUtil       = $injector.get('winPopUtil');
    parentSharedData = $injector.get('parentSharedData');
  }));
  describe('addOneSharedModel & getDataForChild', function() {

    it ("Should have latest data when adding Model Data to Child Window.", function() {

      // -- Add value to scope --
      scope.testValue = "1234";
      // -- Add this 'parentSharedData' factory --
      parentSharedData.addOneSharedModel(scope, 'bindText', 'testValue');
      // -- Data may change, simulate that ::
      scope.testValue = 'ChangedD';

      var sharedData = parentSharedData.getDataForChild();
      expect( sharedData.bindText.data ).toEqual('ChangedD'); 
 
      // --- Add one more 
      scope.secondTestValue = 'value_2';
      scope.testValue = 'Changed-Again';
      parentSharedData.addOneSharedModel(scope, 'bindTextSecond', 'secondTestValue');
      sharedData = parentSharedData.getDataForChild();
      expect( sharedData.bindText.data ).toEqual('Changed-Again'); 
      expect( sharedData.bindTextSecond.data ).toEqual('value_2'); 
    });

  });
});




describe('Factory: parentDataToChild', function () {
  var scope;
  var parentSharedData;
  var windowMock;
  var parentDataToChild;
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
    parentSharedData = $injector.get('parentSharedData');
    scope.testValue = "1234";
    parentSharedData.addOneSharedModel(scope, 'bindText', 'testValue');
  }));
  describe('Child window should get the SharedData', function() { 

    it ('Browsers should find sharedData, in window.opener object', function() {
      // --- Set Data for the Child Window --
      windowMock.opener.$$$shareData = parentSharedData.getDataForChild();

      // --- Inject here, the 'window' object must be set ---
      parentDataToChild = injector.get('parentDataToChild');

      expect(parentDataToChild.isData).toEqual(true);
      var inputData = parentDataToChild.get();
      expect( inputData.bindText.data).toEqual('1234');
      expect( inputData.bindText.name).toEqual('bindText');      
    });

    it ('No SharedData set, should be no data for Child.', function() {
      // --- NO Set Data for the Child Window --

      // --- Inject here, the 'window' object must be set ---
      parentDataToChild = injector.get('parentDataToChild');

      expect(parentDataToChild.isData).toEqual(false);
      var inputData = parentDataToChild.shareData;
      expect( inputData ).toBeUndefined();
    });  
  });
});





describe('Factory: popupService', function () {
  var parentSharedData;
  var popupService;
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
    popupService     = $injector.get('popupService');
    parentSharedData = $injector.get('parentSharedData');

    spyOn(windowMock, 'alert').and.callThrough();
    spyOn(windowMock, 'open').and.callThrough();
    spyOn(windowMock, 'close').and.callThrough();
//    spyOn(windowMock, 'open').and.returnValue(windowMock);
  }));
  describe('popupService.popWdwfnc', function() {

    it ("Should call $window.open() method, if not opened yet.", function() {
      var ret = popupService.popWdwfnc('dummy.html', 'winname', 'specs', 'true', function() {} ); 
      expect( windowMock.open ).toHaveBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1);
      expect( ret ).toEqual( true );
      // --- No data was set to Child --
//      expect( windowMock.$$$shareData ).toBeFalsy();
      // --- There should be one open windows ---
      expect(popupService.popWindows.winname.popWdw).toBe(windowMock); 
    });
    it ("second-click-close=true, Second Time Should call $window.close() method, using same Window name.", function() {
      var secondclickclose = true;
      var ret = popupService.popWdwfnc('dummy.html', 'winname', 'specs', secondclickclose, function() {} ); 
      expect( windowMock.open ).toHaveBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1);
      expect( windowMock.close.calls.count() ).toBe(0);
      expect( ret ).toEqual( true );

      ret = popupService.popWdwfnc('dummy.html', 'winname', 'specs', secondclickclose, function() {} ); 
//      expect( windowMock.open ).not.toHaveNotBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1); // --- From the previous call ---
      expect( windowMock.close ).toHaveBeenCalled();
      expect( windowMock.close.calls.count() ).toBe(1);
      expect( ret ).toEqual( false );

      // --- Now should be able to ropen the window --
      ret = popupService.popWdwfnc('dummy.html', 'winname', 'specs', secondclickclose, function() {} ); 
      expect( windowMock.open.calls.count() ).toBe(2);
      expect( ret ).toEqual( true );
    });

    it ("second-click-close=false, Second Time Should NOT call $window.open() method, using same Window name.", function() {
      var secondclickclose = false;
      var ret = popupService.popWdwfnc('dummy.html', 'winname', 'specs', secondclickclose, function() {} ); 
      expect( windowMock.open ).toHaveBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1);
      expect( windowMock.alert.calls.count() ).toBe(0);
      expect( windowMock.close.calls.count() ).toBe(0);
      expect( ret ).toEqual( true );

      ret = popupService.popWdwfnc('dummy.html', 'winname', 'specs', secondclickclose, function() {} ); 
//      expect( windowMock.open ).not.toHaveNotBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1);
      expect( windowMock.alert.calls.count() ).toBe(1);
      expect( windowMock.close.calls.count() ).toBe(0);

      expect( ret ).toEqual( false );
    });
    it ("second-click-close=true, Different Window name Should call $window.open() method.", function() {
      var secondclickclose = true;
      var ret = popupService.popWdwfnc('dummy.html', 'winname', 'specs', secondclickclose, function() {} ); 
      expect( windowMock.open ).toHaveBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(1);
      expect( windowMock.close.calls.count() ).toBe(0);
      expect( ret ).toEqual( true );

      ret = popupService.popWdwfnc('dummy.html', 'winname_2', 'specs', secondclickclose, function() {} ); 
//      expect( windowMock.open ).not.toHaveNotBeenCalled();
      expect( windowMock.open.calls.count() ).toBe(2);
      expect( windowMock.close.calls.count() ).toBe(0);
      expect( ret ).toEqual( true );
    });

  });
});





describe('Directive: winPopup; testing click functionality', function () {
  var popupService;
  var wpopConfig;
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
    popupService = $injector.get('popupService');
    wpopConfig   = $injector.get('wpopConfig');

    element = angular.element('<win-popup url="views/popupWindow.html" \
     width="500" \
     height="500" \
     name="popupWindow" \
     second-click-colse="true">Testing</win-popup>');   

    $compile(element)(scope);

//    scope.$digest();

    spyOn(popupService, 'popWdwfnc').and.returnValue(true);

    clsIconWinLinkName = wpopConfig.popupLinkCssClass;
    clsIconOpenWinName = wpopConfig.winOpenSignCssClass;
    iconElem = element.children('span');
  }));

  describe('winPopup ...', function() {
    it ('Should have cursor:pointer css.', function() {

    });

    it ('Should keep the link text', function() {
      expect( element.text() ).toEqual( 'Testing' );
    });

    it ('Should have icon class added.', function() {
      expect(element.children('span').hasClass( clsIconWinLinkName )).toBe(true);
    });
 
    it ('Should have a bind clicked event attached to the element.', function() {
      expect( popupService.popWdwfnc.calls.count() ).toBe(0);
 //     browserTrigger(element, 'click');
      element.triggerHandler('click');
      expect( popupService.popWdwfnc).toHaveBeenCalled();
      expect( popupService.popWdwfnc.calls.count() ).toBe(1);
    });

    it ('Should the Window link and Open Window icon class toggle when the link is clicked.', function() {
      expect( popupService.popWdwfnc.calls.count() ).toBe(0);
      expect( iconElem.hasClass( clsIconWinLinkName )).toBe(true);
      expect( iconElem.hasClass( clsIconOpenWinName )).toBe(false);
 //     browserTrigger(element, 'click');
      element.triggerHandler('click');
      expect( popupService.popWdwfnc).toHaveBeenCalled();
      expect( popupService.popWdwfnc.calls.count() ).toBe(1);
      expect( iconElem.hasClass( clsIconWinLinkName )).toBe(false);
      expect( iconElem.hasClass( clsIconOpenWinName )).toBe(true);
    });
  });
});




describe('Directive: winPopup; default parameter passings', function () {
  var popupServiceMock;
  var wpopConfig;
  var scope = {};
  var element;
  // --- parameter values for the popWdwfnc() method call ---
  var url;
  var winName;
  var specsText;
  var secondClickclose;
  var closingFnc;

  // load the controller's module
  beforeEach(module('windowsPopup'));

  // --- Craete Mocks ---
  beforeEach(function() {
    popupServiceMock = {};
    popupServiceMock.popWdwfnc = function( urlPar, winNamePar, specsTextPar, secondClickclosePar, closingFncPar ) {
      console.log('popWdwfnc() was called');
      url              = urlPar;
      winName          = winNamePar;
      specsText        = specsTextPar;
      secondClickclose = secondClickclosePar;
      closingFnc       = closingFncPar;
    };
    module(function ($provide) {
      $provide.value('popupService', popupServiceMock);
    });
  });
  // -- Inject needed services --
  beforeEach(inject(function ($injector, $compile, $rootScope) {
    scope = $rootScope.$new();    
    wpopConfig = $injector.get('wpopConfig');
    element = angular.element('<win-popup name="defaultWin">Testing parameters</win-popup>');   
    $compile(element)(scope);
//    scope.$digest();

    spyOn(popupServiceMock, 'popWdwfnc').and.callThrough();
  }));

  describe('winPopup, we should get the right parameters', function() {

    it ('Should get the default parameter values when calling popWdwfnc()', function() {
      element.triggerHandler('click');

      var defaultParams = wpopConfig.getDefaultWindowParams();
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
    });
  });
});



describe('Directive: winPopup; pre-defined window parameter passings', function () {
  var popupServiceMock;
  var wpopConfig;
  var scope = {};
  var element;
  // --- parameter values for the popWdwfnc() method call ---
  var url;
  var winName;
  var specsText;
  var secondClickclose;
  var closingFnc;

  // load the controller's module
  beforeEach(module('windowsPopup'));

  // --- Craete Mocks ---
  beforeEach(function() {
    popupServiceMock = {};
    popupServiceMock.popWdwfnc = function( urlPar, winNamePar, specsTextPar, secondClickclosePar, closingFncPar ) {
      console.log('popWdwfnc() was called');
      url              = urlPar;
      winName          = winNamePar;
      specsText        = specsTextPar;
      secondClickclose = secondClickclosePar;
      closingFnc       = closingFncPar;
    };
    module(function ($provide) {
      $provide.value('popupService', popupServiceMock);
    });
  });
  // -- Inject needed services --
  beforeEach(inject(function ($injector, $compile, $rootScope) {
    scope = $rootScope.$new();    
    wpopConfig = $injector.get('wpopConfig');
    element = angular.element('<win-popup name="winOne">Testing Pre-defined Win</win-popup>');   
    $compile(element)(scope);
//    scope.$digest();

    spyOn(popupServiceMock, 'popWdwfnc').and.callThrough();
  }));

  describe('winPopup, we should get the right parameters', function() {

    it ('Should get the default parameter values when calling popWdwfnc()', function() {
      element.triggerHandler('click');

      var defaultParams = wpopConfig.getDefaultWindowParams();
      var preDefWindowP = wpopConfig.getPreWindow('winOne');

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
    });
  });
});






describe('Directive: winPopup; attributes window parameter passings', function () {
  var popupServiceMock;
  var wpopConfig;
  var scope = {};
  var element;
  // --- parameter values for the popWdwfnc() method call ---
  var url;
  var winName;
  var specsText;
  var secondClickclose;
  var closingFnc;

  // load the controller's module
  beforeEach(module('windowsPopup'));

  // --- Craete Mocks ---
  beforeEach(function() {
    popupServiceMock = {};
    popupServiceMock.popWdwfnc = function( urlPar, winNamePar, specsTextPar, secondClickclosePar, closingFncPar ) {
      console.log('popWdwfnc() was called');
      url              = urlPar;
      winName          = winNamePar;
      specsText        = specsTextPar;
      secondClickclose = secondClickclosePar;
      closingFnc       = closingFncPar;
    };
    module(function ($provide) {
      $provide.value('popupService', popupServiceMock);
    });
  });
  // -- Inject needed services --
  beforeEach(inject(function ($injector, $compile, $rootScope) {
    scope = $rootScope.$new();    
    wpopConfig = $injector.get('wpopConfig');
    element = angular.element('<win-popup name="winOne" url="testUrl" \
      second-click-close="testTrue" \
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
      >Testing Pre-defined Win</win-popup>');
    $compile(element)(scope);
//    scope.$digest();

    spyOn(popupServiceMock, 'popWdwfnc').and.callThrough();
  }));

  describe('winPopup, we should get the right parameters', function() {

    it ('Should get the default parameter values when calling popWdwfnc()', function() {
      element.triggerHandler('click');

      var defaultParams = wpopConfig.getDefaultWindowParams();
      var preDefWindowP = wpopConfig.getPreWindow('winOne');

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
    });
  });
});







describe('Directive: popupLinkModel', function () {
  var parentDataToChild;
  var parentSharedData;
  var winPopUtil;
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
    winPopUtil  = $injector.get('winPopUtil');
    parentDataToChild = $injector.get('parentDataToChild');
    parentSharedData  = $injector.get('parentSharedData');
   
    spyOn(parentSharedData, 'addOneSharedModel').and.callThrough();

    elementParent = angular.element('<input type="text" popup-link-model="item_one" ng-model="parentData" />');
    $compile(elementParent)(scopeParent);
//    scopeParent.$digest();
    
    // elementChild = angular.element('<input type="text" popup-link-model="item_one" ng-model="ChildData" />');
    // $compile(elementChild)(scopeChild);
    // scopeChild.$digest();

    // -- To compile the child later below --
    compile = $compile;
  }));

  describe('popupLinkModel ...', function() {
    it('Should call parentSharedData.addOneSharedModel', function(){
      // --- Add parentData scope value ---
      expect( parentSharedData.addOneSharedModel).toHaveBeenCalled();
      expect( parentSharedData.addOneSharedModel.calls.count() ).toBe(1);
    });

    it('Should get the data from Parent scope to the Child scope.', function(){
      // --- Add parentData scope value ---
      scopeParent.parentData = "123";
      expect( parentSharedData.addOneSharedModel).toHaveBeenCalled();

      // -- Simulate the open window click by calling setDataToChild --
      parentDataToChild.setDataToChild( function(){ console.log('closing fnc. called')} );
      expect( parentDataToChild.isData ).toBeFalsy();
      expect( window.$$$shareData ).toBeTruthy();
      expect( window.opener ).toBeFalsy();
      // --- Move shared data to window.opener --

      window.opener = {};
      window.opener.$$$shareData = window.$$$shareData;
      window.$$$shareData = null;
      parentDataToChild.isData = true;
      spyOn(parentDataToChild, 'get').and.returnValue( window.opener.$$$shareData );

      // -- Simulate Child window rendering --
      elementChild = angular.element('<input type="text" popup-link-model="item_one" ng-model="ChildData" />');
      compile(elementChild)(scopeChild);
//      scopeChild.$digest();

      expect( parentDataToChild.get).toHaveBeenCalled();
      expect( parentDataToChild.isData ).toBeTruthy();
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

