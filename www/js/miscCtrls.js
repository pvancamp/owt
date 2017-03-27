// by Paul Van Camp

angular.module('owt')

.controller('AccountCtrl', function($scope) {
	$scope.settings = {
		largePrint: false,
		lang: 'A',
	};
})
.controller('DashCtrl', function($scope) {})

.controller('ToursCtrl', function(Tours, $scope, $stateParams) {
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	if ( $stateParams.id ) {
		$scope.item = Tours.get($stateParams.id);
	}
	$scope.current= function() {
		return Tours.current();
	};
	$scope.currentName= function() {
		return Tours.currentName();
	};
	$scope.currentDesc= function() {
		return Tours.currentDesc();
	};

	$scope.items = Tours.all();
	$scope.pageType= 'Tours';
	$scope.remove = function(chat) {
		Tours.remove(chat);
	};
})
;
