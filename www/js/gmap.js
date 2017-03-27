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
		this.map= mapObj;

		this.addMarker= function( key, loc ) {
			if ( !key ) return;
			if ( ! this.markers ) this.markers= {};
			var mkr= this.loc2marker( loc );
			if ( mkr ) {
				this.markers[key]= { m: mkr };
			}
		};

		this.allMarkersVisible= function(viz) {
			var mlist= [];
			if ( this.markers ) {
				angular.forEach( this.markers, (mkr) => {
					mlist.push( mkr );
				});
			}
			mlist.forEach( (mkr) => {
				mkr.m.setVisible(viz);
			});
		},

		this.clearOneMarker= function(which) {
			if ( this.markers ) {
				this.markers[which].m.setMap(null);
				delete this.markers[which];
			}
		};

		this.clearMarkers= function() {
			if ( this.markers ) {
				angular.forEach( this.markers, (mkr) => {
					mkr.m.setMap(null);
				});
			}
		};

		this.fitToMarkers= function() {
			var mlist= [];
			if ( this.markers ) {
				angular.forEach( this.markers, (mkr) => {
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
					marker= this.loc2marker(loc);
					marker.setVisible(false);
				}
				else marker= mlist[0].m;

				this.map.setZoom(12);
				this.map.setCenter( marker.getPosition() );
			} else {
				if ( ! this.bounds )
					this.bounds= new google.maps.LatLngBounds();

				mlist.forEach( (mkr) => {
					this.bounds.extend( mkr.m.getPosition() );
				});
				this.map.fitBounds(this.bounds);
			}
		};

		this.init= function() {
			console.log('gmap.init');
			this.clearMarkers();
			this.markers= null;
			this.bounds= null;
		};

		this.loc2marker= function( loc ) {
			//console.log('loc2marker', loc);
			if ( ! loc.lat || ! loc.lng ) return;

			var myLatLng = new google.maps.LatLng(loc.lat, loc.lng);
			var markerInfo= {
				position: myLatLng,
				//icon: image(),
				//shape: shape,
				map: this.map,
				title: loc.name,
			};
			return new google.maps.Marker( markerInfo );
		};

		this.oneMarkerVisible= function(which) {
			if ( this.markers ) {
				angular.forEach( this.markers, (mkr, key) => {
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
				scope.data.init(map, 'gmap'+scope.$id);
			};

		},
		template: '<div id="gmap{{$id}}" style="width:100%;height:100%"></div>',
	};
})
;

