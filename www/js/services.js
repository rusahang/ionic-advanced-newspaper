angular.module("newspaper.services", [])
// TODO: --|---- directive
	
	
// TODO: --|-------- zoomTap
.directive("zoomTap", function($compile, $ionicGesture) {
	return {
		link: function($scope, $element, $attrs) {
			var zoom = minZoom = 10;
			var maxZoom = 50;
			$element.attr("style", "width:" + (zoom * 10) + "%");
			var handlePinch = function(e){
				if (e.gesture.scale <= 1) {
					zoom--;
				}else{
					zoom++;
				}
				if (zoom >= maxZoom) {
					zoom = maxZoom;
				}
				if (zoom <= minZoom) {
					zoom = minZoom;
				}
				$element.attr("style", "width:" + (zoom * 10) + "%");
			};
			var handleDoubleTap = function(e){
				zoom++;
				if (zoom == maxZoom) {
					zoom = minZoom;
				}
				$element.attr("style", "width:" + (zoom * 10) + "%");
			};
			var pinchGesture = $ionicGesture.on("pinch", handlePinch, $element);
			var doubletapGesture = $ionicGesture.on("doubletap", handleDoubleTap, $element);
			$scope.$on("$destroy", function() {
				$ionicGesture.off(pinchGesture, "pinch", $element);
				$ionicGesture.off(doubletapGesture, "doubletap", $element);
			});
		}
	};
})
// TODO: --|-------- zoom-view
.directive("zoomView", function($compile,$ionicModal, $ionicPlatform){
	return {
			link: function link($scope, $element, $attrs){
				
				if(typeof $scope.zoomImages == "undefined"){
					$scope.zoomImages=0;
				}
				if(typeof $scope.imagesZoomSrc == "undefined"){
					$scope.imagesZoomSrc = {};
				}
				$scope.zoomImages++;
				var indeks = $scope.zoomImages;
				$scope.imagesZoomSrc[indeks] = $attrs.zoomSrc;
				
				$element.attr("ng-click", "showZoomView(" + indeks + ")");
				$element.removeAttr("zoom-view");
				$compile($element)($scope);
				$ionicPlatform.ready(function(){
					var zoomViewTemplate = "";
					zoomViewTemplate += "<ion-modal-view class=\"zoom-view\">";
					zoomViewTemplate += "<ion-header-bar class=\"bar bar-header light bar-balanced-900\">";
					zoomViewTemplate += "<div class=\"header-item title\"></div>";
					zoomViewTemplate += "<div class=\"buttons buttons-right header-item\"><span class=\"right-buttons\"><button ng-click=\"closeZoomView()\" class=\"button button-icon ion-close button-clear button-dark\"></button></span></div>";
					zoomViewTemplate += "</ion-header-bar>";
					zoomViewTemplate += "<ion-content overflow-scroll=\"true\">";
					zoomViewTemplate += "<ion-scroll zooming=\"true\" overflow-scroll=\"false\" direction=\"xy\" style=\"width:100%;height:100%;position:absolute;top:0;bottom:0;left:0;right:0;\">";
					zoomViewTemplate += "<img ng-src=\"{{ zoom_src }}\" style=\"width:100%!important;display:block;width:100%;height:auto;max-width:400px;max-height:700px;margin:auto;padding:10px;\"/>";
					zoomViewTemplate += "</ion-scroll>";
					zoomViewTemplate += "</ion-content>";
					zoomViewTemplate += "</ion-modal-view>";
					$scope.zoomViewModal = $ionicModal.fromTemplate(zoomViewTemplate,{
						scope: $scope,
						animation: "slide-in-up"
					});
					
					$scope.showZoomView = function(indeks){
						$scope.zoom_src = $scope.imagesZoomSrc[indeks] || $attrs.zoomSrc ;
						console.log(indeks,$scope.zoom_src,$scope.imagesZoomSrc);
						$scope.zoomViewModal.show();
					};
					$scope.closeZoomView= function(){
						$scope.zoomViewModal.hide();
					};
				});
		}
	};
})
				
// TODO: --|-------- headerShrink
.directive("headerShrink", function($document){
	var fadeAmt;
	var shrink = function(header, content, amt, max){
		amt = Math.min(44, amt);
		fadeAmt = 1 - amt / 44;
		ionic.requestAnimationFrame(function(){
			var translate3d = "translate3d(0, -" + amt + "px, 0)";
			if(header==null){return;}
			for (var i = 0, j = header.children.length; i < j; i++){
			header.children[i].style.opacity = fadeAmt;
				header.children[i].style[ionic.CSS.TRANSFORM] = translate3d;
			}
		});
	};
	return {
		link: function($scope, $element, $attr){
			var starty = $scope.$eval($attr.headerShrink) || 0;
			var shrinkAmt;
			var header = $document[0].body.querySelector(".page-title");
			var headerHeight = $attr.offsetHeight || 44;
			$element.bind("scroll", function(e){
				var scrollTop = null;
				if (e.detail){
					scrollTop = e.detail.scrollTop;
				} else if (e.target){
					scrollTop = e.target.scrollTop;
				}
				if (scrollTop > starty){
					shrinkAmt = headerHeight - Math.max(0, (starty + headerHeight) - scrollTop);
					shrink(header, $element[0], shrinkAmt, headerHeight);
				}else{
					shrink(header, $element[0], 0, headerHeight);
				}
			});
			$scope.$parent.$on("$ionicView.leave", function (){
				shrink(header, $element[0], 0, headerHeight);
			});
			$scope.$parent.$on("$ionicView.enter", function (){
				shrink(header, $element[0], 0, headerHeight);
			});
		}
	}
})
// TODO: --|-------- fileread
.directive("fileread",function($ionicLoading,$timeout){
	return {
		scope:{
			fileread: "="
		},
		link: function(scope, element,attributes){
			element.bind("change", function(changeEvent) {
				$ionicLoading.show();
				scope.fileread = "";
				var reader = new FileReader();
				reader.onload = function(loadEvent) {
					try{
						scope.$apply(function(){
							scope.fileread = loadEvent.target.result;
						});
					}catch(err){
						//alert(err.message);
					}
				}
				reader.onloadend = function(loadEvent) {
					try{
						$timeout(function(){
							$ionicLoading.hide();
								scope.fileread = loadEvent.target.result;
						},300);
					}catch(err){
						//alert(err.message);
					}
				}
				if(changeEvent.target.files[0]){
					reader.readAsDataURL(changeEvent.target.files[0]);
				}
				$timeout(function(){
					$ionicLoading.hide();
				},300)
			});
		}
	}
}) 
// TODO: --|-------- run-app-sms
/** required: cordova-plugin-whitelist, cordova-plugin-inappbrowser **/
.directive("runAppSms", function(){
	return {
			controller: function($scope, $element, $attrs){
			$element.bind("click", runApp);
			function runApp(event)
			{
				var phoneNumber = $attrs.phone || "08123456789";
				var textMessage = window.encodeURIComponent($attrs.message) || "Hello";
				if (ionic.Platform.isIOS()){
					var urlSchema = "sms:" + phoneNumber + ";?&body=" + textMessage;
				}else{
					var urlSchema = "sms:" + phoneNumber + "?body=" + textMessage;
				}
				window.open(urlSchema,"_system","location=yes");
			};
		}
	};
})
// TODO: --|-------- run-app-call
/** required: cordova-plugin-whitelist, cordova-plugin-inappbrowser **/
.directive("runAppCall", function(){
	return {
			controller: function($scope, $element, $attrs){
			$element.bind("click", runApp);
			function runApp(event)
			{
				var phoneNumber = $attrs.phone || "08123456789";
				var urlSchema = "tel:" + phoneNumber ;
				window.open(urlSchema,"_system","location=yes");
			};
		}
	};
})
// TODO: --|-------- run-app-geo
/** required: cordova-plugin-whitelist, cordova-plugin-inappbrowser **/
.directive("runAppGeo", function(){
	return {
			controller: function($scope, $element, $attrs){
			$element.bind("click", runApp);
			function runApp(event)
			{
				var loc = $attrs.loc || "23,12312";
				if (ionic.Platform.isIOS()){
					var urlSchema = "maps://?q=" + loc ;
				}else{
					var urlSchema = "geo:" + loc ;
				}
				window.open(urlSchema,"_system","location=yes");
			};
		}
	};
})
// TODO: --|-------- run-app-email
/** required: cordova-plugin-whitelist, cordova-plugin-inappbrowser **/
.directive("runAppEmail", function(){
	return {
			controller: function($scope, $element, $attrs){
			$element.bind("click", runApp);
			function runApp(event)
			{
				var EmailAddr = $attrs.email || "fonebayinc@gmail.com.com";
				var textSubject = $attrs.subject || "";
				var textMessage = window.encodeURIComponent($attrs.message) || "";
				var urlSchema = "mailto:" + EmailAddr + "?subject=" + textSubject + "&body=" + textMessage;
				window.open(urlSchema,"_system","location=yes");
			};
		}
	};
})
// TODO: --|-------- run-app-facebook
/** required: cordova-plugin-whitelist, cordova-plugin-inappbrowser **/
.directive("runAppFacebook", function(){
	return {
			controller: function($scope, $element, $attrs){
			$element.bind("click", runApp);
			function runApp(event)
			{
				var textLink = window.encodeURIComponent($attrs.link) || "http://fonebay.com/";
				if (ionic.Platform.isIOS()){
					var urlSchema = "fb://faceweb/f?href=https://facebook.com/sharer/sharer.php?u=" + textLink;
				}else if(ionic.Platform.isAndroid()){
					var urlSchema = "fb://faceweb/f?href=https://facebook.com/sharer/sharer.php?u=" + textLink;
				}else{
					var urlSchema = "https://facebook.com/sharer/sharer.php?u=" + textLink;
				}
				window.open(urlSchema,"_system","location=yes");
			};
		}
	};
})
// TODO: --|-------- run-app-whatsapp
/** required: cordova-plugin-whitelist, cordova-plugin-inappbrowser **/
.directive("runAppWhatsapp", function(){
	return {
			controller: function($scope, $element, $attrs){
			$element.bind("click", runApp);
			function runApp(event)
			{
				var textMessage = window.encodeURIComponent($attrs.message) || "";
				var urlSchema = "whatsapp://send?text=" + textMessage;
				window.open(urlSchema,"_system","location=yes");
			};
		}
	};
})
// TODO: --|-------- run-app-line
/** required: cordova-plugin-whitelist, cordova-plugin-inappbrowser **/
.directive("runAppLine", function(){
	return {
			controller: function($scope, $element, $attrs){
			$element.bind("click", runApp);
			function runApp(event)
			{
				var textMessage = window.encodeURIComponent($attrs.message) || "";
				var urlSchema = "line://msg/text/" + textMessage;
				window.open(urlSchema,"_system","location=yes");
			};
		}
	};
})
// TODO: --|-------- run-app-twitter
/** required: cordova-plugin-whitelist, cordova-plugin-inappbrowser **/
.directive("runAppTwitter", function(){
	return {
			controller: function($scope, $element, $attrs){
			$element.bind("click", runApp);
			function runApp(event)
			{
				var textMessage = window.encodeURIComponent($attrs.message) || "";
				var urlSchema = "twitter://post?message=" + textMessage;
				window.open(urlSchema,"_system","location=yes");
			};
		}
	};
})
// TODO: --|-------- run-open-url
/** required: cordova-plugin-whitelist, cordova-plugin-inappbrowser **/
.directive("runOpenUrl", function(){
	return {
			controller: function($scope,$element,$attrs){
			$element.bind("click", runOpenURL);
			function runOpenURL(event)
			{
				var $href = $attrs.href || "http://fonebay.com/";
				window.open($href,"_system","location=yes");
			};
		}
	};
})
// TODO: --|-------- run-app-browser
/** required: cordova-plugin-whitelist, cordova-plugin-inappbrowser **/
.directive("runAppBrowser", function(){
	return {
			controller: function($scope, $element, $attrs){
			$element.bind("click", runApp);
			function runApp(event)
			{
				var $href = $attrs.href || "http://fonebay.com/";
				var appBrowser = window.open($href,"_blank","hardwareback=Done,toolbarposition=top,location=yes");
	
				appBrowser.addEventListener("loadstart",function(){
					navigator.notification.activityStart("Please Wait", "Its loading....");
				});
	
	
				appBrowser.addEventListener("loadstop",function(){
					navigator.notification.activityStop();
				});
	
	
				appBrowser.addEventListener("loaderror",function(){
					navigator.notification.activityStop();
					window.location = "retry.html";
				});
	
	
				appBrowser.addEventListener("exit",function(){
					navigator.notification.activityStop();
				});
	
			};
		}
	};
})
// TODO: --|-------- run-webview
/** required: cordova-plugin-whitelist, cordova-plugin-inappbrowser **/
.directive("runWebview", function(){
	return {
			controller: function($scope, $element, $attrs){
			$element.bind("click", runApp);
			function runApp(event)
			{
				var $href = $attrs.href || "http://fonebay.com/";
				var appWebview = window.open($href,"_blank","location=no,toolbar=no");
			
				appWebview.addEventListener("loadstart",function(){
					navigator.notification.activityStart("Please Wait", "Its loading....");
				});
			
			
				appWebview.addEventListener("loadstop",function(){
					navigator.notification.activityStop();
				});
			
			
				appWebview.addEventListener("loaderror",function(){
					navigator.notification.activityStop();
					window.location = "retry.html";
				});
			
			
				appWebview.addEventListener("exit",function(){
					navigator.notification.activityStop();
				});
			
			};
		}
	};
})
// TODO: --|-------- run-social-sharing
/** required: cordova-plugin-whitelist, cordova-plugin-inappbrowser **/
.directive("runSocialSharing", function($ionicActionSheet, $timeout){
	return {
			controller: function($scope, $element, $attrs){
			$element.bind("click", showSocialSharing);
			function showSocialSharing(event)
			{
				var hideSheet = $ionicActionSheet.show(
				{
					titleText: 'Share This',
					buttons: [
						{ text: '<i class="icon ion-social-facebook"></i> <b>Facebook</b>'},
						{ text: '<i class="icon ion-social-twitter"></i> <b>Twitter</b>'},
						{ text: '<i class="icon ion-social-whatsapp"></i> <b>Whatsapp</b>'},
						{ text: '<i class="icon ion-ios-chatbubble"></i> <b>Line</b>'},
						],
					cancelText: 'Cancel',
					cancel: function(){
						// add cancel code.
					},
					buttonClicked: function(index)
					{
						switch (index)
						{
							case 0:
								var textMessage = window.encodeURIComponent($attrs.message) || "";
								if (ionic.Platform.isIOS()){
									var urlSchema = "fb://faceweb/f?href=https://facebook.com/sharer/sharer.php?u=" + textMessage;
								}else if(ionic.Platform.isAndroid()){
									var urlSchema = "fb://faceweb/f?href=https://facebook.com/sharer/sharer.php?u=" + textMessage;
								}else{
									var urlSchema = "https://facebook.com/sharer/sharer.php?u=" + textMessage;
								}
								window.open(urlSchema, "_system", "location=yes");
								break;
							case 1:
								var textMessage = window.encodeURIComponent($attrs.message) || "";
								var urlSchema = "twitter://post?message=" + textMessage;
								window.open(urlSchema, "_system", "location=yes");
								break;
							case 2:
								var textMessage = window.encodeURIComponent($attrs.message) || "";
								var urlSchema = "whatsapp://send?text=" + textMessage;
								window.open(urlSchema, "_system", "location=yes");
								break;
							case 3:
								var textMessage = window.encodeURIComponent($attrs.message) || "";
								var urlSchema = "line://msg/text/" + textMessage;
								window.open(urlSchema, "_system", "location=yes");
								break;
						}
					}
				});
				$timeout(function()
				{
					hideSheet();
				}, 5000); 
			};
		}
	};
})




				


document.onclick = function (e){
	e = e ||  window.event;
	var element = e.target || e.srcElement;
	if (element.target == "_system") {
		window.open(element.href, "_system", "location=yes");
		return false;
	}

	if (element.target == "_blank") {
		var appBrowser = window.open(element.href, "_blank", "hardwareback=Done,hardwareback=Done,toolbarposition=top,location=yes");
	
		appBrowser.addEventListener("loadstart",function(){
			navigator.notification.activityStart("Please Wait", "Its loading....");
		});
	
		appBrowser.addEventListener("loadstop",function(){
			navigator.notification.activityStop();
		});
	
		appBrowser.addEventListener("loaderror",function(){
			navigator.notification.activityStop();
			window.location = "retry.html";
		});
	
		appBrowser.addEventListener("exit",function(){
			navigator.notification.activityStop();
		});
		return false;
	}

	if (element.target == "_self") {
		var appWebview = window.open(element.href, "_blank","location=no,toolbar=no");
	
		appWebview.addEventListener("loadstart",function(){
			navigator.notification.activityStart("Please Wait", "Its loading....");
		});
	
		appWebview.addEventListener("loadstop",function(){
			navigator.notification.activityStop();
		});
	
		appWebview.addEventListener("loaderror",function(){
			navigator.notification.activityStop();
			window.location = "retry.html";
		});
	
		appWebview.addEventListener("exit",function(){
			navigator.notification.activityStop();
		});
		return false;
	}
};

document.addEventListener("deviceready",function(){
	var admobid = {};
	admobid = {
		banner: "ca-app-pub-3940256099942544/1033173712",
		interstitial: "ca-app-pub-3940256099942544/5224354917",
	};
			

	admob.banner.config({
		id: admobid.banner,
		autoShow: true,
	});
	admob.banner.prepare();


	admob.interstitial.config({
		id: admobid.interstitial,
		autoShow: true,
	});
	admob.interstitial.prepare();

}, false);

