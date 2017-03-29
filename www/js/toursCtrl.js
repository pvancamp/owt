// by Paul Van Camp

angular.module('owt')

.controller('ToursCtrl', function(App, Tours, $scope, $state, $timeout) {
	$scope.pageType= 'tours';

	$scope.$on('$ionicView.beforeEnter', function(e) {
		App.loadingShow();
	});
	$scope.$on('$ionicView.enter', function(e) {
		//App.loadingHide();
		App.loadingHide();
		if ( $scope.tabsHide ) $scope.tabsHide(false);

		$scope.selEnableF= true;
	});

	var items= Tours.all();
	$scope.itemsFiltered= function() {
		return items;
	}

})

.controller('ToursDetailsCtrl', function(App, Tours, $scope, $stateParams) {
	$scope.pageType= 'toursDetails';

	$scope.$on('$ionicView.enter', function(e) {
		App.loadingHide();
		if ( $scope.tabsHide ) $scope.tabsHide(true);
	});

	$scope.item= Tours.get( $stateParams.id );

	var items= Tours.all();
	var initIx= items.findIndex( (itm) => {return itm.id == $stateParams.id} );

	//Icon to show in selection position
	$scope.addButtonClass= function(id, mode) {
		var itm= Tours.get(id);
		if ( itm ) {
			if ( itm.sel ) return "black";
			else if ( mode && itm.fav ) return "ion-ios-heart black";
		}
		return "ion-ios-checkmark-outline black";
	};

	//Return the position number if item is in the selection list
	$scope.addButtonPos= function(id, deleteF) {
		if ( deleteF ) return '';
		var itm= Tours.get(id);
		if ( itm && itm.sel ) return Tours.sel.list.indexOf(itm.id)+1;
		return '';
	};

	$scope.itemsFiltered= function() {
		return items;
	}

	//Move the ion-content element downward
	$scope.posIonContentStyle= function(place, heightF) {
		var h;
		if ( place ) h= 0;
		else h= $scope.__headerHeight; //iPhone pads header with extra area

		if ( heightF ) return {height: h+'px'};
		return {top: h+'px'};
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

	console.log('ToursDetailsCtrl "'+$stateParams.id+'" select', initIx,"/",items.length);
})

;

