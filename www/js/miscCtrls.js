// by Paul Van Camp

angular.module('owt')

.controller('AccountCtrl', function($scope) {
	$scope.$on('$ionicView.enter', function(e) {
		if ( $scope.tabsHide ) $scope.tabsHide(false);
	});

	$scope.settings = {
		largePrint: false,
		lang: 'A',
	};

	//just for testing
	$scope.changeOriantationLandspace = function() {
		screen.orientation.lock('landscape');
	}
	 
	$scope.changeOriantationPortrait = function() {
		screen.orientation.lock('portrait');
	}

})
.controller('DashCtrl', function($scope) {
	$scope.$on('$ionicView.enter', function(e) {
		if ( $scope.tabsHide ) $scope.tabsHide(false);
	});

})
;
