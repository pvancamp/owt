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

.controller('PlacesDetailsCtrl', function(App, Places, PlacesCtrlSrv, $location, $ionicSlideBoxDelegate, $scope, $stateParams) {
	angular.extend( $scope, PlacesCtrlSrv);
	$scope.pageType= 'placesDetails';

	$scope.$on('$ionicView.enter', function(e) {
		App.loadingHide();
		if ( $stateParams.id ) $scope.tabsHide(true);
		else if ( Places.sel && Places.sel.detailsItem ) {
			$scope.item= Places.sel.detailsItem;
			initIx= items.findIndex( (itm) => {return itm.id == $scope.item.id} );
			$ionicSlideBoxDelegate.update();
			$ionicSlideBoxDelegate.slide(initIx);
			console.log('PlacesDetailsCtrl redirect', initIx, Places.sel.detailsItem.id, Places.sel.detailsRet);
		}
	});

	var items= $scope.itemsFiltered();
	var initIx= 0;
	if ( $stateParams.id ) {
		$scope.item= Places.get( $stateParams.id );
		initIx= items.findIndex( (itm) => {return itm.id == $stateParams.id} );
	}

	$scope.placesDetailsBackButton= function() {
		 $location.path( Places.sel.detailsRet );
	};

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

	console.log('PlacesDetailsCtrl', $scope.item && $scope.item.id, items.length, initIx);
})
;

