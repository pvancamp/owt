angular.module('owt.controllers', [])

.controller('AccountCtrl', function($scope) {
	$scope.settings = {
		largePrint: false,
		lang: 'A',
	};
})
.controller('DashCtrl', function($scope) {})

.controller('PlacesCtrl', function(Places, Tours, $scope, 
	$ionicModal, $ionicScrollDelegate, $location, $stateParams ) {
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	$scope.pageType= 'Places';

	//add to selected list
	$scope.add= function(id) {
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
		if ( $scope.saveSelListUI.delF )
			return "ion-ios-minus red";
		return "ion-ios-minus-outline black";
	};
	$scope.delPlacesButtonOp= function(id) {
		var ix= $scope.saveSelListItems.findIndex( (itm) => {
			return itm.id == id;
		});
		$scope.saveSelListItems.splice(ix, 1);
	};

	$scope.delPlacesButtonTog= function() {
		$scope.saveSelListUI.delF= ! $scope.saveSelListUI.delF;
		if ( $scope.saveSelListUI.delF )
			$scope.saveSelListUI.reorderF= false;
	};

	$scope.filterFavs= function() {
		Places.sel.filterFavs= !Places.sel.filterFavs;
		$scope.selListFilterChg();
	};
	$scope.filterFavsClass= function() {
		if ( Places.sel.filterFavs ) return "ion-ios-heart";
		else return "ion-ios-heart-outline";
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
  	if ( $scope.saveSelListUI.mapPosF ) {
  		switch (op) {
  			case 0: return "control-area-contained-large";
  			case 1: return "control-area-slide";
  			case 2: return "list-area-top-large";
  		}
  	}
  	return "";
  }
  $scope.posControlAreaTog= function() {
  	$scope.saveSelListUI.mapPosF= ! $scope.saveSelListUI.mapPosF;
  };
	$scope.reorderPlacesButtonTog= function() {
		$scope.saveSelListUI.reorderF= ! $scope.saveSelListUI.reorderF;
		if ( $scope.saveSelListUI.reorderF )
			$scope.saveSelListUI.delF= false;
	};

	$scope.selListFilterChg= function() {
		var flt= saveSelListUI.filter && saveSelListUI.filter.trim().toLowerCase();
		if ( flt || Places.sel.filterFavs ) {
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

	$scope.selListFilterClear= function() {
		saveSelListUI.filter= '';
		$scope.selListFilterChg();
	}
	
	$scope.saveSelList= function(op) {
		if ( op ) {
			modalToolbarSetState(1);
			$scope.saveSelListUI.delF= false;
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
	$scope.saveSelListClick= function(itm) {
		console.log('saveSelListClick', itm.id);
	};
	$scope.saveSelListHref= function(itm) {
		if ( $scope.saveSelListUI.mapPosF ) return '';
		return '#/tab/places-edit/'+itm.id
	}

	$scope.saveSelListDialogFunc= function(op) {
		switch (op) {
			case 0: //Reorder
				var chgF= false;
				for ( var ii= 0; ii < Places.sel.list.length; ii++ ) {
					if ( Places.sel.list[ii] != $scope.saveSelListItems[ii].id ) {
						chgF= true;
						break;
					}
				}
				if ( chgF ) {
					//recreate the orginal list
					$scope.saveSelListItems= [];
					Places.sel.list.forEach( (id) => {
						var itm= Places.get(id);
						if (itm) $scope.saveSelListItems.push(itm);
					});
				} else {
					//reverse the list order
					$scope.saveSelListItems.reverse();
				}
				break;
			case 1: //Save To Favs
				Places.favsStor( $scope.saveSelListItems, true );
				$scope.selListFilterChg();
				break;
			case 2: // Remove From Favs
				Places.favsStor( $scope.saveSelListItems, false );
				$scope.selListFilterChg();
				break;
			case 3: //Create A Tour
				saveSelListUI.modalForTour.show();
				break;
			case 4: //Create A Tour -- Cancel
				saveSelListUI.modalForTour.hide();
				break;
			case 5: //Create A Tour -- Step 2
				saveSelListUI.modalForTour.hide();
				var places= [];
				$scope.saveSelListItems.forEach( (itm) => {
					places.push(itm.id);
				});
				var tour= {
					name: saveSelListUI.name,
					description: saveSelListUI.desc,
					places: places,
					pic: 'img/icons/buildingIcon.png',
				};
				Tours.add( tour );
				break;
		}
	};

	$scope.saveSelModalToolbar= function(op) {
		//console.log('saveSelModalToobar', op);
		modalToolbarSetState(op);

		switch (op) {
		case 1: //buttons
			$scope.saveSelListUI.mapPosF= false;
			break;
		case 2: //map all
			$scope.saveSelListUI.mapPosF= true;
			break;
		case 3: //map selected
			$scope.saveSelListUI.mapPosF= true;
			break;
		case 4: //map me
			$scope.saveSelListUI.mapPosF= true;
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
		if ( $scope.saveSelModalToolbarState != op )
			ii += '-outline';
		return ii;
	}

	//////////////////////////////////////////////////////////////////////

	var saveSelListUI= {};
	if ( $stateParams.id ) {
		//this is the details page
		$scope.item= Places.get( $stateParams.id );

		var items= $scope.itemsFiltered();
		var initIx= items.findIndex( (itm) => {return itm.id == $stateParams.id} );

		$scope.slider= {
			options: {
				initialSlide: initIx,
      	direction: 'horizontal', //or vertical
      	speed: 300 //0.3s transition
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

		console.log('PlacesCtrl', $stateParams.id, 'selFilterActive', Places.sel.filterActive, items.length, initIx);
	} 

	
	$scope.$on('$ionicView.beforeEnter', function(e) {
		console.log('PlacesCtrl beforeEnter', $location.path() );
		if ( $stateParams.id ) {
			//init was already done
		}
		else if ( $location.path().indexOf('/places-edit') >= 0 ) {
			saveSelListUI= Places.saveSelListUI;
			$scope.saveSelListItems= Places.saveSelListItems;
			console.log('/places-edit init', $scope.saveSelListItems.length);
		}
		else if ( ! Places.sel ) {
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
		$scope.saveSelListUI= saveSelListUI;
	});

	////////////////////////////////////////////////////////////////////////////////
	//change the tool bar state used in the save places modal
	$scope.saveSelModalToolbarState= 1;
	function modalToolbarSetState(val) {
		$scope.saveSelModalToolbarState= val;
	}

	function placesPageSwitch(op) {
		if ( op ) {
			//return to the orginating page
			console.log('placesPageSwitch return:', saveSelListUI.placesPageSwitchRet);
			if ( saveSelListUI.placesPageSwitchRet ) 
				$location.path(saveSelListUI.placesPageSwitchRet);
		} else {
			Places.saveSelListItems= $scope.saveSelListItems;
			saveSelListUI.placesPageSwitchRet= $location.path();
			console.log('placesPageSwitch', saveSelListUI.placesPageSwitchRet);
			$location.path('/tab/places-edit');
		}
	}

	$ionicModal.fromTemplateUrl('templates/modal-saveTour.html', {
		scope: $scope,
		animation: 'slide-in-up',
	}).then(function(modal) {
		 saveSelListUI.modalForTour= modal;
	});

})

.controller('ToursCtrl', function(Tours, $scope) {
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	$scope.items = Tours.all();
	$scope.pageType= 'Tours';
	$scope.remove = function(chat) {
		Tours.remove(chat);
	};
})

.controller('ToursDetailCtrl', function(Tours, $scope, $stateParams) {
	$scope.item = Tours.get($stateParams.id);
})

;
