/* GLOBAL OBJECT FOR METHODS AVAILABLE FROM EVERYWHERE */
if(GLB) console.log("ERROR: GLB is a singleton!");
var GLB = {};
GLB._mobileBreakpointW = 767.5;
GLB._isMobile = false;
GLB._vw = 0, GLB._vh = 0; //Current viewport size
GLB._maxResH = screen.height;
GLB._oldvwOuter = 0;
GLB._vwOuter = 0; //Viewport including (optional) scrollbars. Use this value for aligning with css media queries
GLB._reliableSh = 0; //Touch screens where browserbar hides when scrolling. Use this value for reliable and "constant" values (while not resizing)
GLB._zoom = 1;
GLB._bodyRect;
GLB._layoutUpdateTimer;
var _UA = window.navigator.userAgent;
//Detection
GLB._iOS = /(iPad|iPhone|iPod)/g.test(_UA);
GLB._iosAndChrome = false;
if(GLB._iOS){
	if(_UA.match('CriOS')) GLB._iosAndChrome = true;
}
GLB._androidVersion = 0, GLB._chromeVersion, GLB._iOSVersion = 0;
GLB._isSafari = /^((?!chrome|android).)*safari/i.test(_UA);
GLB._firefox = _UA.indexOf('Firefox') > -1;
GLB._isIEVersion = 11;
function detectIE() {
	var msie = _UA.indexOf('MSIE ');
	if (msie > 0) {
		// IE 10 or older => return version number
		GLB._isIEVersion = parseInt(_UA.substring(msie + 5, _UA.indexOf('.', msie)), 10);
		return true;
	}
	var trident = _UA.indexOf('Trident/');
	if (trident > 0) {
		// IE 11 => return version number
		var rv = _UA.indexOf('rv:');
		GLB._isIEVersion = parseInt(_UA.substring(rv + 3, _UA.indexOf('.', rv)), 10);
		return true;
	}
	var edge = _UA.indexOf('Edge/');
	if (edge > 0) {
		// Edge (IE 12+) => return version number
		GLB._isIEVersion = parseInt(_UA.substring(edge + 5, _UA.indexOf('.', edge)), 10);
		return true;
	}
	// other browser
	return false;
}
GLB._isIE = detectIE();
GLB._supportsPointerEvents = ("pointerEvents" in document.documentElement.style);
GLB._isTouch = "ontouchstart" in window;
GLB._dpi = window.devicePixelRatio;
//Scroll
GLB._windowScrollY = 0;
GLB._windowScrollTweenedY = 0;
GLB._oldIE = false;
if(GLB._isIE && GLB._isIEVersion < 16) GLB._oldIE = true;

GLB._thresholdSwipe = 4;
GLB._supportsClassList = true;
function setSCL(){
	var _d = document.createElement("div");
	try{_d.classList.add("name");}
	catch(e){GLB._supportsClassList=false;}
}
setSCL();

//Disable scroll offset remembered by browser
/*try{
	if('scrollRestoration' in history){
	  // Back off, browser, I got this...
	  history.scrollRestoration = 'manual';
	}
}
catch(e){}*/

//Set repaint while scrolling
if(GLB._isTouch){
	if(GLB._iOS){
		//iOS version
		var _av = navigator.appVersion;
		var v = (_av).match(/OS (\d+)_(\d+)_?(\d+)?/);
		var ver = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
		GLB._iOSVersion = ver[0];
		//Chrome from version 48 repaints
		var _chromeVersion = 47;
		if(GLB._iosAndChrome){
			try{_chromeVersion = parseInt(_av.substr(_av.indexOf("CriOS/")+6, 2)) || 47;}
			catch(e){}
		}
	}
	else{
		//Android version
		var ua = _UA.toLowerCase();
	    var match = ua.match(/android\s([0-9\.]*)/);
		GLB._chromeVersion = 61;
		try{GLB._chromeVersion = parseInt(ua.substr(ua.indexOf("chrome/")+7,2));}
		catch(e){}
		if(match){
			var _androidVersion = match ? match[1] : false;
			GLB._androidVersion = parseFloat(_androidVersion);
			//Maybe we are on Windows (Surface etc.) so remember to check if (GLB._androidVersion > 0)
		}
	}
}
// Test via a getter in the options object to see if the passive property is accessed
var _supportsPassive = false;
try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function() {
      _supportsPassive = true;
    }
  });
  window.addEventListener("testPassive", null, opts);
  window.removeEventListener("testPassive", null, opts);
} catch (e) {}
//console.log("_supportsPassive", _supportsPassive);

GLB._supportsAutoPlay = true;
if(GLB._isTouch && ((GLB._iOS && GLB._iOSVersion < 10) || (!GLB._iOS && GLB._androidVersion < 5))) GLB._supportsAutoPlay = false;
else if(GLB._isTouch && !GLB._iOS && GLB._chromeVersion < 53) GLB._supportsAutoPlay = false;
//GLB._supportsAutoPlay = true;//debug

GLB._isBot = (_UA.indexOf("bot") != -1);
//GLB._isBot = true;//debug;

/*		Handle viewport size		*/
//Measure screen size
GLB.screensize = function(){
	if(window.innerWidth) GLB._vw = window.innerWidth, GLB._vh = window.innerHeight;
	else GLB._vw = document.documentElement.offsetWidth, GLB._vh = document.documentElement.offsetHeight;
	GLB._vwOuter = GLB._vw;
}
//Store sizes
GLB.resized = function(e){	
	GLB._oldvwOuter = GLB._vwOuter;
	GLB.screensize();
	//Cancel for touchscreens with same width (user just scrolling and topbar hiding/showing). But only if page is not transitioning (because otherwise we need the layoutUpdate)
	if(e && GLB._isTouch && GLB._oldvwOuter === GLB._vwOuter && !_pageTransitions){
		e.stopImmediatePropagation();
		return;
	}
	
	//Browser zoom level
	if(window.innerWidth > window.innerHeight) GLB._zoom = Math.max(window.screen.width, window.screen.height) / window.innerWidth;
	else GLB._zoom = Math.min(window.screen.width, window.screen.height) / window.innerWidth;
	GLB._zoom = Math.min(GLB._zoom, 1);
//	GLB._vw *= GLB._zoom, GLB._vh *= GLB._zoom;
//	GLB._vwOuter *= GLB._zoom;
	
	if(!GLB._isTouch){
		GLB.checkBodyW();
		GLB._reliableSh = GLB._vh;
	}
	else{
		//Touch screens screen height is variable on some platforms, because the browser bar changes height
		if(GLB._vh < GLB._vw) GLB._reliableSh = Math.min(window.screen.availWidth, window.screen.availHeight);
		else GLB._reliableSh = Math.max(window.screen.availWidth, window.screen.availHeight);
		if(GLB._iOS){
			if(navigator.standalone) GLB._reliableSh = GLB._vh;//fullscreen web app
			else if(GLB._iosAndChrome && Math.max(GLB._vw, GLB._vh) > 900) GLB._reliableSh -= 20;//chrome iPad ios10
			else if(Math.max(GLB._vw, GLB._vh) > 900) GLB._reliableSh -= 39; //iPad ios10
			else GLB._reliableSh -= 20; //iPhone optimized for Safari iOS8&9
		}
		else{
			if(Math.max(GLB._vw, GLB._vh) > 600) GLB._reliableSh -= 65; //Assume large screen (Pixel 2 etc.)
			else GLB._reliableSh -= 24; //Other Android devices
		}
	}
	//Update scroll value
	GLB.scrolled(null);
	//Is this mobile or desktop layout
	GLB._isMobile = (GLB._vwOuter < GLB._mobileBreakpointW);
	clearTimeout(GLB._layoutUpdateTimer);
	GLB._layoutUpdateTimer = setTimeout(GLB.dispatchUpdate, 60);
}
//Check for scrollbars and adjust _vw and force resize event
GLB.checkBodyW = function(){
	GLB._bodyRect = document.body.getBoundingClientRect(); //Used for getting actual width without scrollbars
	var _wDif = Math.abs(GLB._bodyRect.width - GLB._vwOuter);
	if(_wDif > 2 && _wDif < 100) GLB._vw = GLB._bodyRect.width;
}
GLB.dispatchUpdate = function(){
	//console.log("dispatchUpdate", GLB._windowScrollY);
	window.dispatchEvent(GLBCustomEvent("LayoutUpdate", 0));
}
/*		Scroll handler to save window scrollTop		*/
GLB.scrolled = function(e){
	GLB._windowScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	if(GLB._isTouch || GLB._isBot) GLB._windowScrollTweenedY = GLB._windowScrollY; //Touch uses same value (desktop is set from Scroller)
}
GLB.offsetY = function(_el){
	return _el.getBoundingClientRect().top + GLB._windowScrollY;
}
/*		Event handling		*/
//Custom events with detail parameter >=IE9
function GLBEventsInit(){
	var _oldBrowser = window.XDomainRequest ? true : false;
	if(GLB._isIE && GLB._isIEVersion >= 11) _oldBrowser = true;
	if(_oldBrowser){
		//console.log("Is old browser");
		(function () {
			function CustomEvent ( event, params ) {
				params = params || { bubbles: false, cancelable: false, detail: undefined };
				var evt = document.createEvent( 'CustomEvent' );
				evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
				return evt;
			};
			CustomEvent.prototype = window.Event.prototype;
			window.CustomEvent = CustomEvent;
		})();
	}
}
GLBEventsInit();
function GLBCustomEvent(_name, _id){
	var e;
	if(window.CustomEvent) e = new CustomEvent(_name, {bubbles:true,cancelable:true,detail:_id});
	else{
		e = document.createEvent('Event');
		e.initEvent(_name, true, true, {detail:_id});
		e.detail = _id;
	}
	return e;
}
//Global event handler method
function GLBEvents(elem,eventType,handler,add){
	if(add){
		if(elem.addEventListener){
			if(eventType == "scroll") elem.addEventListener(eventType,handler, _supportsPassive ? { passive: true } : false); //Scroll listeners on this site NEVER calls preventDefault
			else elem.addEventListener(eventType,handler,false);
		}
		 else if(elem.attachEvent) elem.attachEvent('on'+eventType,handler);
	}
 	else{
		if(elem.removeEventListener){
			if(eventType == "scroll") elem.removeEventListener(eventType,handler, _supportsPassive ? { passive: true } : false);
			else elem.removeEventListener(eventType,handler,false);
		}
		 else if(elem.detachEvent) elem.detachEvent('on'+eventType,handler);
	}
}
/*		Image object		*/
function GLBImage(_url, _holder, _w, _h, _className, onloadCallback, _insertBefore){
	var _this = this;
	var _img,_rel,_imgW,_imgH;
	if(_w&&_h) _img = new Image(_w, _h);
	else _img = new Image();
	_this.img = _img;
	if(_className) _img.className = _className;
	else _img.style.position = "absolute";
	function loaded(e){
		if(!_w||!_h) _imgW = _w = _img.naturalWidth, _imgH = _h = _img.naturalHeight;
		_rel = _w/_h;
		if(onloadCallback) onloadCallback.call(_this, e);
	}
	_this.load = function(){
		_img.onload = loaded;
		_img.src = _url;
		//Prevent dragging
		_img.onmousedown = function(e){
			if(e && e.preventDefault) e.preventDefault();
		}
		if(_holder){
			if(_insertBefore) _holder.insertBefore(_img, _holder.firstChild);
			else _holder.appendChild(_img);
		}
	}
	_this.reload = function(_newurl, _fade){
		if(_newurl == _url) return;
		_img.className = _className + " quick";
		if(_fade) _img.style.opacity = 0;
		TweenLite.delayedCall(.05, loadNew, [_newurl]);
	}
	function loadNew(_newurl){
		_img.className = _className;
		_img.src = _newurl;
		_url = _newurl;
	}
	_this.destroy = function(){
		try{
			if(_holder) _holder.removeChild(_img);
		}
		catch(e){}
		_img.src = "";
		onloadCallback = null;
		_img = null;
	}
}

function getImageInSize(_in){
	if(GLB._vw > 1200 && GLB._dpi > 1.5/* || GLB._vw > 1600*/) return _in[1];//Retina desktop, no larger images for larger screens, because very few images are stretched to fill screen (but grid instead)
	else if(GLB._vw > GLB._mobileBreakpointW) return _in[0];//Normal desktop
	return _in[2];
}

/*Overwrite link behaviour for SPA */
function overWriteLink(_a, _supressDown){
	var _this = this;
	var _href = _a.getAttribute("href") || "";
	if(_href.indexOf("http") != -1 || _href.indexOf("mailto") != -1) return; //absolute path or email
	function clicked(e){
		try{e.preventDefault(), e.stopImmediatePropagation();}
		catch(e){}
		_router.setUrl(_href);
	}
	function dragstart(e){
		e.preventDefault();
	}
	function down(e){
		try{/*e.preventDefault(), */e.stopImmediatePropagation();} //Don't preventdefault on touch - then click doesn't work
		catch(e){}
	}
	if(_supressDown){
		GLBEvents(_a, "mousedown", down, true);
		GLBEvents(_a, "touchstart", down, true);
	}
	GLBEvents(_a, "click", clicked, true);
	GLBEvents(_a, "dragstart", dragstart, true);
	_this.destroy = function(){
		GLBEvents(_a, "click", clicked, false);
		GLBEvents(_a, "dragstart", dragstart, false);
		if(_supressDown){
			GLBEvents(_a, "mousedown", down, false);
			GLBEvents(_a, "touchstart", down, false);
		}
	}
}
function cloneDiv(_target, _class){
	var _clone = _target.cloneNode(true);
	if(_class) _clone.className = _class;
	return _clone;
}

function GLBScrollModule(_module, _element, _parallax, _ignoreBtns){
	var _inView = false, _inProximity = false, _started = false, _playing = false, _active = false, _preloaded = false, _preloadTimerInit = false, _paused = true;
	var _initTimer, _forceUpdateTimer, _preloadTimer;
	var _this = this;
		var _instance = new _module(_element);
	_this._instance = _instance;
	var _outlineBtns = _element.getElementsByClassName("outlineBtn");
	var _outlineBtn;
	var _hasOutLineBtn = false;
	if(_outlineBtns.length > 0 && !_ignoreBtns){
		_outlineBtn = new OutlineBtn(_outlineBtns[0]);
		_hasOutLineBtn = true;
	}
	var _cleanBtns = _element.getElementsByClassName("cleanBtn");
	var _cleanBtn;
	var _hasCleanBtn = false;
	if(_cleanBtns.length > 0 && !_ignoreBtns){
		_cleanBtn = new CleanBtn(_cleanBtns[0]);
		_hasCleanBtn = true;
	}
	
	function resized(e){
		try{_instance.resized();}
		catch(e){}
	}
	function layoutUpdate(e){
		clearTimeout(_forceUpdateTimer);
		_instance.layoutUpdate(), scrolled();
		//Check offset - if too small the DOM is not ready yet (but it should be, because jQuery fired "ready")
		if(_instance.moduleTop+GLB._reliableSh < 0) /*console.log("Force delayed offset update", _instance.moduleTop, GLB._reliableSh),*/ _forceUpdateTimer = setTimeout(layoutUpdate, 2000);
	}
	
	//Scroll listener for starting/stopping
	function scrolled(e){
		if(_paused){
			//console.log("ON PAUSE!!!");
			return; //Important!
		}
		//Check if module is in view
		//When GLB._windowScrollTweenedY > _instance.moduleBottom the module has scrolled further up
		//When GLB._windowScrollTweenedY < _instance.moduleTop the module has not scrolled far enough down
		if(GLB._windowScrollTweenedY > _instance.moduleTop && GLB._windowScrollTweenedY < _instance.moduleBottom) _inView = true;
		else _inView = false;
		//Manage being close enough to screen that some elements need preload etc.
		if(GLB._windowScrollTweenedY > _instance.moduleTop-_instance.moduleProximity && GLB._windowScrollTweenedY < _instance.moduleBottom+_instance.moduleProximity) _inProximity = true;
		else _inProximity = false;
		if(!_preloaded && !_preloadTimerInit && _inProximity) preload();//Check proximity to see if instance is close to view
		
		if(_inView){
			if(!_started) start();//Render module
		}
		else if(_started) stop();//Stop rendering, because module is out of view
		//Parallax
		if(_inProximity && _parallax) _instance.scrolled();
	}
	
	//Start/stop controlled by scroll
	function stop(){
		if(_playing) _instance.stop();
		if(_hasOutLineBtn) _outlineBtn.stop();
		if(_hasCleanBtn) _cleanBtn.stop();
		_started = _playing = _preloadTimerInit = false;
		//clearTimeout(_initTimer);
		TweenLite.killTweensOf(realStart);
		//clearTimeout(_preloadTimer);
		TweenLite.killTweensOf(realPreload);
	}
	function start(){
		_started = true;
		//Delay before starting module (in case user continue to scroll)
		TweenLite.killTweensOf(realStart);
		TweenLite.delayedCall(_instance.initDelay*.001, realStart); 
		//clearTimeout(_initTimer);
//		_initTimer = setTimeout(realStart, _instance.initDelay);
		try{_instance.prestart();}
		catch(e){}
	}
	function realStart(){
		_instance.start();
		if(_hasOutLineBtn) _outlineBtn.start();
		if(_hasCleanBtn) _cleanBtn.start();
		_playing = true;
	}
	function preload(){
		_preloadTimerInit = true;
		//Delay before starting module (in case user continue to scroll)
		TweenLite.killTweensOf(realPreload);
		TweenLite.delayedCall(_instance.initDelay*.001, realPreload); 
//		clearTimeout(_preloadTimer);
//		_preloadTimer = setTimeout(realPreload, _instance.initDelay);
	}
	function realPreload(){
		_preloaded = true;
		_instance.preload();
	}
	
	_this.resume = function(){
		_paused = false;
		try{
			_instance.resume();
			if(_hasOutLineBtn) _outlineBtn.resume();
			if(_hasCleanBtn) _cleanBtn.resume();
		}
		catch(e){}
		if(GLB._isTouch || GLB._isBot) GLBEvents(window, "scroll", scrolled, true);
		else TweenLite.ticker.addEventListener("tick", scrolled);
		GLBEvents(window, "resize", resized, true);
		GLBEvents(window, "LayoutUpdate", layoutUpdate, true);
		scrolled();
	}
	_this.pause = function(){
		_paused = true;
		if(GLB._isTouch || GLB._isBot) GLBEvents(window, "scroll", scrolled, false);
		else TweenLite.ticker.removeEventListener("tick", scrolled); 
		GLBEvents(window, "resize", resized, false);
		GLBEvents(window, "LayoutUpdate", layoutUpdate, false);
		clearTimeout(_forceUpdateTimer);
		stop();
		try{
			_instance.pause();
			if(_hasOutLineBtn) _outlineBtn.pause();
			if(_hasCleanBtn) _cleanBtn.pause();
		}
		catch(e){}
	}
	_this.destroy = function(){
		_this.pause();
		_instance.destroy();
		_instance = null;
	}
	//Init
	_this.resume();
}
function OutlineBtn(_me, _skipEvents){
	//console.log("New OutlineBtn");
	var _this = this;
	var _inactive = false;
	
	//Detect if this is used for inpage scrolling
	var _targetForWindowScroll = _me.getAttribute("data-scroll") || "";
	if(_targetForWindowScroll != ""){
		//console.log("On click we should jump to:", _targetForWindowScroll);
		_skipEvents = true;
		GLBEvents(_me, "click", jumToSection, true);
	}
	function jumToSection(e){
		try{
			e.preventDefault(), e.stopImmediatePropagation();
			var _target = document.getElementById(_targetForWindowScroll);
			TweenLite.to(window, .4, {scrollTo:{y:_target.offsetTop, autoKill:!GLB._isTouch}, ease:Cubic.easeInOut});
		}
		catch(e){}
	}
	if(!_skipEvents) overWriteLink(_me);
	//Create arrow
	var _arrow = document.createElement("div");
	_arrow.className = "arrow";
	_me.appendChild(_arrow);
	var _arrowP = document.createElement("div");
	_arrowP.className = "arrow white";
	TweenLite.set(_arrowP, {x:-32, opacity:0, transformOrigin:"0 0"});
	_me.appendChild(_arrowP);
	var _animIn = false;
	
	function reset(){
		if(GLB._isBot) return;
		if(GLB._supportsClassList) _me.classList.add("tempHide");
		
		for(var i=0;i<4;++i){
			TweenLite.killTweensOf(_staticborders[i]);
			if(i == 0 || i == 3) TweenLite.set(_staticborders[i], {scaleY:0, transformOrigin:"0 100%"});
			else TweenLite.set(_staticborders[i], {scaleX:0, transformOrigin:"0 0"});
		}
	}
	_this.start = function(_d){
		if(GLB._isBot) return;
		if(!_d) _d = 1;
		if(_animIn) return;
		_animIn = true;
		reset();
		
		//Borders
		for(var i=0;i<4;++i) TweenLite.killTweensOf(_staticborders[i]);
		TweenLite.to(_staticborders[0], .3, {delay:_d, scaleY:1, transformOrigin:"0 100%", ease:Quad.easeIn});//left
		TweenLite.to(_staticborders[1], .4, {delay:_d+.1, scaleX:1, transformOrigin:"0 0", ease:Quad.easeOut, onStart:showContent});//bottom
		TweenLite.to(_staticborders[2], .5, {delay:_d+.3, scaleX:1, transformOrigin:"0 0", ease:Quad.easeOut});//top
		TweenLite.to(_staticborders[3], .3, {delay:_d+.45, scaleY:1, transformOrigin:"0 100%", ease:Quad.easeOut, onComplete:animInOver});//right
	}
	function showContent(){
		if(GLB._supportsClassList) _me.classList.add("animIn"), _me.classList.remove("tempHide");
	}
	function animInOver(){
		if(GLB._supportsClassList) _me.classList.remove("animIn");
	}
	_this.stop = function(){
		
	}
	
	//Borders
	var _staticborders = [];
	var _borders = [];
	var _letter = ["a", "b", "c", "d"];
	for(var i=0;i<4;++i){
		var _sb = document.createElement("div");
		_sb.className = "staticborder " + _letter[i];
		var _b = document.createElement("div");
		_b.className = "border " + _letter[i];
		if(i == 0 || i == 3) TweenLite.set(_sb, {scaleY:0, transformOrigin:"0 100%"}), TweenLite.set(_b, {scaleY:0, transformOrigin:"0 100%"});
		else TweenLite.set(_sb, {scaleX:0, transformOrigin:"0 0"}), TweenLite.set(_b, {scaleX:0, transformOrigin:"0 0"});
		_me.appendChild(_sb);
		_me.appendChild(_b);
		
		_staticborders.push(_sb);
		_borders.push(_b);
	}
	
	var _overComplete = false, _outComplete = true, _animating = false, _mouseOver = false;
	GLBEvents(_me, "mouseenter", over, true);
	GLBEvents(_me, "mouseleave", out, true);
	function over(e){
		if(_inactive) return;
		_mouseOver = true;
		if(_outComplete) overAnim();
	}
	function overAnim(){
		if(_animating || _inactive) return;
		//Hide white arrow
		TweenLite.killTweensOf(_arrowP), TweenLite.killTweensOf(_arrow);
		TweenLite.to(_arrow, .3, {x:_arrowWidth, opacity:0, transformOrigin:"0 0", ease:Cubic.easeInOut});
		//Pink arrow
		TweenLite.set(_arrowP, {x:-_arrowWidth, opacity:0, transformOrigin:"0 0"});
		TweenLite.to(_arrowP, .6, {x:0, opacity:1, transformOrigin:"0 0", ease:Cubic.easeInOut, onComplete:overComplete});
		_overComplete = false;
		_animating = true;
		
		//Borders
		for(var i=0;i<4;++i) TweenLite.killTweensOf(_borders[i]);
		TweenLite.to(_borders[0], .15, {scaleY:1, transformOrigin:"0 100%", ease:Quad.easeIn});//left
		TweenLite.to(_borders[1], .25, {delay:.05, scaleX:1, transformOrigin:"0 0", ease:Quad.easeOut});//bottom
		TweenLite.to(_borders[2], .25, {delay:.15, scaleX:1, transformOrigin:"0 0", ease:Quad.easeOut});//top
		TweenLite.to(_borders[3], .15, {delay:.3, scaleY:1, transformOrigin:"0 100%", ease:Quad.easeOut});//right
	}
	function overComplete(){
		_overComplete = true;
		_animating = false;
		//Check for firing mouseout animation
		if(!_mouseOver) outAnim();
	}
	function out(e){
		_mouseOver = false;
		if(_overComplete) outAnim();
	}
	function outAnim(){
		if(_animating) return;
		//reverse
		TweenLite.killTweensOf(_arrowP), TweenLite.killTweensOf(_arrow);
		TweenLite.to(_arrowP, .5, {x:_arrowWidth, opacity:0, transformOrigin:"0 0", ease:Cubic.easeInOut});
		if(_overComplete) TweenLite.set(_arrow, {x:-_arrowWidth, opacity:0, transformOrigin:"0 0"});
		TweenLite.to(_arrow, .6, {x:0, opacity:1, transformOrigin:"0 0", clearProps:"all", ease:Cubic.easeInOut, onComplete:outComplete});
		_outComplete = false;
		_animating = true;
		
		//Borders
		for(var i=0;i<4;++i) TweenLite.killTweensOf(_borders[i]);
		TweenLite.to(_borders[0], .15, {scaleY:0, transformOrigin:"0 0", ease:Quad.easeIn});//left
		TweenLite.to(_borders[1], .25, {delay:.05, scaleX:0, transformOrigin:"100% 0", ease:Quad.easeOut});//bottom
		TweenLite.to(_borders[2], .25, {delay:.15, scaleX:0, transformOrigin:"100% 0", ease:Quad.easeOut});//top
		TweenLite.to(_borders[3], .15, {delay:.3, scaleY:0, transformOrigin:"0 0", ease:Quad.easeOut});//right
	}
	function outComplete(){
		_outComplete = true;
		_animating = false;
		//Check for firing mouseover animation
		if(_mouseOver) overAnim();
	}
	
	var _arrowWidth = 0;
	function layoutUpdate(){
		_arrowWidth = _arrow.offsetWidth;
	}
	_this.fakeLayoutUpdate = function(){
		layoutUpdate();
	}
	
	_this.resume = function(){
		GLBEvents(window, "LayoutUpdate", layoutUpdate, true);
		reset();
	}
	_this.pause = function(){
		GLBEvents(window, "LayoutUpdate", layoutUpdate, false);
		_animIn = false; //Allow animation again
	}
	_this.active = function(){
		_me.style.opacity = 1;
		_me.style.pointerEvents = "auto";
		_inactive = false;
	}
	_this.inactive = function(){
		_me.style.opacity = .5;
		_me.style.pointerEvents = "none";
		_inactive = true;
	}
}
function CleanBtn(_me){
	//console.log("New CleanBtn");
	var _this = this;
	overWriteLink(_me, true);//Used in work carousel
	//Create arrow
	var _arrow = document.createElement("div");
	_arrow.className = "arrow";
	_me.appendChild(_arrow);
	var _arrowP = document.createElement("div");
	_arrowP.className = "arrow white";
	TweenLite.set(_arrowP, {x:-32, opacity:0, transformOrigin:"0 0"});
	_me.appendChild(_arrowP);
	
	function reset(){
		if(GLB._isBot) return;
		TweenLite.killTweensOf(_me);
		TweenLite.set(_me, {opacity:0});
		TweenLite.set(_arrow, {x:-16});
	}
	var _animIn = false;
	
	_this.start = function(){
		//console.log("Start clearbtn", _animIn)
		if(_animIn) return;
		_animIn = true;
		if(GLB._isBot) return;
		TweenLite.killTweensOf(_me);
		TweenLite.to(_me, .6, {opacity:1, delay:.4, ease:Quad.easeOut});
		TweenLite.killTweensOf(_arrow);
		TweenLite.to(_arrow, .4, {x:0, transformOrigin:"0 0", delay:.4, ease:Quad.easeOut});
	}
	_this.stop = function(){
		
	}
	
	var _overComplete = false, _outComplete = true, _animating = false, _mouseOver = false;
	GLBEvents(_me, "mouseenter", over, true);
	GLBEvents(_me, "mouseleave", out, true);
	function over(e){
		_mouseOver = true;
		if(_outComplete) overAnim();
	}
	function overAnim(){
		if(_animating) return;
		//Hide white arrow
		TweenLite.killTweensOf(_arrowP), TweenLite.killTweensOf(_arrow);
		TweenLite.to(_arrow, .3, {x:_arrowWidth, opacity:0, transformOrigin:"0 0", ease:Cubic.easeInOut});
		//Pink arrow
		TweenLite.set(_arrowP, {x:-_arrowWidth, opacity:0, transformOrigin:"0 0"});
		TweenLite.to(_arrowP, .6, {x:0, opacity:1, transformOrigin:"0 0", ease:Cubic.easeInOut, onComplete:overComplete});
		_overComplete = false;
		_animating = true;
	}
	function overComplete(){
		_overComplete = true;
		_animating = false;
		//Check for firing mouseout animation
		if(!_mouseOver) outAnim();
	}
	function out(e){
		_mouseOver = false;
		if(_overComplete) outAnim();
	}
	function outAnim(){
		if(_animating) return;
		//reverse
		TweenLite.killTweensOf(_arrowP), TweenLite.killTweensOf(_arrow);
		TweenLite.to(_arrowP, .5, {x:_arrowWidth, opacity:0, transformOrigin:"0 0", ease:Cubic.easeInOut});
		if(_overComplete) TweenLite.set(_arrow, {x:-_arrowWidth, opacity:0, transformOrigin:"0 0"});
		TweenLite.to(_arrow, .6, {x:0, opacity:1, transformOrigin:"0 0", ease:Cubic.easeInOut, onComplete:outComplete});
		_outComplete = false;
		_animating = true;
	}
	function outComplete(){
		_outComplete = true;
		_animating = false;
		//Check for firing mouseover animation
		if(_mouseOver) overAnim();
	}
	
	var _arrowWidth = 0;
	function layoutUpdate(){
		_arrowWidth = _arrow.offsetWidth;
	}
	
	_this.resume = function(){
		//console.log("resume btn")
		GLBEvents(window, "LayoutUpdate", layoutUpdate, true);
		reset();
	}
	_this.pause = function(){
		//console.log("pause btn")
		GLBEvents(window, "LayoutUpdate", layoutUpdate, false);
		_animIn = false; //Allow animation again
		TweenLite.killTweensOf(_me);
	}
}
function forceResize(){
	GLB._vwOuter -= 1;
	if(GLB._isIE){
		var evt = document.createEvent("HTMLEvents");
	     evt.initEvent('resize', true, false);
	     window.dispatchEvent(evt);
	}
	else window.dispatchEvent(new Event("resize"));
}
function fireScroll(){
	window.dispatchEvent(GLBCustomEvent("scroll", 0));
}

/*		Init		*/
//Fires when all scripts have loaded
GLBEvents(window, "resize", GLB.resized, true);
GLB.resized(null);
GLBEvents(window, "scroll", GLB.scrolled, true);
console.log("Touch:", GLB._isTouch, "Dpi:", GLB._dpi);