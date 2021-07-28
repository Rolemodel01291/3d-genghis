/*
v 1.0 - revised 4/3 ILTP
*/
function Work(_me){
	var _this = this;
	
	//console.log("Home page");
	var _built = false;
	var _front;
	var _casesHtml = _me.getElementsByClassName("subpage");
	var _numCases = _casesHtml.length;
	var _atFront = false;
	var _subPageurls = []
	var _cases = []; //Subpages with case studies
	for(var i=0;i<_numCases;++i) _subPageurls.push((_casesHtml[i].getAttribute("data-url") || ""));
	
	_this.start = function(){
		//console.log("Start Work");
		if(!_built){
			_built = true;
			_front = new WorkOverview(_me);
		}
		else _front.resume();
		_3dController.subpageOff();
		//_sharedTemplates["caseCarousel"].pause();
		_sharedTemplates["newsletter"].pause();
		_this.subpageChange(true);
	}
	_this.stop = function(){
		//console.log("Stop Work");
		_front.pause();
		hideOldSubpage();
	}
	
	var _l, _nextPage;
	var _activeSubpage;
	_this.subpageChange = function(_skip){
		_l = _router.getPages().length;
		//console.log("subpageChange", _router.getPages(), "_l", _l);
		TweenLite.killTweensOf(frontAnimOutOver);
		if(_l <= 1){
			_front.show();
			if(_atFront) return; //Avoid being able to click "work" in menu when already at frontpage
			_atFront = true;
			hideOldSubpage();
			//Jump to top of window
			window.scrollTo(0,0);
			GLB._windowScrollTweenedY = GLB._windowScrollY = 0;
			if(!_skip) TweenLite.delayedCall(.07, forceResize); //Force resize in order for bounds and offsets to be read correctly 
		}
		else{
			_atFront = false;
			_front.hide();
			_nextPage = findNextId();
			if(!_activeSubpage){
				//Coming from frontpage, so we move window to top and build subpage on completion
				_scroller.speedUp(1);
				if(GLB._isBot){
					frontAnimOutOver(); //Instant for bots
				}
				else{
					TweenLite.to(window, .8, {scrollTo:{y:0, autoKill:!GLB._isTouch}, delay:.2, ease:Cubic.easeInOut});
					TweenLite.delayedCall(1, frontAnimOutOver);
				}				
			}
			else if(_activeSubpage){
				//Show subpage after coming from another subpage (clicking next case button)
				_pageTransition.animate(readyForNextPage, true);
			}
		}
	}
	
	//Menu items are gone and window scrolled to top
	function frontAnimOutOver(){
		_front.setHeightZero();
		//Show subpage after coming from frontpage
		showNewSubpage();
	}
	function findNextId(){
		var _url = _router.getFullUrl();
		for(var i=0;i<_numCases;++i){
			if(_url == _subPageurls[i]){
				return i;
			}
		}
	}
	function hideOldSubpage(){
		//console.log("hideOldSubpage");
		if(_activeSubpage) _activeSubpage.stop(), _activeSubpage = null;
	}
	function showNewSubpage(){
		//console.log("showNewSubpage", _nextPage);
		if(_activeSubpage != _cases[_nextPage]) hideOldSubpage();
		if(!_cases[_nextPage]){
			//Subpage has not been created yet
			//console.log("Build subpage:", _nextPage);
			_cases[_nextPage] = new PageTemplate(CaseStudy, _casesHtml[_nextPage]);
		}
		_activeSubpage = _cases[_nextPage];
		_activeSubpage.start();
		TweenLite.delayedCall(.07, forceResize); //Force resize in order for bounds and offsets to be read correctly 
		//TweenLite.delayedCall(.5, fireScroll); //Trigger scroll, to make sure animations in headers are activated
		//TweenLite.to(window, 1.2, {scrollTo:{y:GLB._reliableSh * ., autoKill:!GLB._isTouch}, delay:.1, ease:Strong.easeInOut});//Scroll to first section with text
	}
	function readyForNextPage(){
		_scroller.pageChange();
		showNewSubpage();
	}
}

/*Overview is always visible - either as overview or first (header) element for case study*/
function WorkOverview(_parent){
	var _this = this;
	var _started = false;
	var _me = _parent.getElementsByClassName("allwork")[0];
	if(GLB._isMobile){
		//Set instantly the first time, so we don't have to wait for layoutupdate
		var _mh = _me.offsetHeight;
		if(_mh > 10) _parent.style.minHeight = _mh + 150 + "px";
	}
	var _cases = _parent.getElementsByClassName("subpage");
	var _bgVideos = document.createElement("div");
	_bgVideos.className = "bgPlayer";
	document.body.insertBefore(_bgVideos, document.body.firstChild);
	var _numCases = _cases.length;
	//Create all players (they don't preload anyway)
	var _bgPlayers = [];
	for(var i=0;i<_numCases;++i) _bgPlayers.push(new WorkHeaderPlayer(i, _cases[i], _bgVideos, _parent));
	//Links
	var _linksHtml = _me.getElementsByTagName("a");
	var _numLinks = _linksHtml.length;
	var _links = [];
	if(_numLinks != _numCases){
		console.log("Mismatch in number of cases and links to cases!");
		_numLinks = _numCases = Math.min(_numLinks, _numCases);
	}
	for(var i=0;i<_numLinks;++i) _links.push(new WorkHeaderBtn(i, _linksHtml[i], _me));
	for(i=0;i<_numLinks;++i) _links[i].reset();
	
	var _curPlayer = -1;
	GLBEvents(_me, "highlight", highlight, true);
	GLBEvents(_me, "unhighlight", unhighlight, true);
	function highlight(e){
		//console.log("highlight", _curPlayer, e.detail);
		_links[e.detail].highlight();
		if(_curPlayer == e.detail) return;
		if(_curPlayer != -1) _bgPlayers[_curPlayer].pausePlayer(false);
		_curPlayer = e.detail;
		_bgPlayers[_curPlayer].play();
	}
	function unhighlight(e){
		_links[e.detail].unhighlight();
	}
	
	//Start/stop called between front and single case
	_this.show = function(){
		//Autoplay a video when nothing is selected
		if(_curPlayer == -1) _curPlayer = 0;
		else _links[_curPlayer].unhighlight();
		_bgPlayers[_curPlayer].play();
		if(GLB._isMobile) _links[_curPlayer].mobileHighlight();
		//if(_started) return;
		_started = true;
		//console.log("Show overview");
		for(var i=0;i<_numLinks;++i) _links[i].show();
		//Reset video position
		if(GLB._isMobile) TweenLite.set(_bgVideos, {y:0, force3D:true});
		_me.style.display = "block";
	}
	_this.hide = function(){
		//Never skip this, because videos start/stop here for case studies!
		_started = false;
		//console.log("Hide overview");
		for(var i=0;i<_numCases;++i){
			var _url = _router.getFullUrl();
			if(_url == _bgPlayers[i]._url){
				//console.log("KEEP PLAYER", i);
				//Keep this in screen and use as header for case study (subpage)
				_curPlayer = i;
				_bgPlayers[i].play();
			}
			else{
				//Stop and hide this player, we are now on something else than the Work overview
				_bgPlayers[i].pausePlayer(true);
			}
		}
		for(var i=0;i<_numLinks;++i) _links[i].hide(_numCases);
	}
	_this.setHeightZero = function(){
		_me.style.display = "none";
	}
	
	//Activates/deactivate when work section is selectes
	var _paused = true;
	_this.pause = function(){
		_paused = true;
		GLBEvents(window, "resize", resized, false);
		GLBEvents(window, "LayoutUpdate", layoutUpdate, false);
		TweenLite.ticker.removeEventListener("tick", scrolled);
		for(var i=0;i<_numCases;++i) _bgPlayers[i].pause();
		for(var i=0;i<_numLinks;++i) _links[i].pause();
		_bgVideos.style.display = "none";
	}
	_this.resume = function(){
		_paused = false;
		GLBEvents(window, "resize", resized, true);
		GLBEvents(window, "LayoutUpdate", layoutUpdate, true);
		TweenLite.ticker.addEventListener("tick", scrolled);
		for(var i=0;i<_numLinks;++i) _links[i].resume();
		_bgVideos.style.display = "block";
	}
	
	//Video height is minimum the relation (16:9) and also minimum reliableSh
	var _size = ["1280","720","360","640"];
	var _oriW = parseInt(_size[0]), _oriH = parseInt(_size[1]), _oriMW = parseInt(_size[2]), _oriMH = parseInt(_size[3]);
	var _vidW = 0, _vidH = 0, _paraFactor = .5;
	_this._pf = .5;
	//Write
	function resized(e){
		if(GLB._isMobile){
			_vidW = GLB._vwOuter;
			_vidH = _vidW / _oriMW * _oriMH;
			var _maxSh = GLB._reliableSh;
			if(GLB._iOS) _maxSh += 80;
			if(_vidH < _maxSh){
				_vidH = _maxSh;
				_vidW = _vidH * _oriMW / _oriMH;
			}
		}
		else{
			_vidW = GLB._vwOuter;
			_vidH = _vidW / _oriW * _oriH;
			if(_vidH < GLB._reliableSh){
				_vidH = GLB._reliableSh;
				_vidW = _vidH * _oriW / _oriH;
			}
		}
		TweenLite.set(_bgVideos, {width:_vidW, height:Math.floor(_vidH), x:(GLB._vwOuter-_vidW)/2});
	}
	
	//Read properties (delayed to avoid layout thrashing)
	var _content = document.getElementById("content");
	var _footer = document.getElementsByTagName("footer")[0];
	
	function layoutUpdate(){
		for(var i=0;i<_numLinks;++i) _links[i].layoutUpdate();
		//On frontpage we have to set a minHeight on touch. Because the element is fixed and moves async with scroll (parallax)
		if(GLB._isTouch){
			if(_started) _parent.style.minHeight = _me.offsetHeight + 150 + "px";
			else TweenLite.set(_parent, {clearProps:"minHeight"});
		}
		
		//Desktop move background...
		var _totalHeight = _content.offsetHeight, _footerH = _footer.offsetHeight;
		//console.log(_totalHeight)
		if(_started){
			//Amount that can be scrolled
			var _maxScroll = _totalHeight - GLB._reliableSh;
			_paraFactor = (_vidH - GLB._reliableSh)/_maxScroll;
		}
		else _paraFactor = .5;//Same as textpages for header
		TweenLite.to(_this, .3, {_pf:_paraFactor, ease:Cubic.easeOut});
	}
	
	//var _isHidden = false;
	var _mobileY = 0;
	function scrolled(e){
		if(_paused) return; //Important!
		if(GLB._isTouch && _started){
			//Parallax (slow down a bit)
			_mobileY += (GLB._windowScrollTweenedY*.8 - _mobileY) * .2;
			TweenLite.set(_me, {y:-_mobileY});
			
			//Find element closest to 80px from top
			var _nearestId = 0, _nearestDist = 10000;
			var _dist;
			for(var i=0;i<_numLinks;++i){
				if(GLB._isMobile) _dist = Math.abs(((GLB._windowScrollTweenedY*.8) + 80)-_links[i]._pageY);
				else _dist = Math.abs((GLB._windowScrollTweenedY+120)-_links[i]._pageY+_mobileY);
				if(_dist < _nearestDist){
					_nearestDist = _dist;
					_nearestId = i;
				}
			}
			if(_nearestId != _curPlayer){
				if(_curPlayer != -1) _links[_curPlayer].mobileUnHighlight();
				_links[_nearestId].mobileHighlight();
			}
			return;
		}
		if(_started || (!_started && GLB._windowScrollTweenedY <= GLB._vh)) TweenLite.set(_bgVideos, {y:-GLB._windowScrollTweenedY * _this._pf, force3D:true}); //Case study video parallax (under header section)
		//Manage play/pause on scroll
		if(!_started && _curPlayer != -1) _bgPlayers[_curPlayer].scrolled(_started);
		//Move menu items (desktop only)
		if(_started) TweenLite.set(_me, {y:-GLB._windowScrollTweenedY*.3, force3D:true});
	}	
	
	//Init
	_this.resume();
}

/* Header player used on both Work frontpage/overview and as first element on Case study*/
function WorkHeaderPlayer(_id, _case, _parent, _parentsparent){
	var _this = this;
	_this._url = _case.getAttribute("data-url");
	var _urls = _case.getAttribute("data-src").split(",");
	
	var _me = document.createElement("div");
	_me.className = "player";
	
	//Videoplayer
	var _video = document.createElement("video");
	_video.className = "inlinevideo";
	if(_id == 0) _video.preload = "auto";
	else _video.preload = "none";
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
	_me.appendChild(_video);
	_parent.insertBefore(_me, _parent.firstChild);
	if(_id == 0 && GLB._isMobile) _video.poster = _mediaPrefix + _parentsparent.getAttribute("data-poster");
	
	var _playing = false;
	
	//Listen for touch to start videos - this is a backup solution and might not work at all!
	if(GLB._isMobile && _id == 0) GLBEvents(window, "touchstart", initMV, true);
	function initMV(e){
		_this.play();
		GLBEvents(window, "touchstart", initMV, false);
	}
	
	_this.play = function(){
		if(_playing) return;
		_playing = true;
		if(GLB._isMobile) _video.autoplay = true;//Fix issues with ios when deeplinking
		_video.play();
		if(GLB._supportsClassList) _me.classList.remove("off");
		if(GLB._supportsClassList) _me.classList.add("on");
		TweenLite.killTweensOf(hide);
		//console.log("Play", _id);
	}
	_this.pausePlayer = function(_fast){
		if(!_playing) return;
		_playing = false;
		if(GLB._isMobile) _video.autoplay = false;
		_video.pause();
		if(GLB._supportsClassList) _me.classList.add("off");
		if(!_fast) TweenLite.delayedCall(.35, hide);
		else hide();
		//console.log("Pause", _id);
	}
	function hide(){
		if(GLB._supportsClassList) _me.classList.remove("on");
		if(GLB._supportsClassList) _me.classList.remove("off");
	}
	
	_this.pause = function(){
		_this.pausePlayer(true);
	}
	_this.scrolled = function(_atFront){
		if(_atFront) return;
		//When out of screen the player pauses
		if(!_atFront && _playing && GLB._windowScrollTweenedY > GLB._vh) _this.pausePlayer(true);
		else if(!_playing && GLB._windowScrollTweenedY < GLB._vh) _this.play();
	}
}

/* Outline button/label - this is also used in the Carousel */
function WorkHeaderBtn(_id, _me, _parent){
	var _this = this;
	overWriteLink(_me);
	var _initDelay = .6;
	//Add duplicate of text
	var _text = _me.textContent;
	_me.textContent = "";
	var _outline = document.createElement("div");
	_outline.className = "outline";
	_outline.textContent = _text;
	_me.appendChild(_outline);
	
	var _solid = document.createElement("div");
	_solid.className = "solid";
	_solid.textContent = _text;
	/*var _solidInner = document.createElement("div");
	_solidInner.className = "solidInner";
	_solidInner.textContent = _text;
	_solid.appendChild(_solidInner);*/
	_me.appendChild(_solid);
	
	/*var _num = document.createElement("div");
	_num.className = "num";
	_num.textContent = "0" + (_id+1);
	_me.appendChild(_num);*/
	var _outOpacity = 0;
	if(GLB._isMobile) _outOpacity = .3;
	
	var _onScreen = false;
	_this.reset = function(){
		if(GLB._isBot) return;
		TweenLite.set(_me, {y:32 + _id * 8, autoAlpha:0});
	}
	
	//Start/stop called between front and single case
	_this.show = function(){
		if(!GLB._isTouch){
			GLBEvents(_me, "mouseenter", over, true);
			GLBEvents(_me, "mouseleave", out, true);
		}
		if(!_onScreen){
			_this.reset();
			TweenLite.to(_me, .5+_id*.1, {y:0, delay:.05+_id*.025 + _initDelay, autoAlpha:1, ease:Cubic.easeOut}), _onScreen = true;
		}
		_initDelay = 0;
	}
	_this.hide = function(_numCases){
		if(!GLB._isTouch){
			GLBEvents(_me, "mouseenter", over, false);
			GLBEvents(_me, "mouseleave", out, false);
		}
		//Hide
		_numCases--;
		if(GLB._isBot) return;
		if(_onScreen) TweenLite.to(_me, .2+(_numCases-_id)*.02, {y:64, delay:(_numCases-_id)*.01, autoAlpha:0, ease:Cubic.easeIn, onComplete:unhin}), _onScreen = false;
	}
	function unhin(){
		//Unhighlight if needed
		_solid.style.opacity = _outOpacity;
	}
	_this.carouselLink = function(){
		if(!GLB._isTouch){
			GLBEvents(_me, "mouseenter", _this.highlight, true);
			GLBEvents(_me, "mouseleave", _this.unhighlight, true);
		}
	}
	
	_this.pause = function(){
		if(!GLB._isTouch){
			GLBEvents(_me, "mouseenter", over, false);
			GLBEvents(_me, "mouseleave", out, false);
		}
		_initDelay = .6;
		TweenLite.set(_me, {y:64, autoAlpha:0}), _onScreen = false;
	}
	_this.resume = function(){
		if(!GLB._isTouch){
			GLBEvents(_me, "mouseenter", over, true);
			GLBEvents(_me, "mouseleave", out, true);
		}
	}
	
	
	function over(e){
		_parent.dispatchEvent(GLBCustomEvent("highlight", _id));
	}
	function out(e){
		_parent.dispatchEvent(GLBCustomEvent("unhighlight", _id));
	}
	_this.mobileHighlight = function(){
		over(null);
	}
	_this.mobileUnHighlight = function(){
		out(null);
	}
	
	
	var _outlineW = 0;
	_this.highlight = function(e){
		/*TweenLite.killTweensOf(_solid), TweenLite.killTweensOf(_solidInner);
		TweenLite.set(_solid, {clearProps:"all"}), TweenLite.set(_solidInner, {clearProps:"all"});
		_outlineW = _outline.offsetWidth;
		TweenLite.to(_solid, .4, {width:_outlineW, ease:_maskEase});*/
		_solid.style.opacity = 1;
	}
	_this.unhighlight = function(e){
		/*TweenLite.killTweensOf(_solid), TweenLite.killTweensOf(_solidInner);
		//Flip (to mask opposite direction like underlines in menu)
		TweenLite.set(_solid, {scaleX:-1, x:_outlineW, transformOrigin:"0 0"});
		TweenLite.set(_solidInner, {scaleX:-1, x:"-100%", transformOrigin:"100% 0"});
		TweenLite.to(_solid, .6, {width:0, ease:_maskEase});*/
		_solid.style.opacity = _outOpacity;
	}
	
	//On mobile this is used for calculating when to highlight
	_this._pageY = 0;
	_this.layoutUpdate = function(){
		_this._pageY = _me.offsetTop;
	}
}