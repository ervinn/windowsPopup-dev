'use strict';
angular.module('app', ['windowsPopup'])

.controller('parentController', function($scope, wnpToChild) {
	$scope.bgrColor = "lightgray";
	wnpToChild.addOneSharedModel($scope, 'item_three', 'bgrColor');

})
.controller('buildYourPopupCtrl', function($scope) {
	$scope.inputStyle = {};

	$scope.wnpName  = 'WinName';
	$scope.wnpTitle = 'Popup Window Title';
	$scope.wnpUrl = 'views/popupWindow.html#/sampleTwo';

	$scope.wnpUrlList = ['views/popupWindow.html#/sampleTwo', 'views/popupWindow.html#/sampleOne', 'views/popupWindow.html#/sampleThree', 'views/popupWindow.html#/sampleFour'];	

	$scope.wnpWidth  = 600;
	$scope.wnpHeight = 600;
	$scope.wnpLeft = 10;
	$scope.wnpTop  = 100;
	$scope.wnpToggleOpenClose = "true";
	$scope.wnpAutoUpdate = "true";

	$scope.isOpen = false;

	$scope.onOpen = function(name) {
//		console.log('name=', name);
		$scope.isOpen = true;
		$scope.inputStyle = {'background-color': $scope.bgrColor};
	};
	$scope.onClose = function(name) {
//		console.log('name=', name);
		$scope.isOpen = false;
		$scope.inputStyle = {};
	};	

});

