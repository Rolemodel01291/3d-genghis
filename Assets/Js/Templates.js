/*
v 1.4 - revised 1/3 ILTP
*/
function PageTemplate(_pageTemplate, _div){
	var _this = this;
	_this._url = _div.getAttribute("data-url") || "";
	//_this._url = _this._deepurl.split("/")[0] || _this._deepurl;
	//Build custom template for the page
	var _template = new _pageTemplate(_div);
	//Standard modules are controlled from here (to aviod duplicate code in each page)
	var _built = false;
	var _sections = _div.getElementsByTagName("section");
	var _numSections = _sections.length, _numModules = 0;
	if(_div.className == "work page" || _div.className == "news page") _numSections = 0; //"Work" and "News" page is a "dumb" frontpage, all case studies are subpage
	var _modules = [];
	
	var _started = false;
	_this.start = function(){
		if(_started) return;
		_started = true;
		//console.log("Start pageTemplate");
		_div.style.display = "block";
		_template.start();
		if(!_built){
			_built = true;
			var _c = "";
			for(var i=0;i<_numSections;++i){
				_c = _sections[i].className;
				if(_c.indexOf("txtImg") != -1 || _c.indexOf("imgTxt") != -1) _modules.push(new GLBScrollModule(TextImage, _sections[i], true));
				else if(_c.indexOf("centerTxt") != -1) _modules.push(new GLBScrollModule(CenterText, _sections[i], false));
				else if(_c.indexOf("videoblock") != -1) _modules.push(new GLBScrollModule(VideoBlock, _sections[i], true));
				else if(_c.indexOf("nextPageBlock") != -1) _modules.push(new GLBScrollModule(CenterText, _sections[i], false));
				else if(_c.indexOf("txtOnly") != -1) _modules.push(new GLBScrollModule(TextOnly, _sections[i], false));
				else if(_c.indexOf("microgallery") != -1) _modules.push(new GLBScrollModule(MicroGallery, _sections[i], false));
			}
			_numModules = _modules.length;
		}
		else{
			for(var i=0;i<_numModules;++i) _modules[i].resume();
		}
		//SEO
		_router.setMetaDescription(_div.getAttribute("data-desc") || "");
	}
	_this.stop = function(){
		if(!_started) return;
		_started = false;
		//console.log("Stop pageTemplate");
		_div.style.display = "none";
		_template.stop();
		for(var i=0;i<_numModules;++i) _modules[i].pause();
	}
	
	_this.subpageChange = function(){
		console.log("-----------", _template);
		try{_template.subpageChange();}
		catch(e){console.log(e, "Couldn't call method subpageChange!");}
	}
}
/* Block with 1 image and 1 text section */
function TextImage(_me){
	//console.log("New TextImage Module")
	var _this = this;
	_this.moduleTop = 0, _this.moduleBottom = 0; //When to start/stop this module
	_this.moduleRealTop = 0, _this.moduleRealBottom = 0; //Without the margins
	_this.moduleProximity = 0;
	var initMargins = .1;//Add borders (view height * initMargins) to make sure module only starts when inside that area
	_this.initDelay = 200; //Delay (miliseconds) to wait before starting module. This is relevant if user is scrolling quickly past this module - then it would be stupid to load assets.
	
	//Reload function used in Careers
	function updateImage(e){
		//console.log("updateImage", e.detail);
		if(!_img) return;
		var _urls = e.detail;
		if(_urls != ""){
			var _url = getImageInSize(_urls.split("|"));
			if(_url){
				if(_prevUrl == _url) return; //Same image
				_prevUrl = _url;
				reset();
				_imgLoaded = false;
				_img.reload(_mediaPrefix+_url, false);
				if(_animation == "" || _animation == "f" || _animation == "fs") _img.img.style.visibility = "visible";
			}
		}
	}
	GLBEvents(_me, "updateImage", updateImage, true);
	
	//test
	/*function tester(){
		_me.dispatchEvent(GLBCustomEvent("updateImage", "job_header2.jpg?v=2,job_header2.jpg?v=2,job_m.jpg?v=2"));//user afterwards
	}
	setTimeout(tester, 2000);*/
	
	var _introHidden = false;
	if(_me.className.indexOf("intro") != -1){
		_introHidden = true;
		_me.style.visibility = "hidden";
	}
	
	var _h = GLB._reliableSh, _offY = 0, _myCenterY = _h/2, _per = 1;
	var _factor = (_me.getAttribute("data-para") || "0,0").split(",");
	var _moveFactor = parseInt(_factor[0]);
	var _animation = _me.getAttribute("data-anim") || "";
	var _prevUrl;
	var _target = parseInt(_me.getAttribute("data-target") || 0);
	var _loaded = false, _started = false, _imgLoaded = false, _animedIn = false, _readyForAnimin = false, _appendToParent = true;
	var _f3d = true;
	
	//Image element
	var _size = (_me.getAttribute("data-rel") || "").split(",");
	if(_size.length < 3) _size.push(_size[0]+""), _size.push(_size[1]+"");//Mobile sizes check
	var _oriW = parseInt(_size[0]), _oriH = parseInt(_size[1]), _oriMW = parseInt(_size[2]), _oriMH = parseInt(_size[3]);
	var _imgHolder = _me.getElementsByClassName("imgHolder");
	if(_imgHolder.length > 0) _imgHolder = _imgHolder[0], _appendToParent = false;
	else _imgHolder = document.createElement("div"), _imgHolder.className = "imgHolder";
	
	var _aspectKeeper = document.createElement("div");
	_aspectKeeper.className = "aspectKeeper";
	_imgHolder.appendChild(_aspectKeeper);
	
	if(_appendToParent) _me.insertBefore(_imgHolder, _me.firstChild);
	var _urls = _me.getAttribute("data-img") || ""; //Normal desktop, retina, mobile
	var _img;
	var _isMap = false;
	var _mapdata = _me.getAttribute("data-map") || "";
	if(_urls == "" && _mapdata != "") _this.initDelay = 0, _isMap = true, _img = new ContactMap(_aspectKeeper, _mapdata.split(",")); //Use as Google Map (for Contact)
	if(_urls != ""){
		var _imgClass = "img";
		if(_animation == "f") _imgClass += " fadeImg";
		else if(_animation == "fs") _imgClass += " fadeAndScaleImg";
		var _url = getImageInSize(_urls.split("|"));
		if(_url){
			_prevUrl = _url;
			_img = new GLBImage(_mediaPrefix+_url, _aspectKeeper, null, null, _imgClass, imgLoaded);
			if(_animation == "" || _animation == "f" || _animation == "fs") _img.img.style.visibility = "visible";
		}
	}
	
	//Setup text animation
	var _txt = _me.getElementsByClassName("txt")[0];
	var _noAnimTxt = false;
	if(_txt) _noAnimTxt = _txt.getAttribute("data-noanimation") == "true"; //Some pages (like jobs) have no animation
	var _txtAnimation;
	if(_txt && !_noAnimTxt) _txtAnimation = new TextAnimation(_txt);
	
	
	//Find element on top (to be moved parallax)
	var _paraTarget;
	if(_target == 0) _paraTarget = _imgHolder;
	else if(_target == 2) _paraTarget = _imgHolder;
	else _paraTarget = _txt;
	
	
	//Called when element is within moduleProximity.
	_this.preload = function(){
		if(_loaded) return;
		_loaded = true;
		if(_img) _img.load();
		//console.log("Preload TextImage");
	}
	_this.prestart = function(){
		//console.log("prestart");
		if(_introHidden) _introHidden = false, _me.style.visibility = "visible";
		//_this.preload(); //This will cause that element loads even if scrolled quickly past it!!!
	}
	_this.start = function(){
		_started = true;
		if(_imgLoaded) readyForImage();
		//console.log("start TextImage");
		_this.preload();
		if(_txtAnimation) _txtAnimation.animIn();
	}
	_this.stop = function(){
		_started = false;
		//console.log("stop TextImage", _id);
	}
	_this.resume = function(){
		//console.log("Resume TextImage", _id, GLB._windowScrollTweenedY);
	}
	_this.pause = function(){
		//console.log("Pause TextImage", _id, _animedIn);
		//Reset for animation (masking)
		reset();
		if(_txtAnimation) _txtAnimation.animOut();
	}
	
	function reset(){
		if(_animedIn && !_isMap){
			_animedIn = false;
			_readyForAnimin = false;
			_img.img.style.visibility = "hidden";
			TweenLite.killTweensOf(_img.img);
			TweenLite.killTweensOf(_aspectKeeper);
			TweenLite.set(_aspectKeeper, {clearProps:"width,height,scaleX,scaleY,x,y"});
			TweenLite.set(_img.img, {clearProps:"width,height,scaleX,scaleY,x,y"});
			if(GLB._supportsClassList) _img.img.classList.remove("in");
		}
	}
	
	function imgLoaded(e){
		//console.log("imgLoaded", _started)
		_imgLoaded = true;
		if(_started) readyForImage();
	}
	function readyForImage(){
		_readyForAnimin = true;
		if(_moveFactor == 0 || Math.abs(_per) < .9) animInImage(); //No parallax to call method (maybe no parallax or maybe not scrolling currently)
	}

	function animInImage(){
		if(_animedIn) return;
		_animedIn = true;
		if(_animation == "") return;

		//Set sizes temporary
		var _w, _h;
		if(_animation == "l" || _animation == "r"){
			_w = _aspectKeeper.offsetWidth;
			if(_w == 0){
				//Fired too soon (relevant for headers)
				_animedIn = false;
				return;
			}
			_img.img.style.width = _w + "px", _aspectKeeper.style.width = "0px";
		}
		else if(_animation == "t" || _animation == "b") _h = _aspectKeeper.offsetHeight, _img.img.style.height = _h + "px", _aspectKeeper.style.paddingTop = "0px";
		
		if(_animation == "l"){
			TweenLite.set(_img.img, {x:-GLB._vw*.01, force3D:_f3d});
			TweenLite.to(_img.img, 1.4, {x:0, delay:.1, force3D:_f3d, ease:Quad.easeOut, onComplete:animInOver});
			TweenLite.to(_aspectKeeper, 1.2, {width:_w, delay:.1, force3D:false, ease:_maskEase});	
		}
		else if(_animation == "r"){
			//Flip image and aspectkeer
			TweenLite.set(_aspectKeeper, {width:0, scaleX:-1, x:_w, transformOrigin:"0 0", force3D:false});
			TweenLite.set(_img.img, {scaleX:-1, x:_w-GLB._vw*.01, transformOrigin:"0 0", force3D:_f3d});
			TweenLite.to(_img.img, 1.4, {x:_w, delay:.1, force3D:_f3d, ease:Quad.easeOut, onComplete:animInOver});
			TweenLite.to(_aspectKeeper, 1.2, {width:_w, delay:.1, force3D:false, ease:_maskEase});
		}
		else if(_animation == "t"){
			TweenLite.set(_img.img, {y:GLB._reliableSh*.1, force3D:_f3d});
			TweenLite.to(_img.img, 2.2, {y:0, delay:.1, force3D:_f3d, ease:Quad.easeOut, onComplete:animInOver});
			TweenLite.to(_aspectKeeper, 2.0, {paddingTop:_h, delay:.1, force3D:false, ease:_maskEase});	
		}
		else if(_animation == "b"){
			//Flip image and aspectkeer
			TweenLite.set(_aspectKeeper, {scaleY:-1, y:_h, transformOrigin:"0 0", force3D:false});
			TweenLite.set(_img.img, {scaleY:-1, y:_h-GLB._reliableSh*.1, transformOrigin:"0 0", force3D:_f3d});
			TweenLite.to(_img.img, 1.6, {y:_h, delay:.1, force3D:_f3d, ease:_maskEase, onComplete:animInOver});
			TweenLite.to(_aspectKeeper, 1.4, {paddingTop:_h, delay:.1, force3D:false, ease:_maskEase});	
		}
		else if(_animation == "f" || _animation == "fs"){
			//Fade in
			TweenLite.delayedCall(.06, function(){
				if(GLB._supportsClassList) _img.img.classList.add("in");
			});
		}
		_img.img.style.visibility = "visible";
	}
	function animInOver(){
		TweenLite.set(_aspectKeeper, {clearProps:"width,height,scaleX,scaleY,x,y"});
		TweenLite.set(_img.img, {clearProps:"width,height,scaleX,scaleY,x,y"});
		if(_animation == "t") _this.resized();
	}
	
	//Parallax
	_this.scrolled = function(){
		if(_target == 2) TweenLite.set(_paraTarget, {y:GLB._windowScrollTweenedY*.5, force3D:true});
		else{
			if(_moveFactor == 0) return;
			_per = (_myCenterY - GLB._windowScrollTweenedY - GLB._reliableSh/2)/_h;
			if(_per > GLB._reliableSh) _per = GLB._reliableSh;
			else if(_per < -GLB._reliableSh) _per = -GLB._reliableSh;
			TweenLite.set(_paraTarget, {y:_per * _moveFactor, force3D:true});
		}
		//Anim in when entering screen
		//console.log(_readyForAnimin, _animedIn)
		if(_readyForAnimin && !_animedIn && Math.abs(_per) < .9) animInImage();
	}
	
	//Write
	_this.resized = function(){
		if(GLB._isMobile) _aspectKeeper.style.paddingTop = _oriMH/_oriMW*100 + "%", _moveFactor = parseInt(_factor[1]);
		else _aspectKeeper.style.paddingTop = _oriH/_oriW*100 + "%", _moveFactor = parseInt(_factor[0]);
		if(!GLB._isMobile && GLB._isTouch && GLB._iOS) _moveFactor *= .5; //iPad updates too slow...
		if(GLB._isBot) _moveFactor = 0;
	}
	_this.resized();
	//Read properties (delayed to avoid layout thrashing)
	_this.layoutUpdate = function(){
		if(_txtAnimation) _txtAnimation.resized();
		_h = _me.offsetHeight, _offY = GLB.offsetY(_me);
		_myCenterY = _offY + _h/2;
		_this.moduleTop = _this.moduleRealTop = _offY - GLB._reliableSh + (GLB._reliableSh * initMargins);
        _this.moduleBottom = _this.moduleRealBottom = _this.moduleTop + _h + GLB._reliableSh * (1 - initMargins * 2);
		_this.moduleProximity = GLB._reliableSh / 8;
		_this.scrolled();
	}
}

/* Simple text centered (no image) */
function CenterText(_me){
	//console.log("New CenterText Module")
	var _this = this;
	_this.moduleTop = 0, _this.moduleBottom = 0; //When to start/stop this module
	_this.moduleRealTop = 0, _this.moduleRealBottom = 0; //Without the margins
	_this.moduleProximity = 0;
	var initMargins = .1;//Add borders (view height * initMargins) to make sure module only starts when inside that area
	_this.initDelay = 200; //Delay (miliseconds) to wait before starting module. This is relevant if user is scrolling quickly past this module - then it would be stupid to load assets.
	
	var _h = GLB._reliableSh, _offY = 0;	
	var _loaded = false, _started = false;
	
	//Setup text animation
	var _txt = _me.getElementsByClassName("txt")[0];
	var _txtAnimation;
	if(_txt && _me.className.indexOf("nextPageBlock") == -1) _txtAnimation = new TextAnimation(_txt); //Don't animate the nextPageBlock (no need for it)
	
	//Called when element is within moduleProximity.
	_this.preload = function(){
		if(_loaded) return;
		_loaded = true;
		//console.log("Preload TextImage", _id);
	}
	_this.prestart = function(){
		//console.log("prestart", _id);
		//_this.preload(); //This will cause that element loads even if scrolled quickly past it!!!
	}
	_this.start = function(){
		_started = true;
		//console.log("start TextImage", _id);
		_this.preload();
		if(_txtAnimation) _txtAnimation.animIn();
	}
	_this.stop = function(){
		_started = false;
		//console.log("stop TextImage", _id);
	}
	_this.resume = function(){
		//console.log("Resume TextImage", _id);
	}
	_this.pause = function(){
		//console.log("Pause TextImage", _id);
		if(_txtAnimation) _txtAnimation.animOut();
	}

	//Write
	_this.resized = function(){}
	//Read properties (delayed to avoid layout thrashing)
	_this.layoutUpdate = function(){
		if(_txtAnimation) _txtAnimation.resized();
		_h = _me.offsetHeight, _offY = GLB.offsetY(_me);
		_this.moduleTop = _this.moduleRealTop = _offY - GLB._reliableSh + (GLB._reliableSh * initMargins);
        _this.moduleBottom = _this.moduleRealBottom = _this.moduleTop + _h + GLB._reliableSh * (1 - initMargins * 2);
		_this.moduleProximity = GLB._reliableSh / 8;
	}
}

/* Simple text centered (no image) */
function TextOnly(_me){
	var _this = this;
	_this.moduleTop = 0, _this.moduleBottom = 0; //When to start/stop this module
	_this.moduleRealTop = 0, _this.moduleRealBottom = 0; //Without the margins
	_this.moduleProximity = 0;
	var initMargins = .2;//Add borders (view height * initMargins) to make sure module only starts when inside that area
	_this.initDelay = 200; //Delay (miliseconds) to wait before starting module. This is relevant if user is scrolling quickly past this module - then it would be stupid to load assets.
	if(GLB._isBot) _this.initDelay = 0;
	
	var _h = GLB._reliableSh, _offY = 0;	
	var _loaded = false, _started = false;
		
	//Setup text animation
	var _txt = _me.getElementsByClassName("txt")[0];
	var _txtAnimation;
	if(_txt) _txtAnimation = new TextAnimation(_txt);
	
	//Called when element is within moduleProximity.
	_this.preload = function(){
		if(_loaded) return;
		_loaded = true;
		//console.log("Preload TextOnly");
	}
	_this.prestart = function(){
		//console.log("prestart", _id);
		//_this.preload(); //This will cause that element loads even if scrolled quickly past it!!!
	}
	_this.start = function(){
		_started = true;
		//console.log("start TextOnly");
		_this.preload();
		if(_txtAnimation) _txtAnimation.animIn();
	}
	_this.stop = function(){
		_started = false;
	}
	_this.resume = function(){
	}
	_this.pause = function(){
		if(_txtAnimation) _txtAnimation.animOut();
	}

	//Write
	_this.resized = function(){}
	//Read properties (delayed to avoid layout thrashing)
	_this.layoutUpdate = function(){
		if(_txtAnimation) _txtAnimation.resized();
		_h = _me.offsetHeight, _offY = GLB.offsetY(_me);
		_this.moduleTop = _this.moduleRealTop = _offY - GLB._reliableSh + (GLB._reliableSh * initMargins);
        _this.moduleBottom = _this.moduleRealBottom = _this.moduleTop + _h + GLB._reliableSh * (1 - initMargins * 2);
		_this.moduleProximity = GLB._reliableSh / 8;
	}
}

/* Video standalone */
function VideoBlock(_me){
	//console.log("New VideoBlock Module")
	var _this = this;
	_this.moduleTop = 0, _this.moduleBottom = 0; //When to start/stop this module
	_this.moduleRealTop = 0, _this.moduleRealBottom = 0; //Without the margins
	_this.moduleProximity = 0;
	var initMargins = .1;//Add borders (view height * initMargins) to make sure module only starts when inside that area
	_this.initDelay = 100; //Delay (miliseconds) to wait before starting module. This is relevant if user is scrolling quickly past this module - then it would be stupid to load assets.
	
	var _h = GLB._reliableSh, _offY = 0, _myCenterY = _h/2, _per = 0;
	var _factor = (_me.getAttribute("data-para") || "0,0").split(",");
	var _moveFactor = parseInt(_factor[0]);
	
	var _loaded = false, _started = false, _animedIn = false, _appendToParent = true;
	var _f3d = true;
	
	//Video element
	var _size = (_me.getAttribute("data-rel") || "").split(",");
	if(_size.length < 3) _size.push(_size[0]+""), _size.push(_size[1]+"");//Mobile sizes check
	var _oriW = parseInt(_size[0]), _oriH = parseInt(_size[1]), _oriMW = parseInt(_size[2]), _oriMH = parseInt(_size[3]);
	var _imgHolder = _me.getElementsByClassName("imgHolder");
	if(_imgHolder.length > 0) _imgHolder = _imgHolder[0], _appendToParent = false;
	else _imgHolder = document.createElement("div"), _imgHolder.className = "imgHolder";
	
	var _aspectKeeper = document.createElement("div");
	_aspectKeeper.className = "aspectKeeper";
	_imgHolder.appendChild(_aspectKeeper);
	
	if(_appendToParent) _me.insertBefore(_imgHolder, _me.firstChild);
	var _urls = _me.getAttribute("data-src").split(","); //Normal desktop, retina, mobile
	//Videoplayer
	var _video = document.createElement("video");
	_video.className = "inlinevideo fadeImg";
	_video.preload = "none";
	_video.muted = true;
	_video.autoplay = false;
	if(GLB._isMobile) _video.controls = true;
	else _video.controls = false;
	_video.loop = true;
	_video.setAttribute('playsinline', 'true'); // must be set before src is set or it will be ignored
	_video.playsinline = true;
	var _srcMp4 = document.createElement("source"); 
	_srcMp4.type = "video/mp4";
	if(GLB._isMobile) _srcMp4.src = _urls[1];
	else _srcMp4.src = _urls[0];
	_video.appendChild(_srcMp4);
	_aspectKeeper.appendChild(_video);
	
	//Find element on top (to be moved parallax)
	var _paraTarget = _imgHolder;
	
	//Called when element is within moduleProximity.
	_this.preload = function(){
		if(_loaded) return;
		_loaded = true;
		_video.load();
	}
	_this.prestart = function(){
		//console.log("prestart", _id);
		//_this.preload(); //This will cause that element loads even if scrolled quickly past it!!!
	}
	_this.start = function(){
		_started = true;
		if(!_animedIn){
			_animedIn = true;
			_video.style.opacity = 1;
		}
		_video.play();
	}
	_this.stop = function(){
		_started = false;
		_video.pause();
	}
	_this.resume = function(){
	}
	_this.pause = function(){
		//Reset for animation (masking)
		if(_animedIn){
			_animedIn = false;
			_video.style.opacity = 0;
		}
	}
		
	//Parallax
	_this.scrolled = function(){
		if(_moveFactor == 0) return;
		_per = (_myCenterY - GLB._windowScrollTweenedY - GLB._reliableSh/2)/_h;
		if(_per > GLB._reliableSh) _per = GLB._reliableSh;
		else if(_per < -GLB._reliableSh) _per = -GLB._reliableSh;
		TweenLite.set(_paraTarget, {y:_per * _moveFactor, force3D:true});
	}
	
	//Write
	_this.resized = function(e){
		if(GLB._isMobile) _aspectKeeper.style.paddingTop = _oriMH/_oriMW*100 + "%", _moveFactor = parseInt(_factor[1]);
		else _aspectKeeper.style.paddingTop = _oriH/_oriW*100 + "%", _moveFactor = parseInt(_factor[0]);
		if(GLB._isBot) _moveFactor = 0;
	}
	_this.resized();
	//Read properties (delayed to avoid layout thrashing)
	_this.layoutUpdate = function(){
		_h = _me.offsetHeight, _offY = GLB.offsetY(_me);
		_myCenterY = _offY + _h/2;
		_this.moduleTop = _this.moduleRealTop = _offY - GLB._reliableSh + (GLB._reliableSh * initMargins);
        _this.moduleBottom = _this.moduleRealBottom = _this.moduleTop + _h + GLB._reliableSh * (1 - initMargins * 2);
		_this.moduleProximity = GLB._reliableSh / 8;
		_this.scrolled();
	}
}

/* Galleries for case studies */
function MicroGallery(_me){
	var _this = this;
	_this.moduleTop = 0, _this.moduleBottom = 0; //When to start/stop this module
	_this.moduleRealTop = 0, _this.moduleRealBottom = 0; //Without the margins
	_this.moduleProximity = 0;
	var initMargins = .1;//Add borders (view height * initMargins) to make sure module only starts when inside that area
	_this.initDelay = 100; //Delay (miliseconds) to wait before starting module. This is relevant if user is scrolling quickly past this module - then it would be stupid to load assets.
	
	var _urls = _me.getAttribute("data-img").split("/DIV/") || ""; //Normal desktop, retina, mobile
	var _numImgs = _urls.length;
	
	//Check if data-src is defined, because then this is a Vimeo player using the image as a thumbnail
	var _videoId = _me.getAttribute("data-src") || "";
	
	var _h = GLB._reliableSh, _offY = 0;
	var _animations = _me.getAttribute("data-anim").split("|") || "";
	
	var _loaded = false, _started = false, _imgLoaded = false, _animedIn = false, _readyForAnimin = false;
	var _f3d = true;
	var _loadCount = 0;
	
	//Image element(s)
	var _size = (_me.getAttribute("data-rel") || "").split(",");
	if(_size.length < 3) _size.push(_size[0]+""), _size.push(_size[1]+"");//Mobile sizes check
	var _oriW = parseInt(_size[0]), _oriH = parseInt(_size[1]), _oriMW = parseInt(_size[2]), _oriMH = parseInt(_size[3]);
	
	var _imgHolders = [], _aspectKeepers = [];
	for(var i=0;i<_numImgs;++i){
		var _i = document.createElement("div");
		_i.className = "imgHolder";
		var _aspectKeeper = document.createElement("div");
		_aspectKeeper.className = "aspectKeeper";
		_i.appendChild(_aspectKeeper);
		_me.appendChild(_i);
		_aspectKeepers.push(_aspectKeeper);
		_imgHolders.push(_i);
	}
	//Create image(s)
	var _imgs = [];
	if(_numImgs > 0){
		var _imgClass;
		for(var i=0;i<_numImgs;++i){
			_imgClass = "img";
			if(_animations[i] == "f") _imgClass += " fadeImg";
			else if(_animations[i] == "fs") _imgClass += " fadeAndScaleImg";
			var _img = new GLBImage(_mediaPrefix+getImageInSize(_urls[i].split("|")), _aspectKeepers[i], null, null, _imgClass, imgLoaded);
			if(_animations[i] == "" || _animations[i] == "f" || _animations[i] == "fs") _img.img.style.visibility = "visible";
			_imgs.push(_img);
		}
	}
	
	//Vimeo player
	var _playBtn;
	if(_videoId != ""){
		_playBtn = new VideoPlayButton(_imgHolders[0], _videoId, _me.getAttribute("data-type"));
	}
	
	
	//Called when element is within moduleProximity.
	_this.preload = function(){
		if(_loaded) return;
		_loaded = true;
		for(var i=0;i<_numImgs;++i) _imgs[i].load();
		if(_playBtn) _playBtn.load();
	}
	_this.prestart = function(){
	}
	_this.start = function(){
		_started = true;
		if(_imgLoaded) readyForImage();
		//console.log("start TextImage", _id);
		_this.preload();
	}
	_this.stop = function(){
		_started = false;
		if(_playBtn) _playBtn.stop();
		//console.log("stop MicroGallery");
	}
	_this.resume = function(){
		//console.log("Resume TextImage", _id, GLB._windowScrollTweenedY);
	}
	_this.pause = function(){
		//console.log("Pause TextImage", _id, _animedIn);
		//Reset for animation (masking)
		if(_playBtn) _playBtn.stop();
		if(_animedIn){
			_animedIn = false;
			_readyForAnimin = false;
			_img.img.style.visibility = "hidden";
			if(GLB._supportsClassList) _img.img.classList.remove("in");
		}
		if(_txtAnimation) _txtAnimation.animOut();
	}
	
	function imgLoaded(e){
		_loadCount++;
		if(_loadCount == _numImgs){
			//console.log("imgLoaded", _started);
			_imgLoaded = true;
			if(_started) readyForImage();
		}
	}
	function readyForImage(){
		_readyForAnimin = true;
		animInImages(); //No parallax to call method (maybe no parallax or maybe not scrolling currently)
	}

	function animInImages(){
		if(_animedIn) return;
		_animedIn = true;
		//Set sizes temporary
		var _w, _h;
		for(var i=0;i<_numImgs;++i){
			if(_animations[i] == "") continue;
			if(_animations[i] == "f" || _animations[i] == "fs"){
				//Fade in
				TweenLite.delayedCall(.06, addClass, [i]);
			}
			_imgs[i].img.style.visibility = "visible";
		}
	}
	function addClass(i){
		_imgs[i].img.className += " in";
	}
		
	//Write
	_this.resized = function(e){
		if(GLB._isMobile){
			for(var i=0;i<_numImgs;++i) _aspectKeepers[i].style.paddingTop = _oriMH/_oriMW*100 + "%";
		}
		else{
			for(var i=0;i<_numImgs;++i) _aspectKeepers[i].style.paddingTop = _oriH/_oriW*100 + "%";
		}
	}
	_this.resized();
	//Read properties (delayed to avoid layout thrashing)
	_this.layoutUpdate = function(){
		_h = _me.offsetHeight, _offY = GLB.offsetY(_me);
		_this.moduleTop = _this.moduleRealTop = _offY - GLB._reliableSh + (GLB._reliableSh * initMargins);
        _this.moduleBottom = _this.moduleRealBottom = _this.moduleTop + _h + GLB._reliableSh * (1 - initMargins * 2);
		_this.moduleProximity = GLB._reliableSh / 8;
	}
}

//Play button controlling appearance of Vimeo videos
function VideoPlayButton(_parent, _videoId, _type){
	var _this = this;
	var _me = document.createElement("div");
	_me.className = "playBtn";
	var _img = new GLBImage("Assets/Grx/playBtn.png", _me, 130, 130, "playIcon fadeImg", iconLoaded);
	var _player;
	_parent.appendChild(_me);
	
	function iconLoaded(){
		_img.img.className = "playIcon fadeImg in";
	}
	_this.load = function(){
		_img.load();
		GLBEvents(_parent, "click", initVideo, true);
	}
	_this.stop = function(){
		//Player out of viewport
		if(_player) _player.stop();
	}
	
	function initVideo(e){
		e.stopPropagation();
		GLBEvents(_parent, "click", initVideo, false);
		if(_type == "Vimeo") _player = new VimeoPlayer(_parent, _videoId);
		else if(_type == "Youtube") _player = new YoutubePlayer(_parent, _videoId);
	}
}

function VimeoPlayer(_parent, _id){
	var _this = this;
	
	//Load Vimeo API
	if(!_vimeoJsAdded){
		_vimeoJsAdded = true;
		var _vimeoJs = document.createElement('script');
		_vimeoJs.onload = VimeoJsLoaded;
		_vimeoJs.setAttribute("type","text/javascript");
		_vimeoJs.setAttribute("async","");
		_vimeoJs.setAttribute("defer","");
		_vimeoJs.setAttribute("src", "https://player.vimeo.com/api/player.js");
		document.body.appendChild(_vimeoJs);
	}
	
	var _holder = document.createElement("div");
	_holder.className = "extVideoHolder";
	var _unique = _id + "_" + Date.now();
	_holder.setAttribute("id", _unique);
	var _player;
	
	if(_vimeoReady) create();
	else GLBEvents(window, "VimeoAPIReady", create, true);
	
	function create(e){
		GLBEvents(window, "VimeoAPIReady", create, false);
		_parent.appendChild(_holder);
		//Create new player
		_player = new Vimeo.Player(_unique, {id:_id,playsinline:false,byline:false,responsive:true,loop:false,color:"ff3d59",muted:GLB._isMobile,autoplay:true,playsinline:true,portrait:false});
	}
	
	_this.stop = function(){
		//Player out of viewport
		if(_player) _player.pause();
	}
}

function YoutubePlayer(_parent, _id){
	var _this = this;
	
	//Load Youtube API
	if(!_youtubeJsAdded){
		_youtubeJsAdded = true;
		var _youtubeJs = document.createElement('script');
		//_youtubeJs.onload = YoutubeJsLoaded;
		_youtubeJs.setAttribute("type","text/javascript");
		_youtubeJs.setAttribute("async","");
		_youtubeJs.setAttribute("defer","");
		_youtubeJs.setAttribute("src", "https://www.youtube.com/iframe_api");
		document.body.appendChild(_youtubeJs);
	}
	
	var _holder = document.createElement("div");
	_holder.className = "extVideoHolder";
	var _unique = _id + "_" + Date.now();
	_holder.setAttribute("id", _unique);
	var _player;
	
	if(_youtubeReady) create();
	else GLBEvents(window, "YoutubeAPIReady", create, true);
	
	function create(e){
		GLBEvents(window, "YoutubeAPIReady", create, false);
		_parent.appendChild(_holder);
		//Create new player
		var _events = {};//{'onReady': onPlayerReady,'onStateChange': onPlayerStateChange};
		_player = new YT.Player(_unique, {videoId:_id, playerVars:{'fs':0,'autohide':1,'controls':1,'playsinline':1,'suggestedQuality':'hd1080','disablekb':1,'html5':1,'modestbranding':0,'showinfo':0,'rel':0,'enablejsapi':1,'iv_load_policy':3,'autoplay':1,'origin':'https://veritystudios.com'}, events:_events});
	}
	
	_this.stop = function(){
		//Player out of viewport
		if(_player) _player.stopVideo();
	}
}

//Manage video APIs
function VimeoJsLoaded(){
	_vimeoReady = true;
	window.dispatchEvent(GLBCustomEvent("VimeoAPIReady", 0));
}
function onYouTubeIframeAPIReady(){
	_youtubeReady = true;
	window.dispatchEvent(GLBCustomEvent("YoutubeAPIReady", 0));
}
var _vimeoJsAdded = false, _vimeoReady = false;
var _youtubeJsAdded = false, _youtubeReady = false;



//Animation of mouse (desktop) or line (mobile)
function makeMeScroll(_parent, _desktopUsesBody, _initDelay){
	var _this = this;
	var _firstDelay = 0;
	
	var _me = document.createElement("div");
	_me.className = "makeMeScroll";
	if(!GLB._isMobile) TweenLite.set(_me, {opacity:0, force3D:true});
	
	var _label = document.createElement("div");
	_label.className = "label";
	_label.textContent = "Scroll";
	if(!GLB._isMobile) _me.appendChild(_label);
	
	var _mouseIcon = document.createElement("div");
	_mouseIcon.className = "mouseIcon";
	if(!GLB._isMobile) _me.appendChild(_mouseIcon);
	
	var _mobileLine = document.createElement("div");
	_mobileLine.className = "mobileLine";
	TweenLite.set(_mobileLine, {scaleY:0, opacity:0, transformOrigin:"0 -20%", force3D:true});
	_me.appendChild(_mobileLine);
	
	if(_desktopUsesBody && !GLB._isMobile) document.body.appendChild(_me);
	else _parent.appendChild(_me);
	
	var _animate = true;
	var _pageYOnInit = 0;
	function scrolled(e){
		if(Math.abs(_pageYOnInit - GLB._windowScrollTweenedY) > GLB._vh * .1){
			//console.log("Cancel makeMeScroll");
			GLBEvents(window, "scroll", scrolled, false);
			_animate = false;
			if(!GLB._isMobile){
				TweenLite.killTweensOf(_me);
				TweenLite.to(_me, .4, {y:-32, opacity:0, force3D:true, ease:Cubic.easeOut});
			}
		}
	}
	
	_this.start = function(){
		//Listen for scrolling (and canceling)
		_pageYOnInit = GLB._windowScrollTweenedY;
		GLBEvents(window, "scroll", scrolled, true);
		_animate = true;
		_firstDelay = _initDelay;
		if(!GLB._isMobile) TweenLite.set(_me, {opacity:0, y:8, force3D:true});
		animationLoop();
	}
	
	_this.stop = function(){
		GLBEvents(window, "scroll", scrolled, false);
		_animate = false;
		if(!GLB._isMobile){
			TweenLite.killTweensOf(_me);
			TweenLite.to(_me, .4, {opacity:0, force3D:true, ease:Cubic.easeOut});
		}
	}
	
	function animationLoop(){
		if(!_animate) return;
		if(GLB._isMobile){
			TweenLite.to(_mobileLine, .6, {delay:2+_firstDelay, opacity:.5, force3D:true, ease:Linear.easeNone});
			TweenLite.to(_mobileLine, .6, {delay:2+_firstDelay, scaleY:1, transformOrigin:"0 -20%", force3D:true, ease:Cubic.easeIn});
			TweenLite.to(_mobileLine, .6, {delay:3+_firstDelay, opacity:0, force3D:true, ease:Cubic.easeOut});
			TweenLite.to(_mobileLine, 1, {delay:2.6+_firstDelay, scaleY:0, transformOrigin:"0 120%", force3D:true, ease:Cubic.easeOut, onComplete:animationLoop});
		}
		else{
			TweenLite.to(_me, .6, {delay:0+_firstDelay, y:0, opacity:1, force3D:true, ease:Cubic.easeInOut});
			mouseGlow();
		}
		_firstDelay = 0;
	}
	
	function mouseGlow(){
		if(!_animate) return;
		TweenLite.to(_mouseIcon, 1.2, {delay:.6+_firstDelay, opacity:1, force3D:true, ease:Cubic.easeInOut});
		TweenLite.to(_mouseIcon, 1.2, {delay:1.8+_firstDelay, opacity:.5, force3D:true, ease:Cubic.easeOut, onComplete:mouseGlow});
	}
}

//Animation of mouse dragging for carousel
function makeMePan(_parent){
	var _this = this;
	var _firstDelay = 0;
	
	var _me = document.createElement("div");
	_me.className = "makeMePan";
		
	var _mouseIcon = document.createElement("div");
	_mouseIcon.className = "mouseIcon";
	if(!GLB._isMobile) _me.appendChild(_mouseIcon);
	
	var _label = document.createElement("div");
	_label.className = "label";
	_label.textContent = "DRAG TO EXPLORE";
	if(!GLB._isMobile) _me.appendChild(_label);
	
	var _arrowL = document.createElement("div");
	_arrowL.className = "arrow left";
	_me.appendChild(_arrowL);
	var _arrowR = document.createElement("div");
	_arrowR.className = "arrow right";
	_me.appendChild(_arrowR);
	
	
	GLBEvents(_arrowL, "mousedown", panL, true);
	GLBEvents(_arrowL, "touchstart", panL, true);
	GLBEvents(_arrowR, "mousedown", panR, true);
	GLBEvents(_arrowR, "touchstart", panR, true);
	function panL(e){
		e.stopPropagation();
		window.dispatchEvent(GLBCustomEvent("scrollCarousel", 0));
	}
	function panR(e){
		e.stopPropagation();
		window.dispatchEvent(GLBCustomEvent("scrollCarousel", 1));
	}
	
	_parent.appendChild(_me);
	
	var _animate = false;
	_this.start = function(){
		_animate = true;
		//Fade in
		_me.className = "makeMePan in";
		//Rotate mouse icon
		mouseLoop();
	}
	function mouseLoop(){
		if(!_animate) return;
		TweenLite.delayedCall(2, loopA);
	}
	function loopA(){
		if(!_animate) return;
		TweenLite.killTweensOf(_mouseIcon);
		TweenLite.to(_mouseIcon, .4, {x:-2, rotation:-6, opacity:1, force3D:true, ease:Cubic.easeInOut, transformOrigin:"0 110%"});
		TweenLite.to(_mouseIcon, .6, {delay:.4, x:2, y:-2, rotation:3, force3D:true, ease:Cubic.easeInOut, transformOrigin:"0 110%"});
		TweenLite.to(_mouseIcon, .8, {delay:1.0, x:0, y:0, rotation:0, opacity:.5, force3D:true, ease:Cubic.easeInOut, transformOrigin:"0 110%", onComplete:mouseLoop});
		
		TweenLite.to(_arrowL, .3, {delay:0, x:-4, ease:Linear.easeNone});
		TweenLite.to(_arrowL, .8, {delay:0.3, x:0, ease:Strong.easeInOut});
		
		TweenLite.to(_arrowR, .3, {delay:0, x:4, ease:Linear.easeNone});
		TweenLite.to(_arrowR, .8, {delay:0.3, x:0, ease:Strong.easeInOut});
	}
	_this.stop = function(_fast){
		_animate = false;
		TweenLite.killTweensOf(loopA);
		if(_fast){
			//Reset because modules was left
			_me.className = "makeMePan";
			TweenLite.killTweensOf(_mouseIcon);
			TweenLite.killTweensOf(_arrowL);
			TweenLite.killTweensOf(_arrowR);
			TweenLite.set(_mouseIcon, {clearProps:"all"});
			TweenLite.set(_arrowL, {clearProps:"all"});
			TweenLite.set(_arrowR, {clearProps:"all"});
		}
	}
}

function TextAnimation(_txt){
	var _this = this;
	var _animations = [];
	
	var _introHidden = false;
	if(_txt.className.indexOf("intro") != -1){
		_introHidden = true;
		_txt.style.visibility = "hidden";
	}
	
	var _h2s = _txt.getElementsByTagName("h2"), _h2
	var _numH2s = _h2s.length;
	var _useMobileH2 = false;
	if(GLB._isMobile && _numH2s > 1){
		//Check if we should grab a mobile only version
		for(var i=0;i<_numH2s;++i){
			if(_h2s[i].className == "mobile") _useMobileH2 = true;
		}
	}
	if(GLB._isMobile && _useMobileH2) _h2 = _txt.getElementsByTagName("h2")[1] || null;
	else _h2 = _txt.getElementsByTagName("h2")[0] || null;
	if(_h2) _animations.push(new H2Animation(_h2));
	var _h3 = _txt.getElementsByTagName("h3")[0] || null;
	if(_h3) _animations.push(new H2Animation(_h3));
	var _h5 = _txt.getElementsByTagName("h5")[0] || null;
	if(_h5) _animations.push(new H5Animation(_h5));
	var _p = _txt.getElementsByTagName("p")[0] || null;
	if(_p) _animations.push(new PAnimation(_p));
	var _numAnimations = _animations.length;
	
	_this.animIn = function(){
		if(_introHidden) _introHidden = false, _txt.style.visibility = "visible";
		for(var i=0;i<_numAnimations;++i) _animations[i].animIn();
	}
	_this.animOut = function(){
		for(var i=0;i<_numAnimations;++i) _animations[i].animOut();
	}
	_this.resized = function(){
		for(var i=0;i<_numAnimations;++i) _animations[i].resized();
	}
}
function H2Animation(_h2){
	var _this = this;
	var _f3d = true, _isOn = false;
	var _linesS, _lines;
	var _numLines = 0, _vwBefore = -1;
	var _yOff = 32;
	//Uses classname for css transitions :-)
	
	_this.animIn = function(){
		if(GLB._isBot) return;
		_isOn = true;
		for(var i=0;i<_numLines;++i){
			_lines[i].className = "lineFade in";
			TweenLite.set(_lines[i], {y:0, opacity:1, force3D:_f3d, delay:i*.08});
			//TweenLite.to(_lines[i], 1, {y:0, opacity:1, force3D:_f3d, delay:i*.1, ease:Quad.easeOut});
		}
	}
	_this.animOut = function(){
		if(GLB._isBot) return;
		_isOn = false;
		for(var i=0;i<_numLines;++i){
			_lines[i].className = "lineFade";
			TweenLite.killTweensOf(_lines[i]);
			TweenLite.set(_lines[i], {y:_yOff, opacity:0, force3D:_f3d});
		}
	}
	//Redraw when needed
	_this.resized = function(){
		if(GLB._isBot) return;
		if(_linesS){
			if(_vwBefore == GLB._vwOuter) return;
			_linesS.revert();
			_vwBefore = GLB._vwOuter;
		}
		_linesS = new SplitText(_h2, {type:"lines"});
		_lines = _linesS.lines;
		_numLines = _lines.length;
		if(_numLines <= 1) _yOff = 16;
		else _yOff = 32;
		if(_isOn) return;
		for(var i=0;i<_numLines;++i){
			_lines[i].className = "lineFade";
			TweenLite.set(_lines[i], {y:_yOff, opacity:0, force3D:_f3d});
		}
	}
}
function H5Animation(_h5){
	var _this = this;
	var _f3d = true, _isOn = false;
	var _linesS, _lines;
	var _numLines = 0, _vwBefore = -1;
	var _baseAlpha = 0;
	
	_this.animIn = function(){
		if(GLB._isBot) return;
		_isOn = true;
		for(var i=0;i<_numLines;++i){
			_lines[i].className = "lineFade in";
			TweenLite.set(_lines[i], {y:0, opacity:1, force3D:_f3d, delay:i*.08});
			//TweenLite.to(_lines[i], 1, {y:0, opacity:1, force3D:_f3d, delay:i*.1, ease:Quad.easeOut});
		}
	}
	_this.animOut = function(){
		if(GLB._isBot) return;
		_isOn = false;
		for(var i=0;i<_numLines;++i){
			_lines[i].className = "lineFade";
			TweenLite.killTweensOf(_lines[i]);
			TweenLite.set(_lines[i], {y:12, opacity:_baseAlpha, force3D:_f3d});
		}
	}
	//Redraw when needed
	_this.resized = function(){
		if(GLB._isBot) return;
		if(_linesS){
			if(_vwBefore == GLB._vwOuter) return;
			_linesS.revert();
			_vwBefore = GLB._vwOuter;
		}
		_linesS = new SplitText(_h5, {type:"lines"});
		_lines = _linesS.lines;
		_numLines = _lines.length;
		if(_isOn) return;
		for(var i=0;i<_numLines;++i){
			_lines[i].className = "lineFade";
			TweenLite.set(_lines[i], {y:12, opacity:_baseAlpha, force3D:_f3d});
		}
	}
}
function PAnimation(_p){
	var _this = this;
	var _f3d = true, _isOn = false;
	var _needsRepaint = false;
	var _linesS, _lines;
	var _numLines = 0, _vwBefore = -1;
	var _yOff = 16;
	var _linksHtml = _p.getElementsByTagName("a");
	var _numLinks = _linksHtml.length, _numLinksOverwritten = 0;
	var _links = [];
	var _hasLinks = (_numLinks > 0);
	//Uses classname for css transitions :-)
	
	_this.animIn = function(){
		if(GLB._isBot) return;
		_isOn = true;
		for(var i=0;i<_numLines;++i){
			_lines[i].className = "lineFade in";
			TweenLite.set(_lines[i], {y:0, opacity:1, force3D:_f3d, delay:i*.05+.4});
			//TweenLite.to(_lines[i], 1, {y:0, opacity:1, force3D:_f3d, delay:i*.1, ease:Quad.easeOut});
		}
	}
	_this.animOut = function(){
		if(GLB._isBot) return;
		_isOn = false;
//		_needsRepaint = true;
		for(var i=0;i<_numLines;++i){
			_lines[i].className = "lineFade";
			TweenLite.killTweensOf(_lines[i]);
			TweenLite.set(_lines[i], {y:_yOff, opacity:0, force3D:_f3d});
		}
	}
	//Redraw when needed
	_this.resized = function(){
		if(GLB._isBot) return;
		if(_linesS){
			if(/*!_needsRepaint && */_vwBefore == GLB._vwOuter) return;
			//_needsRepaint = false;
			//Remove link event
			if(_hasLinks){
				try{
					for(var i=0;i<_numLinksOverwritten;++i) _links[i].destroy();
				}
				catch(e){}
				_numLinksOverwritten = 0, _links = [];
			}
			_linesS.revert();
			_vwBefore = GLB._vwOuter;
		}
		_linesS = new SplitText(_p, {type:"lines"});
		_lines = _linesS.lines;
		_numLines = _lines.length;
		if(_numLines <= 1) _yOff = 8;
		else _yOff = 16;
		
		//Overwrite internal links
		if(_hasLinks){
			for(var i=0;i<_numLinks;++i){
				if(_linksHtml[i].className.indexOf("outlineBtn") == -1 && _linksHtml[i].getAttribute("href").indexOf("http") == -1) _links.push(new overWriteLink(_linksHtml[i])); //Internal link
			}
			_numLinksOverwritten = _links.length;
		}
		
		if(_isOn) return;
		for(var i=0;i<_numLines;++i){
			_lines[i].className = "lineFade";
			TweenLite.set(_lines[i], {y:_yOff, opacity:0, force3D:_f3d});
		}
	}
}

/* Case carousel */
function CaseCarousel(_me){
	var _this = this;
	_this.moduleTop = 0, _this.moduleBottom = 0; //When to start/stop this module
	_this.moduleRealTop = 0, _this.moduleRealBottom = 0; //Without the margins
	_this.moduleProximity = 0;
	var initMargins = 0;//Add borders (view height * initMargins) to make sure module only starts when inside that area
	_this.initDelay = 200; //Delay (miliseconds) to wait before starting module. This is relevant if user is scrolling quickly past this module - then it would be stupid to load assets.
	
	var _h = GLB._reliableSh, _offY = 0;
	var _loaded = false, _started = false, _firstDrag = true;
	
	//Image element
	var _outer = document.createElement("div");
	_outer.className = "outer";
	var _inner = document.createElement("nav");
	_inner.className = "inner";
	_outer.appendChild(_inner);
	var _casesHtml = document.getElementsByClassName("work")[0].getElementsByClassName("subpage");
	var _numCases = _casesHtml.length;
	var _cases = [];
	//Instantly build, in order for height to be set correct
	for(var i=0;i<_numCases;++i) _cases.push(new CarouselCase(i, _casesHtml[i], _inner));
	_me.appendChild(_outer);
	
	//Setup desktop swipe/scroll controllers
	var _desktopSwipe = new CarouselSwipe(_inner, _me);
	var _scrollbar = new CarouselScroll(_inner, _me, _numCases);
	GLBEvents(_me, "updateSwipe", updateSwipe, true);
	GLBEvents(_me, "stopSwipe", stopSwipe, true);
	
	var _dragIcon = new makeMePan(_outer);
	
	//Mobile arrows
	var _mobileArrows = new CaseMobileArrows(_outer, _numCases);
	
	//Called when element is within moduleProximity.
	_this.preload = function(){
		//console.log("Preload CaseCarousel");
	}
	_this.prestart = function(){
		///console.log("prestart");
		//_this.preload(); //This will cause that element loads even if scrolled quickly past it!!!
	}
	_this.start = function(){
		_started = true;
		//console.log("start CaseCarousel");
		//_this.preload();
		_desktopSwipe.addListeners(), _scrollbar.addListeners();
		checkInView(-_desktopSwipe._x, GLB._vwOuter-_desktopSwipe._x);
		_firstDrag = true, _dragIcon.start();
	}
	_this.stop = function(){
		_started = false;
		//console.log("stop CaseCarousel");
		_desktopSwipe.removeListeners(), _scrollbar.removeListeners();
		for(var i=0;i<_numCases;++i) _cases[i].stop();
		_dragIcon.stop(true);
	}
	//Scrolling/swiping
	function updateSwipe(e){
		if(e.detail[1] != "scrollbar") _scrollbar.updateSwipe(e.detail[0]);
		if(e.detail[1] != "swiper") _desktopSwipe.updateSwipe(e.detail[0]);
		checkInView(-_desktopSwipe._tweenedX, GLB._vwOuter-_desktopSwipe._tweenedX);
		if(_firstDrag) _firstDrag = false, _dragIcon.stop(false);
		_mobileArrows.setIndex(e.detail[0]);
	}
	function stopSwipe(e){
		if(e.detail != "scrollbar") _scrollbar.stopSwipe();
		if(e.detail != "swiper") _desktopSwipe.stopSwipe();
	}
	
	function checkInView(_l, _r){
		for(var i=0;i<_numCases;++i) _cases[i].checkInView(_l, _r);
	}
	
	
	_this.resume = function(){
		//console.log("Resume CaseCarousel");
		_me.style.display = "block";
		//Load the first (visible only) items
		if(_loaded) return;
		_loaded = true;
		if(_numCases >= 1) _cases[1].load(); //The centered one loads from the beginning, so something is ready when we get down to that section
	}
	_this.pause = function(){
		//console.log("Pause CaseCarousel");
		_me.style.display = "none";
	}
	
	//Write
	_this.resized = function(e){
		
	}
	//Read properties (delayed to avoid layout thrashing)
	_this.layoutUpdate = function(){
		_h = _me.offsetHeight, _offY = GLB.offsetY(_me);
		_this.moduleTop = _this.moduleRealTop = _offY - GLB._reliableSh + (GLB._reliableSh * initMargins);
        _this.moduleBottom = _this.moduleRealBottom = _this.moduleTop + _h + GLB._reliableSh * (1 - initMargins * 2);
		_this.moduleProximity = GLB._reliableSh / 4;
		for(var i=0;i<_numCases;++i) _cases[i].layoutUpdate();
		//Scroll to init position
		var _totalW = _cases[_numCases-1]._w + _cases[_numCases-1]._offX;
		_inner.style.width = _totalW+1 + "px";
		_totalW = _inner.offsetWidth; //Get the right margin too
		if(GLB._isMobile){
			//Scroll to first case
			_desktopSwipe.setInitPos(0);
		}
		else{
			//Scroll to second case
			_desktopSwipe.setInitPos(-_cases[1]._offX + GLB._vw/2 - _cases[1]._w/2);
		}
		_desktopSwipe.setLimit(_totalW, GLB._vwOuter);
		_scrollbar.layoutUpdate(_numCases);
	}
}

function CarouselCase(_id, _case, _parent){
	var _this = this;
	_this._offX = 0;
	_this._w = 0;
	var _aspect = 9/16;
	if(GLB._isMobile) _aspect = 16/9;
	
	var _caseHeader = _case.getElementsByClassName("contentblock")[0];
	var _h1 = _caseHeader.getElementsByTagName("h1")[0];
	var _urls = _case.getAttribute("data-src").split(",");
	
	var _me = document.createElement("a");
	_me.setAttribute("href", _case.getAttribute("data-url"));
	_me.className = "case";
	var _imgHolder = document.createElement("div");
	_imgHolder.className = "imgHolder";
	var _aspectKeeper = document.createElement("div");
	_aspectKeeper.className = "aspectKeeper";
	_aspectKeeper.style.paddingTop = _aspect*100 + "%";
	_imgHolder.appendChild(_aspectKeeper);
	_me.appendChild(_imgHolder);
	_parent.appendChild(_me);
	
	//Videoplayer
	var _video = document.createElement("video");
	_video.className = "inlinevideo";
	_video.preload = "none";
	_video.muted = true;
	_video.autoplay = false;
	_video.controls = false;
	_video.loop = true;
	_video.setAttribute('playsinline', 'true'); // must be set before src is set or it will be ignored
	_video.playsinline = true;
	var _srcMp4 = document.createElement("source"); 
	_srcMp4.type = "video/mp4";
	if(GLB._isMobile) _srcMp4.src = _videoPrefix + _urls[1];
	else _srcMp4.src = _videoPrefix + _urls[0];
	_video.appendChild(_srcMp4);
	_aspectKeeper.appendChild(_video);
	
	var _a = document.createElement("div");
//	_a.setAttribute("href", _case.getAttribute("data-url"));
	_a.textContent = _h1.textContent;
	_a.className = "link";
	_me.appendChild(_a);
	var _label = new WorkHeaderBtn(_id, _a, _aspectKeeper);
	_label.carouselLink();
	if(!GLB._isTouch){
		GLBEvents(_me, "mouseenter", over, true);
		GLBEvents(_me, "mouseleave", out, true);
	}
	function over(e){
		if(GLB._supportsClassList) _me.classList.add("over");
		_label.highlight();
	}
	function out(e){
		if(GLB._supportsClassList) _me.classList.remove("over");
		_label.unhighlight();
	}
	
	//Click event
	var _acceptClick = false, _acceptTimer;
	if(GLB._isTouch) GLBEvents(_me, "touchstart", down, true), GLBEvents(_me, "touchend", clicked, true);
	else GLBEvents(_me, "mousedown", down, true), GLBEvents(_me, "click", clicked, true);
	overWriteLink(_me);
	
	function down(){
		_acceptClick = true;
		clearTimeout(_acceptTimer);
		_acceptTimer = setTimeout(acceptClick, 300);
	}
	function acceptClick(){
		_acceptClick = false;
	}
	function clicked(e){
		if(!_acceptClick){
			e.preventDefault();
			e.stopImmediatePropagation();
			//console.log("Cancel click");
		}
	}
	
	var _playing = false;
	function play(){
		_playing = true;
		_video.play();
		//console.log("Play", _id)
	}
	function pause(){
		_playing = false;
		_video.pause();
		//console.log("Pause", _id)
	}
	
	//Carousel not currently in viewport
	_this.stop = function(){
		if(_playing) pause();
	}
	
	var _loadInit = false;
	_this.load = function(){
		if(_loadInit) return;
		_loadInit = true;
		_video.load();
		if(GLB._supportsClassList){
			if(_id == 1) _me.classList.add("fastloaded");
			else _me.classList.add("loaded");
		}
		else _me.className += " fastloaded";
	}
	
	var _p = 0;
	var _inView = false;
	_this.checkInView = function(_l, _r){
		//Manage label position
		_p = -(_l + (GLB._vwOuter/2 - _this._w/2) - _this._offX) / (GLB._vwOuter + _this._w);// + _this._w) / (GLB._vwOuter/_this._w);
		
		if(_loadInit){
			//Just manage play/pause
			_l -= _this._w;
			if(_this._offX > _l && _this._offX < _r){
				_inView = true;
				if(!_playing) play();
			}
			else{
				_inView = false;
				if(_playing) pause();
			}
		}
		else{
			//Check for loading
			_l -= _this._w * 1.25, _r += _this._w * .25; //Increase a little so elements load before entering viewport
			if(_this._offX > _l && _this._offX < _r) _this.load();
		}
		//Parallax on label
		if(_inView) TweenLite.set(_a, {x:_this._w * .25 * _p, force3D:true});
	}
	
	_this.layoutUpdate = function(){
		_this._offX = _me.offsetLeft, _this._w = _me.offsetWidth;
	}
}

function CarouselSwipe(_container, _hitarea){
	var _this = this;
	_this._x = 0;
	_this._tweenedX = 0;
	var _speed = .1, _limitX, _startTime, _endTime, _timeDown, _removeClickTimer, _movedX = 0, _initX = 0, _initDragX, _initDragY, _pageX, _pageY, _decrease = .95, _pos = [], _dir = 0, _delta = 0, _lastMoved = 0;
	var _down = false, _running = false, _dragXIsInit = false, _dragYIsInit = false, _updatingFromNav = false, _wasUpdatedFromNav = false, _hasBeenUsed = false;
	if(GLB._isMobile) _speed = .4, _decrease = .95;
	
	function startSw(e){
		_startTime = new Date().getTime();
		_down = _hasBeenUsed = true;
		_dragYIsInit = _updatingFromNav = _wasUpdatedFromNav = false;
		//Listen for movement and stop
		if(GLB._isTouch){
			_initDragX = _pageX = e.touches[0].pageX, _initDragY = _pageY = e.touches[0].pageY;
			GLBEvents(_hitarea, "touchstart", startSw, false);
			document.addEventListener("touchend", endSw, true); //useCapture is needed her to avoid children receiving event before this
			GLBEvents(document, "touchmove", moved, true);
		}
		else{
			_initDragX = _pageX = e.pageX, _initDragY = _pageY = e.pageY;
			GLBEvents(_hitarea, "mousedown", startSw, false);
			document.addEventListener("mouseup", endSw, true); //useCapture is needed her to avoid children receiving event before this
			GLBEvents(document, "mousemove", moved, true);
		}
		_container.addEventListener("click", clicked, true); //useCapture is needed her to avoid children receiving event before this
		_movedX = 0, _initX = _this._x;
		//Add cursor if engine is already running
		if(_dragXIsInit && GLB._supportsClassList && !GLB._isTouch) _hitarea.classList.add("moving");
	}
	function moved(e){
		if(GLB._isTouch) _pageX = e.touches[0].pageX, _pageY = e.touches[0].pageY;
		else _pageX = e.pageX, _pageY = e.pageY;
		//Check for scrolling vertical and disable
		if(_dragYIsInit) return;
		else if(!_dragXIsInit){
			//Check threshold
			if(Math.abs(_pageX-_initDragX) >= GLB._thresholdSwipe){
				_dragXIsInit = true;
				_movedX = 0, _initDragX = _pageX;
				TweenLite.killTweensOf(_container, false, {x:true});
				TweenLite.killTweensOf(_this);
				_initX = _this._x;
				_running = true, TweenLite.ticker.addEventListener('tick', dragEngine);
				e.preventDefault();
				//Move cursor
				if(GLB._supportsClassList && !GLB._isTouch) _hitarea.classList.add("moving");
			}
			else if(GLB._isTouch && Math.abs(_pageY-_initDragY) > GLB._thresholdSwipe*4) _dragYIsInit = true;
		}
		else if(_dragXIsInit) e.stopImmediatePropagation(), e.preventDefault(), _movedX = _pageX-_initDragX;
	}
	function endSw(e){
		if(GLB._isTouch){
			GLBEvents(_hitarea, "touchstart", startSw, true);
			document.removeEventListener("touchend", endSw, true);
			GLBEvents(document, "touchmove", moved, false);
		}
		else{
			GLBEvents(_hitarea, "mousedown", startSw, true);
			document.removeEventListener("mouseup", endSw, true);
			GLBEvents(document, "mousemove", moved, false);
			if(GLB._supportsClassList && !GLB._isTouch) _hitarea.classList.remove("moving");
		}
		_removeClickTimer = setTimeout(removeClick, 100);
		//Measure time pressed down
		_endTime = new Date().getTime();
		_timeDown = _endTime - _startTime;
		if(_dragXIsInit){
			//Slide away functionality (use latest 4 recorded points)
			var _l = Math.min(_pos.length, 4), _dirBefore = _dir;
			_dir = 0;
			if(_l > 0){
				for(var i = 0; i < _l; ++i) _dir += _pos[i];
				_dir /= _l;
			}
			_pos = [];
			_lastMoved = 0;
			if(!GLB._isMobile) _dir *= .5;//Decrease effect
			else if(GLB._isMobile) _dir *= 1.5;//Increase effect
			if(_dir < -100) _dir = -100;
			else if(_dir > 100) _dir = 100;
			//If throwing same direction fast: we add a little the previous direction and speed it up - user is trying to scroll quickly in the container!
			if((_dirBefore < 0 && _dir < 0) || (_dirBefore > 0 && _dir > 0) && _timeDown < 300) _dir *= 1.2;
		}
		_down = false;
	}
	function clicked(e){
		if(_dragYIsInit || (_dragXIsInit && (Math.abs(_movedX) > 16 || _timeDown > 300))) e.stopImmediatePropagation(), e.preventDefault();
	}
	function removeClick(){
		_hitarea.removeEventListener("click", clicked, true);
	}
	
	function dragEngine(e){
		if(_updatingFromNav) _this._x = _movedX;
		else if(!_down){
			if(Math.abs(_this._x-_this._tweenedX)<.1 && Math.abs(_dir) < .02){
				//console.log("Stop engine");
				_dragXIsInit = _dragYIsInit = _running = false;
				_dir = 0;
				_this._x = _this._tweenedX = Math.round(_this._tweenedX);
				TweenLite.set(_container, {x:_this._x, force3D:true});
				TweenLite.ticker.removeEventListener('tick', dragEngine);
				if(!_updatingFromNav && !_wasUpdatedFromNav) _container.dispatchEvent(GLBCustomEvent("stopSwipe", "swiper"));
				return;
			}
			if(!_wasUpdatedFromNav){
				//Thrown
				_this._x -= _dir;
				_dir *= _decrease; //Decrease speed
				checkLimit();
			}
			else _this._x = _movedX;
		}
		else{
			_this._x = _movedX+_initX;
			checkLimit();
			_delta = _lastMoved-_movedX, _lastMoved = _movedX;
			_dir *= 4
			//Dragged
			if(_pos.length > 4) _pos.shift();
		    _pos.push(_delta);
		}
		//Update other navigation elements
		if(!_updatingFromNav && !_wasUpdatedFromNav) _container.dispatchEvent(GLBCustomEvent("updateSwipe", [_this._x / _limitX, "swiper"]));
		
		_this._tweenedX += (_this._x-_this._tweenedX) * _speed;
		TweenLite.set(_container, {x:_this._tweenedX, force3D:true});
	}
	function checkLimit(){
		if(_this._x < _limitX) _this._x = _limitX;
		else if(_this._x > 0) _this._x = 0;
	}
	
	_this.addListeners = function(){
		if(GLB._isTouch) GLBEvents(_hitarea, "touchstart", startSw, true);
		else GLBEvents(_hitarea, "mousedown", startSw, true);
	}
	_this.removeListeners = function(){
		if(GLB._isTouch) GLBEvents(_hitarea, "touchstart", startSw, false);
		else GLBEvents(_hitarea, "mousedown", startSw, false);
	}
	
	_this.setInitPos = function(x){
		if(!_hasBeenUsed) _this._x = _this._tweenedX = x;
	}
	
	_this.setLimit = function(_totalW, _availW){
		_limitX = -_totalW + _availW;
		//Update to make sure borders are respected and scrollbars in right position
		checkLimit();
		_this._tweenedX = _this._x;
		TweenLite.set(_container, {x:_this._x, force3D:true});
		_container.dispatchEvent(GLBCustomEvent("updateSwipe", [_this._x / _limitX, "swiper"]));
	}
	
	//(external) Navigation is used to update position
	_this.updateSwipe = function(_percent){
		if(_down) return;
		_movedX = _limitX*_percent;
		_wasUpdatedFromNav = false, _updatingFromNav = true;
		if(!_running) _running = true, TweenLite.ticker.addEventListener('tick', dragEngine);
	}
	//Nav stopped
	_this.stopSwipe = function(){
		if(!_updatingFromNav) return;
		_updatingFromNav = false, _wasUpdatedFromNav = true;
		if(!_down) _dir = 0;
	}
}

function CarouselScroll(_container, _parent, _numImgs){
	var _this = this;
	
	var _me = document.createElement("div");
	_me.className = "hScrollbar";
	var _bg = document.createElement("div");
	_bg.className = "bg";
	_me.appendChild(_bg);
	var _bar = document.createElement("div");
	_bar.className = "bar";
	var _barSolid = document.createElement("div");
	_barSolid.className = "solid";
	_bar.appendChild(_barSolid);
	_me.appendChild(_bar);
	_parent.appendChild(_me);
	
	var _totalW = 0, _barW = 0, _timer, _percent = 0, _numCases = 8;
	
	_this.layoutUpdate = function(numCases){
		_numCases = numCases;
		_totalW = _me.offsetWidth;
		if(_totalW == 0){
			//console.log("No width measured");
			clearTimeout(_timer);
			_timer = setTimeout(_this.layoutUpdate, 100);
			return;
		}
		_barW = 60;
		if(GLB._isMobile) _barW = 30;
		_bar.style.width = _barW + "px";
		_limitX = _totalW - _barW;
		
		_x = _percent*(_totalW-_barW);
		TweenLite.set(_bar, {x:_x, force3D:true});
	}
	
	_this.addListeners = function(){
		if(GLB._isTouch){
			GLBEvents(_bar, "touchstart", startSw, true);
			GLBEvents(_me, "touchstart", _bgDown, true);
		}
		else{
			GLBEvents(_bar, "mousedown", startSw, true);
			GLBEvents(_me, "mousedown", _bgDown, true);
			GLBEvents(_parent, "wheel", wheeled, true);
		}
		GLBEvents(window, "scrollCarousel", buttonScroll, true);
	}
	_this.removeListeners = function(){
		if(GLB._isTouch){
			GLBEvents(_bar, "touchstart", startSw, false);
			GLBEvents(_me, "touchstart", _bgDown, false);
		}
		else{
			GLBEvents(_bar, "mousedown", startSw, false);
			GLBEvents(_me, "mousedown", _bgDown, false);
			GLBEvents(_parent, "wheel", wheeled, false);
		}
		GLBEvents(window, "scrollCarousel", buttonScroll, false);
	}
	
	//Scroll by clicking buttons (jump 1 case)
	var _lastBtnValue = 0, _buttonscrollTimer;
	function buttonScroll(e){
		if(_lastBtnValue != 0){
			if(e.detail == 0) _percent = _lastBtnValue-1/(_numCases-1);
			else _percent = _lastBtnValue+1/(_numCases-1);
		}
		else{
			if(e.detail == 0) _percent -= 1/(_numCases-1);
			else _percent += 1/(_numCases-1);
		}
		_lastBtnValue = _percent;
		clearTimeout(_buttonscrollTimer);
		_buttonscrollTimer = setTimeout(resetBtnScroll, 1000)
		
		if(_percent < 0) _percent = 0;
		else if(_percent > 1) _percent = 1;
		gotoX(_percent*(_totalW-_barW))
	}
	function resetBtnScroll(){
		_lastBtnValue = 0;
	}
	
	//Clicking bg to jump
	var _downTimer;
	function _bgDown(e){
		if(_running) return;
		e.stopPropagation(), e.preventDefault();
		if(GLB._isTouch) gotoX(e.touches[0].pageX-_me.offsetLeft-_barW*.5);
		else gotoX(e.pageX-_me.offsetLeft-_barW*.5);
		
	}
	function unDown(){
		_down = false;
	}
	function gotoX(_toX){
		_down = true;
		clearTimeout(_downTimer);
		_downTimer = setTimeout(unDown, 100);
		_initX = 0;
		_tweenedMovedX = _x;
		_movedX = _toX;
		TweenLite.killTweensOf(_container, false, {x:true}), TweenLite.killTweensOf(_this);
		if(_movedX < 0) _movedX = 0;
		else if(_movedX > _limitX) _movedX = _limitX;
		_running = true, TweenLite.ticker.addEventListener('tick', dragEngine);
	}
	
	//Wheel
	var _wheelMinimum = 6, _wheelTimer;
	function wheeled(e){
		try{
			if(Math.abs(e.deltaX) > _wheelMinimum){
				e.stopPropagation(), e.preventDefault();
				gotoX(_x + e.deltaX*.5);
				_wheelMinimum = .5;
				clearTimeout(_wheelTimer);
				_wheelTimer = setTimeout(resetMinWheel, 500);
			}
		}
		catch(e){}
	}
	function resetMinWheel(){
		_wheelMinimum = 6;
	}
		
	var _x = 0, _limitX, _movedX, _tweenedMovedX = 0, _initX = 0, _initDragX, _pageX;
	var _down = false, _running = false;
	
	function startSw(e){
		e.stopImmediatePropagation();
		if(_down) return;
		_down = true;
		//Listen for movement and stop
		if(GLB._isTouch){
			_initDragX = _pageX = e.touches[0].pageX, _initDragY = _pageY = e.touches[0].pageY;
			GLBEvents(_bar, "touchstart", startSw, false);
			GLBEvents(document, "touchend", endSw, true);
			GLBEvents(document, "touchmove", moved, true);
		}
		else{
			_initDragX = _pageX = e.pageX, _initDragY = _pageY = e.pageY;
			GLBEvents(_bar, "mousedown", startSw, false);
			GLBEvents(document, "mouseup", endSw, true);
			GLBEvents(document, "mousemove", moved, true);
		}
		if(GLB._supportsClassList) _me.classList.add("dragged");
		_movedX = _tweenedMovedX = 0;
		_this._speed = 1;
		TweenLite.killTweensOf(_container, false, {x:true}), TweenLite.killTweensOf(_this);
		_initX = _x;
		_running = true, TweenLite.ticker.addEventListener('tick', dragEngine);
		e.preventDefault();
	}
	function endSw(e){
		if(GLB._isTouch){
			GLBEvents(_bar, "touchstart", startSw, true);
			GLBEvents(document, "touchend", endSw, false);
			GLBEvents(document, "touchmove", moved, false);
		}
		else{
			GLBEvents(_bar, "mousedown", startSw, true);
			GLBEvents(document, "mouseup", endSw, false);
			GLBEvents(document, "mousemove", moved, false);
		}
		_down = false;
		if(GLB._supportsClassList) _me.classList.remove("dragged");
	}

	function moved(e){
		if(GLB._isTouch) _pageX = e.touches[0].pageX, _pageY = e.touches[0].pageY;
		else _pageX = e.pageX, _pageY = e.pageY;
		e.stopImmediatePropagation(), e.preventDefault();
		_movedX = _pageX-_initDragX;
	}
	
	function dragEngine(e){
		_tweenedMovedX += (_movedX-_tweenedMovedX)*.2;
		_x = _tweenedMovedX+_initX;
		
		if(_x < 0) _x = 0;
		else if(_x > _limitX) _x = _limitX;
		TweenLite.set(_bar, {x:_x, force3D:true});
		_container.dispatchEvent(GLBCustomEvent("updateSwipe", [_x / (_totalW-_barW), "scrollbar"]));
		_percent = _x/(_totalW-_barW);
		
		if(!_down && Math.abs(_tweenedMovedX-_movedX) < .00001){
			//console.log("Stop scrollbar");
			_lastBtnValue = 0;
			_container.dispatchEvent(GLBCustomEvent("stopSwipe", "scrollbar"));
			_running = false, TweenLite.ticker.removeEventListener('tick', dragEngine);
		}
	}
	_this._speed = 1;
	//Called when other controllers are used
	_this.updateSwipe = function(_p){
		_percent = _p;
		if(_down) return;
		if(_running){
			_running = false, TweenLite.ticker.removeEventListener('tick', dragEngine);
			//Still tweening position so adjust for this by tweening speed (so scrollbar eases into new position controlled by external nav/swiper)
			TweenLite.killTweensOf(_this);
			_this._speed = .05;
			TweenLite.to(_this, 1.0, {_speed:1, ease:Quad.easeInOut});
		}
		_x += (_percent*(_totalW-_barW) - _x) * _this._speed;
		TweenLite.set(_bar, {x:_x, force3D:true});
	}
	_this.stopSwipe = function(){
		if(_running) return;
		if(_x < 0) _x = 0;
		else if(_x > _limitX) _x = _limitX;
		else return;
		TweenLite.to(_bar, .6, {x:_x, force3D:true, ease:Cubic.easeOut});
	}
	
	_this.destroy = function(){
		clearTimeout(_timer);
		TweenLite.ticker.removeEventListener('tick', dragEngine);
		TweenLite.killTweensOf(_this);
		TweenLite.killTweensOf(_bar);
		_this.removeListeners();
		clearTimeout(_wheelTimer);
		clearTimeout(_downTimer);
		GLBEvents(document, "touchend", endSw, false);
		GLBEvents(document, "touchmove", moved, false);
		GLBEvents(document, "mouseup", endSw, false);
		GLBEvents(document, "mousemove", moved, false);
		_bar.removeChild(_barSolid);
		_me.removeChild(_bar);
		_parent.removeChild(_me);
		_barSolid = null;
		_bar = null;
		_me = null;
	}
}

function CaseMobileArrows(_parent, _numCases){
	var _this = this;
	var _built = false;
	var _lastIndex = 1;
	
	_this.setIndex = function(_p){
		if(!_built) return;
		var _index = Math.round(_p*(_numCases-1)) + 1;
		if(_lastIndex == _index) return;
		_lastIndex = _index;
		if(_index < 10) _indLeft.textContent = "0"+_index;
		else _indLeft.textContent = _index+"";
	}
	
	if(!GLB._isMobile) return;
	_built = true;
	
	var _me = document.createElement("div");
	_me.className = "mobileArrows";
	var _left = document.createElement("div");
	_left.className = "arrow left";
	var _right = document.createElement("div");
	_right.className = "arrow right";
	_me.appendChild(_left);
	_me.appendChild(_right);
	
	GLBEvents(_left, "touchstart", downL, true);
	GLBEvents(_right, "touchstart", downR, true);
	function downL(e){
		e.stopPropagation(), e.preventDefault();
		window.dispatchEvent(GLBCustomEvent("scrollCarousel", 0));
		TweenLite.to(_left, .2, {x:-4, ease:Strong.easeOut});
		TweenLite.to(_left, .5, {x:0, ease:Cubic.easeOut, delay:.2});
	}
	function downR(e){
		e.stopPropagation(), e.preventDefault();
		window.dispatchEvent(GLBCustomEvent("scrollCarousel", 1));
		TweenLite.to(_right, .2, {x:4, ease:Strong.easeOut});
		TweenLite.to(_right, .5, {x:0, ease:Cubic.easeOut, delay:.2});
	}
	
	var _indicator = document.createElement("div");
	_indicator.className = "indicator";
	var _indLeft = document.createElement("div"), _indRight = document.createElement("div");
	_indLeft.className = "left", _indRight.className = "right";
	_indicator.appendChild(_indLeft), _indicator.appendChild(_indRight);
	_indLeft.textContent = "01";
	if(_numCases < 10) _indRight.textContent = "0"+_numCases;
	else _indRight.textContent = _numCases+"";
	_me.appendChild(_indicator);
	
	_parent.appendChild(_me);
}

//Google Map for Contact page
function ContactMap(_parent, _mapdata){
	var _this = this;
	var _firstTime = true;
	var _mapInstance;
	
	//Use this name in order to align with parent class (normally using images)
	_this.img = document.createElement("div");
	_this.img.className = "img fadeImg";
	_this.img.style.visibility = "visible";
	_this.img.style.width = _this.img.style.height = "100%";
	_parent.appendChild(_this.img);
	
	_this.load = function(){
		//console.log("Load map");
		if(_GMReady) initMap();
		else GLBEvents(window, "GMAPIReady", initMap, true);
		
		if(_firstTime){
			_firstTime = false;
			var _mapsJs = document.createElement('script');
			_mapsJs.setAttribute("type","text/javascript");
			_mapsJs.setAttribute("async","");
			_mapsJs.setAttribute("defer","");
			_mapsJs.setAttribute("src", "https://maps.googleapis.com/maps/api/js?key=AIzaSyAdX9IL3YPyElz_O5e0eslhtxCw7Qpr_zE&callback=GML");
			document.body.appendChild(_mapsJs);
		}
	}

	var _initPos = {lat:parseFloat(_mapdata[0]), lng:parseFloat(_mapdata[1])}, _initZoom = 15;
	function initMap(e){
		GLBEvents(window, "GMAPIReady", initMap, false);
		
 		//Custom style
		_mapInstance = new google.maps.Map(_this.img,{center:_initPos, zoom:_initZoom, mapTypeControl:false,zoomControl:true,scaleControl:false,rotateControl:false,streetViewControl:false,fullscreenControl:false,
			styles: [
				{
					"elementType": "geometry",
					"stylers": [
						{
							"color": "#f5f5f5"
						}
					]
				},
				{
					"elementType": "labels.icon",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				},
				{
					"elementType": "labels.text.fill",
					"stylers": [
						{
							"color": "#616161"
						}
					]
				},
				{
					"elementType": "labels.text.stroke",
					"stylers": [
						{
							"color": "#f5f5f5"
						}
					]
				},
				{
					"featureType": "administrative.land_parcel",
					"elementType": "labels.text.fill",
					"stylers": [
						{
							"color": "#bdbdbd"
						}
					]
				},
				{
					"featureType": "poi",
					"elementType": "geometry",
					"stylers": [
						{
							"color": "#eeeeee"
						}
					]
				},
				{
					"featureType": "poi",
					"elementType": "labels.text.fill",
					"stylers": [
						{
							"color": "#757575"
						}
					]
				},
				{
					"featureType": "poi.park",
					"elementType": "geometry",
					"stylers": [
						{
							"color": "#e5e5e5"
						}
					]
				},
				{
					"featureType": "poi.park",
					"elementType": "labels.text.fill",
					"stylers": [
						{
							"color": "#9e9e9e"
						}
					]
				},
				{
					"featureType": "road",
					"elementType": "geometry",
					"stylers": [
						{
							"color": "#ffffff"
						}
					]
				},
				{
					"featureType": "road.arterial",
					"elementType": "labels.text.fill",
					"stylers": [
						{
							"color": "#757575"
						}
					]
				},
				{
					"featureType": "road.highway",
					"elementType": "geometry",
					"stylers": [
						{
							"color": "#dadada"
						}
					]
				},
				{
					"featureType": "road.highway",
					"elementType": "labels.text.fill",
					"stylers": [
						{
							"color": "#616161"
						}
					]
				},
				{
					"featureType": "road.local",
					"elementType": "labels.text.fill",
					"stylers": [
						{
							"color": "#9e9e9e"
						}
					]
				},
				{
					"featureType": "transit.line",
					"elementType": "geometry",
					"stylers": [
						{
							"color": "#e5e5e5"
						}
					]
				},
				{
					"featureType": "transit.station",
					"elementType": "geometry",
					"stylers": [
						{
							"color": "#eeeeee"
						}
					]
				},
				{
					"featureType": "water",
					"elementType": "geometry",
					"stylers": [
						{
							"color": "#c9c9c9"
						}
					]
				},
				{
					"featureType": "water",
					"elementType": "labels.text.fill",
					"stylers": [
						{
							"color": "#9e9e9e"
						}
					]
				}
			]
		});
		google.maps.event.addListenerOnce(_mapInstance, 'tilesloaded', mapLoaded);
		
		var image = "Assets/Grx/pin.png";
		var marker = new google.maps.Marker({position:_initPos, map:_mapInstance, title:'Verity Studios AG', icon:image});
	}
	
	function mapLoaded(e){
		//console.log("mapLoaded");
		_this.img.className = "img fadeImg in";
	}
}
//Manage Google Maps
function GML(){
	_GMReady = true;
	window.dispatchEvent(GLBCustomEvent("GMAPIReady", 0));
}
var _GMReady = false;



/* Newsletter */
function Newsletter(_me){
	//console.log("New Newsletter Module - singleton...!")
	var _this = this;
	_this.moduleTop = 0, _this.moduleBottom = 0; //When to start/stop this module
	_this.moduleRealTop = 0, _this.moduleRealBottom = 0; //Without the margins
	_this.moduleProximity = 0;
	var initMargins = 0;//Add borders (view height * initMargins) to make sure module only starts when inside that area
	_this.initDelay = 50; //Delay (miliseconds) to wait before starting module. This is relevant if user is scrolling quickly past this module - then it would be stupid to load assets.
	
	var _h = GLB._reliableSh, _offY = 0;
	var _started = false;
	
	//CTA button
	var _cta = _me.getElementsByClassName("cta")[0];
	GLBEvents(_cta, "click", showPopup, true);
	var _closeBtn = _me.getElementsByClassName("closeBtn")[0];
	GLBEvents(_closeBtn, "click", close, true);
	var _popup = _me.getElementsByClassName("newsletterpopup")[0];
	var _form = _popup.getElementsByClassName("form")[0];
	GLBEvents(_form, "submit", submittingForm, true);
	var _formMailchimp = _form.getElementsByTagName("form")[0];
	var _submitBtn = _formMailchimp.getElementsByClassName("submit")[0];
	var _signupBtn = _form.getElementsByClassName("outlineBtn")[0];
	GLBEvents(_signupBtn, "click", submit, true);
	var _outlineBtn = new OutlineBtn(_signupBtn, true);
	_outlineBtn.resume();
	var _tick = _form.getElementsByClassName("tick")[0];
	var _tickRect = _tick.getElementsByClassName("rect")[0];
	GLBEvents(_tick, "click", toggleAccept, true);
	var _accepted = false;
	
	function toggleAccept(e){
		_accepted = !_accepted;
		if(_accepted){
			if(GLB._supportsClassList) _tickRect.classList.add("selected");
			_outlineBtn.active();
		}
		else{
			if(GLB._supportsClassList) _tickRect.classList.remove("selected");
			_outlineBtn.inactive();
		}
	}
	
	function showPopup(e){
		if(e) e.stopPropagation();
		_popup.style.display = "block";
		document.body.appendChild(_popup);
		_outlineBtn.resume();
		_outlineBtn.fakeLayoutUpdate();
		_outlineBtn.start(.5);
		_outlineBtn.inactive();
		//setTimeout(confirmMsg, 2000);//debug
	}
	//setTimeout(showPopup, 500);//debug
	
	function submit(e){
		e.preventDefault(), e.stopPropagation();
		if(!_accepted) return;
		_submitBtn.click();
	}
	//Needed if user press "enter"
	function submittingForm(e){
		if(!_accepted) e.preventDefault(), e.stopPropagation();
		else confirmMsg();
	}
	
	//Manage confirm message
	var _thanks = _me.getElementsByClassName("thanks")[0];
	var _closeThanksBtn = _thanks.getElementsByClassName("outlineBtn")[0];
	var _outlineBtnB;
	GLBEvents(_closeThanksBtn, "click", clickedClose, true);
	
	//Close from "thank you"
	function clickedClose(e){
		try{e.preventDefault(), e.stopImmediatePropagation();}
		catch(e){}
		if(GLB._supportsClassList) _popup.classList.remove("completed");
		_outlineBtnB.stop();
		_outlineBtnB.pause();
		//Reset form
		_formMailchimp.reset();
		//Remove popup
		close();
	}
	
	function confirmMsg(){
		if(GLB._supportsClassList) _popup.classList.add("completed");
		if(!_outlineBtnB) _outlineBtnB = new OutlineBtn(_closeThanksBtn, true);
		_outlineBtnB.resume();
		_outlineBtnB.start();
	}
	
	//Close button (form)
	function close(e){
		_popup.style.display = "none";
		_me.appendChild(_popup);
		if(_accepted){
			_accepted = false;
			if(GLB._supportsClassList) _tickRect.classList.remove("selected");
			_outlineBtn.inactive();
		}
		_outlineBtn.stop(), _outlineBtn.pause();
	}
	
	//Called when element is within moduleProximity.
	_this.preload = function(){
		//console.log("Preload Newsletter");
	}
	_this.prestart = function(){
		//console.log("prestart");
		//_this.preload(); //This will cause that element loads even if scrolled quickly past it!!!
	}
	_this.start = function(){
		_started = true;
		//console.log("start Newsletter");
	}
	_this.stop = function(){
		_started = false;
		//console.log("stop Newsletter");
	}
	_this.resume = function(){
		//console.log("Resume Newsletter");
		_me.style.display = "block";
	}
	_this.pause = function(){
		//console.log("Pause Newsletter");
		_me.style.display = "none";
	}
		
	//Write
	_this.resized = function(e){}
	//Read properties (delayed to avoid layout thrashing)
	_this.layoutUpdate = function(){
		_h = _me.offsetHeight, _offY = GLB.offsetY(_me);
		_this.moduleTop = _this.moduleRealTop = _offY - GLB._reliableSh + (GLB._reliableSh * initMargins);
        _this.moduleBottom = _this.moduleRealBottom = _this.moduleTop + _h + GLB._reliableSh * (1 - initMargins * 2);
		_this.moduleProximity = GLB._reliableSh / 8;
	}
}