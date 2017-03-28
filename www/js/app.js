// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('owt', ['ionic'])

.run(function($ionicPlatform, $rootScope, $window) {
	$ionicPlatform.ready(function() {

		$rootScope.__isIOS= ionic.Platform.isIOS();
		$rootScope.__width= $window.innerWidth;
		$rootScope.__height= $window.innerHeight;

		//Ionic header area header size
		if ( $rootScope.__isIOS ) $rootScope.__headerHeight= 64;
		else $rootScope.__headerHeight= 44;

		console.log('run platform isIOS', $rootScope.__isIOS );
		console.log('window inner size:', $window.innerWidth, $window.innerHeight );

		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
		if ( screen.orientation && screen.orientation.lock ) {
			//always will be in portrait mode
			screen.orientation.lock('portrait');
			console.log('run: Orientation is ' + screen.orientation.type);
		}

		$rootScope.tabsHide= function(val) {
			var el= angular.element(document).find('ion-tabs');
			//console.log('run tabsHide', el, val);
			if (el) {
				if (val) el.addClass('tabs-item-hide');
				else el.removeClass('tabs-item-hide');
			}
		};
	});
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

	$ionicConfigProvider.tabs.position('bottom'); 
	$ionicConfigProvider.backButton.previousTitleText(false);
	$ionicConfigProvider.navBar.alignTitle('center');

	$stateProvider

	// setup an abstract state for the tabs directive
	.state('tab', {
		url: '/tab',
		abstract: true,
		templateUrl: 'templates/tabs.html'
	})

	//settings
	.state('tab.account', {
		url: '/account',
		views: {
			'tab-account': {
				templateUrl: 'templates/tab-account.html',
				controller: 'AccountCtrl'
			}
		}
	})

	.state('tab.current', {
		url: '/current',
		views: {
			'tab-current': {
				templateUrl: 'templates/tab-current.html',
				controller: 'ToursCtrl',
			}
		}
	})

	.state('tab.current-detail', {
		url: '/current/:id',
		views: {
			'tab-current': {
				templateUrl: 'templates/tab-tours-detail.html',
				controller: 'ToursDetailsCtrl'
			}
		}
	})

	.state('tab.dash', {
		url: '/dash',
		views: {
			'tab-dash': {
				templateUrl: 'templates/tab-dash.html',
				controller: 'DashCtrl'
			}
		}
	})

	.state('tab.places', {
		url: '/places',
		views: {
			'tab-places': {
				templateUrl: 'templates/tab-places.html',
				controller: 'PlacesCtrl',
			}
		}
	})
	.state('tab.places-detail', {
		url: '/places/:id',
		views: {
			'tab-places': {
				templateUrl: 'templates/tab-places-detail.html',
				controller: 'PlacesDetailsCtrl',
			}
		}
	})

	.state('tab.places-edit', {
		url: '/places-edit',
		views: {
			'tab-places-edit': {
				templateUrl: 'templates/modal-savePlaces.html',
				controller: 'PlacesManCtrl',
			}
		}
	})

	.state('tab.places-edit-detail', {
		url: '/places-edit/:id',
		views: {
			'tab-places-edit': {
				templateUrl: 'templates/tab-places-detail.html',
				controller: 'PlacesDetailsCtrl',
			}
		}
	})

	.state('tab.tours', {
		url: '/tours',
		views: {
			'tab-tours': {
				templateUrl: 'templates/tab-tours.html',
				controller: 'ToursCtrl'
			}
		}
	})
	.state('tab.tours-detail', {
		url: '/tours/:id',
		views: {
			'tab-tours': {
				templateUrl: 'templates/tab-tours-detail.html',
				controller: 'ToursDetailsCtrl'
			}
		}
	})

	;

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/tab/dash');

});
