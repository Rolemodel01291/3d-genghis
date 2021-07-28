function Main(){
	var _this = this;
	var _menu = new SiteMenu();
	var _content = document.getElementById("content");
	_scroller = new Scroller(_content);
	_maskEase = CustomEase.create("custom", "M0,0 C0.032,0.01 0.096,0.024 0.156,0.12 0.226,0.232 0.349,0.81 0.5,0.918 0.631,1.01 0.752,1 1,1");
	_pageTransition = new PageTransition();
	//var _cookies = new CookiePolicy();
	
	//Setup pages
	var _templates = [Home, FourZeroFour, /*JobPage,*/ TextPage/*terms*/, TextPage/*Sitemap*/, FAQPage/*faq*/]; //Client cannot change order of the pages!
	var _divs = document.getElementsByClassName("page");
	var _numTemplates = _templates.length;
	var _pages = [];
	for(var i=0;i<_numTemplates;++i){
		_pages.push(new PageTemplate(_templates[i], _divs[i]));
	}
	//Instantly build shared templates (case carousel, sign up etc.)
	//_sharedTemplates["caseCarousel"] = new GLBScrollModule(CaseCarousel, document.getElementsByClassName("casecarousel")[0], false);
	_sharedTemplates["newsletter"] = new GLBScrollModule(Newsletter, document.getElementsByClassName("signup")[0], false, true);
	
	//Page management
	var _activePage, _nextPage = -1, _paths;
	function pageChanged(e){
		_paths = _router.getPages();
		if(_paths[0] == "") _paths[0] = "/";
		for(var i=0;i<_numTemplates;i++){
			if(_pages[i]._url == _paths[0]){
				//console.log("Found page at:", i);
				newPage(i);
				return;
			}
		}
		//Fix old page links (from previous website - found by Google!)
		if(_paths[0] == "join-us") newPage(5);
		else if(_paths[0] == "join") newPage(5);
		else if(_paths[0] == "products") newPage(3);
		else if(_paths[0] == "project") newPage(4);
		else if(_paths[0] == "Opera") newPage(4);
		else newPage(8); //404
	}
	function newPage(i){
		//Animate overlay
		if(GLB._isMobile && _menu.isOpen()){
			_nextPage = i;
			readyForNextPage();
		}
		else{
			if(!_activePage) _nextPage = i, readyForNextPage(); //First page
			else{
				_pageTransition.animate(readyForNextPage, _nextPage < i);
				_nextPage = i;
			}
		}
	}
	function readyForNextPage(){
		if(_activePage) _activePage.stop();
		_activePage = _pages[_nextPage];
		_scroller.pageChange();
		_activePage.start();
		TweenLite.delayedCall(.07, forceResize); //Force resize in order for bounds and offsets to be read correctly 
		TweenLite.delayedCall(.5, fireScroll); //Trigger scroll, to make sure animations in headers are activated
		_menu.select(_nextPage-1);
	}
	function subPageChanged(e){
		try{_activePage.subpageChange();}
		catch(e){console.log("Couldn't call method subpageChange!");}
	}
	GLBEvents(window, "pageChange", pageChanged, true);
	GLBEvents(window, "subPageChange", subPageChanged, true);
	pageChanged(null);
	
	document.body.style.visibility = "visible";
}

function PageTransition(){
	var _this = this;
	
	var _me = document.createElement("div");
	_me.className = "pageTransition";
	TweenLite.set(_me, {x:-GLB._vwOuter, force3D:true});
	document.body.appendChild(_me);
	
	var _logo = document.getElementsByClassName("logo")[0];
	
	var _callback;
	_this.animate = function(_cb, _fromLeft){
		_me.style.visibility = "visible";
		_callback = _cb;
		TweenLite.killTweensOf(_me);
		if(!_pageTransitions){
			if(!_fromLeft) TweenLite.set(_me, {x:-GLB._vwOuter, force3D:true});
			else TweenLite.set(_me, {x:GLB._vwOuter, force3D:true});
		}
		//TweenLite.to(_me, .45, {delay:0, x:0, force3D:true, ease:Quart.easeIn, onComplete:firstPartOver});
		TweenLite.to(_me, .3, {delay:0, x:0, force3D:true, ease:Quad.easeIn, onComplete:firstPartOver});
		if(!_fromLeft) TweenLite.to(_me, 1.0, {delay:.35, x:GLB._vwOuter, force3D:true, ease:Expo.easeOut, onComplete:animOver});//.55
		else TweenLite.to(_me, 1.0, {delay:.35, x:-GLB._vwOuter, force3D:true, ease:Expo.easeOut, onComplete:animOver});
		_pageTransitions = true;
		
		if(GLB._supportsClassList) _logo.classList.add("pagetransition");
	}
	function firstPartOver(){
		if(_callback) _callback.call();
	}
	function animOver(){
		_me.style.visibility = "hidden";
		_pageTransitions = false;
		if(GLB._supportsClassList) _logo.classList.remove("pagetransition");
	}
}

function SiteMenu(){
	var _this = this;
	
	_this.isOpen = function(){
		if(!_burger) return true;
		return _burger._menuOpen;
	}
	//Top menu
	// var _topMenu = document.getElementsByClassName("mainmenu")[0];
	// var _topLinks = _topMenu.getElementsByTagName("a");
	// var _numL = _numTopLinks = _topLinks.length;
	// for(var i=0;i<_numL;++i){
	// 	overWriteLink(_topLinks[i]);
	// 	if(!GLB._isMobile){
	// 		TweenLite.set(_topLinks[i], {x:8, opacity:0});
	// 		TweenLite.to(_topLinks[i], .8, {x:0, opacity:1, ease:Cubic.easeInOut, delay:1.8+i*.1, clearProps:"x"});
	// 	}
	// }
	
	//Footer
	var _footer = document.getElementsByTagName("footer")[0];
	var _relevantDiv = _footer.getElementsByClassName("onsite")[0];
	var _footerLinks = _relevantDiv.getElementsByTagName("a");
	_numL = _footerLinks.length;
	for(var i=0;i<_numL;++i) overWriteLink(_footerLinks[i]);
			
	var _logos = document.getElementsByClassName("logo");
	var _topLogo = _logos[0];
	overWriteLink(_topLogo);
	_topLogo.style.opacity = 1; //Intro animin
	//Copy svg logo
	var _bottomLogo = _logos[1];
	_bottomLogo.appendChild(cloneDiv(_topLogo.getElementsByClassName("logosvg")[0]));
	
	//Manage mobile vs desktop appearance
	function resized(e){
		if(GLB._isMobile){
			// if(!_burger) _burger = new BurgerIcon(_topMenu);
		}
	}
	GLBEvents(window, "resize", resized, true);
	resized(null);
	
	var _burger;	
	var _prevSelectedId = -1;
	_this.select = function(_id){
		//console.log("select", _id)
		if(!GLB._supportsClassList) return;
		if(_prevSelectedId != -1 && _prevSelectedId < _numTopLinks) _topLinks[_prevSelectedId].classList.remove("selected");
		if(_id != -1 && _id < _numTopLinks) _topLinks[_id].classList.add("selected");
		_prevSelectedId = _id;
	}
}

function BurgerIcon(_parent){
	var _this = this;
	_this._menuOpen = false;
	
	var _bg = document.createElement("div");
	_bg.className = "mobileBg";
	
	var _icon = document.createElement("div");
	_icon.className = "burger";
	var _lineA = document.createElement("div"), _lineB = document.createElement("div"), _lineC = document.createElement("div");
	_lineA.className = _lineB.className = _lineC.className = "line";
	_icon.appendChild(_lineA), _icon.appendChild(_lineB), _icon.appendChild(_lineC);
	GLBEvents(_icon, "touchstart", tap, true);
	GLBEvents(_icon, "mousedown", tap, true);
	
	
	function tap(e){
		try{e.preventDefault();e.stopPropagation();}
		catch(e){console.log("ERROR Burgericon");}
		
		if(_this._menuOpen){
			closeMenu();
		}
		else{
			_this._menuOpen = true;
			if(GLB._supportsClassList) document.body.classList.add("mobilemenuopen");
			//Listen for pagechange
			GLBEvents(window, "pageChange", pageChanged, true);
			GLBEvents(window, "subPageChange", pageChanged, true);
		}
	}
	function pageChanged(e){
		closeMenu();
	}
	function closeMenu(){
		_this._menuOpen = false;
		GLBEvents(window, "pageChange", pageChanged, false);
		GLBEvents(window, "subPageChange", pageChanged, false);
		if(GLB._supportsClassList) document.body.classList.remove("mobilemenuopen");
	}
	
	_parent.insertBefore(_bg, _parent.firstChild);
	_parent.appendChild(_icon);
	
	//Anim in
	TweenLite.delayedCall(1.0, animIn); //Force resize in order for bounds and offsets to be read correctly 
	function animIn(){
		if(GLB._supportsClassList) _icon.classList.add("animedIn");
	}
}

function Scroller(_me){
	var _this = this;
	_this._speed = .1;
	var _totalHeight = GLB._vh, _oldTotalHeight = 0;
	
	//Speed up for work->case study
	_this.speedUp = function(_delay){
		_this._speed = 1;
		TweenLite.to(_this, .4, {_speed:.1, delay:_delay, ease:Cubic.easeOut});
	}
	
	//Handle touch/no-touch for managin scroll and layout
	//GLB._isTouch = true;//debug
	var _noTouch = false;
	if(!GLB._isTouch && !GLB._isBot){
		if(GLB._supportsClassList) document.body.classList.add("noTouch");
		_noTouch = true;
	}
		
	//Handle scroll for no-touch
	var _engineOn = false;
	var _frameCounter = 0;
	if(_noTouch) GLBEvents(window, "scroll", scrolled, true);
				
	function scrolled(e){
		if(!_engineOn) _engineOn = true, TweenLite.ticker.addEventListener("tick", scrollEngine, this, false, 1); //Extremely important to have priority on this scroll listener!
	}
	function scrollEngine(e){
		GLB._windowScrollTweenedY += (GLB._windowScrollY-GLB._windowScrollTweenedY) * _this._speed;
		//Check for stopping engine (only once per second)
		_frameCounter++;
		if((_frameCounter%20 == 0) && Math.abs(GLB._windowScrollTweenedY - GLB._windowScrollY) < .1){
			//console.log("Stop scroll engine");
			GLB._windowScrollTweenedY = GLB._windowScrollY;
			_engineOn = false, TweenLite.ticker.removeEventListener("tick", scrollEngine);
		}
		//Render
		TweenLite.set(_me, {y:-GLB._windowScrollTweenedY, force3D:true});
	}
	if(_noTouch) scrolled(null);
	
	_this.pageChange = function(_cachedPosition){
		if(_cachedPosition && _cachedPosition > 0) window.scrollTo(0,_cachedPosition), GLB._windowScrollTweenedY = GLB._windowScrollY = _cachedPosition;
		else window.scrollTo(0,0), GLB._windowScrollTweenedY = GLB._windowScrollY = 0;
		if(_engineOn) _engineOn = false, TweenLite.ticker.removeEventListener("tick", scrollEngine);
	}
	
	function resized(e){
		if(_noTouch) GLB._windowScrollTweenedY = GLB._windowScrollY, TweenLite.set(_me, {y:-GLB._windowScrollTweenedY, force3D:true});
	}
	/*function dispatchLayout(){
		window.dispatchEvent(GLBCustomEvent("LayoutUpdate", 0));
	}*/
	function layoutUpdate(e){
		if(_noTouch){
			GLB._windowScrollTweenedY = GLB._windowScrollY, TweenLite.set(_me, {y:-GLB._windowScrollTweenedY, force3D:true});
			_totalHeight = _me.offsetHeight;
			document.body.style.height = _totalHeight + "px";
		}
	}
	GLBEvents(window, "resize", resized, true);
	GLBEvents(window, "LayoutUpdate", layoutUpdate, true);
	resized(null);
}

function Router(){
	var _this = this;
	var _apiPrefix = "/";
	//Get prefix from BASE tag
	try{
		var _baseHref = document.getElementsByTagName('base')[0].href;
		if(_baseHref == "/"){}
		else if(_baseHref.indexOf("localhost") != -1) _apiPrefix = _baseHref.split("localhost")[1];
		else{
			var _afterDot = _baseHref.split(".");
			_apiPrefix = _afterDot[_afterDot.length-1].substr(_afterDot[_afterDot.length-1].indexOf("/"));
		}
	}
	catch(e){console.log("No base found!");}
	
	var _prefix = _apiPrefix;
	var _titlePrefix = document.getElementsByTagName('title')[0].textContent || "Verity Studios";
	
	var _useAPI = !!(window.history && history.pushState); //Check for History API; //History API or hash approach
	if(GLB._isTouch && (!GLB._iOS && GLB._androidVersion < 4.3 && GLB._androidVersion > 0)) _useAPI = false; //Detect old Android phones
	//_useAPI = false;//test
	
	var _firstTime = true;
	var _pages = [];
	var _gaPath = "";
	if(!_useAPI) _prefix = "#";
	var _oldUrl = "", _currentUrl = "", _previousPageUrls = [];
	console.log("_apiPrefix", _apiPrefix, "Router, history supported:", _useAPI);
	
	//Check that deeplink (if any) has same format
	var _firstUrl, _firstPath = window.location.pathname;
	var _firstHash = window.location.hash;
	if(_firstHash.length > 1){
		//Has deeplink with hash on start up
		if(_useAPI){
			_firstUrl = _firstHash.substr(1);
			window.location.href = window.location.href.split("#").join("");//refreshes page without hash
		}
		else _currentUrl = cleanUrl(window.location.hash || "");
	}
	else if(_firstPath.length > _apiPrefix.length){
		//Has deeplink without hash on start up
		if(!_useAPI){
			_firstUrl = _firstPath.substr(_apiPrefix.length);
			window.location = _apiPrefix + _prefix + _firstUrl; //refreshes page with hash
		}
		else _currentUrl = cleanUrl(window.location.pathname || "");
	}
	
	//Add slash in end
	if(_useAPI && _currentUrl.substr(_currentUrl.length-1) != "/") _currentUrl = _currentUrl+"/";
	
	//Respond to back/forward browser navigation
	function popstate(e){
		respondToState();
	}
	if(_useAPI) popstate(), GLBEvents(window, "popstate", popstate, true);
	
	//Respond to hash change for older browsers
	function hashChanged(e){
		respondToState();
	}
	if(!_useAPI) hashChanged(), GLBEvents(window, "hashchange", hashChanged, true);
	
	
	//Set description meta tag
	var _descMeta;
	var _firstMetaTxt = "";
	_this.setMetaDescription = function(v){
		if(v == "") _this.resetMetaDescription();
		else _descMeta.content = v+"";
	}
	_this.resetMetaDescription = function(){
		_descMeta.content = _firstMetaTxt;
	}
	function findDescMeta(){
		var _tags = document.getElementsByTagName("meta");
		var _numElements = _tags.length;
		for(var i=0;i<_numElements;++i){
			if(_tags[i].name == "description"){
				_descMeta = _tags[i];
				_firstMetaTxt = _descMeta.content;
				return;
			}
		}
	}
	findDescMeta();
	
	//Set address
	_this.setUrl = function(_newstate){
		if(_newstate == "" || _newstate == "/") _newstate = _prefix;
		if(_useAPI){
			//console.log("new", _newstate);
			window.history.pushState({}, "", _newstate);
			respondToState();
		}
		else window.location.hash = _newstate;
	}
	
	//Parameters. These are always seen as strings
	_this._parameters = {};
	function readParameters(){
		//Reset all old keys
		_this._parameters = {};
		//Find first parameters
		var _location = window.location.href;
		var _paramOnInit = _location.split("?");
		if(_paramOnInit.length > 1){
			var _allParams = _paramOnInit[1].split("&");
			var _l = _allParams.length;
			var _par;
			for(var i = 0;i<_l;i++){
				_par = _allParams[i].split("=");
				_this._parameters[_par[0]] = _par[1];
			}
		}
	}
	readParameters();
	
	
	
	
	//Get address
	_this.getUrl = function(){
		return _currentUrl.toLowerCase();
	}
	_this.getFullUrl = function(){
		return _pages.join("/");
	}
	_this.getPages = function(){
		return _pages;
	}
	_this.init = function(){
		respondToState();
	}
	
	//Address was changed, get the url and dispatch global pageChange event
	function respondToState(){
		_oldUrl = _currentUrl;
		if(_useAPI) _currentUrl = cleanUrl(window.location.pathname || "");
		else _currentUrl = cleanUrl(window.location.hash || "");
		//Remove slash in beginning
		if(_currentUrl == "/") _currentUrl = "";
		else if(_currentUrl.indexOf("/") == 0) _currentUrl = _currentUrl.substr(1);
		//Add slash in end
		if(_currentUrl.substr(_currentUrl.length-1) != "/") _currentUrl = _currentUrl+"/";
		if(_allowCookies || _firstTime) track(); //Track first page. After that only when cookies have been accepted.
		setCanonical();
		readParameters();
		if(!_firstTime && _oldUrl == _currentUrl){
			//console.log("Same url firing statechange", _oldUrl);
			window.dispatchEvent(GLBCustomEvent("subPageChange", 0));
			return;
		}
		_firstTime = false;
		setTitle();
		//Pages listening can animIn/Out
		window.dispatchEvent(GLBCustomEvent("pageChange", 0));
	}
	function track(){
		//Track
		try{
			_gaPath = "";
			var _l = _pages.length;
			for(var i=0;i<_l;i++) _gaPath += "/"+_pages[i];
			ga('set', 'page', _gaPath);
			ga('send', 'pageview');
		}
		catch(e){
			console.log("Couldn't track GA!");
		}
	}
	var _canonical;
	function setCanonical(){
		//if(!GLB._isBot) return;
		if(_canonical){
			document.head.removeChild(_canonical);
			_canonical = null;
		}
		_canonical = document.createElement("link");
		_canonical.setAttribute("rel", "canonical");
		var _href = decodeURI(window.location.href).split("?")[0];//Ignore parameters
		_canonical.setAttribute("href", _href);
		document.head.appendChild(_canonical);
	}
	function setTitle(){
		if(_currentUrl == "" || _currentUrl == "/"){
			document.title = _titlePrefix;
			return;
		}
		try{
			var _tAr = _currentUrl.split("/"), _l = _tAr.length, _t = _titlePrefix;
			if(_tAr[_l-1] == "") _l--;
			for(var i=0;i<_l;i++) _t += " - " + _tAr[i].substr(0, 1).toUpperCase() + _tAr[i].substr(1);
			document.title = _t;
		}
		catch(e){document.title = _titlePrefix;}
	}
	function cleanUrl(_in){
		//Only return first page and not subpages
		_pages = removePrefix(_in).split("/");
		//console.log("_array", _pages);
		if(_pages[0] == "" && _pages.length > 1) _pages.splice(0, 1);
		if(_pages[_pages.length-1] == "" && _pages.length > 1) _pages.splice(_pages.length-1);
		_pages[0] = _pages[0].split("?")[0];
		return _pages[0];
	}
	function removePrefix(_in){
		var _l = _prefix.length;
		if(_l > 0) return _in.substr(_l);
		else return _in;
	}
}

// function CookiePolicy(){
// 	var _this = this;
// 	var _me = document.getElementById("cookieconsent");
// 	var _cookieName = "veritystudios_website_cookie_consent";
// 	var _closeBtn = _me.getElementsByClassName("closeBtn")[0];
// 	try{
// 		overWriteLink(_me.getElementsByTagName("a")[0]);
// 	}
// 	catch(e){
// 		console.log("No link in cookie text!");
// 	}
// 	function close(e){
// 		e.stopPropagation();
// 		GLBEvents(_closeBtn, "click", close, false);
// 		setCookie(_cookieName,"yes",30*12*10);//10 years
// 		hide();
// 	}
	
// 	//Slide in from right
// 	function show(){
// 		GLBEvents(_closeBtn, "click", close, true);
// 		if(GLB._supportsClassList) _me.classList.add("in");
// 	}
// 	function hide(){
// 		if(GLB._supportsClassList) _me.classList.remove("in");
// 		setTimeout(destroy, 600);
// 	}
// 	function destroy(){
// 		//console.log("destroy cookie box");
// 		_allowCookies = true;
// 		document.body.removeChild(_me);
// 		_me = null;
// 		_closeBtn = null;
// 	}
// 	function setCookie(cname, cvalue, exdays) {
// 	    var d = new Date();
// 	    d.setTime(d.getTime() + (exdays*24*60*60*1000));
// 	    var expires = "expires="+ d.toUTCString();
// 	    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
// 	}
// 	function getCookie(cname) {
// 	    var name = cname + "=";
// 	    var decodedCookie = decodeURIComponent(document.cookie);
// 	    var ca = decodedCookie.split(';');
// 	    for(var i = 0; i <ca.length; i++) {
// 	        var c = ca[i];
// 	        while (c.charAt(0) == ' ') {
// 	            c = c.substring(1);
// 	        }
// 	        if (c.indexOf(name) == 0) {
// 	            return c.substring(name.length, c.length);
// 	        }
// 	    }
// 	    return "";
// 	}
// 	//Init
// 	var _currentCookie = getCookie(_cookieName);
// 	//console.log("_currentCookie", _currentCookie);
// 	if(_currentCookie == "yes") destroy();
// 	else setTimeout(show, 3000);
// 	//For debugging
// 	//setCookie(_cookieName,"no",30*12*10);//10 years
// }

//Init
var _mediaPrefix = "Assets/Images/";
_mediaPrefix = "";
var _videoPrefix = "Assets/Videos/";
_videoPrefix = "";
var _allowCookies = false;
var _router = new Router();
var _pageTransition, _scroller;
var _pageTransitions = false;
var _maskEase;
var _sharedTemplates = [];
var _initTimer, _isInit = false;
function init(){
	if(_isInit) return;
	_isInit = true;
	clearTimeout(_initTimer);
	new Main();
}
//Wait for fonts loading etc.
if(GLB._firefox){
	_initTimer = setTimeout(init, 1500);
	try{
		document.fonts.onloadingdone = function (fontFaceSetEvent){
			//console.log('onloadingdone we have ' + fontFaceSetEvent.fontfaces.length + ' font faces loaded');
			clearTimeout(_initTimer);
			init();
		}
	}
	catch(e){_initTimer = setTimeout(init, 100);}
}
else _initTimer = setTimeout(init, 100);


