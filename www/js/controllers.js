angular.module('owt.controllers', [])

.controller('AccountCtrl', function($scope) {
	$scope.settings = {
		largePrint: false,
		lang: 'A',
	};
})
.controller('DashCtrl', function($scope) {})

.controller('PlacesCtrl', function(Places, $scope, $ionicModal ) {
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	var selList= [];
	var selFilterFavs= false;

	$scope.pageType= 'Places';

	$scope.add= function(id) {
		console.log('Add', id)
		var itm= Places.get(id);
		if ( itm ) {
			itm.sel= ! itm.sel;
			if ( itm.sel ) selList.push(itm.id);
			else selList.splice( selList.indexOf(itm.id), 1);
		}
	};
	$scope.addButtonClass= function(id) {
		var itm= Places.get(id);
		if ( itm && itm.sel ) return "black";
		return "ion-ios-plus-outline black";
	};
	$scope.addButtonPos= function(id) {
		var itm= Places.get(id);
		if ( itm && itm.sel ) return selList.indexOf(itm.id)+1;
		return '';
	};
	$scope.filterFavs= function() {
		selFilterFavs= !selFilterFavs;
	}
	$scope.filterFavsClass= function() {
		if ( selFilterFavs ) return "ion-ios-heart";
		else return "ion-ios-heart-outline";
	}
	$scope.items= function() {
		return Places.all();
	};
	$scope.moveSelList= function(item, fromIndex, toIndex) {
    //Move the item in the array
    $scope.saveSelListItems.splice(fromIndex, 1);
    $scope.saveSelListItems.splice(toIndex, 0, item);
  };
	$scope.saveSelList= function(op) {
		if ( op ) {
			$scope.saveSelListUI.modal.show();
			$scope.saveSelListItems= [];
			selList.forEach( (id) => {
				var itm= Places.get(id);
				if (itm) $scope.saveSelListItems.push(itm);
			});
		} else {
			selList.forEach( (id) => {
				var itm= Places.get(id);
				if (itm) itm.sel= 0;
			});
			selList= [];
		}
	};
	$scope.saveSelListDialogFunc= function(op) {
		switch (op) {
			case 0:
				saveSelListUI.modal.hide();
				break;
		}
	}

	var saveSelListUI= {};
	$scope.saveSelListUI= saveSelListUI;
	
	$ionicModal.fromTemplateUrl('templatesaveSelList.html', {
		scope: $scope,
		animation: 'slide-in-up',
	}).then(function(modal) {
		 saveSelListUI.modal= modal;
	});

})

.controller('PlacesDetailCtrl', function(Places, $scope, $stateParams) {
	$scope.item = Places.get($stateParams.id);
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
