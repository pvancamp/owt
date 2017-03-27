// by Paul Van Camp

angular.module('owt')

.controller('PlacesCtrl', function(App, Places, PlacesCtrlSrv, $scope) {
	angular.extend( $scope, PlacesCtrlSrv);
	$scope.pageType= 'places';

	$scope.$on('$ionicView.enter', function(e) {
		//App.loadingHide();
		Places.saveSelListUI.managerF= false;
		$scope.tabsHide(false);
	});

})

.controller('PlacesDetailsCtrl', function(App, Places, PlacesCtrlSrv, $scope, $stateParams) {
	angular.extend( $scope, PlacesCtrlSrv);
	$scope.pageType= 'placesDetails';

	$scope.$on('$ionicView.enter', function(e) {
		App.loadingHide();
		$scope.tabsHide(true);
	});

	$scope.item= Places.get( $stateParams.id );

	var items= $scope.itemsFiltered();
	var initIx= items.findIndex( (itm) => {return itm.id == $stateParams.id} );

	$scope.slider= {
		options: {
			initialSlide: initIx,
			direction: 'horizontal', //or vertical
			paginationHide: true, //do not want to see these
			speed: 300, //0.3s transition
		},
		delegate: null,
	};

	$scope.$watch('slider.delegate', function(newVal, oldVal) {
		if (newVal != null) {
			$scope.slider.delegate.on('slideChangeEnd', function() {
				$scope.item= items[ $scope.slider.delegate.activeIndex ];
				//use $scope.$apply() to refresh any content external to the slider
				$scope.$apply();
			});
		}
	});

	console.log('PlacesDetailsCtrl', $stateParams.id, items.length, initIx);
})
;

