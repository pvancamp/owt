// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('owt', ['ionic', 'owt.controllers', 'owt.services'])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
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

	// Each tab has its own nav history stack:

	.state('tab.current', {
		url: '/current',
		views: {
			'tab-current': {
				templateUrl: 'templates/tab-current.html',
				controller: 'DashCtrl'
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
					templateUrl: 'templates/tab-item-detail.html',
					controller: 'PlacesDetailCtrl'
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
					templateUrl: 'templates/tab-item-detail.html',
					controller: 'ToursDetailCtrl'
				}
			}
		})

	.state('tab.account', {
		url: '/account',
		views: {
			'tab-account': {
				templateUrl: 'templates/tab-account.html',
				controller: 'AccountCtrl'
			}
		}
	});

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/tab/dash');

});
