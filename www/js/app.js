// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('owt', ['ionic'])

.factory('App', function(owtFirebase, $ionicLoading, $q, $rootScope) {

	var app= {
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
			waitingWithCancel( canceler );
			return canceler.promise;
		},

		settings: {
			ver: '0.3',
			largePrint: false,
			lang: 'A',
			region: 'B',
			streetViewEnable: false,
		},

		//callback used to cancel via the stored promise: app.wwcCancelCbk
		wwcCbk: function() {
			switch( app.wwcState++ ) {
			case 0:
				// one more tap needed to cancel
				app.wwcTxt='Tap To Abort ...';
				break;
			case 1:
				$ionicLoading.hide();
				if ( app.wwcCancelCbk ) {
					//console.log('wwcCbk calling resolve on cancel promise');
					app.wwcCancelCbk.resolve();
				}
				break;
			}
		},

	};

	//sets up canceler callback used to cancel http operation
	function waitingWithCancel( cancelCbk ) {
		//console.log('waitingWithCancel');
		app.wwcCancelCbk= cancelCbk;
		app.wwcState= 0;
		app.wwcTxt= 'Waiting ...';
		$ionicLoading.show({ template: '<a ng-click="app.wwcCbk()" style="z-index:500"><ion-spinner></ion-spinner> {{app.wwcTxt}}</a>' });
	}

	$rootScope.app= app; //Give HTML access to App settings
	return app;
})

.run(function(App, $ionicPlatform, $rootScope, $window) {
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

	.state('tab.current', {
		url: '/current',
		views: {
			'tab-current': {
				templateUrl: 'templates/tab-current.html',
				controller: 'ToursGuidedCtrl',
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

	.state('tab.places-man', {
		url: '/places-man',
		views: {
			'tab-places-man': {
				templateUrl: 'templates/modal-savePlaces.html',
				controller: 'PlacesManCtrl',
			}
		}
	})

	.state('tab.places-man-detail', {
		url: '/places-man/:id',
		views: {
			'tab-places-man': {
				templateUrl: 'templates/tab-places-detail.html',
				controller: 'PlacesDetailsCtrl',
			}
		}
	})

	//settings
	.state('tab.settings', {
		url: '/settings',
		views: {
			'tab-settings': {
				templateUrl: 'templates/tab-settings.html',
				controller: 'SettingsCtrl'
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
