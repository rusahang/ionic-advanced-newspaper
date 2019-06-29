angular.module("newspaper", ["ngCordova","ionic","ionMdInput","ionic-material","ion-datetime-picker","ionic.rating","utf8-base64","angular-md5","chart.js","pascalprecht.translate","tmh.dynamicLocale","ionicLazyLoad","ngMap","newspaper.controllers", "newspaper.services"])
	.run(function($ionicPlatform,$window,$interval,$timeout,$ionicHistory,$ionicPopup,$state,$rootScope){

		$rootScope.appName = "Newspaper" ;
		$rootScope.appLogo = "img/icon.png" ;
		$rootScope.appVersion = "1.0" ;
		$rootScope.headerShrink = false ;

		$rootScope.liveStatus = "pause" ;
		$ionicPlatform.ready(function(){
			$rootScope.liveStatus = "run" ;
		});
		$ionicPlatform.on("pause",function(){
			$rootScope.liveStatus = "pause" ;
		});
		$ionicPlatform.on("resume",function(){
			$rootScope.liveStatus = "run" ;
		});


		$rootScope.hide_menu_dashboard = false ;
		$rootScope.hide_menu_categories = false ;
		$rootScope.hide_menu_posts = false ;
		$rootScope.hide_menu_users = false ;
		$rootScope.hide_menu_post_bookmark = false ;
		$rootScope.hide_menu_help = false ;
		$rootScope.hide_menu_rate_this_app = false ;
		$rootScope.hide_menu_faqs = false ;
		$rootScope.hide_menu_about_us = false ;


		$ionicPlatform.ready(function() {

			localforage.config({
				driver : [localforage.WEBSQL,localforage.INDEXEDDB,localforage.LOCALSTORAGE],
				name : "newspaper",
				storeName : "newspaper",
				description : "The offline datastore for Newspaper app"
			});

			if(window.cordova){
				$rootScope.exist_cordova = true ;
			}else{
				$rootScope.exist_cordova = false ;
			}
			//required: cordova plugin add ionic-plugin-keyboard --save
			if(window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}

			//required: cordova plugin add cordova-plugin-statusbar --save
			if(window.StatusBar) {
				StatusBar.styleDefault();
			}
			// this will create a banner on startup
			//required: cordova plugin add cordova-plugin-admob-free --save
			if (typeof admob !== "undefined"){
				var admobid = {};
				admobid = {
					banner: "ca-app-pub-3940256099942544/1033173712",
					interstitial: "ca-app-pub-3940256099942544/5224354917",
				};
				
				// banner
				try{
					admob.banner.config({
						id: admobid.banner,
						autoShow: false
					});
					admob.banner.prepare();
				}catch(err){ 
					//alert(err.message);
				}
				$interval(function(){
					if($rootScope.liveStatus == "run"){
						try{
							admob.banner.show();
						}catch(err){ 
							//alert(err.message);
						}
					}
				},10000); 
				
				$ionicPlatform.on("pause",function(){
					try{
						admob.banner.hide();
					}catch(err){ 
						//alert(err.message);
					}
				});
				
				// interstitial
				try{
					admob.interstitial.config({
						id: admobid.interstitial,
						autoShow: false
					});
					admob.interstitial.prepare();
				}catch(err){ 
					//alert(err.message);
				}
			}

			//required: cordova plugin add cordova-plugin-network-information --save
			$interval(function(){
				if ( typeof navigator == "object" && typeof navigator.connection != "undefined"){
					var networkState = navigator.connection.type;
					$rootScope.is_online = true ;
					if (networkState == "none") {
						$rootScope.is_online = false ;
						$window.location = "retry.html";
					}
				}
			}, 5000);

			//required: cordova plugin add onesignal-cordova-plugin --save
			if(window.plugins && window.plugins.OneSignal){
				window.plugins.OneSignal.enableNotificationsWhenActive(true);
				var notificationOpenedCallback = function(jsonData){
					try {
						$timeout(function(){
							$window.location = "#/newspaper/" + jsonData.notification.payload.additionalData.page ;
						},200);
					} catch(e){
						console.log("onesignal:" + e);
					}
				}
				window.plugins.OneSignal.startInit("c705055f-57d0-43cd-9303-af2426b6f97e").handleNotificationOpened(notificationOpenedCallback).endInit();
			}


		});
		$ionicPlatform.registerBackButtonAction(function (e){
			if($ionicHistory.backView()){
				$ionicHistory.goBack();
			}else{
				var confirmPopup = $ionicPopup.confirm({
					title: "Confirm Exit",
					template: "Are you sure you want to exit?"
				});
				confirmPopup.then(function (close){
					if(close){
						ionic.Platform.exitApp();
					}
				});
			}
			e.preventDefault();
			return false;
		},101);
	})


	.filter("to_trusted", ["$sce", function($sce){
		return function(text) {
			return $sce.trustAsHtml(text);
		};
	}])

	.filter("trustUrl", function($sce) {
		return function(url) {
			return $sce.trustAsResourceUrl(url);
		};
	})

	.filter("trustJs", ["$sce", function($sce){
		return function(text) {
			return $sce.trustAsJs(text);
		};
	}])

	.filter("strExplode", function() {
		return function($string,$delimiter) {
			if(!$string.length ) return;
			var $_delimiter = $delimiter || "|";
			return $string.split($_delimiter);
		};
	})

	.filter("strDate", function(){
		return function (input) {
			return new Date(input);
		}
	})
	.filter("phpTime", function(){
		return function (input) {
			var timeStamp = parseInt(input) * 1000;
			return timeStamp ;
		}
	})
	.filter("strHTML", ["$sce", function($sce){
		return function(text) {
			return $sce.trustAsHtml(text);
		};
	}])
	.filter("strEscape",function(){
		return window.encodeURIComponent;
	})
	.filter("strUnscape", ["$sce", function($sce) {
		var div = document.createElement("div");
		return function(text) {
			div.innerHTML = text;
			return $sce.trustAsHtml(div.textContent);
		};
	}])

	.filter("stripTags", ["$sce", function($sce){
		return function(text) {
			return text.replace(/(<([^>]+)>)/ig,"");
		};
	}])

	.filter("chartData", function(){
		return function (obj) {
			var new_items = [];
			angular.forEach(obj, function(child) {
				var new_item = [];
				var indeks = 0;
				angular.forEach(child, function(v){
						if ((indeks !== 0) && (indeks !== 1)){
							new_item.push(v);
						}
						indeks++;
					});
					new_items.push(new_item);
				});
			return new_items;
		}
	})

	.filter("chartLabels", function(){
		return function (obj){
			var new_item = [];
			angular.forEach(obj, function(child) {
			var indeks = 0;
			new_item = [];
			angular.forEach(child, function(v,l) {
				if ((indeks !== 0) && (indeks !== 1)) {
					new_item.push(l);
				}
				indeks++;
			});
			});
			return new_item;
		}
	})
	.filter("chartSeries", function(){
		return function (obj) {
			var new_items = [];
			angular.forEach(obj, function(child) {
				var new_item = [];
				var indeks = 0;
				angular.forEach(child, function(v){
						if (indeks === 1){
							new_item.push(v);
						}
						indeks++;
					});
					new_items.push(new_item);
				});
			return new_items;
		}
	})



.config(["$translateProvider", function ($translateProvider){
	$translateProvider.preferredLanguage("en-us");
	$translateProvider.useStaticFilesLoader({
		prefix: "translations/",
		suffix: ".json"
	});
	$translateProvider.useSanitizeValueStrategy("escapeParameters");
}])


.config(function(tmhDynamicLocaleProvider){
	tmhDynamicLocaleProvider.localeLocationPattern("lib/ionic/js/i18n/angular-locale_{{locale}}.js");
	tmhDynamicLocaleProvider.defaultLocale("en-us");
})


.config(function($stateProvider, $urlRouterProvider,$sceDelegateProvider,$httpProvider,$ionicConfigProvider){
	try{
		// Domain Whitelist
		$sceDelegateProvider.resourceUrlWhitelist([
			"self",
			new RegExp('^(http[s]?):\/\/(w{3}.)?youtube\.com/.+$'),
			new RegExp('^(http[s]?):\/\/(w{3}.)?w3schools\.com/.+$'),
			new RegExp('^(http[s]?):\/\/(w{3}.)?wordpress/.+$'),
			new RegExp('^(http[s]?):\/\/(w{3}.)?facebook/.+$'),
			new RegExp('^(http[s]?):\/\/(w{3}.)?google/.+$'),
			new RegExp('^(http[s]?):\/\/(w{3}.)?twitter/.+$'),
		]);
	}catch(err){
		console.log("%cerror: %cdomain whitelist","color:blue;font-size:16px;","color:red;font-size:16px;");
	}
	$stateProvider
	.state("newspaper",{
		url: "/newspaper",
			abstract: true,
			templateUrl: "templates/newspaper-side_menus.html",
			controller: "side_menusCtrl",
	})

	.state("newspaper.about_us", {
		url: "/about_us",
		views: {
			"newspaper-side_menus" : {
						templateUrl:"templates/newspaper-about_us.html",
						controller: "about_usCtrl"
					},
			"fabButtonUp" : {
						template: '',
					},
		}
	})

	.state("newspaper.bookmarks", {
		url: "/bookmarks",
		views: {
			"newspaper-side_menus" : {
						templateUrl:"templates/newspaper-bookmarks.html",
						controller: "bookmarksCtrl"
					},
			"fabButtonUp" : {
						template: '',
					},
		}
	})

	.state("newspaper.categories", {
		url: "/categories",
		cache:true,
		views: {
			"newspaper-side_menus" : {
						templateUrl:"templates/newspaper-categories.html",
						controller: "categoriesCtrl"
					},
			"fabButtonUp" : {
						template: '',
					},
		}
	})

	.state("newspaper.dashboard", {
		url: "/dashboard",
		views: {
			"newspaper-side_menus" : {
						templateUrl:"templates/newspaper-dashboard.html",
						controller: "dashboardCtrl"
					},
			"fabButtonUp" : {
						template: '',
					},
		}
	})

	.state("newspaper.faqs", {
		url: "/faqs",
		views: {
			"newspaper-side_menus" : {
						templateUrl:"templates/newspaper-faqs.html",
						controller: "faqsCtrl"
					},
			"fabButtonUp" : {
						template: '',
					},
		}
	})

	.state("newspaper.menu_one", {
		url: "/menu_one",
		views: {
			"newspaper-side_menus" : {
						templateUrl:"templates/newspaper-menu_one.html",
						controller: "menu_oneCtrl"
					},
			"fabButtonUp" : {
						template: '',
					},
		}
	})

	.state("newspaper.menu_two", {
		url: "/menu_two",
		views: {
			"newspaper-side_menus" : {
						templateUrl:"templates/newspaper-menu_two.html",
						controller: "menu_twoCtrl"
					},
			"fabButtonUp" : {
						template: '',
					},
		}
	})

	.state("newspaper.online_radio", {
		url: "/online_radio",
		views: {
			"newspaper-side_menus" : {
						templateUrl:"templates/newspaper-online_radio.html",
						controller: "online_radioCtrl"
					},
			"fabButtonUp" : {
						template: '',
					},
		}
	})

	.state("newspaper.post_bookmark", {
		url: "/post_bookmark",
		cache:false,
		views: {
			"newspaper-side_menus" : {
						templateUrl:"templates/newspaper-post_bookmark.html",
						controller: "post_bookmarkCtrl"
					},
			"fabButtonUp" : {
						template: '',
					},
		}
	})

	.state("newspaper.post_singles", {
		url: "/post_singles/:id",
		cache:true,
		views: {
			"newspaper-side_menus" : {
						templateUrl:"templates/newspaper-post_singles.html",
						controller: "post_singlesCtrl"
					},
			"fabButtonUp" : {
						template: '<button id="fab-up-button" ng-click="scrollTop()" class="button button-fab button-fab-bottom-right button-energized-900 spin"><i class="icon ion-arrow-up-a"></i></button>',
						controller: function ($timeout) {
							$timeout(function () {
								document.getElementById("fab-up-button").classList.toggle("on");
							}, 900);
						}
					},
		}
	})

	.state("newspaper.posts", {
		url: "/posts/:categories",
		cache:true,
		views: {
			"newspaper-side_menus" : {
						templateUrl:"templates/newspaper-posts.html",
						controller: "postsCtrl"
					},
			"fabButtonUp" : {
						template: '<button id="fab-up-button" ng-click="scrollTop()" class="button button-fab button-fab-bottom-right button-energized-900 spin"><i class="icon ion-arrow-up-a"></i></button>',
						controller: function ($timeout) {
							$timeout(function () {
								document.getElementById("fab-up-button").classList.toggle("on");
							}, 900);
						}
					},
		}
	})

	.state("newspaper.slide_tab_menu", {
		url: "/slide_tab_menu",
		views: {
			"newspaper-side_menus" : {
						templateUrl:"templates/newspaper-slide_tab_menu.html",
						controller: "slide_tab_menuCtrl"
					},
			"fabButtonUp" : {
						template: '',
					},
		}
	})

	.state("newspaper.users", {
		url: "/users",
		cache:false,
		views: {
			"newspaper-side_menus" : {
						templateUrl:"templates/newspaper-users.html",
						controller: "usersCtrl"
					},
			"fabButtonUp" : {
						template: '',
					},
		}
	})

	$urlRouterProvider.otherwise("/newspaper/dashboard");
});
