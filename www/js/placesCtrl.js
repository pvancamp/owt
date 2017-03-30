// by Paul Van Camp

angular.module('owt')

.controller('PlacesCtrl', function(App, Places, PlacesCtrlSrv, $scope) {
	angular.extend( $scope, PlacesCtrlSrv);
	$scope.pageType= 'places';

	$scope.$on('$ionicView.beforeEnter', function(e) {
		App.loadingShow();
	});
	$scope.$on('$ionicView.enter', function(e) {
		//App.loadingHide();
		App.loadingHide();
		Places.saveSelListUI.managerF= false;
		if ( $scope.tabsHide ) $scope.tabsHide(false);
	});

	//Move the ion-content element downward
	$scope.posIonContentStyle= function(place, heightF) {
		var h;
		if ( place == 2 ) h= (mapMode ? 200 : 0);
		else if ( place == 1 ) h= (mapMode ? 44 : -200)+$scope.__headerHeight;
		else h= $scope.__headerHeight; //iPhone pads header with extra area

		if ( heightF ) return {height: h+'px'};
		return {top: h+'px'};
	};

})

.controller('PlacesDetailsCtrl', function(App, Places, PlacesCtrlSrv, $ionicPopup, $scope, $stateParams, $timeout) {
	angular.extend( $scope, PlacesCtrlSrv);
	$scope.pageType= 'placesDetails';

	$scope.$on('$ionicView.enter', function(e) {
		App.loadingHide();
		if ( $scope.tabsHide ) $scope.tabsHide(true);
	});

	$scope.item= Places.get( $stateParams.id );
	$scope.gmapData= { init: $scope.gmapInit, index: 'placesDetails' };

	var items= $scope.itemsFiltered();
	$scope.sliderCache= false; //used the cached html template
	var initIx= items.findIndex( (itm) => {return itm.id == $stateParams.id} );

	var cnt= 0;
	items.forEach( (itm) => { itm.sliders= sliderIndicators(cnt++) } );

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
				var ix= $scope.slider.delegate.activeIndex;
				$scope.item= items[ix];
				if ( mapMode ) gmapItem( $scope.item, false );
				//use $scope.$apply() to refresh any content external to the slider
				$scope.$apply();
			});
		}
	});

	//Move the ion-content element downward
	$scope.posIonContentStyle= function(place, heightF) {
		var h;
		switch ( place ) {
		case 3:
			h= $scope.__height - $scope.__headerHeight - 46;
			break;
		case 2:
			h= (mapMode ? 200 : 0);
			break;
		case 1:
			h= (mapMode ? 44 : -200)+$scope.__headerHeight;
			break;
		default:
			h= $scope.__headerHeight; //iPhone pads header with extra area
			break;
		}
		if ( heightF ) return {height: h+'px'};
		return {top: h+'px'};
	};

	var mapMode= false;
	var mapMeMode= false;
	$scope.toolBarBut= function(op) {
		switch( op ) {
		case 0:
			$scope.item.fav= ! $scope.item.fav;
			break;
		case 1:
			$ionicPopup.alert({
				title: 'Share A Place',
				template: 'It is good to share!',
			});
			break;
		case 2:
			//camera
			$ionicPopup.alert({
				title: 'Take A Photo',
				template: 'Someday you will be able to attach your own photo!',
			});
			break;
		case 3:
			mapMode= !mapMode;
			gmapItem( $scope.item, true );
			break;
		case 4:
			mapMeMode= ! mapMeMode;
			break;
		default:
			mapMode= op;
		}
	};
	$scope.toolBarButClass= function(op) {
		var ii= '';
		switch ( op ) {
			case 0: ii= 'ion-ios-heart';
				if ( ! $scope.item.fav ) ii += '-outline'; //tool not enabled
				break;
			case 1: ii= 'ion-ios-cloud-upload-outline'; break;
			case 2: ii= 'ion-ios-camera-outline';
				break;
			case 3: ii= 'ion-ios-world';
				if (!mapMode) ii += '-outline'; //tool not enabled
				break;
			case 4: ii= 'ion-ios-navigate';
				if (!mapMeMode) ii += '-outline'; //tool not enabled
				break;
		}
		return ii;		
	};

	var gmap, gmapLoc, gmapMove;
	function gmapItem(vals, initF) {
		if ( vals ) {
			//map the place
			console.log('PlacesDetails gmapItem', vals);
			gmap= Places.gmap.placesDetails;
			gmap.init();
			var loc= {
				name: vals.name,
				lat: vals.location.latitude,
				lng: vals.location.longitude,
			};
			gmap.addMarker( vals.id, loc );
			if ( initF || ! gmapLoc  ) {
				gmap.fitToMarkers();
				gmapLoc= loc;
			} else {
				var steps= 10;
				gmapMove= {
					cnt: steps,
					lat: (loc.lat - gmapLoc.lat)/ steps,
					lng: (loc.lng - gmapLoc.lng)/ steps,
				};
				gmapMoveOp();
			}
		}
	}

	function gmapMoveOp() {
		gmapLoc.lat += gmapMove.lat;
		gmapLoc.lng += gmapMove.lng;
		gmap.moveToLocation( gmapLoc );
		if ( --gmapMove.cnt > 0 ) {
			$timeout( gmapMoveOp, 50 );
		}
	}

	function sliderIndicators(ix) {
		if ( ix == 0 ) return 1;
		else if ( ix == items.length -1)
			return 2;
		return 0;
	}
	console.log('PlacesDetailsCtrl Cache:', $scope.sliderCache, 'id:', $stateParams.id, initIx, '/', items.length);
})
;

