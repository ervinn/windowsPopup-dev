'use strict';
angular.module('app', ['windowsPopup'])

.controller('parentController', function($scope, parentSharedData) {
	$scope.bgrColor = "lightgray";
	parentSharedData.addOneSharedModel($scope, 'item_three', 'bgrColor');
});

