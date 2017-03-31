// by Paul Van Camp

angular.module('owt')

.controller('DashCtrl', function($scope) {
	$scope.$on('$ionicView.enter', function(e) {
		if ( $scope.tabsHide ) $scope.tabsHide(false);
	});

})
.controller('SettingsCtrl', function($scope) {
	$scope.$on('$ionicView.enter', function(e) {
		if ( $scope.tabsHide ) $scope.tabsHide(false);
	});

	//just for testing
	$scope.changeOriantationLandspace = function() {
		screen.orientation.lock('landscape');
	}
	 
	$scope.changeOriantationPortrait = function() {
		screen.orientation.lock('portrait');
	}

})
;
