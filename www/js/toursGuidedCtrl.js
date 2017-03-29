// by Paul Van Camp

angular.module('owt')

.controller('ToursGuidedCtrl', function(App, Tours, $scope, $state, $timeout) {
	$scope.$on('$ionicView.enter', function(e) {
		//App.loadingHide();
		App.loadingHide();
		if ( $scope.tabsHide ) $scope.tabsHide(false);

		$scope.selEnableF= false;
	});

	$scope.current= function() {
		return Tours.current();
	};
	$scope.currentName= function() {
		return Tours.currentName();
	};
	$scope.currentDesc= function() {
		return Tours.currentDesc();
	};
	$scope.currentDetails= function() {
		var itm= Tours.currentItem();
		if ( itm ) {
			console.log('Tours swiping to:', itm);
			App.loadingShow();
			$timeout(() => { $state.go('tab.current-detail', {id: itm.id}) });
		}
	}
})

;