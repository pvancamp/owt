// by Paul Van Camp

angular.module('owt')

.factory('PlacesCtrlSrv', function(App, Places, Tours, GmapUtils, $state,
	$ionicScrollDelegate, $location, $timeout ) {

	var $scope= {pageType: null};

	//add to selected list
	$scope.add= function(id) {
		//can not add or remove when in Places Manager Mode
		if ( saveSelListUI.managerF ) return;

		var itm= Places.get(id);
		if ( itm ) {
			itm.sel= ! itm.sel;
			if ( itm.sel ) Places.sel.list.push(itm.id);
			else Places.sel.list.splice( Places.sel.list.indexOf(itm.id), 1);
		}
	};

	//Icon to show in selection position
	$scope.addButtonClass= function(id, deleteF) {
		if ( deleteF ) return "ion-ios-close-outline red";
		var itm= Places.get(id);
		if ( itm ) {
			if ( itm.sel ) return "black";
			else if ( itm.fav ) return "ion-ios-heart black";
		}
		return "ion-ios-checkmark-outline black";
	};

	//Return the position number if item is in the selection list
	$scope.addButtonPos= function(id, deleteF) {
		if ( deleteF ) return '';
		var itm= Places.get(id);
		if ( itm && itm.sel ) return Places.sel.list.indexOf(itm.id)+1;
		return '';
	};

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
		Places.gmap.clearOneMarker(id);
		$scope.saveSelListItems.splice(ix, 1);
	};

	//Button press to toggle delete-from-selection mode
	$scope.delPlacesButtonTog= function() {
		saveSelListUI.delF= ! saveSelListUI.delF;
		if ( saveSelListUI.delF )
			saveSelListUI.reorderF= false;
	};

	//Favs filer mode button
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

	//Icon to show for favs filter mode
	$scope.filterFavsClass= function() {
		if ( Places.sel.filterFavs ) return "ion-ios-heart";
		else return "ion-ios-heart-outline";
	};

	//Change to the details page
	$scope.itemDetailsPage= function(itm) {
		App.loadingShow();
		Places.sel.detailsRet= $location.path();
		Places.sel.detailsItem= itm;
		$timeout(() => { $state.go('places-detail') });
	};

	//Return a list of all places
	$scope.items= function() {
		return Places.all();
	};

	//Return a list of places of interest
	$scope.itemsFiltered= function() {
		if ( $location.path().indexOf('/places-edit') >= 0 )
			return $scope.saveSelListItems;

		if ( Places.sel && Places.sel.filterActive )
			return Places.sel.filterList;

		return $scope.items();
	};

	//change size of control area if map is visible (placesMan )
	$scope.posControlAreaClass= function(op) {
		if ( saveSelListUI.mapMode ) {
			switch (op) {
				case 1: return "control-area-slide";
			}
		}
		return "";
	};

	//Button press for reorder (i.e. shuffle) mode
	$scope.reorderPlacesButtonTog= function() {
		saveSelListUI.reorderF= ! saveSelListUI.reorderF;
		if ( saveSelListUI.reorderF )
			saveSelListUI.delF= false;
	};

	//Button press for saving the selection and changing to placesMan
	$scope.saveSelListBut= function(op) {
		if ( op ) {
			//Collect a list of places and switch to the manager
			console.log('saveSelListBut', Places.gmap);
			if ( Places.gmap ) Places.gmap.init();

			$scope.saveSelListItems.splice(0, $scope.saveSelListItems.length);
			Places.sel.list.forEach( (id) => {
				var itm= Places.get(id);
				if (itm) $scope.saveSelListItems.push(itm);
			});

			saveSelListUI.initPlacesManF= true;
			saveSelListUI.placesPageSwitchRet= $location.path();
			console.log('placesPageSwitch', saveSelListUI.placesPageSwitchRet);
			$location.path('/tab/places-edit');
		} else {
			//clear the list of selected
			Places.sel.list.forEach( (id) => {
				var itm= Places.get(id);
				if (itm) itm.sel= 0;
			});
			Places.sel.list= [];
		}
	};

	//Called when the slection filter changes
	$scope.selListFilterChg= function() {
		var flt= saveSelListUI.filter && saveSelListUI.filter.trim().toLowerCase();
		console.log('selListFilterChg', flt);
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

	//Need a darker icon when text filtering is active
	$scope.selListFilterClass= function() {
		return saveSelListUI.filter && saveSelListUI.filter.length > 0 ?
		 'ion-ios-close' : 'ion-ios-close-outline';
	};

	//Clear the text-based filtering
	$scope.selListFilterClear= function() {
		saveSelListUI.filter= '';
		$scope.selListFilterChg();
	};
	
	//////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////

	var saveSelListUI= {toolbarIx: 1};
	$scope.saveSelListUI= saveSelListUI;
	$scope.gmapData= { init: gmapInit };
	$scope.saveSelListItems= [];

	Places.saveSelListUI= saveSelListUI;
	Places.sel= {
		filterActive: false,
		filterList: [],
		filterFavs: false,
		list: [],
	};

	//callback given to gmap directive is invoked when map is ready
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

	return $scope;
})
;