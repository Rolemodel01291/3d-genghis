/*
v 1.3 - revised 24/5 2019 ILTP
	
*/
function Home(_me){
	var _this = this;
	
	//console.log("Home page");
	var _built = false;
	var _header;
	
	_this.start = function(){
		//console.log("Start HOME");
		if(!_built){
			_built = true;
			_header = new GLBScrollModule(HomeHeaderText, _me.getElementsByClassName("contentblock")[0], true);
		}
		else _header.resume();
		_3dController.home();
		//_sharedTemplates["caseCarousel"].resume();
		_sharedTemplates["newsletter"].resume();
	}
	_this.stop = function(){
		//console.log("Stop HOME");
		_header.pause();
	}
	_me.style.display = "none";//Home does always start visible (for intro animation)
}
function HomeHeaderText(_me){
	var _this = this;
	_this.moduleTop = 0, _this.moduleBottom = 0; //When to start/stop this module
	_this.moduleRealTop = 0, _this.moduleRealBottom = 0; //Without the margins
	_this.moduleProximity = 0;
	var initMargins = 0;//Add borders (view height * initMargins) to make sure module only starts when inside that area
	_this.initDelay = 50; //Delay (miliseconds) to wait before starting module. This is relevant if user is scrolling quickly past this module - then it would be stupid to load assets.
	var _loaded = false, _animIn = false;
	var _factor = (_me.getAttribute("data-para") || "0,0").split(",");
	var _moveFactor = parseInt(_factor[0]);
	_this._animInAX = GLB._vw * .1, _this._animInBX = GLB._vw * .15;
	var _txt = _me.getElementsByClassName("txt")[0];
	var _h5 = _txt.getElementsByTagName("h5")[0];
	var _h1s = _txt.getElementsByTagName("h1")[0];
    var _h3s = _txt.getElementsByTagName("h3")[0];
	var _pA = _h1s;
	var _pB = _h3s;
	
	var _makeMeScroll = new makeMeScroll(_txt, true, 5);
	
	//Called when element is within moduleProximity.
	_this.preload = function(){
		if(_loaded) return;
		_loaded = true;
		//console.log("Preload element");
	}
	_this.prestart = function(){
		//console.log("prestar HomeHeadert");
		//_this.preload(); //This will cause that element loads even if scrolled quickly past it!!!
	}
	_this.start = function(){
		//console.log("start HomeHeader");
		_this.preload();
		_makeMeScroll.start();
		if(!_animIn){
			_animIn = true;
			_this._animInAX = GLB._vw * .1, _this._animInBX = GLB._vw * .15;
			_h5.className = "animedIn";
			_pA.style.opacity = _pB.style.opacity = 1;
			if(!GLB._isMobile){
				TweenLite.to(_this, 3.8, {_animInAX:0, ease:Strong.easeOut, delay:.5});
				TweenLite.to(_this, 4.2, {_animInBX:0, ease:Strong.easeOut, delay:.5, onUpdate:_this.scrolled});
			}
			else{
				TweenLite.set(_pA, {x:_this._animInAX});
				TweenLite.set(_pB, {x:_this._animInBX});
				TweenLite.to(_pA, 2.8, {x:0, ease:Strong.easeOut, delay:.5});
				TweenLite.to(_pB, 3.2, {x:0, ease:Strong.easeOut, delay:.6});
			}
		}
		if(!GLB._isMobile){
			GLBEvents(window, "mousemove", mousemoved, true);
			TweenLite.ticker.addEventListener("tick", engine);
		}
	}
	_this.stop = function(){
		//console.log("stop HomeHeader");
		_makeMeScroll.stop();
		GLBEvents(window, "mousemove", mousemoved, false);
		TweenLite.ticker.removeEventListener("tick", engine);
	}
	_this.resume = function(){
		//console.log("Resume HomeHeader");
	}
	_this.pause = function(){
		//console.log("Pause HomeHeader");
		if(_animIn){
			_animIn = false;
			_h5.className = "";
			TweenLite.set(_pA, {clearProps:"opacity"}), TweenLite.set(_pB, {clearProps:"opacity"});
			TweenLite.killTweensOf(_this);
		}
	}
	
	var _mX = 0, _mY = 0, _twX = 0, _twY = 0, _per = 0;
	function mousemoved(e){
		_mX = e.clientX / GLB._vw - .5, _mY = e.clientY / GLB._vh - .5;
	}
	_this.scrolled = function(){
		_per = -(GLB._windowScrollTweenedY/GLB._reliableSh)//*.001;
	}
	function engine(){
		_twX += (_mX - _twX) * .05;
		_twY += (_mY - _twY) * .05;
		TweenLite.set(_pA, {x:-_twX*8 + _this._animInAX + _per * _moveFactor * .4, y:-_twY * 16 + _per * _moveFactor * 1, force3D:true});
		TweenLite.set(_pB, {x:-_twX*16 + _this._animInBX + _per * _moveFactor * .8, y:-_twY * 32 + _per * _moveFactor * 1.4, force3D:true});
	}
	//Write
	var _h = 0, _offY = 0, _myCenterY = 0;
	_this.resized = function(e){
		if(GLB._isMobile) _moveFactor = parseInt(_factor[1]);
		else _moveFactor = parseInt(_factor[0]);
	}
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
function About(_me){
	var _this = this;
	
	var _built = false;
	_this.start = function(){
		//console.log("Start ABOUT");
		if(!_built){
			_built = true;
		}
		_3dController.subpageOn();
		//_sharedTemplates["caseCarousel"].resume();
		_sharedTemplates["newsletter"].resume();
	}
	_this.stop = function(){
		//console.log("Stop ABOUT");
	}
}
function Technology(_me){
	var _this = this;
	
	_this.start = function(){
		//console.log("Start Technology");
		_3dController.subpageOn();
		//_sharedTemplates["caseCarousel"].pause();
		_sharedTemplates["newsletter"].resume();
	}
	_this.stop = function(){
		//console.log("Stop Technology");
	}
}
function Whatwedo(_me){
	var _this = this;
	
	var _built = false;
	var _acc;
	
	_this.start = function(){
		//console.log("Start Whatwedo");
		if(!_built){
			_built = true;
			_acc = new GLBScrollModule(WWDAccordions, _me.getElementsByClassName("shows")[0], false, true);
		}
		else _acc.resume();
		_3dController.subpageOn();
		//_sharedTemplates["caseCarousel"].pause();
		_sharedTemplates["newsletter"].resume();
	}
	_this.stop = function(){
		_acc.pause();
		//console.log("Stop Whatwedo");
	}
}
function Contact(_me){
	var _this = this;
	var _built = false;
	var _form;
	
	_this.start = function(){
		//console.log("Start Contact");
		if(!_built){
			_built = true;
			_form = new GLBScrollModule(ContactForm, _me.getElementsByClassName("formblock")[0], false, true);
		}
		else _form.resume();
		_3dController.subpageOn();
		//_sharedTemplates["caseCarousel"].pause();
		_sharedTemplates["newsletter"].pause();
	}
	_this.stop = function(){
		//console.log("Stop Contact");
		_form.pause()
	}
}
function ContactForm(_me){
	var _this = this;
	_this.moduleTop = 0, _this.moduleBottom = 0; //When to start/stop this module
	_this.moduleRealTop = 0, _this.moduleRealBottom = 0; //Without the margins
	_this.moduleProximity = 0;
	var initMargins = 0;//Add borders (view height * initMargins) to make sure module only starts when inside that area
	_this.initDelay = 100; //Delay (miliseconds) to wait before starting module. This is relevant if user is scrolling quickly past this module - then it would be stupid to load assets.
	
	var _h = GLB._reliableSh, _offY = 0;	
	var _loaded = false, _started = false;
	
	//Overwrite submit button
	var _form = _me.getElementsByTagName("form")[0];
	var _inputs = _form.getElementsByTagName("input");
	var _numInputs = _inputs.length;
	for(var i=0;i<_numInputs;++i) GLBEvents(_inputs[i], "invalid", invalid, true);
	GLBEvents(_form.getElementsByTagName("textarea")[0], "invalid", invalid, true);
	var _submitBtn = document.getElementById("submitcontact");
	var invalidDelay;

	//Number input for the budget
	var _budget = _form.getElementsByClassName("budget")[0];
	GLBEvents(_budget, "keydown", keypressed, true);
	GLBEvents(_budget, "blur", validateBudget, true);
	function keypressed(e){
		//console.log("keypressed", e.keyCode);
		//Accept tab, delete and cmd
		if(e.keyCode  == 8 || e.keyCode  == 9 || e.keyCode  == 13 || e.keyCode  == 91 || (e.keyCode >= 48 && e.keyCode <= 57)){
			//console.log("good");
		}
		else e.preventDefault();
	}
	function validateBudget(e){
		//console.log("validateBudget", _budget.value);
		var _str = _budget.value.replace(/[^\d]/g, '');
		_budget.value = _str;
	}
	
	
	//GDPR
	var _tick = _form.getElementsByClassName("gdpr")[0];
	var _tickRect = _tick.getElementsByClassName("rect")[0];
	//All links should not toggle accept
	var _linksInText = _tick.getElementsByTagName("a");
	var _numLIT = _linksInText.length;
	for(var i=0;i<_numLIT;++i) GLBEvents(_linksInText[i], "click", stopBubbling, true);
	function stopBubbling(e){
		e.stopPropagation();
	}
	GLBEvents(_tick, "click", toggleAccept, true);
	var _accepted = false;
	
	function toggleAccept(e){
		_accepted = !_accepted;
		if(_accepted){
			if(GLB._supportsClassList) _tickRect.classList.add("selected");
		}
		else{
			if(GLB._supportsClassList) _tickRect.classList.remove("selected");
		}
	}
	
	function invalid(e){
		if(e) e.stopPropagation();
		//console.log("invalid event");
		clearTimeout(invalidDelay);
		invalidDelay = setTimeout(resetValidation, 3000);
		if(GLB._supportsClassList) _form.classList.add("error");
		if(!_accepted && GLB._supportsClassList) _tickRect.classList.add("error");
		_submitBtn.setAttribute("value", "Please fix the errors above");
	}
	function resetValidation(){
		if(GLB._supportsClassList) _form.classList.remove("error");
		if(GLB._supportsClassList) _tickRect.classList.remove("error");
		_submitBtn.setAttribute("value", "Submit");
	}
	
	GLBEvents(_form, "submit", submit, true);
	function submit(e){
		if(!_accepted){
			e.preventDefault();
			invalid(null);
			return;
		}
		//Confirmation:
		confirmMsg();
	}
	
	//When choosing “request a quote” we show two extra dropdowns
	var _selects = _form.getElementsByTagName("select");
	var _quoteRelated = _form.getElementsByClassName("forquote");
	var _numQR = _quoteRelated.length;
	GLBEvents(_selects[0], "change", newIndex, true);
	function newIndex(e){
		if(_selects[0].selectedIndex == 2){
			if(GLB._supportsClassList) _form.classList.add("showforquote");
			for(var i=0;i<_numQR;++i) _quoteRelated[i].setAttribute("required", "");
		}
		else {
			if(GLB._supportsClassList) _form.classList.remove("showforquote");
			for(var i=0;i<_numQR;++i) _quoteRelated[i].removeAttribute("required");
		}
	}
	//Manage confirm message
	var _completed = false;
    var _thanksOverlay = _me.getElementsByClassName("thanksOverlay")[0];
	var _thanks = _me.getElementsByClassName("thanks")[0];
	var _closeThanksBtn = _thanks.getElementsByClassName("outlineBtn")[0];
	var _outlineBtn;
	GLBEvents(_closeThanksBtn, "click", clickedClose, true);
	
	function clickedClose(e){
		try{e.preventDefault(), e.stopImmediatePropagation();}
		catch(e){}
		if(GLB._supportsClassList) _form.classList.remove("completed");
		_outlineBtn.stop();
		_outlineBtn.pause();
		_completed = false;
		//Reset form
		_form.reset();
	}
	
	function confirmMsg(){
		_completed = true;
		if(GLB._supportsClassList) _form.classList.add("completed");
		if(!_outlineBtn) _outlineBtn = new OutlineBtn(_closeThanksBtn, true);
		_outlineBtn.resume();
		_outlineBtn.fakeLayoutUpdate();
		_outlineBtn.start();
	}
	//setTimeout(confirmMsg, 1000);//debug
	
	
	//Called when element is within moduleProximity.
	_this.preload = function(){
		if(_loaded) return;
		_loaded = true;
	}
	_this.prestart = function(){
		//console.log("prestart", _id);
		//_this.preload(); //This will cause that element loads even if scrolled quickly past it!!!
	}
	_this.start = function(){
		_started = true;
		//_this.preload();
	}
	_this.stop = function(){
		_started = false;
		//Close thanks overlay (if needed)
		if(_completed) clickedClose(null);
	}
	_this.resume = function(){
	}
	_this.pause = function(){
	}

	//Write
	_this.resized = function(){		
	}
	//Read properties (delayed to avoid layout thrashing)
	_this.layoutUpdate = function(){
		_h = _me.offsetHeight, _offY = GLB.offsetY(_me);
		_this.moduleTop = _this.moduleRealTop = _offY - GLB._reliableSh + (GLB._reliableSh * initMargins);
        _this.moduleBottom = _this.moduleRealBottom = _this.moduleTop + _h + GLB._reliableSh * (1 - initMargins * 2);
		_this.moduleProximity = GLB._reliableSh / 8;
	}
}
function Careers(_me){
	var _this = this;
	
	var _built = false;
	//var _jobs;
	//var _breezy = _me.getElementsByClassName("breezyHolder")[0];
	
	_this.start = function(){
		//console.log("Start Careers");
		if(!_built){
			_built = true;

			var _breezyJs = document.createElement('script');
			_breezyJs.setAttribute("type","text/javascript");
			_breezyJs.setAttribute("async","");
			_breezyJs.setAttribute("defer","");
			_breezyJs.onload = function(){
				//console.log("loaded");
				//TweenLite.delayedCall(.2, forceResize); //Force resize in order for bounds and offsets to be read correctly 
				TweenLite.delayedCall(1.2, forceResize); //Force resize in order for bounds and offsets to be read correctly 
			}
			_breezyJs.setAttribute("src", "https://verity-studios-ag.breezy.hr/embed/js?inline=true&bzsrc=jswidget&group_by=dept");
			document.body.appendChild(_breezyJs);
			//_jobs = new Jobs(_me);
		}
		_3dController.subpageOn();
		//_sharedTemplates["caseCarousel"].pause();
		_sharedTemplates["newsletter"].pause();
		//_this.subpageChange(true);
	}
	_this.stop = function(){
		//console.log("Stop Careers");
	}
	
	_this.subpageChange = function(_skip){
		/*if(_router._parameters["t"]) _jobs.filter(_router._parameters["t"]);
		else _jobs.filter("");*/
		if(!_skip) TweenLite.delayedCall(.07, forceResize); //Force resize in order for bounds and offsets to be read correctly 
	}
}
function Jobs(_me){
	var _this = this;
	//Create the list of all jobs
	var _jobsHtml = _me.getElementsByClassName("job");
	var _numJobsTotal = _jobsHtml.length;
	var _jobs = [];
	for(var i=0;i<_numJobsTotal;++i) _jobs.push(new JobAccordian(_jobsHtml[i], _numJobsTotal));
	
	//Overwrite the filter buttons
	var _filtersHtml = _me.getElementsByClassName("jobtype")[0].getElementsByTagName("a");
	var _numFilters = _filtersHtml.length;
	var _filters = [];
	for(i=0;i<_numFilters;++i) _filters.push(new JobFilterBtn(i, _filtersHtml[i]));
	
	_this.filter = function(_filter){
		for(var i=0;i<_numJobsTotal;++i) _jobs[i].filter(_filter);
		for(i=0;i<_numFilters;++i) _filters[i].filter(_filter);
	}
}
function JobFilterBtn(_id, _a){
	var _this = this;
	var _type = _a.getAttribute("data-type");
	var _href = _a.getAttribute("href") || "";
	var _splitHref = _href.split("?t=")
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
			_href = _splitHref.join("?t=");
		}
	}
}
function JobAccordian(_me, _numJobsTotal){
	var _this = this;
	var _type = _me.getAttribute("data-type");
	
	_this.filter = function(_filter){
		if(_type == _filter || _filter == "") _me.style.display = "block";
		else _me.style.display = "none";
	}
	
	var _open = false;
	var _p = _me.getElementsByTagName("p")[0];
	//Catch internal links (if any)
	var _linksInText = _p.getElementsByTagName("a");
	var _numLIT = _linksInText.length;
	for(var i=0;i<_numLIT;++i) overWriteLink(_linksInText[i]);
	
	var _header = _me.getElementsByTagName("h3")[0];
	var _a = _me.getElementsByClassName("outlineBtn")[0] || null;
	
	//Hit layer controls all open/close functionality
	var _hitLayer = document.createElement("div");
	_hitLayer.className = "hit";
	_me.appendChild(_hitLayer);
	if(!GLB._isTouch){
		GLBEvents(_hitLayer, "mouseenter", over, true);
		GLBEvents(_hitLayer, "mouseleave", out, true);
	}
	GLBEvents(_hitLayer, "click", toggle, true);
	function over(e){
		_header.style.opacity = .4;
		if(_open) TweenLite.set(_plus, {rotation:-45});
		else if(!_open) TweenLite.set(_plus, {rotation:90});
	}
	function out(e){
		_header.style.opacity = 1;
		if(_open) TweenLite.set(_plus, {rotation:45});
		else if(!_open) TweenLite.set(_plus, {rotation:0});
	}
	function toggle(e){
		if(_open) close();
		else open();
	}
	
	
	var _plus = document.createElement("div");
	_plus.className = "plus";
	var _plusHit = document.createElement("div");
	_plusHit.className = "hit";
	_plus.appendChild(_plusHit);
	_me.appendChild(_plus);
	
	
	var _outlineBtn;
		
	function open(){
		//console.log("open");
		if(_open) return;
		_open = true;
		var _hNow = _me.offsetHeight;
		_me.style.height = "auto";
		var _realH = _me.offsetHeight;
		_me.style.height = _hNow + "px";
		TweenLite.killTweensOf(_p);
		//if(_a) TweenLite.killTweensOf(_a);
		TweenLite.killTweensOf(_me);
		TweenLite.to(_me, .4, {height:_realH, ease:Cubic.easeOut});
		TweenLite.to(_p, .5, {autoAlpha:1, ease:Cubic.easeOut, onComplete:updateDocH});
		//if(_a) TweenLite.set(_a, {autoAlpha:1, delay:.4});
		if(GLB._supportsClassList) _me.classList.add("selected");
		TweenLite.set(_plus, {rotation:45});
		
		if(!_a) return;
		if(!_outlineBtn) _outlineBtn = new OutlineBtn(_a);
		_outlineBtn.resume();
		_outlineBtn.start(.5);
	}
	function close(){
		//console.log("close");
		if(!_open) return;
		_open = false;
		var _hNow = _me.offsetHeight;
		TweenLite.killTweensOf(_p);
		//if(_a) TweenLite.killTweensOf(_a);
		TweenLite.killTweensOf(_me);
		TweenLite.set(_p, {autoAlpha:0});
		//if(_a) TweenLite.set(_a, {autoAlpha:0});
		TweenLite.set(_me, {clearProps:"height"});
		var _realH = _me.offsetHeight;
		_me.style.height = _hNow + "px";
		TweenLite.to(_me, .3, {height:_realH, ease:Cubic.easeOut, clearProps:"height", onComplete:forceResize});
		
		if(GLB._supportsClassList) _me.classList.remove("selected");
		TweenLite.set(_plus, {rotation:0});
				
		if(!_a) return;
		_outlineBtn.stop();
		_outlineBtn.pause();
	}
	
	
	function updateDocH(){
		_me.style.height = "auto";
		forceResize();
	}
	
	//If no vacancies - then just open the default text (added as a job backend)
	if(_numJobsTotal == 1) open();
}
function FourZeroFour(_me){
	var _this = this;
	
	_this.start = function(){
		//console.log("Start FourZeroFour");
		//_3dController.subpageOn();
		_3dController.singleDrone();
		//_sharedTemplates["caseCarousel"].pause();
		_sharedTemplates["newsletter"].pause();
	}
	_this.stop = function(){
		_3dController.singleDroneOff();
		//console.log("Stop FourZeroFour");
	}
}
//Used as subpages:
function CaseStudy(_me){
	var _this = this;
	var _h1 = _me.getElementsByTagName("h1")[0];
	var _makeMeScroll = new makeMeScroll(_me.getElementsByClassName("contentblock")[0], true, 1);
	
	_this.start = function(){
		TweenLite.delayedCall(.1, animIn);
	}
	function animIn(){
		if(GLB._supportsClassList) _h1.classList.add("animedIn");
		_makeMeScroll.start();
	}
	_this.stop = function(){
		TweenLite.killTweensOf(animIn);
		if(GLB._supportsClassList) _h1.classList.remove("animedIn");
		_makeMeScroll.stop();
	}
}
function NewsPage(_me){
	var _this = this;
	_this.start = function(){}
	_this.stop = function(){}
}

//Accordion "Shows" module:
function WWDAccordions(_me){
	var _this = this;
	_this.moduleTop = 0, _this.moduleBottom = 0; //When to start/stop this module
	_this.moduleRealTop = 0, _this.moduleRealBottom = 0; //Without the margins
	_this.moduleProximity = 0;
	var initMargins = 0;//Add borders (view height * initMargins) to make sure module only starts when inside that area
	_this.initDelay = 200; //Delay (miliseconds) to wait before starting module. This is relevant if user is scrolling quickly past this module - then it would be stupid to load assets.
	
	var _h = GLB._reliableSh, _offY = 0;	
	var _loaded = false, _started = false;
	
	//Build the 3 accordions
	var _tabsHtml = _me.getElementsByClassName("tab");
	var _numTabs = _tabsHtml.length;
	var _tabs = [];
	for(var i=0;i<_numTabs;++i) _tabs.push(new WWDTab(i, _tabsHtml[i], _me))
	
	
	//Called when element is within moduleProximity.
	_this.preload = function(){
		if(_loaded) return;
		_loaded = true;
		for(var i=0;i<_numTabs;++i) _tabs[i].load();
	}
	_this.prestart = function(){
		//console.log("prestart acc");
	}
	_this.start = function(){
		_started = true;
		_this.preload();
		for(var i=0;i<_numTabs;++i) _tabs[i].start();
	}
	_this.stop = function(){
		_started = false;
		for(var i=0;i<_numTabs;++i) _tabs[i].stop();
	}
	_this.resume = function(){
		for(var i=0;i<_numTabs;++i) _tabs[i].resume();
	}
	_this.pause = function(){
		for(var i=0;i<_numTabs;++i) _tabs[i].pause();
	}

	//Write
	_this.resized = function(){
		
	}
	//Read properties (delayed to avoid layout thrashing)
	_this.layoutUpdate = function(){
		for(var i=0;i<_numTabs;++i) _tabs[i].layoutUpdate();
		_h = _me.offsetHeight, _offY = GLB.offsetY(_me);
		_this.moduleTop = _this.moduleRealTop = _offY - GLB._reliableSh + (GLB._reliableSh * initMargins);
        _this.moduleBottom = _this.moduleRealBottom = _this.moduleTop + _h + GLB._reliableSh * (1 - initMargins * 2);
		_this.moduleProximity = GLB._reliableSh / 3;
	}
}

function WWDTab(_id, _me, _parent){
	var _this = this;
	var _loaded = false, _isOpen = false;
	var _to = "", _opento = "";
	_this._panSpeed = 0;
	_this._panScale = 1;
	var _mX = 0, _mY = 0, _twX = 0, _twY = 0, _curImgW, _curImgH, _offX, _offY, _myH = 0, _imgH = 0;
	var _firstMouseMove = true;
	
	//Image element
	var _imgHolder = document.createElement("div");
	_imgHolder.className = "imgHolder";
	//Black overlay
	var _black = document.createElement("div");
	_black.className = "overlay";
	_me.insertBefore(_black, _me.firstChild);
	_me.insertBefore(_imgHolder, _me.firstChild);
	
	var _urls = (_me.getAttribute("data-img") || "").split("|"); //Desktop, mobile
	var _img, _url = _urls[0];
	if(_urls != ""){
		if(GLB._isMobile) _url = _urls[1];
		_img = new GLBImage(_mediaPrefix+_url, _imgHolder, null, null, "bg fadeImg", imgLoaded);
	}
	function imgLoaded(e){
		_this.layoutUpdate();
		_img.img.style.opacity = 1;
		if(GLB._supportsClassList) _black.classList.add("animedIn");
	}
	
	var _txt = _me.getElementsByClassName("txt")[0];
	
	//Outline buttons
	var _btns =  _me.getElementsByClassName("outlineBtn");
	var _outlineBtnA = new OutlineBtn(_btns[0], true), _outlineBtnB = new OutlineBtn(_btns[1], true);
	GLBEvents(_btns[0], "click", clicked, true);
	GLBEvents(_btns[1], "click", clickedClose, true);
	//Overwrite links in text
	var _linksInText = _txt.querySelectorAll("a:not(.outlineBtn)");
	var _numLinksInText = _linksInText.length;
	for(var i=0;i<_numLinksInText;++i){
		if(_linksInText[i].getAttribute("href").indexOf("http") == -1) overWriteLink(_linksInText[i]);
		else GLBEvents(_linksInText[i], "click", stopBubbling, true);
	}
	function stopBubbling(e){
		e.stopPropagation();
	}
		
	function clicked(e){
		try{e.preventDefault(), e.stopImmediatePropagation();}
		catch(e){}
		open();
	}
	function clickedClose(e){
		try{e.preventDefault(), e.stopImmediatePropagation();}
		catch(e){}
		close();
	}
	GLBEvents(_me, "click", clicked, true);
	
	function open(){
		if(GLB._supportsClassList) _me.classList.remove("hover"), _me.classList.add("opening");
		TweenLite.killTweensOf(_imgHolder), TweenLite.killTweensOf(_me);
		if(GLB._isMobile){
			TweenLite.to(_imgHolder, .6, {delay:.07, y:0, ease:Cubic.easeOut, transformOrigin:"0 0", force3D:true});
			TweenLite.to(_me, .6, {delay:.07, y:0, height:"100%", ease:Cubic.easeOut, onComplete:setAsOpen});
		}
		else{
			TweenLite.to(_imgHolder, .6, {delay:0, x:0, scale:1, ease:Cubic.easeOut, transformOrigin:_to, force3D:true});
			TweenLite.to(_me, .6, {delay:0, x:0, width:"100%", ease:Cubic.easeOut, onComplete:setAsOpen});
		}
		GLBEvents(_me, "click", clicked, false);
		GLBEvents(_me, "click", clickedClose, true);
		_isOpen = true;
	}
	function close(){
		TweenLite.killTweensOf(_imgHolder), TweenLite.killTweensOf(_me), TweenLite.killTweensOf(_this);
		if(GLB._supportsClassList) _me.classList.add("opening"), _me.classList.remove("open");
		if(GLB._isMobile){
			TweenLite.to(_imgHolder, .6, {y:-120, ease:Cubic.easeOut, transformOrigin:"0 0", force3D:true});
			TweenLite.to(_me, .6, {y:480/3 * _id, height:"160px", ease:Cubic.easeOut, onComplete:setAsClosed});
		}
		else{
			TweenLite.ticker.removeEventListener("tick", panEngine);
			GLBEvents(window, "mousemove", mousemoved, false);
			_this._panScale = 1;
			TweenLite.to(_imgHolder, .6, {x:-GLB._vwOuter/2 + GLB._vwOuter/6, y:(_myH-_imgH)/2, scale:1, ease:Cubic.easeOut, transformOrigin:"0 0", force3D:true});
			TweenLite.to(_me, .6, {x:GLB._vwOuter/3 * _id, width:"33.3334%", ease:Cubic.easeOut, onComplete:setAsClosed});
		}
		GLBEvents(_me, "click", clickedClose, false);
		GLBEvents(_me, "click", clicked, true);
	}
	function setAsOpen(){
		if(GLB._supportsClassList) _me.classList.remove("opening"), _me.classList.add("open");
		_outlineBtnB.resume(), _outlineBtnB.start();
		if(GLB._isMobile) return;
		//Zoom in and start panning
		_this._panSpeed = 0;
		TweenLite.to(_this, 3.0, {delay:1, _panScale:1.05, ease:Quad.easeInOut, onStart:startPan});
	}
	function setAsClosed(){
		if(GLB._supportsClassList) _me.classList.remove("opening");
		_isOpen = false;
		_firstMouseMove = true;
		_outlineBtnB.pause();
	}
	
	function startPan(){
		_outlineBtnB.fakeLayoutUpdate(); //For arrow transition
		_mX = _twX = .5, _mY = _twY = .5;
		TweenLite.ticker.addEventListener("tick", panEngine);
		GLBEvents(window, "mousemove", mousemoved, true);
	}
	function mousemoved(e){
		_mX = e.clientX / GLB._vwOuter, _mY = e.clientY / GLB._vh;
		if(_firstMouseMove){
			_firstMouseMove = false;
			TweenLite.to(_this, 1.5, {_panSpeed:.01, ease:Quad.easeInOut});
		}
	}
	function panEngine(){
		_twX += (_mX-_twX) * _this._panSpeed, _twY += (_mY-_twY) * _this._panSpeed;
	  	//Calculate new offsets
	    _curImgW = GLB._vwOuter * _this._panScale;
	    _offX = -_twX * (_curImgW-GLB._vwOuter);
	    _curImgH = _imgH * _this._panScale;
	    _offY = -_twY * (_curImgH-_myH);
		TweenLite.set(_imgHolder, {x:_offX, y:_offY, scale:_this._panScale, transformOrigin:"0 0", force3D:true});
	}
	
	_this.load = function(){
		if(_loaded) return;
		_loaded = true;
		_img.load();
	}
	
	_this.start = function(){
		TweenLite.delayedCall(.1 * _id + .2, _outlineBtnA.start);
		if(!GLB._isTouch){
			GLBEvents(_me, "mouseenter", over, true);
			GLBEvents(_me, "mouseleave", out, true);
		}
		
	}
	_this.stop = function(){
		GLBEvents(_me, "mouseenter", over, false);
		GLBEvents(_me, "mouseleave", out, false);
		if(_isOpen) reset();
	}
	
	function reset(){
		GLBEvents(_me, "click", close, false);
		TweenLite.killTweensOf(_imgHolder), TweenLite.killTweensOf(_me), TweenLite.killTweensOf(_this);
		if(GLB._supportsClassList) _me.classList.remove("open");
		TweenLite.ticker.removeEventListener("tick", panEngine);
		GLBEvents(window, "mousemove", mousemoved, false);
		if(GLB._isMobile){
			TweenLite.set(_imgHolder, {y:-120, transformOrigin:"0 0", force3D:true});
			TweenLite.set(_me, {y:480/3 * _id, height:"160px"});
		}
		else{
			_this._panScale = 1;
			TweenLite.set(_imgHolder, {x:-GLB._vwOuter/2 + GLB._vwOuter/6, y:(_myH-_imgH)/2, scale:1, transformOrigin:"0 0", force3D:true});
			TweenLite.set(_me, {x:GLB._vwOuter/3 * _id, width:"33.3334%"});
		}
		setAsClosed();
	}
	
	_this.resume = function(){
		_outlineBtnA.resume(), _outlineBtnB.resume();
	}
	_this.pause = function(){
		if(_isOpen) reset();
		_outlineBtnA.pause(), _outlineBtnB.pause();
	}
	
	function over(e){
		if(_isOpen) return;
		if(GLB._supportsClassList) _me.classList.add("hover");
		TweenLite.killTweensOf(_imgHolder);
		TweenLite.to(_imgHolder, 1.5, {scale:1.05, ease:Cubic.easeOut, transformOrigin:_to, force3D:true});
	}
	function out(e){
		if(_isOpen) return;
		if(GLB._supportsClassList) _me.classList.remove("hover");
		TweenLite.killTweensOf(_imgHolder);
		TweenLite.to(_imgHolder, 1.0, {scale:1, ease:Cubic.easeOut, transformOrigin:_to, force3D:true});
	}
	
	_this.layoutUpdate = function(){
		_myH = _me.offsetHeight;
		_imgH = _img.img.offsetHeight;
		_to = "50% " + _imgH/2 + "px"
		if(!_isOpen){
			if(GLB._isMobile){
				TweenLite.set(_me, {y:480/3 * _id});
				TweenLite.set(_imgHolder, {y:-120, force3D:true});
			}
			else{
				TweenLite.set(_me, {x:GLB._vwOuter/3 * _id});
				TweenLite.set(_imgHolder, {x:-GLB._vwOuter/2 + GLB._vwOuter/6, y:(_myH-_imgH)/2, force3D:true});
			}
			
		}
	}
}



/*
- Text pages with greywhite background	
*/
function TextPage(_me){
	var _this = this;
	var _linksHtml;
	var _numLinks = 0;
	var _links = [];
	var _hasLinks;
	var _built = false;
	
	_this.start = function(){
		//console.log("Start TextPage");
		if(!_built){
			_built = true;
			_linksHtml = _me.getElementsByTagName("a");
			_numLinks = _linksHtml.length;
			_hasLinks = (_numLinks > 0);
		}
		_3dController.subpageOff();
		//_sharedTemplates["caseCarousel"].pause();
		_sharedTemplates["newsletter"].pause();
		
		//Overwrite internal links
		if(_hasLinks){
			for(var i=0;i<_numLinks;++i){
				if(_linksHtml[i].className.indexOf("outlineBtn") == -1 && _linksHtml[i].getAttribute("href").indexOf("http") == -1) _links.push(new overWriteLink(_linksHtml[i])); //Internal link
			}
		}
	}
	_this.stop = function(){}
}
function JobPage(_me){
	var _this = this;
	var _subpages = _me.getElementsByClassName("textpage");
	var _numSubPages = _subpages.length;
	var _header = _me.getElementsByClassName("header")[0];
	var _h2 = _header.getElementsByTagName("h2")[0];
	var _form = _me.getElementsByTagName("form")[0];
	var _inputs = _form.getElementsByTagName("input");
	var _jobid = document.getElementById("jobid");
	var _jobtitle = document.getElementById("jobtitle");
	var _jobreceiver = document.getElementById("jobreceiver");
	
	var _built = false;
	_this.start = function(){
		//console.log("Start JobPage");
		if(!_built){
			_built = true;
		}
		_3dController.subpageOff();
		//_sharedTemplates["caseCarousel"].pause();
		_sharedTemplates["newsletter"].pause();
		_this.subpageChange();
	}
	_this.stop = function(){
		//console.log("Stop TextPage");
		if(_activeId > -1) _subpages[_activeId].style.display = "none";
		_activeId = -1;
	}
	
	var _pages, _activeId = -1;
	_this.subpageChange = function(){
		_pages = _router.getPages();
		
		//Hide old
		if(_activeId > -1) _subpages[_activeId].style.display = "none";
		
		//Find the div to show
		for(var i=0;i<_numSubPages;++i){
			if(_subpages[i].getAttribute("data-id") == _pages[1]){
				_activeId = i;
				var _t = _subpages[_activeId].getAttribute("data-title");
				_h2.textContent = _t;
				_subpages[_activeId].style.display = "block";
				_jobid.setAttribute("value", _pages[1]);
				_jobtitle.setAttribute("value", _t);
				_jobreceiver.setAttribute("value", _subpages[_activeId].getAttribute("data-receiver"));
				//Update header
				var _imgs = _subpages[_activeId].getAttribute("data-header");
				_header.setAttribute("data-img", _imgs);//used first time
				_header.dispatchEvent(GLBCustomEvent("updateImage", _imgs));//user afterwards
				i = _numSubPages;
				continue;
			}
		}
		window.scrollTo(0,0);
		GLB._windowScrollTweenedY = GLB._windowScrollY = 0;
		setTimeout(forceResize, 70);//Force resize in order for bounds and offsets to be read correctly 
	}
	
	
	//Manage form
	var _numInputs = _inputs.length;
	for(var i=0;i<_numInputs;++i) GLBEvents(_inputs[i], "invalid", invalid, true);
	GLBEvents(_form.getElementsByTagName("textarea")[0], "invalid", invalid, true);
	var _submitBtn = document.getElementById("submitjob");
	var invalidDelay;
	
	//GDPR
	var _tick = _form.getElementsByClassName("gdpr")[0];
	var _tickRect = _tick.getElementsByClassName("rect")[0];
	//All links should not toggle accept
	var _linksInText = _tick.getElementsByTagName("a");
	var _numLIT = _linksInText.length;
	for(var i=0;i<_numLIT;++i) GLBEvents(_linksInText[i], "click", stopBubbling, true);
	function stopBubbling(e){
		e.stopPropagation();
	}
	GLBEvents(_tick, "click", toggleAccept, true);
	var _accepted = false;
	
	function toggleAccept(e){
		_accepted = !_accepted;
		if(_accepted){
			if(GLB._supportsClassList) _tickRect.classList.add("selected");
		}
		else{
			if(GLB._supportsClassList) _tickRect.classList.remove("selected");
		}
	}
	
	function invalid(e){
		if(e) e.stopPropagation();
		console.log("invalid event");
		clearTimeout(invalidDelay);
		invalidDelay = setTimeout(resetValidation, 3000);
		if(GLB._supportsClassList) _form.classList.add("error");
		if(!_accepted && GLB._supportsClassList) _tickRect.classList.add("error");
		_submitBtn.setAttribute("value", "Please fix the errors above");
	}
	function resetValidation(){
		if(GLB._supportsClassList) _form.classList.remove("error");
		if(GLB._supportsClassList) _tickRect.classList.remove("error");
		_submitBtn.setAttribute("value", "Submit");
	}
	GLBEvents(_form, "submit", submit, true);
	function submit(e){
		//console.log("submit");
		if(!_accepted){
			e.preventDefault();
			invalid(null);
			return;
		}
		//Confirmation:
		confirmMsg();
	}
	
	//When choosing “request a quote” we show two extra dropdowns
	/*var _selects = _form.getElementsByTagName("select");
	GLBEvents(_selects[0], "change", newIndex, true);
	function newIndex(e){
		console.log(_selects[0].selectedIndex)
		if(_selects[0].selectedIndex == 2){
			if(GLB._supportsClassList) _form.classList.add("showforquote");
		}
		else {
			if(GLB._supportsClassList) _form.classList.remove("showforquote");
		}
	}*/
	
	//Manage confirm message
	var _completed = false;
    var _thanksOverlay = _me.getElementsByClassName("thanksOverlay")[0];
	var _thanks = _me.getElementsByClassName("thanks")[0];
	var _closeThanksBtn = _thanks.getElementsByClassName("outlineBtn")[0];
	var _outlineBtn;
	GLBEvents(_closeThanksBtn, "click", clickedClose, true);
	
	function clickedClose(e){
		try{e.preventDefault(), e.stopImmediatePropagation();}
		catch(e){}
		if(GLB._supportsClassList) _form.classList.remove("completed");
		_outlineBtn.stop();
		_outlineBtn.pause();
		_completed = false;
		//Reset form
		_form.reset();
	}
	
	function confirmMsg(){
		_completed = true;
		if(GLB._supportsClassList) _form.classList.add("completed");
		if(!_outlineBtn) _outlineBtn = new OutlineBtn(_closeThanksBtn, true);
		_outlineBtn.resume();
		_outlineBtn.fakeLayoutUpdate();
		_outlineBtn.start();
	}
	//setTimeout(confirmMsg, 1000);//debug
}
function FAQPage(_me){
	var _this = this;
	
	var _built = false;
	var _jobsHtml = _me.getElementsByClassName("job");
	var _numJobsTotal = _jobsHtml.length;
	var _jobs = [];
	var _contact
	
	_this.start = function(){
		//console.log("Start FAQPage");
		if(!_built){
			_built = true;
			//Create the list of all jobs
			for(var i=0;i<_numJobsTotal;++i) _jobs.push(new JobAccordian(_jobsHtml[i], _numJobsTotal));
			//Contact section
			_contact = new GLBScrollModule(TextOnly, _me.getElementsByClassName("textOnly")[0], false);
		}
		else _contact.resume();
		_3dController.subpageOff();
		//_sharedTemplates["caseCarousel"].pause();
		_sharedTemplates["newsletter"].pause();
	}
	_this.stop = function(){
		//console.log("Stop TextPage");
		_contact.pause();
	}
}