'use strict';
describe('Controller: childCtrl', function () {

  // load the controller's module
  beforeEach(module('PopupApp'));

  var childCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    childCtrl = $controller('childCtrl', {
      $scope: scope
    });
  }));
});
