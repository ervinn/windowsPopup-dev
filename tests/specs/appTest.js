'use strict';
describe('Controller: parentController', function () {

  // load the controller's module
  beforeEach(module('app'));

  var parentController,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    parentController = $controller('parentController', {
      $scope: scope
    });
  }));

});
