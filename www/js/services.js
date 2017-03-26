// by Paul Van Camp

angular.module('owt.services', [])
.factory('owtFirebase', function() {
	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyAA_shTfFs112y4S9pc2mfuZsRsVQwFR7s",
		authDomain: "fireside-5b9ad.firebaseapp.com",
		databaseURL: "https://fireside-5b9ad.firebaseio.com",
		storageBucket: "fireside-5b9ad.appspot.com",
		messagingSenderId: "755392357336"
	};
	firebase.initializeApp(config);
	//console.log('owtFirebase', firebase.database() );

	return {
		authCreate: function(email, password, retFunc) {
			//creates does login
			firebase.createUserWithEmailAndPassword(email, password).then( retFunc ).catch( retFunc );
		},
		authLogin: function(email, password, retFunc) {
			firebase.signInWithEmailAndPassword(email, password).then( retFunc ).catch( retFunc );
		},
		authLogout: function(retFunc) {
			firebase.signOut().then( retFunc ).catch( retFunc );
		},
		authUser: function() { return firebase.auth().currentUser; },

		places: function() {
			return firebase.database().ref('historic-locations/orlando').once('value');
		},
	};
})

.factory('App', function(owtFirebase, $ionicLoading, $q, $rootScope) {

	return {
		//return the logged in uesr if logged in
		authUser: function() { return owtFirebase.authUser; },

		//Take down the spinner
		loadingHide: function() { $ionicLoading.hide() },

		//Put up the spinner to show that program is waiting for something
		loadingShow: function() {
			$ionicLoading.show({
				template: '<ion-spinner></ion-spinner> &nbsp;Waiting ...'
			});
		},

		//Put up the spinner and return a promise that can be used to
		// cancel http operation
		loadingShowWithCanceler: function() {
			var canceler= $q.defer();
			$rootScope.waitingWithCancel( canceler );
			return canceler.promise;
		},
	}

})

.factory('Places', function(owtFirebase, $ionicLoading, $rootScope) {
	var itemsAsObj, itemsAsList, itemsLoaded;

	function items() {
		if ( ! itemsLoaded ) {
			itemsLoaded= true;
			/************
			$ionicLoading.show();
			owtFirebase.places().then( (snap) => {
				console.log('owtFirebase places', snap.val());
				$ionicLoading.hide();
				itemsAsObj= snap.val();
				$rootScope.$apply();
			});
			***********/
			itemsAsObj= historic_locations.orlando;
		}
		return itemsAsObj;
	}

	var srv= {
		all: function() {
			if ( ! items() ) return null;

			if ( ! itemsAsList ) {
				itemsAsList= [];
				angular.forEach(items(), (vals, key) => {
					vals.id= key;
					switch (vals.type.toLowerCase()) {
					case 'building':
						vals.pic= 'img/icons/buildingIcon.png';
						break;
					case 'park':
						vals.pic= 'img/icons/parkIcon.png';
						break;
					case 'sign':
						vals.pic= 'img/icons/signIcon.png';
						break;
					default:
						vals.pic= 'img/icons/questionIcon.png';
						break;
					}
					itemsAsList.push( vals );
				});
				itemsAsList.sort( (a,b) => { return(a.name - b.name) } );
				console.log('Places all', itemsAsList);
			}
			return itemsAsList;
		},
		favsStor: function(selList, val) {
			selList.forEach( (itm) => {
				itm.fav= val;
			});
		},
		get: function(id) {
			return items()[id];
		},
		initForUser: function() {
			//Call this when someone logs in
		},
		remove: function(id) {
			delete items()[id];
		},
		selected: function() {
			var selList= [];
			itemsAsList.forEach( (itm) => {
				if ( itm.sel ) selList.push( itm );
			});
			return selList;
		}
	};

	return srv;
})

.factory('Tours', function() {
	var itemsAsObj, itemsAsList, itemsLoaded;
	var itemCurrent;

	function items() {
		if ( ! itemsLoaded ) {
			itemsLoaded= true;
			/************
			$ionicLoading.show();
			owtFirebase.tours().then( (snap) => {
				console.log('owtFirebase tours', snap.val());
				$ionicLoading.hide();
				itemsAsObj= snap.val();
				$rootScope.$apply();
			});
			***********/
			itemsAsObj= {};
		}
		return itemsAsObj;
	}

	function itemsList() {
		if ( ! items() ) return null;

		if ( ! itemsAsList ) {
			itemsAsList= [];
			angular.forEach(items(), (vals, key) => {
				vals.id= key;
				itemsAsList.push( vals );
			});
			itemsAsList.sort( (a,b) => { return(a.name - b.name) } );
			console.log('Places all', itemsAsList);
		}
		return itemsAsList;
	}

	var srv= {
		add: function(tour) {
			var tours= items();
			var ix;
			if ( tours ) {
				ix= tours['#'] || 1;
				ix++;
				tours['#']= ix;
				tour.id= ix;
				tours[ix]= tour;

				itemsList().push(tour);
				console.log('Added Tour', ix);
			}
			return ix;
		},
		all: function() {
			return itemsList();
		},
		currentSelect: function(itm) {
			var tours= items();
			if ( tours[itm] ) itemCurrent= itm;
			console.log('Selecting Tour', itemCurrent);
		},
		current: function() {
			return itemCurrent;
		},
		currentDesc: function() {
			var dft= '*** No Description ***'
			var tours= items();
			if ( tours && tours[itemCurrent] ) {
				return tours[itemCurrent].description || dft;
			}
			return dft;
		},
		currentName: function() {
			var dft= '*** No Name ***';
			var tours= items();
			if ( tours && tours[itemCurrent] ) {
				return tours[itemCurrent].name || dft;
			}
			return dft;
		},
		favsStor: function(selList, val) {
			selList.forEach( (itm) => {
				itm.fav= val;
			});
		},
		get: function(id) {
			return items()[id];
		},
		initForUser: function() {
			//Call this when someone logs in
			itemCurrent= null;
		},
		remove: function(id) {
			delete items()[id];
		},
		selected: function() {
			var selList= [];
			itemsAsList.forEach( (itm) => {
				if ( itm.sel ) selList.push( itm );
			});
			return selList;
		}
	};

	return srv;
})
;

/////////////////////////////////////////////////////////////
function itemsToList(items) {
	var list= [];
	angular.forEach(items, (vals, key) => {
		list.push( angular.extend({id: key}, vals) );
	});
	return list;
}

