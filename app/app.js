'use strict';
angular.module('app', ['windowsPopup'])

.controller('parentController', function($scope, wnpToChild) {
	$scope.bgrColor = "lightgray";
	wnpToChild.addOneSharedModel($scope, 'item_three', 'bgrColor');

	$scope.wnpName  = 'WinName';
	$scope.wnpTitle = 'Popup Window Title';
	$scope.wnpUrl = 'views/popupWindow.html#/sampleTwo';
	$scope.wnpWidth  = 600;
	$scope.wnpHeight = 600;
	$scope.wnpLeft = 10;
	$scope.wnpTop  = 100;

	$scope.wnpToggleOpenClose = "true";
	$scope.wnpAutoUpdate = "true";


});

