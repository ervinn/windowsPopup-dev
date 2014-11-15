'use strict';
angular.module('app', ['windowsPopup'])

.controller('parentController', function($scope, wnpToChild) {
	$scope.bgrColor = "lightgray";
	wnpToChild.addOneSharedModel($scope, 'item_three', 'bgrColor');
});

