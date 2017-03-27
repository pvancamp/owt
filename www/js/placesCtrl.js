// by Paul Van Camp

angular.module('owt')

.controller('PlacesCtrl', function(App, Places, Tours, GmapUtils, $scope, $state,
	$ionicModal, $ionicPopup, $ionicScrollDelegate, $location, $stateParams, $timeout ) {

	//add to selected list
	$scope.add= function(id) {
		//can not add or remove when in Places Manager
		if ( Places.saveSelListUI.managerF ) return;

		var itm= Places.get(id);
		if ( itm ) {
			itm.sel= ! itm.sel;
			if ( itm.sel ) Places.sel.list.push(itm.id);
			else Places.sel.list.splice( Places.sel.list.indexOf(itm.id), 1);
		}
	};
	$scope.addButtonClass= function(id, deleteF) {
		if ( deleteF ) return "ion-ios-close-outline red";
		var itm= Places.get(id);
		if ( itm ) {
			if ( itm.sel ) return "black";
			else if ( itm.fav ) return "ion-ios-heart black";
		}
		return "ion-ios-checkmark-outline black";
	};
	$scope.addButtonPos= function(id, deleteF) {
		if ( deleteF ) return '';
		var itm= Places.get(id);
		if ( itm && itm.sel ) return Places.sel.list.indexOf(itm.id)+1;
		return '';
	};
	$scope.delPlacesButtonClass= function() {
		if ( saveSelListUI.delF )
			return "ion-ios-minus red";
		return "ion-ios-minus-outline black";
	};
	$scope.delPlacesButtonOp= function(id) {
		var ix= $scope.saveSelListItems.findIndex( (itm) => {
			return itm.id == id;
		});
		Places.gmap.clearOneMarker(id);
		$scope.saveSelListItems.splice(ix, 1);
	};

	$scope.delPlacesButtonTog= function() {
		saveSelListUI.delF= ! saveSelListUI.delF;
		if ( saveSelListUI.delF )
			saveSelListUI.reorderF= false;
	};

	var filterFavsBlockF;
	$scope.filterFavs= function() {
		if ( filterFavsBlockF ) return;
		Places.sel.filterFavs= !Places.sel.filterFavs;
		$scope.selListFilterChg();
		filterFavsBlockF= true;

		//debounce this click
		$timeout(function(){ filterFavsBlockF= false;},
			1000);
	};
	$scope.filterFavsClass= function() {
		if ( Places.sel.filterFavs ) return "ion-ios-heart";
		else return "ion-ios-heart-outline";
	};
	$scope.itemDetailsPage= function(itm) {
		App.loadingShow();
		$timeout(function() {$state.go('tab.places-detail', {id: itm.id}) });
	};

	$scope.items= function() {
		return Places.all();
	};

	$scope.itemsFiltered= function() {
		if ( $location.path().indexOf('/places-edit') >= 0 )
			return Places.saveSelListItems;

		if ( Places.sel && Places.sel.filterActive )
			return Places.sel.filterList;

		return $scope.items();
	};
	$scope.moveSelList= function(item, fromIndex, toIndex) {
		//Move the item in the array
		$scope.saveSelListItems.splice(fromIndex, 1);
		$scope.saveSelListItems.splice(toIndex, 0, item);
	};
	$scope.posControlAreaClass= function(op) {
		if ( saveSelListUI.mapMode ) {
			switch (op) {
				case 1: return "control-area-slide";
			}
		}
		return "";
	};

	$scope.posIonContentStyle= function(place, heightF) {
		//iPhone pads header with extra area
		var h;
		if ( place ) {
			h= 0;
		}
		else h= $scope.__headerHeight;

		if ( heightF ) return {height: h+'px'};
		return {top: h+'px'};
	};

	$scope.posListTopStyle= function() {
		var h= 156;
		if ( saveSelListUI.mapMode ) h= 236;
		return { top : (h + $scope.__headerHeight) + 'px'};
	};

	$scope.reorderPlacesButtonTog= function() {
		saveSelListUI.reorderF= ! saveSelListUI.reorderF;
		if ( saveSelListUI.reorderF )
			saveSelListUI.delF= false;
	};

	$scope.selListFilterChg= function() {
		var flt= saveSelListUI.filter && saveSelListUI.filter.trim().toLowerCase();
		if ( flt || Places.sel.filterFavs ) {
			saveSelListUI.filter= flt;
			var reduceF= false;
			Places.sel.filterActive= true;
			Places.sel.filterList= [];
			$scope.items().forEach( (itm) => {
				if ( (!Places.sel.filterFavs || itm.fav) && (!flt || itm.name.toLowerCase().indexOf(flt) >= 0 ) )
					Places.sel.filterList.push(itm);
				else
					reduceF= true;
			});
			if ( reduceF ) {
				//make sure we can see everything
				$ionicScrollDelegate.scrollTop();
			}
		}
		else Places.sel.filterActive= false;
		//console.log('selListFilterChg', Places.sel.filterActive, Places.sel.filterList.length);
	};

	$scope.selListFilterClass= function() {
		return saveSelListUI.filter && saveSelListUI.filter.length > 0 ?
		 'ion-ios-close' : 'ion-ios-close-outline';
	};

	$scope.selListFilterClear= function() {
		saveSelListUI.filter= '';
		$scope.selListFilterChg();
	};
	
	$scope.saveSelListBut= function(op) {
		if ( op ) {
			//Collect a list of places and switch to the manager
			console.log('saveSelListBut', Places.gmap);
			modalToolbarSetState(1);
			if ( Places.gmap ) Places.gmap.init();

			$scope.saveSelListItems= [];
			Places.sel.list.forEach( (id) => {
				var itm= Places.get(id);
				if (itm) $scope.saveSelListItems.push(itm);
			});
			placesPageSwitch(0);
		} else {
			//clear the list of selected
			Places.sel.list.forEach( (id) => {
				var itm= Places.get(id);
				if (itm) itm.sel= 0;
			});
			Places.sel.list= [];
		}
	};
	$scope.saveSelListClick= function(itm, op) {
		console.log('saveSelListClick', itm.id);
		saveSelListUI.lastClick= itm.id;
		if ( op || saveSelListUI.mapMode < 2 )
			$state.go('tab.places-edit-detail', {id: itm.id});
		else if ( saveSelListUI.mapMode == 2)
			gmapModeSet(2);
	};

	$scope.saveSelListDialogFunc= function(op) {
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
				Places.gmap.init();
				$scope.saveSelListItems= [];
				Places.sel.list.forEach( (id) => {
					var itm= Places.get(id);
					if (itm) {
						$scope.saveSelListItems.push(itm);
						var loc= {
							name: itm.name,
							lat: itm.location.latitude,
							lng: itm.location.longitude,
						};
						Places.gmap.addMarker( itm.id, loc );
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
				var places= [];
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
				placesPageSwitch(true);
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

	//////////////////////////////////////////////////////////////////////
	$scope.gmapData= { init: gmapInit };
	$scope.pageType= 'Places';

	var hideTabsF= false;
	var saveSelListUI= {toolbarIx: 1};
	if ( $stateParams.id ) {
		//this is the details page
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

		console.log('PlacesCtrl', $stateParams.id, items.length, initIx);
	} 

	$scope.$on('$ionicView.beforeEnter', function(e) {
		App.loadingShow();

		//console.log('PlacesCtrl beforeEnter', $location.path() );
		if ( ! Places.sel ) {
			//Create an object for seletion and filtering. Attach it to Places so it
			// can be shared with details pages.
			Places.sel= {
				filterActive: false,
				filterList: [],
				filterFavs: false,
				list: [],
			};
			Places.saveSelListUI= saveSelListUI;
			$scope.saveSelListItems= [];
		}
		if ( $stateParams.id ) {
			//Details mode
			//init was already done
		}
		else if ( $location.path().indexOf('/places-edit') >= 0 ) {
			hideTabsF= true;
			$scope.tabsHide(true);
			$scope.saveSelListItems= Places.saveSelListItems;
			Places.saveSelListUI.managerF= true;
			//modalToolbarSetState(1);
			//console.log('/places-edit init', $scope.saveSelListItems.length);
		}
		else Places.saveSelListUI.managerF= false;

		saveSelListUI= Places.saveSelListUI;
		$scope.saveSelListUI= saveSelListUI;
	});

	$scope.$on('$ionicView.enter', function(e) {
		App.loadingHide();
	});

	$scope.$on('$ionicView.beforeLeave', function(e) {
		if (hideTabsF) $scope.tabsHide(false);
	});

	////////////////////////////////////////////////////////////////////////////////
	function gmapInit(gg, el) {
	
		gg.setOptions({
			clickableIcons: true,
			disableDoubleClickZoom: false,
			fullscreenControl: true,
			streetViewControl: true,
		});
		
		Places.gmap= new GmapUtils.mapMan( gg );
		console.log('gmapInit');
	}

	function gmapModeSet(val) {
		saveSelListUI.mapMode= val;
		if ( val > 0 ) {
			//map is to be shown
			var tourplaces= $scope.saveSelListItems;
			if ( tourplaces.length ) {
				if ( ! Places.gmap.markers ) {
					tourplaces.forEach( (vals) => {
						var loc= {
							name: vals.name,
							lat: vals.location.latitude,
							lng: vals.location.longitude,
						};
						Places.gmap.addMarker( vals.id, loc );
					});
					Places.gmap.fitToMarkers();
				}
				else if (val == 1 ) Places.gmap.fitToMarkers();
				if ( val == 1 ) {
					Places.gmap.allMarkersVisible(true);
				} 
				else if ( val == 2 ) {
					Places.gmap.oneMarkerVisible( saveSelListUI.lastClick );
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

	function placesPageSwitch(op) {
		if ( op ) {
			//return to the orginating page
			console.log('placesPageSwitch return:', saveSelListUI.placesPageSwitchRet);
			if ( !saveSelListUI.placesPageSwitchRet )
				saveSelListUI.placesPageSwitchRet='/';
			$location.path(saveSelListUI.placesPageSwitchRet);
			saveSelListUI.placesPageSwitchRet= null;
		} else {
			Places.saveSelListItems= $scope.saveSelListItems;
			Places.saveSelListUI= saveSelListUI;

			saveSelListUI.placesPageSwitchRet= $location.path();
			console.log('placesPageSwitch', saveSelListUI.placesPageSwitchRet);
			$location.path('/tab/places-edit');
		}
	}

	var modalForTour;
	$ionicModal.fromTemplateUrl('templates/modal-saveTour.html', {
		scope: $scope,
		animation: 'slide-in-up',
	}).then(function(modal) {
		 modalForTour= modal;
	});

})
;