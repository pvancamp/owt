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
		var h= $scope.__headerHeight; //iPhone pads header with extra area

		if ( heightF ) return {height: h+'px'};
		return {top: h+'px'};
	};

})

.controller('PlacesDetailsCtrl', function(App, Places, PlacesCtrlSrv, $ionicPopup, $ionicScrollDelegate, $scope, $stateParams, $timeout) {
	angular.extend( $scope, PlacesCtrlSrv);
	$scope.pageType= 'placesDetails';

	var gmap, gmapLoc, gmapMove;

	$scope.$on('$ionicView.enter', function(e) {
		App.loadingHide();
		if ( $scope.tabsHide ) $scope.tabsHide(true);
		gmap= Places.gmap.placesDetails;
		if ( gmap ) {
			//console.log('PlacesDetailsCtrl enter gmap settings', App.settings.streetViewEnable);
			gmap.map.setOptions({
				streetViewControl: App.settings.streetViewEnable,
			});
		}
	});

	$scope.item= Places.get( $stateParams.id );
	$scope.gmapData= { init: $scope.gmapInit, index: 'placesDetails' };

	var items= $scope.itemsFiltered();
	$scope.sliderCache= false; //used the cached html template
	var initIx= items.findIndex( (itm) => {return itm.id == $stateParams.id} );

	var cnt= 0;
	items.forEach( (itm) => { itm.sliders= sliderIndicators(cnt++); itm.render= false; } );
	itemRenderEnable( initIx );

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
				itemRenderEnable( ix );

				if ( mapMode ) {
					gmapItem( $scope.item, false );
					//turn off directions
					if ( mapMode === 2 ) mapMode= true;
				}
				//use $scope.$apply() to refresh any content external to the slider
				$ionicScrollDelegate.scrollTop();
				$scope.$apply();
			});
		}
	});

	$scope.mapDirectionsClass= function() {
		if ( mapMode !== 2 ) return 'owt-details-map-disable';
		return '';
	};

	//directions button was clicked
	$scope.mapDirectionsMode= function() {
		console.log('mapDirectionsMode');
		if ( ! mapMode ) return;

		if ( mapMode === 2 ) mapMode= true;
		else mapMode= 2; //turn on directions
	};

	//Move the ion-content element downward
	$scope.posIonContentStyle= function(place, heightF) {
		var h;
		var ret= {};
		switch ( place ) {
		case 3:
			h= $scope.__height - $scope.__headerHeight - 46;
			break;
		case 2:
			h= (picsMode ? -4 : -200 - $scope.__headerHeight);
			break;
		case 1:
			h= (mapMode ? (mapMode === 2 ? -4 : -204 ) 
				: -400 - $scope.__headerHeight);
			break;
		default:
			h= $scope.__headerHeight; //iPhone pads header with extra area
			break;
		}
		if ( heightF ) ret.height= h+'px';
		else ret.top= h+'px';
		return ret;
	};

	var picsMode= false;
	var mapMode= false;
	var mapMeMode= false;
	var mapStreetMode= false;
	$scope.toolBarBut= function(op) {
		switch( op ) {
		case 0:
			$scope.item.fav= ! $scope.item.fav;
			break;
		case 1:
			break;
		case 2:
			//pictures
			picsMode= ! picsMode;
			if ( picsMode ) mapMode= false;
			break;
		case 3:
			mapMode= !mapMode;
			if ( mapMode ) {
				picsMode= false;
				gmapItem( $scope.item, true );
			}
			break;
		case 4:
			mapMeMode= ! mapMeMode;
			break;
		case 5:
			mapStreetMode= ! mapStreetMode;
			break;
		};
	};
	$scope.toolBarButClass= function(op) {
		var ii= '';
		switch ( op ) {
			case 0: ii= 'ion-ios-heart';
				if ( ! $scope.item.fav ) ii += '-outline'; //tool not enabled
				break;
			case 1: ii= 'ion-ios-cloud-upload-outline'; break;
			case 2: 
				if ( picsMode ) ii= 'ion-android-arrow-dropup';
				else ii= 'ion-ios-camera-outline';
				break;
			case 3: 
				if ( mapMode ) ii= 'ion-android-arrow-dropup';
				else ii= 'ion-ios-world-outline'; //tool not enabled
				break;
			case 4: ii= 'ion-ios-navigate';
				if (!mapMeMode) ii += '-outline'; //tool not enabled
				break;
			case 5: ii= 'ion-ios-body';
				if (!mapStreetMode) ii += '-outline'; //tool not enabled
				break;
		}
		return ii;		
	};

	$scope.toolBarButText= function(op) {
		var ii= '';
		switch ( op ) {
		case 1: return 'Take A Pic';
		case 2:
			if ( picsMode ) return 'No Pics';
			else return 'Pics';
		case 3:
			if ( mapMode ) return 'No Map';
			else return 'Map';
		}
	}

	/////////////////////////////////////////////////////////////////////////
	//Utilites

	//To speed up page switching details are not rendered until they are in view
	//or near to be in view.
	function itemRenderEnable(ix) {
		for ( var ii= ix-1; ii <= ix+1; ii++) {
			var itm= items[ii];
			if ( itm ) itm.render= true;
		}
	}

	function gmapItem(vals, initF) {
		if ( vals ) {
			//map the place
			//console.log('PlacesDetails gmapItem', vals);
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

	//first and last items do not get both slider indicator markings
	function sliderIndicators(ix) {
		if ( ix == 0 ) return 1;
		else if ( ix == items.length -1)
			return 2;
		return 0;
	}
	//console.log('PlacesDetailsCtrl Cache:', $scope.sliderCache, 'id:', $stateParams.id, initIx, '/', items.length);
})
;

