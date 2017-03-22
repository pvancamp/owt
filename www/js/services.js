angular.module('owt.services', [])
.factory('owtDatabase', function() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAA_shTfFs112y4S9pc2mfuZsRsVQwFR7s",
    authDomain: "fireside-5b9ad.firebaseapp.com",
    databaseURL: "https://fireside-5b9ad.firebaseio.com",
    storageBucket: "fireside-5b9ad.appspot.com",
    messagingSenderId: "755392357336"
  };
  firebase.initializeApp(config);
  //console.log('owtDatabase', firebase.database() );

  return {
  	places: function() {
  		return firebase.database().ref('historic-locations/orlando').once('value');
  	}
  };
})

.factory('Places', function(owtDatabase, $ionicLoading, $rootScope) {
	var itemsAsObj, itemsAsList, itemsLoaded;

	function items() {
		if ( ! itemsLoaded ) {
			itemsLoaded= true;
			/************
			$ionicLoading.show();
			owtDatabase.places().then( (snap) => {
  			console.log('owtDatabase places', snap.val());
  			$ionicLoading.hide();
  			itemsAsObj= snap.val();
  			$rootScope.$apply();
  		});
			***********/
			itemsAsObj= historic_locations.orlando;
		}
		return itemsAsObj;
	}

	return {
		add: function(item) {
			angular.extend( itemsAsObj, item );
			if ( itemsAsList )
				itemsAsList.push( item );
		},
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
		get: function(id) {
			return items()[id];
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
})

.factory('Tours', function() {
	var items= {};
	var itemsAsList;

	return {
		add: function(item) {
			angular.extend( items, item );
			if ( itemsAsList )
				itemsAsList.push( item );
		},
		all: function() {
			if ( ! itemsAsList ) {
				itemsAsList= [];
				itemsAsList.sort( (a,b) => { return(a.id - b.id) } );
			}
			return itemsAsList;
		},
		get: function(id) {
			return items[id];
		},
		remove: function(id) {
			delete items[id];
		},
	};
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

