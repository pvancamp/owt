// by Paul Van Camp

angular.module('owt')

.factory('GmapUtils', function() {
	var imageStor, shape;

	function image() {
		//must not be called until google maps is loaded
		if ( imageStor ) return imageStor;

		imageStor = {
			url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
			// This marker is 20 pixels wide by 32 pixels high.
			size: new google.maps.Size(10, 12),
			// The origin for this image is (0, 0).
			origin: new google.maps.Point(0, 0),
			// The anchor for this image is the base of the flagpole at (0, 32).
			anchor: new google.maps.Point(0, 32)
		};

		// Shapes define the clickable region of the icon. The type defines an HTML
		// <area> element 'poly' which traces out a polygon as a series of X,Y points.
		// The final coordinate closes the poly by connecting to the first coordinate.
		shape = {
			coords: [1, 1, 1, 20, 18, 20, 18, 1],
			type: 'poly'
		};
	}

	function mapMan(mapObj) {
		var self= this;
		self.map= mapObj;

		self.addMarker= function( key, loc ) {
			if ( !key ) return;
			if ( ! self.markers ) self.markers= {};
			var mkr= self.loc2marker( loc );
			if ( mkr ) {
				self.markers[key]= { m: mkr };
			}
		};

		self.allMarkersVisible= function(viz) {
			var mlist= [];
			if ( self.markers ) {
				angular.forEach( self.markers, (mkr) => {
					mlist.push( mkr );
				});
			}
			mlist.forEach( (mkr) => {
				mkr.m.setVisible(viz);
			});
		},

		self.clearOneMarker= function(which) {
			if ( self.markers ) {
				self.markers[which].m.setMap(null);
				delete self.markers[which];
			}
		};

		self.clearMarkers= function() {
			if ( self.markers ) {
				angular.forEach( self.markers, (mkr) => {
					mkr.m.setMap(null);
				});
				self.markers= [];
			}
		};

		self.fitToMarkers= function() {
			var mlist= [];
			if ( self.markers ) {
				angular.forEach( self.markers, (mkr) => {
					mlist.push( mkr );
				});
			}

			if ( mlist.length < 2 ) {
				var marker;
				if ( mlist.length < 1 ) {
					var loc= {
						name: 'Orlando',
						lat: 28.540303,
						lng: -81.38080,
					};
					marker= self.loc2marker(loc);
					marker.setVisible(false);
				}
				else marker= mlist[0].m;

				self.map.setZoom(15);
				self.map.setCenter( marker.getPosition() );
			} else {
				if ( ! self.bounds )
					self.bounds= new google.maps.LatLngBounds();

				mlist.forEach( (mkr) => {
					self.bounds.extend( mkr.m.getPosition() );
				});
				self.map.fitBounds(self.bounds);
			}
		};

		self.init= function() {
			//console.log('gmap.init');
			self.clearMarkers();
			self.markers= null;
			self.bounds= null;
		};

		self.loc2marker= function( loc ) {
			//console.log('loc2marker', loc);
			if ( ! loc.lat || ! loc.lng ) return;

			var myLatLng = new google.maps.LatLng(loc.lat, loc.lng);
			var markerInfo= {
				position: myLatLng,
				//icon: image(),
				//shape: shape,
				map: self.map,
				title: loc.name,
			};
			return new google.maps.Marker( markerInfo );
		};

		self.moveToLocation= function(loc) {
			if ( ! loc.lat || ! loc.lng ) return;
			var myLatLng = new google.maps.LatLng(loc.lat, loc.lng);

			self.map.setCenter( myLatLng );
		};

		self.oneMarkerVisible= function(which) {
			if ( self.markers ) {
				angular.forEach( self.markers, (mkr, key) => {
					mkr.m.setVisible(which == key);
				});
			}
		};
	}

	return {
		mapMan: mapMan
	}
})
.directive('gmap', function( GmapUtils, $timeout) {
	return {
		restrict: 'A',
		scope: {
			data: "=gmap",
		},
		link: function(scope, element, attrs) {
			//console.log('gmap init', scope);

			function checkReady() {
				if ( GoogleMapsIsReady ) mapInit();
				else $timeout( checkReady, 1000 );
			}
			checkReady();

			function mapInit() {
				var initOptions = {
					zoom: 1,
					center: new google.maps.LatLng(0, 0),
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					disableDefaultUI: true,
				};
				var el= element.children()[0];
				var map = new google.maps.Map(el, initOptions );
				scope.data.init(map, scope.data.index || 'gmap'+scope.$id);
			};

		},
		template: '<div id="gmap{{$id}}" style="width:100%;height:100%"></div>',
	};
})
;

