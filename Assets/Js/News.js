/*
v 0.5 - revised 9/10 ILTP
	
*/
function News(_me){
	var _this = this;
	
	var _built = false;
	var _articles;
	
	_this.start = function(){
		if(!_built){
			_built = true;
			_articles = new NewsArticles(_me);
		}
		else _articles.resume();
		_3dController.subpageOn();
		//_sharedTemplates["caseCarousel"].pause();
		_sharedTemplates["newsletter"].resume();
		_this.subpageChange(true);
	}
	_this.stop = function(){
		_frontScrollOffset = 0;
		_articles.pause();
		hideOldSubpage();
	}
	
	var _front = _me.getElementsByClassName("front")[0];
	var _newsHtml = _me.getElementsByClassName("subpage");
	var _numNews = _newsHtml.length;
	var _atFront = true;
	var _subPageurls = []
	var _news = []; //Subpages with case studies
	for(var i=0;i<_numNews;++i) _subPageurls.push((_newsHtml[i].getAttribute("data-url") || ""));
	
	var _l, _nextPage, _frontScrollOffset = 0;
	var _activeSubpage;
	_this.subpageChange = function(_skip){
		//Manage front vs. subpage (article)
		_l = _router.getPages().length;
		//console.log("subpageChange", _router.getPages(), "_l", _l);
		if(_l <= 1){
			//Manage filter
			if(_router._parameters["c"]) _articles.filter(_router._parameters["c"]);
			else _articles.filter("");
			
			//Show front
			if(_atFront){
				_front.style.display = "block";
				if(!_skip) TweenLite.delayedCall(.07, forceResize); //Force resize in order for bounds and offsets to be read correctly 
				return; //Avoid being able to click "news" in menu when already at frontpage
			}
			_atFront = true;
			_pageTransition.animate(readyForFrontPage, false);
			_articles.resume();
		}
		else{
			if(_atFront) _frontScrollOffset = GLB._windowScrollTweenedY, _articles.pause();
			_atFront = false;
			_nextPage = findNextId();
			if(_skip) readyForNextPage(); //Deeplink to article very first time
			else _pageTransition.animate(readyForNextPage, true);
		}
	}
	
	
	function findNextId(){
		var _url = _router.getFullUrl();
		for(var i=0;i<_numNews;++i){
			if(_url == _subPageurls[i]){
				return i;
			}
		}
		console.log("Error finding news id");
		return 0;
	}
	function hideOldSubpage(){
		if(_activeSubpage) _activeSubpage.stop(), _activeSubpage = null;
	}
	function showNewSubpage(){
		//console.log("showNewSubpage", _nextPage);
		if(_activeSubpage != _news[_nextPage]) hideOldSubpage();
		if(!_news[_nextPage]){
			//Subpage has not been created yet
			//console.log("Build subpage:", _nextPage);
			_news[_nextPage] = new PageTemplate(NewsPage, _newsHtml[_nextPage]);
		}
		_activeSubpage = _news[_nextPage];
		_activeSubpage.start();
		TweenLite.delayedCall(.07, forceResize); //Force resize in order for bounds and offsets to be read correctly 
	}
	function readyForNextPage(){
		_front.style.display = "none";
		_scroller.pageChange();
		showNewSubpage();
	}
	function readyForFrontPage(){
		_front.style.display = "block";
		hideOldSubpage();
		_scroller.pageChange(_frontScrollOffset);
		TweenLite.delayedCall(.07, forceResize); //Force resize in order for bounds and offsets to be read correctly 
	}
}

function NewsArticles(_me){
	var _this = this;
	//Create the list of all jobs
	var _newsHtml = _me.getElementsByClassName("articlelink");
	var _numNewsTotal = _newsHtml.length;
	var _articles = [];
	for(var i=0;i<_numNewsTotal;++i) _articles.push(new GLBScrollModule(NewsArticle, _newsHtml[i], true, false));
	
	//Overwrite the filter buttons
	var _filterHolder = _me.getElementsByClassName("categories")[0];
	var _filtersHtml = _filterHolder.getElementsByTagName("a");
	var _numFilters = _filtersHtml.length;
	var _filters = [];
	for(i=0;i<_numFilters;++i) _filters.push(new NewsFilterBtn(i, _filtersHtml[i]));
	
	_this.filter = function(_filter){
		var _featuredIsSet = false;
		for(var i=0;i<_numNewsTotal;++i){
			if(_featuredIsSet) _articles[i]._instance.filter(_filter, true);
			else _featuredIsSet = _articles[i]._instance.filter(_filter, _featuredIsSet);
		}
		for(i=0;i<_numFilters;++i) _filters[i].filter(_filter);
		if(GLB._isMobile && _filtersOpen) closeFilters();
	}
	
	_this.pause = function(){
		for(var i=0;i<_numNewsTotal;++i) _articles[i].pause();
		closeFilters();
	}
	_this.resume = function(){
		for(var i=0;i<_numNewsTotal;++i) _articles[i].resume();
	}
	
	//Mobile categories
	var _filtersOpen = false;
	if(!GLB._isMobile) return;
	var _desc = _me.getElementsByClassName("desc")[0];
	var _front = _me.getElementsByClassName("front")[0];
	var _txt = _front.getElementsByClassName("intro")[0].getElementsByClassName("txt")[0];
	_desc.textContent = "Filter by Category";
	GLBEvents(_desc, "click", openFilters, true);
	
	var _bg = document.createElement("div");
	_bg.className = "bg";
	GLBEvents(_bg, "click", closeFilters, true);
	
	function openFilters(e){
		if(_filtersOpen) return;
		_filtersOpen = true;
		//Add site overlay
		_txt.insertBefore(_bg, _txt.firstChild);
		if(GLB._supportsClassList) _txt.classList.add("darker");
		TweenLite.killTweensOf(animOutBg);
		TweenLite.delayedCall(.06, animInBg);
		//Check for scrolling while open
		_scrollYonOpen = GLB._windowScrollTweenedY;
		GLBEvents(window, "scroll", scrolledWhileOpen, true);
	}
	function animInBg(){
		if(GLB._supportsClassList) _bg.classList.add("animedIn"), _filterHolder.classList.add("animedIn");
	}
	function scrolledWhileOpen(e){
		if(Math.abs(_scrollYonOpen - GLB._windowScrollTweenedY) > GLB._reliableSh*.3) closeFilters();
	}
	function closeFilters(e){
		if(!_filtersOpen) return;
		_filtersOpen = false;
		GLBEvents(window, "scroll", scrolledWhileOpen, false);
		TweenLite.killTweensOf(animInBg);
		if(GLB._supportsClassList) _bg.classList.add("animOut"), _filterHolder.classList.remove("animedIn");
		TweenLite.delayedCall(.26, animOutBg);
		if(GLB._supportsClassList) _txt.classList.remove("darker");
	}
	function animOutBg(){
		_txt.removeChild(_bg);
		if(GLB._supportsClassList) _bg.classList.remove("animOut");
		if(GLB._supportsClassList) _bg.classList.remove("animedIn");
	}
}

function NewsFilterBtn(_id, _a){
	var _this = this;
	var _type = _a.getAttribute("data-type");
	var _href = _a.getAttribute("href") || "";
	var _splitHref = _href.split("?c=")
	var _originalParameter = _splitHref[1];
	if(_href.indexOf("http") != -1) return; //absolute path
	function clicked(e){
		try{e.preventDefault(), e.stopImmediatePropagation();}
		catch(e){}
		_router.setUrl(_href);
	}
	function dragstart(e){
		e.preventDefault();
	}
	GLBEvents(_a, "click", clicked, true);
	GLBEvents(_a, "dragstart", dragstart, true);
	
	_this.filter = function(_filter){
		if(!GLB._supportsClassList) return;
		if(_type == _filter){
			_a.classList.add("selected");
			//Temporary set parameter empty, so user can reset selection/filters
			_href = _splitHref[0];
		}
		else{
			_a.classList.remove("selected");
			_href = _splitHref.join("?c=");
		}
	}
}

function NewsArticle(_me, _numNewsTotal){
	var _this = this;
	_this.moduleTop = 0, _this.moduleBottom = 0; //When to start/stop this module
	_this.moduleRealTop = 0, _this.moduleRealBottom = 0; //Without the margins
	_this.moduleProximity = 0;
	var initMargins = 0;//Add borders (view height * initMargins) to make sure module only starts when inside that area
	_this.initDelay = 100; //Delay (miliseconds) to wait before starting module. This is relevant if user is scrolling quickly past this module - then it would be stupid to load assets.
	
	var _h = GLB._reliableSh, _offY = 0, _myCenterY = _h/2, _moveFactor = 50, _per = 0;
	var _loaded = false, _featured = false, _needsReload = false;
	var _type = _me.getAttribute("data-type");
	var _paraTarget = _me.getElementsByClassName("txt")[0];
	
	//Called when element is within moduleProximity.
	_this.preload = function(){
		if(_loaded) return;
		_loaded = true;
		preload();
	}
	_this.prestart = function(){}
	_this.start = function(){
		_this.preload();
	}
	_this.stop = function(){}
	_this.resume = function(){}
	_this.pause = function(){}
	
	//Parallax
	_this.scrolled = function(){
		if(!_featured) return;
		else{
			if(_moveFactor == 0) return;
			_per = (_myCenterY - GLB._windowScrollTweenedY - GLB._reliableSh/2)/_h;
			if(_per > GLB._reliableSh) _per = GLB._reliableSh;
			else if(_per < -GLB._reliableSh) _per = -GLB._reliableSh;
			TweenLite.set(_paraTarget, {y:_per * _moveFactor, force3D:true});
		}
	}

	//Write
	_this.resized = function(){
		if(GLB._isMobile) _moveFactor = 0;
		else _moveFactor = 50;
	}
	//Read properties (delayed to avoid layout thrashing)
	_this.layoutUpdate = function(){
		_h = _me.offsetHeight, _offY = GLB.offsetY(_me);
		_myCenterY = _offY + _h/2;
		_this.moduleTop = _this.moduleRealTop = _offY - GLB._reliableSh + (GLB._reliableSh * initMargins);
        _this.moduleBottom = _this.moduleRealBottom = _this.moduleTop + _h + GLB._reliableSh * (1 - initMargins * 2);
		_this.moduleProximity = GLB._reliableSh / 4;
	}
	
	_this.filter = function(_filter, _featuredIsSet){
		if(_featured){
			if(GLB._supportsClassList) _paraTarget.classList.add("animedIn"), _me.classList.remove("featured");
			_featured = false;
			TweenLite.set(_paraTarget, {y:0, force3D:true});
		}
		if(_type == _filter || _filter == ""){
			_me.style.display = "";
			//Feature first visible article
			if(!_featuredIsSet){
				if(GLB._supportsClassList) _me.classList.add("featured");
				_featured = true;
				_needsReload = true;
				if(!GLB._isMobile){
					//Fade in text and update scroll position (for parallax text)
					_paraTarget.style.opacity = 0;
					_this.resized();
					_this.layoutUpdate();
					_this.scrolled();
					if(GLB._supportsClassList) _paraTarget.classList.add("animedIn");
					_paraTarget.style.opacity = 1;
				}
				
			}
			if(_needsReload) preload();
			_wasHidden = false;
		}
		else _needsReload = true, _me.style.display = "none";
		return _featured;
	}
	
	
	//Create image
	var _imgHolder = _me.getElementsByClassName("imgHolder")[0];
	var _aspectKeeper = document.createElement("div");
	_aspectKeeper.className = "aspectKeeper";
	_aspectKeeper.style.paddingTop = 420/512*100 + "%";
	_imgHolder.appendChild(_aspectKeeper);
	
	var _img;
	var _imgLoaded = false, _loadedHD = false;
	var _urls =_imgHolder.getAttribute("data-img").split("|"); 
	function preload(){
		//Set relation
		if(_featured && !GLB._isMobile) _aspectKeeper.style.paddingTop = 800/1200*100 + "%";
		else _aspectKeeper.style.paddingTop = 420/512*100 + "%";
		if(_loadedHD) return;
		
		//Load new image (if needed)
		var _url = getImageInSize(_urls);
		if(!_featured && !GLB._isMobile) _url = _urls[0];//Make sure we don't use retina version for non-featured articles
		if(_featured && !GLB._isMobile) _url = _urls[1];
		if(_url == _urls[1]) _loadedHD = true; //Now retina version is on, never reload again
		
		if(_imgLoaded){
			//console.log("Reload:", _url)
			_img.reload(_mediaPrefix+_url, true);
			return;
		}
		_imgLoaded = true;
		_img = new GLBImage(_mediaPrefix+_url, _aspectKeeper, null, null, "img fadeImg", imgLoaded);
		_img.load();
	}
	function imgLoaded(e){
		_img.img.style.opacity = 1;
	}
}