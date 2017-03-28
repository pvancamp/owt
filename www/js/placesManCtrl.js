// by Paul Van Camp

angular.module('owt')

.controller('PlacesManCtrl', function(App, Places, PlacesCtrlSrv, Tours, $location, $scope, $state, 
	$ionicModal, $ionicPopup) {

	angular.extend( $scope, PlacesCtrlSrv );
	$scope.pageType= 'placesMan';

	$scope.$on('$ionicView.enter', function(e) {
		App.loadingHide();
		saveSelListUI.managerF= false;
		saveSelListUI.reorderActiveF= false;
		if ( Places.gmap.placesMan ) Places.gmap.placesMan.init();

		
		if ( $scope.tabsHide ) $scope.tabsHide(true);
		if ( saveSelListUI.initPlacesManF ) {
			saveSelListUI.initPlacesManF= false;
			modalToolbarSetState(1);
		}
	});

	$scope.gmapData= { init: $scope.gmapInit, index: 'placesMan' };

	//Icon to show delete-from-list mode
	$scope.delPlacesButtonClass= function() {
		if ( saveSelListUI.delF )
			return "ion-ios-minus red";
		return "ion-ios-minus-outline black";
	};

	//Delete from selection list button press
	$scope.delPlacesButtonOp= function(id) {
		var ix= $scope.saveSelListItems.findIndex( (itm) => {
			return itm.id == id;
		});
		Places.gmap.placesMan.clearOneMarker(id);
		$scope.saveSelListItems.splice(ix, 1);
	};

	//Button press to toggle delete-from-selection mode
	$scope.delPlacesButtonTog= function() {
		saveSelListUI.delF= ! saveSelListUI.delF;
		if ( saveSelListUI.delF )
			saveSelListUI.reorderF= false;
	};

	//Used to drag and drop list order
	$scope.moveSelList= function(item, fromIndex, toIndex) {
		//Move the item in the array
		$scope.saveSelListItems.splice(fromIndex, 1);
		$scope.saveSelListItems.splice(toIndex, 0, item);
	};

	$scope.onReorderButtonTouch= function() {
		saveSelListUI.reorderActiveF= true;
	}

	$scope.onReorderButtonRelease= function() {
		saveSelListUI.reorderActiveF= false;
	}

	//Move the ion-content element downward
	$scope.posIonContentStyle= function(place, heightF) {
		var h;
		if ( place ) h= 0;
		else h= $scope.__headerHeight; //iPhone pads header with extra area

		if ( heightF ) return {height: h+'px'};
		return {top: h+'px'};
	};

	$scope.posListTopStyle= function() {
		var h= 156;
		if ( saveSelListUI.mapMode ) h= 236;
		var ret= { top : (h + $scope.__headerHeight) + 'px'};
		if ( saveSelListUI.reorderActiveF ) ret['pointer-events']= 'none';
		return ret;
	};

	//Places list-item was clicked
	$scope.saveSelListClick= function(itm, op) {
		console.log('saveSelListClick', itm.id);
		saveSelListUI.lastClick= itm.id;
		if ( op || saveSelListUI.mapMode < 2 )
			$state.go('tab.places-edit-detail', {id: itm.id});
		else if ( saveSelListUI.mapMode == 2)
			gmapModeSet(2);
	};

	//Control button was pressed
	$scope.saveSelListDialogFunc= function(op) {
		console.log('saveSelListDialogFunc', op);
		switch (op) {
		case 0: //Reorder
			var chgF= Places.sel.list.length != $scope.saveSelListItems.length;
			if ( ! chgF ) {
				for ( var ii= 0; ii < Places.sel.list.length; ii++ ) {
					if ( Places.sel.list[ii] != $scope.saveSelListItems[ii].id ) {
						chgF= true;
						break;
					}
				}
			}
			if ( chgF ) {
				//recreate the orginal list
				Places.gmap.placesMan.init();
				$scope.saveSelListItems.splice(0, $scope.saveSelListItems.length);
				Places.sel.list.forEach( (id) => {
					var itm= Places.get(id);
					if (itm) {
						$scope.saveSelListItems.push(itm);
						var loc= {
							name: itm.name,
							lat: itm.location.latitude,
							lng: itm.location.longitude,
						};
						Places.gmap.placesMan.addMarker( itm.id, loc );
					}
				});
			} else {
				//reverse the list order
				$scope.saveSelListItems.reverse();
			}
			break;
		case 1: //reverse the list order
			$scope.saveSelListItems.reverse();
			break;
		case 2: //Add To Favs
			Places.favsStor( $scope.saveSelListItems, true );
			$scope.selListFilterChg();
			break;
		case 3: // Remove From Favs
			Places.favsStor( $scope.saveSelListItems, false );
			$scope.selListFilterChg();
			break;
		case 4: //Create A Tour
			modalForTour.show();
			break;
		case 10: //Create A Tour -- Cancel
			modalForTour.hide();
			break;
		case 11: //Create A Tour -- Step 2
		case 12:
			var nm= saveSelListUI.name && saveSelListUI.name.trim();
			var places= [];
			var tourplaces= $scope.saveSelListItems;
			var tour= {
				name: nm,
				description: saveSelListUI.desc,
				places: places,
				pic: 'img/icons/buildingIcon.png',
			};

			if ( ! nm ) {
				$ionicPopup.alert({
					title: 'Tour Creation Error',
					template: 'Tour must have a name',
				});
			}
			else if ( ! tourplaces ) {
				$ionicPopup.alert({
					title: 'Tour Creation Error',
					template: 'Tour must contain places',
				});
			}
			else {
				tourplaces.forEach( (itm) => {
					places.push(itm.id);
				});
				var tourIx= Tours.add( tour );

				$ionicPopup.alert({
					title: 'Tour Creation Success',
					template: 'Congratulations on successfully creating an awesome tour!',
				}).then( function(res) {
					modalForTour.hide();
					if ( op == 12 ) {
						$location.path('/tab/current');
						Tours.currentSelect(tourIx);
					}
				});
			}
			break;
		}
	};

	$scope.saveSelModalToolbar= function(op) {
		//console.log('saveSelModalToobar', op);

		switch (op) {
		case 1: //buttons
			gmapModeSet(0);
			modalToolbarSetState(op);
			break;
		case 2: //map all
			gmapModeSet(1);
			modalToolbarSetState(op);
			break;
		case 3: //map selected
			gmapModeSet(2);
			modalToolbarSetState(op);
			break;
		case 4: //map me
			saveSelListUI.toolbarMapMe= !saveSelListUI.toolbarMapMe;
			if ( saveSelListUI.toolbarMapMe && ! saveSelListUI.mapMode ) {
				$scope.saveSelModalToolbar(2); //turn on map
			}
			break;

		case 0: //Return to orginating page
				placesPageSwitch();
				break;
		}
	};
	$scope.saveSelModalToolbarClass= function(op) {
		var ii= '';
		switch ( op ) {
			case 0: ii= 'ion-ios-close'; break;
			case 1: ii= 'ion-ios-gear'; break;
			case 2: ii= 'ion-ios-world'; break;
			case 3: ii= 'ion-ios-location'; break;
			case 4: ii= 'ion-ios-navigate'; break;
		}
		if ( ( op != 4 && saveSelListUI.toolbarIx != op ) ||
		 	( op == 4 && ! saveSelListUI.toolbarMapMe) )
			ii += '-outline'; //tool not enabled
		return ii;
	}

	////////////////////////////////////////////////////////////
	function gmapModeSet(val) {
		saveSelListUI.mapMode= val;
		if ( val > 0 ) {
			//map is to be shown
			var gmap= Places.gmap.placesMan;
			var tourplaces= $scope.saveSelListItems;
			if ( tourplaces.length ) {
				if ( ! gmap.markers ) {
					tourplaces.forEach( (vals) => {
						var loc= {
							name: vals.name,
							lat: vals.location.latitude,
							lng: vals.location.longitude,
						};
						gmap.addMarker( vals.id, loc );
					});
					gmap.fitToMarkers();
				}
				else if (val == 1 ) gmap.fitToMarkers();
				if ( val == 1 ) {
					gmap.allMarkersVisible(true);
				} 
				else if ( val == 2 ) {
					gmap.oneMarkerVisible( saveSelListUI.lastClick );
				}
			}
		}
	}

	//change the tool bar state used in the save places modal
	function modalToolbarSetState(val) {
		saveSelListUI.toolbarIx= val;
		if ( val == 1 && saveSelListUI ) {
			saveSelListUI.delF= false;
			saveSelListUI.mapMode= false;
		}
	}

	function placesPageSwitch() {
		//return to the orginating page
		console.log('placesPageSwitch return:', saveSelListUI.placesPageSwitchRet);
		if ( !saveSelListUI.placesPageSwitchRet )
			saveSelListUI.placesPageSwitchRet='/';
		$location.path(saveSelListUI.placesPageSwitchRet);
		saveSelListUI.placesPageSwitchRet= null;
	}

	var saveSelListUI= Places.saveSelListUI;
	var modalForTour;

	$ionicModal.fromTemplateUrl('templates/modal-saveTour.html', {
		scope: $scope,
		animation: 'slide-in-up',
	}).then(function(modal) {
		 modalForTour= modal;
	});

});
