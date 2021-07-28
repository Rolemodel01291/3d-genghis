/*
v 1.2 - revised 7/9 ILTP
*/
function ThreeDController(){
	var _this = this;
	var _3dmain;
	var _loopTimer;
	
	//Different states
	_this.home = function(){
		instantiate("home");
	}
	_this.subpageOn = function(){
		instantiate("subpageOn");
	}
	_this.subpageOff = function(){
		if(!_3dmain) return; //No need to load 3d here
		instantiate("subpageOff");
	}
	_this.singleDrone = function(){
		instantiate("singleDrone");
	}
	_this.singleDroneOff = function(){
		instantiate("singleDroneOff");
	}
	function instantiate(_callback){
		//THREE is loaded async, so we have to check when it's ready
		if(typeof THREE !== 'undefined'){
			//console.log("THREE is ready", _callback);
			clearTimeout(_loopTimer);
			if(!_3dmain) _3dmain = new threeDMain();
			_3dmain[_callback]();
		}
		else{
			//console.log("Loop until loaded");
			_loopTimer = setTimeout(instantiate, 100, _callback);
		}
	}
}

function threeDMain(){
	var _this = this;
	var _mode = -1, _mX = 0, _mY = 0, _twX = 0, _twY = 0, _scrolledOutP = 0, _moveFactor = 1, _hmo = 1, _oldHmo = 1, _cameraY = 0, _gradMover = 0;
	var _started = false, _running = false, _mouseIsControlling = false, _allowRender = true, _atIntroAnim = false, _veryFirstTime = true, _fadeHeroMaterial = false;
	_this._heroY = 0, _this._heroZ = 0;
	_this._cameraXanimIn = 32, _this._cameraYanimIn = 64;
	_this._movementF = 1;
	_this._randomFloatFactor = 0;
	_this._introIntensity = 0;
	
	var _ratio = window.devicePixelRatio ? window.devicePixelRatio : 1;
	if(GLB._isTouch) _ratio = 1;
	var _pointSize = 16;// Add to scene size for better near-border experience ;-)
	//Setup scene
	var _camera = new THREE.PerspectiveCamera(82, (GLB._vw+_pointSize)/GLB._vh, 32, 600);//field of view, frustum aspect ratio, near, far
	_camera.position.z = 256;
	var _scene = new THREE.Scene();
	_scene.background = new THREE.Color(0x000000);
	//Background image(s)
	var _textureLoader = new THREE.TextureLoader();
	var _bgMap = _textureLoader.load("Assets/Grx/bg3d.jpg", bgLoaded);
	var _bgSubMap = _textureLoader.load("Assets/Grx/bg3d_sub.jpg", bgLoaded);
	var _bgGradientMap;
	// if(!GLB._isMobile) _bgGradientMap = _textureLoader.load("Assets/Grx/bg3d_grad.png", bgLoaded);
	_bgGradientMap = _textureLoader.load("Assets/Grx/bg3d_grad.png", bgLoaded);
	var _bgIntroMap = _textureLoader.load("Assets/Grx/bg3d_intro.png", bgLoaded);
	var _bgCount = 0,  _targetLoad = 4;
	if(GLB._isMobile) _targetLoad = 3;
	function bgLoaded(){
		_bgCount++;
		if(_mode == 1 && _bgCount == _targetLoad) _renderer.render(_scene, _camera);
	}
	
	var _background = new THREE.Mesh(new THREE.PlaneGeometry(1024, 512, 1, 1), new THREE.MeshBasicMaterial({transparent:false, map:_bgMap, side:THREE.FrontSide, depthTest:false, fog:false}));
	if(GLB._isMobile) _background.scale.x = 1, _background.scale.y = 1;
	else _background.scale.x = 2.5, _background.scale.y = 2;
	_background.position.z = -256, _background.position.x = -64, _background.position.y = 32;
	_scene.add(_background);
	
	var _subpageBgMat = new THREE.MeshBasicMaterial({transparent:false, map:_bgSubMap, side:THREE.FrontSide, depthTest:false, fog:false});
	var _backgroundSub = new THREE.Mesh(new THREE.PlaneGeometry(1024, 512, 1, 1), _subpageBgMat);
	if(GLB._isMobile) _backgroundSub.scale.x = 1, _backgroundSub.scale.y = 1;
	else _backgroundSub.scale.x = 2.5, _backgroundSub.scale.y = 2;
	_backgroundSub.position.z = -255, _backgroundSub.position.y = 32, _backgroundSub.visible = false;
	_scene.add(_backgroundSub);
	
	var _bgFreeGradient, _bgGradientMat;
	// if(!GLB._isTouch){
	// 	_bgGradientMap.wrapS = _bgGradientMap.wrapT = THREE.RepeatWrapping;
	// 	_bgGradientMat = new THREE.MeshBasicMaterial({transparent:true, map:_bgGradientMap, side:THREE.FrontSide, depthTest:false, fog:false});
	// 	_bgFreeGradient = new THREE.Mesh(new THREE.PlaneGeometry(1024, 512, 1, 1), _bgGradientMat);
	// 	_bgFreeGradient.scale.x = 4, _bgFreeGradient.scale.y = 3;
	// 	_bgFreeGradient.position.z = -255, _bgGradientMap.offset.x = .05, _bgGradientMap.offset.y = .05, _bgGradientMat.opacity = 0;
	// 	_scene.add(_bgFreeGradient);
	// }

	if(!GLB._isTouch){
		_bgGradientMap.wrapS = _bgGradientMap.wrapT = THREE.RepeatWrapping;
		_bgGradientMat = new THREE.MeshBasicMaterial({transparent:true, map:_bgGradientMap, side:THREE.FrontSide, depthTest:false, fog:false});
		_bgFreeGradient = new THREE.Mesh(new THREE.PlaneGeometry(1024, 512, 1, 1), _bgGradientMat);
		_bgFreeGradient.scale.x = 4, _bgFreeGradient.scale.y = 3;
		_bgFreeGradient.position.z = -255, _bgGradientMap.offset.x = .05, _bgGradientMap.offset.y = .05, _bgGradientMat.opacity = 0;
		_scene.add(_bgFreeGradient);
	}
		
	var _introBgMat = new THREE.MeshBasicMaterial({transparent:true, map:_bgIntroMap, side:THREE.FrontSide, depthTest:false, fog:false});
	var _backgroundIntro = new THREE.Mesh(new THREE.PlaneGeometry(512, 256, 1, 1), _introBgMat);
	if(GLB._isMobile) _backgroundIntro.scale.x = 1.5, _backgroundIntro.scale.y = 3;
	else _backgroundIntro.scale.x = 2.5, _backgroundIntro.scale.y = 2.5;
	_backgroundIntro.position.z = 0;
	_scene.add(_backgroundIntro);
	
	var _introSolidMat = new THREE.MeshBasicMaterial({transparent:true, color:0x000000, side:THREE.FrontSide, depthTest:false, fog:false});
	var _overlayIntro = new THREE.Mesh(new THREE.PlaneGeometry(512, 256, 1, 1), _introSolidMat);
	if(GLB._isMobile) _overlayIntro.scale.x = 1.5, _overlayIntro.scale.y = 3;
	else _overlayIntro.scale.x = 2.5, _overlayIntro.scale.y = 2.5;
	_overlayIntro.position.z = 0;
	_scene.add(_overlayIntro);
	
	//Light (behind hero) on background and scene
	var _ambientLight = new THREE.PointLight(0xFFFFFF, .4);
	_ambientLight.position.z = 512, _ambientLight.position.y = -1024;
	_scene.add(_ambientLight);
		
	//Group all content that should scroll out of the screen
	var _heroAndDrones = new THREE.Group();
	//Create hero
	var _heroMap;
	if(_ratio <= 1) _heroMap = _textureLoader.load("Assets/Grx/hero.png");
	else if(_ratio > 1) _heroMap = _textureLoader.load("Assets/Grx/hero_hd.png");
	var _heroGeometry = new THREE.PlaneGeometry(1024/4, 2048/4, 1, 1); //w, h, wseg, hseg (more = better details)
	_heroGeometry.center();
	var _heroMaterial;
	if(GLB._isTouch) _heroMaterial = new THREE.MeshBasicMaterial({transparent:true, map:_heroMap, side:THREE.FrontSide, depthTest:false, fog:false});
	else _heroMaterial = new THREE.MeshStandardMaterial({transparent:true, map:_heroMap, side:THREE.FrontSide, depthTest:false, fog:false});
	_heroMaterial.opacity = _oldHmo = 0;
	var _hero = new THREE.Mesh(_heroGeometry, _heroMaterial);
	_hero.scale.set(.75,.75,.75);
	 _heroAndDrones.add(_hero);
	 
	//Setup drones	
	var _controller = new DroneController(_scene, _heroAndDrones, _textureLoader);

	//Add group
	_scene.add(_heroAndDrones);
	
	//Renderer
	var _renderer = new THREE.WebGLRenderer({antialias:false});
	_renderer.setSize((GLB._vw+_pointSize), GLB._vh);
	//console.log("_ratio", _ratio);
	_renderer.setPixelRatio(_ratio);
	_renderer.gammaInput = false, _renderer.gammaOutput = false;
	document.getElementById("threed").appendChild(_renderer.domElement);
	
	function animate(e){
		//How far out of screen have we scrolled?
		_scrolledOutP = Math.min(1,(GLB._windowScrollTweenedY * .5)/(GLB._vh * .5));
		_moveFactor = Math.min(_this._movementF, 1-_scrolledOutP);
		
		//Mouse/tilt ease
		_twX += (_mX - _twX) * .05, _twY += (_mY - _twY) * .05;
		_twX *= _moveFactor, _twY *= _moveFactor;
				
		//Render all drones
		_controller.render(_scrolledOutP, _twX, _twY, _this._randomFloatFactor, _mode == 0);
		
		if(_mode == 0){
			//Home
			
			//Manage opacity of Hero, based on scroll
			if(_scrolledOutP > .2) _hmo = 1-(_scrolledOutP-.2)*2;
			else _hmo = 1;
			//Steps 0-100
			if(_mode == 0)
			_hmo = Math.round(_hmo*100)/100;
			if(_hmo < 0) _hmo = 0;
			//Only modify when not animating in (except if user scroll down the page quickly)
			if((!_atIntroAnim || GLB._windowScrollTweenedY > 50) && _hmo != _oldHmo){
				_oldHmo = _hmo;
				_heroMaterial.opacity = _hmo * _this._heroMaterialOpacity;
			}
			else if(_fadeHeroMaterial) _heroMaterial.opacity = _hmo * _this._heroMaterialOpacity; //Hero is fading in
			_heroAndDrones.position.x = -GLB._windowScrollTweenedY * .05;
			_heroAndDrones.position.y = _this._heroY + GLB._windowScrollTweenedY*.5;
		}
		
		_heroAndDrones.position.z = _this._heroZ + -GLB._windowScrollTweenedY * .15;
		if(!GLB._isTouch){
			//Move gradient
			_bgFreeGradient.position.x = - _twX*GLB._vw*.1, _bgFreeGradient.position.y = _twY*GLB._vh*.05;
			//Move gradient texture
			_gradMover++;
			if(_gradMover < 300){
				_bgGradientMap.offset.x -= 0.001, _bgGradientMap.offset.y -= 0.0002;
			}
			else{
				if(_gradMover > 600) _gradMover = 0; 
				_bgGradientMap.offset.x += 0.001, _bgGradientMap.offset.y += 0.0002;
			}
		}
		
		_ambientLight.intensity = (1- (_twX+.5))*GLB._vw*.0001 + 1.4 + _this._introIntensity;
		_ambientLight.position.x = (_twX*.2)*GLB._vw*.5+GLB._vw*.25;
		
		_camera.position.x = _twX * 16 + _this._cameraXanimIn;
		_cameraY = -_twY * 16 + _this._cameraYanimIn;
		if(GLB._isMobile) _cameraY += 16;
		_camera.position.y = _cameraY;
		_camera.position.z = 256 + (_twX + .5)*16;
		_renderer.render(_scene, _camera);
	}
	
	var _randoms = [-64, 64, -100, 100, 32, -128];
	function randomFloatLoop(){
		if(!_allowRender) return;
		if(_mode == 1){
			TweenLite.to(_this, 15, {_randomFloatFactor:_randoms[Math.floor(Math.random() * 6)], ease:Quad.easeInOut, onComplete:randomFloatLoop});
			TweenLite.to(_this, 12, {_cameraXanimIn:200, ease:Quad.easeInOut}); //Move left for subpage header layout
		}
		else TweenLite.to(_this, 20, {_randomFloatFactor:_randoms[Math.floor(Math.random() * 6)], ease:Quad.easeInOut, onComplete:randomFloatLoop});
	}
	
	
	//Home
	_this.home = function(){
		//console.log("Show home in 3d scene");
		_mode = 0;
		_allowRender = true;
		stop();
		start();
	}
	
	//Show starmap
	_this.subpageOn = function(){
		//console.log("Show subpage in 3d scene");
		_controller.animOut();
		stopHome();
		_backgroundSub.visible = true;
		_allowRender = true;
		_mode = 1;
		stop();
		start();
	}
	function stopHome(){
		if(_mode == 0){
			//Coming from Home			
			TweenLite.killTweensOf(_this, false, {_heroZ:true, _heroMaterialOpacity:true});
			_fadeHeroMaterial = false;
			_this._heroMaterialOpacity = _heroMaterial.opacity = 0;
			TweenLite.set(_this, {_heroZ:-32});
		}
	}
	//404 single drone is lost
	_this.singleDrone = function(){
		_this.subpageOn();
		_controller.singleDrone();
	}
	_this.singleDroneOff = function(){
		_controller.singleDroneOff();
	}
	
	//Hide everything
	_this.subpageOff = function(){
		//console.log("Show nothing in 3d scene");
		stopHome();
		_mode = 2;
		_allowRender = false;
		stop();
	}
	
	
	function scrollEngine(e){
		if((_started && _running && GLB._windowScrollTweenedY > GLB._vh*1.5) || (!_allowRender && _running)){
			//console.log("pause renderer");
			TweenLite.ticker.removeEventListener("tick", animate);
			TweenLite.killTweensOf(_this, false, {_randomFloatFactor:true});
			_running = false;
		}
		else if(_started && !_running && GLB._windowScrollTweenedY < GLB._vh*1.5 && _allowRender){
			//console.log("resume renderer");
			TweenLite.ticker.addEventListener("tick", animate);
			_running = true;
			//Tween movement factor for smooth reappearing (maybe mouse is in opposite side of the screen now)
			TweenLite.killTweensOf(_this, false, {_movementF:true});
			_this._movementF = 0;
			TweenLite.to(_this, 2, {_movementF:1, ease:Quad.easeInOut});
			randomFloatLoop();
		}
	}
	function start(){
		if(_started) return;
		_started = true;
		GLBEvents(window, "resize", resized, true);
		resized(null);
		TweenLite.ticker.addEventListener("tick", scrollEngine);
			
		if(_veryFirstTime){
			_veryFirstTime = false;
			if(GLB._isMobile){
				TweenLite.to(_introSolidMat, 1.2, {opacity:0, delay:.1, ease:Quad.easeInOut});
				TweenLite.to(_introBgMat, 2.5, {opacity:0, delay:.5, ease:Quad.easeInOut, onComplete:removeIntroBgs});
			}
			else{
				TweenLite.to(_introSolidMat, 1.2, {opacity:0, delay:.1, ease:Quad.easeInOut});
				TweenLite.to(_introBgMat, 2.5, {opacity:0, delay:.5, ease:Quad.easeInOut});
				if(_bgGradientMat) TweenLite.to(_bgGradientMat, 2.0, {opacity:1, delay:1.0, ease:Quad.easeInOut});
				TweenLite.to(_backgroundIntro.scale, 3, {x:7, y:6, delay:.1, ease:Quad.easeInOut, onComplete:removeIntroBgs});
			}
		}
		if(_mode == 0){
			if(GLB._isTouch) GLBEvents(window, "deviceorientation", tilt, true);
			else{
				GLBEvents(window, "mousemove", mousemoved, true);
				GLBEvents(window, "mousedown", mousedown, true);
			}
			//Anim in Home scene
			_atIntroAnim = true;
			_controller.animIn();
			TweenLite.killTweensOf(_this, false, {_cameraXanimIn:true, _movementF:true, _randomFloatFactor:true});
			_this._movementF = 0, _this._heroZ = -16, _this._heroY = -32, _this._cameraXanimIn = 32, _this._cameraYanimIn = 32, _this._introIntensity = .5;
			TweenLite.to(_this, 2.5, {_movementF:1, _heroY:0, _heroZ:0, delay:.5, ease:Quad.easeInOut});
			TweenLite.to(_this, 3.0, {_introIntensity:0, delay:1, ease:Quad.easeInOut});
			TweenLite.killTweensOf(_heroMaterial, false, {opacity:true});
			//Fade in Hero
			_fadeHeroMaterial = true;
			_this._heroMaterialOpacity = _heroMaterial.opacity = 0;
			TweenLite.to(_this, 1.2, {_heroMaterialOpacity:1, delay:1.1, ease:Quad.easeInOut, onComplete:stopFadingHero});
			TweenLite.to(_this, 2, {_cameraXanimIn:0, _cameraYanimIn:0, delay:.8, ease:Quad.easeOut, onComplete:animInOver});
			_backgroundSub.visible = false;
		}
		randomFloatLoop();
	}
	function stopFadingHero(){
		_fadeHeroMaterial = false;
	}
	function removeIntroBgs(){
		_scene.remove(_overlayIntro);
		_scene.remove(_backgroundIntro);
		_overlayIntro.geometry.dispose();
		_introSolidMat.dispose();
		_overlayIntro = null;
		_backgroundIntro.geometry.dispose();
		_introBgMat.dispose();
		_backgroundIntro = null;
	}
	function animInOver(){
		_atIntroAnim = false;
	}
	function stop(){
		if(!_started) return;
		_started = false;
		if(GLB._isTouch) GLBEvents(window, "deviceorientation", tilt, false);
		else{
			GLBEvents(window, "mousemove", mousemoved, false);
			GLBEvents(window, "mousedown", mousedown, false);
		}
		GLBEvents(window, "resize", resized, false);
		TweenLite.ticker.removeEventListener("tick", animate);
		TweenLite.ticker.removeEventListener("tick", scrollEngine);
		_running = false;
		TweenLite.killTweensOf(_this, false, {_movementF:true});
		TweenLite.to(_this, .4, {_movementF:0, ease:Quad.easeOut});
	}
	function mousemoved(e){
		_mX = e.clientX / GLB._vw - .5, _mY = e.clientY / GLB._vh - .5;
	}
	var _deviceTiltX, _deviceTiltY;
	var _beta = 0, _gamma = 0;
	function tilt(e){
		if(e && e.alpha) _alpha = e.alpha, _beta = e.beta, _gamma = e.gamma;			
		else{
			if(window.orientation == 180) _beta = -e.beta, _gamma = -e.gamma;
			else if(window.orientation == 90) _beta = -e.gamma, _gamma = e.beta;
			else if(window.orientation == -90) _beta = e.gamma, _gamma = -e.beta;
			else _beta = e.beta, _gamma = e.gamma;
		}
		_deviceTiltY = (_beta + 90 - 45) / 180;  // In degree in the range [-180,180]
		_deviceTiltX = (_gamma + 45) / 90; // In degree in the range [-90,90]
		if(_deviceTiltX < 0) _this._deviceTiltX = 0;
		else if(_deviceTiltX > 1) _this._deviceTiltX = 1;
		if(_deviceTiltY < 0) _this._deviceTiltY = 0;
		else if(_deviceTiltY > 1) _this._deviceTiltY = 1;
		_mX = _deviceTiltX - .5, _mY = _deviceTiltY - .5;
		_mX *= 4, _mY *= 4;
	}
	var _downTimer;
	function mousedown(e){
		if(!_running) return;
		GLBEvents(window, "mouseup", mouseup, true);
		if(e.clientY > 100) _downTimer = setTimeout(controlWithMouse, 50); //Not close to menu
		else _downTimer = setTimeout(controlWithMouse, 250);
	}
	function mouseup(e){
		GLBEvents(window, "mouseup", mouseup, false);
		clearTimeout(_downTimer);
		if(_mouseIsControlling){
			_controller.resumeAfterMouse();
			TweenLite.killTweensOf(_this, false, {_heroZ:true});
			TweenLite.to(_this, 1, {_heroZ:0, ease:Quad.easeOut});
		}
		_mouseIsControlling = false;
	}
	function controlWithMouse(){
		//console.log("controlWithMouse");
		_mouseIsControlling = true;
		_controller.mouseInteractionInit();
		TweenLite.killTweensOf(_this, false, {_heroZ:true});
		TweenLite.to(_this, .8, {_heroZ:-8, ease:Cubic.easeOut});
	}

	function resized(e){
		if(GLB._isMobile){
			_hero.position.x = 16, _hero.position.y = -116;
			_scene.position.x = 0, _scene.position.z = -50, _scene.position.y = 100;
			_background.scale.x = _backgroundSub.scale.x = GLB._vw/400;
			_background.scale.y = _backgroundSub.scale.y = GLB._maxResH/256;
		}
		else{
			_scene.position.x = Math.round(26 + GLB._vw * .01);
			_hero.position.x = 0, _hero.position.y = -( GLB._vh * .16 - (Math.pow(GLB._vh, 2) * .00005));//.15 is further up
		}
		if(GLB._isMobile && GLB._iOS){
			_camera.aspect = (GLB._vw+_pointSize)/(GLB._vh + 80);
			_camera.updateProjectionMatrix();
			_renderer.setSize((GLB._vw+_pointSize), (GLB._vh + 80));
		}
		else{
			_camera.aspect = (GLB._vw+_pointSize)/GLB._vh;
			_camera.updateProjectionMatrix();
			_renderer.setSize((GLB._vw+_pointSize), GLB._vh);
		}
	}
}

var _usePointForDrone = true;

//Manages different patterns of movement
function DroneController(_scene, _heroAndDrones, _textureLoader){
	var _this = this;
	var _starsGeometry, _starsBGeometry, _starsMaterial, _starsBMaterial, _starField, _starBField;
	var _mouseControlling = false;
	
	//Public:
	_this.radiusA = 0; //Radius
	_this.radiusB = 0;
	_this.turnSpeedA = 0; //Speed of rotation
	_this.turnSpeedB = 0;
	_this.angleMul = 0;
	_this.sinFactor = 0;
	_this._groupAy = 50, _this._groupBy = 50;
	_this._mouseControlSpeed = 0;
	
	var _pattern = 0, _sin = 0;
	var _numDronesPrGroup = 8;
	var _totalDrones = _numDronesPrGroup*2;
	
	//Position in circle
	var _angle = 360/_totalDrones * Math.PI/180;
	var _ao = 0, _aoB = 0; //Angle offset
	var _patternTimer;
	
	//Create two groups of drones
	var _groupA = new THREE.Group(), _groupB = new THREE.Group();
	_groupA.position.y = _groupB.position.y = _this._groupAy; //A little offset to make them higher in the air
	
	var _drones = [];
	var _droneWhite = _textureLoader.load( "Assets/Grx/point.png" );
	var _droneFlare = _textureLoader.load( "Assets/Grx/flare.png" );
	var _matWhite;
	if(_usePointForDrone) _matWhite = new THREE.PointsMaterial({size:64, map:_droneWhite, depthTest:false, transparent:true, fog:false});
	else _matWhite = new THREE.MeshBasicMaterial({map:_droneWhite, side:THREE.FrontSide, depthTest:false, transparent:true, fog:false});
	var _matFlare = new THREE.MeshBasicMaterial({transparent:true, map:_droneFlare, side:THREE.FrontSide, depthTest:false, fog:false});
	var _droneGeometry;
	if(_usePointForDrone) _droneGeometry = new THREE.CircleGeometry(1, 1, 1, 1); //w, h, wseg, hseg (more = better details)
	else _droneGeometry = new THREE.PlaneGeometry(64, 64, 1, 1); //w, h, wseg, hseg (more = better details)
	var _droneFlareGeometry = new THREE.PlaneGeometry(32, 32, 1, 1); //w, h, wseg, hseg (more = better details)
	_droneGeometry.center();
	
	//Create drones in each circle
	for(var i=0;i<_numDronesPrGroup;++i){
		var _l = ((i%2) == 0);
		_drones.push(new DroneThreeD(i*2, _l, _groupA, _droneGeometry, _droneFlareGeometry, _matWhite, _matFlare));
		_drones.push(new DroneThreeD(i*2+1, _l, _groupB, _droneGeometry, _droneFlareGeometry, _matWhite, _matFlare));
	}
	_heroAndDrones.add(_groupA), _heroAndDrones.add(_groupB);
	
	
	_this._lostDrone;
	_this.singleDrone = function(){
		if(!_this._lostDrone) _this._lostDrone = new lostDrone(_scene, _droneGeometry, _droneFlareGeometry, _matWhite, _matFlare);
		_this._lostDrone.start();
	}
	_this.singleDroneOff = function(){
		_this._lostDrone.stop();
	}
	
	
	//Create stars
	_starsGeometry = new THREE.Geometry(), _starsBGeometry = new THREE.Geometry();
	var _numStars = 80;
	if(GLB._isTouch) _numStars = 32;
	for(var i = 0; i < _numStars; i ++){
		var _star = new THREE.Vector3();
		if(i < _numStars/3.3){
			//In the sides
			if((i%2) == 0) _star.x = (THREE.Math.randFloatSpread(512) + 256);
			else _star.x = - (THREE.Math.randFloatSpread(512) + 256);
			if(Math.random() < .5) _star.y = -Math.random() * 64 - 32;
			else _star.y = Math.random() * 64 + 32;
			_star.z = Math.random() * 128 + 64;
		}
		else{
			_star.x = THREE.Math.randFloatSpread(1600);
			_star.y = THREE.Math.randFloatSpread(512);
//			_star.z = - (Math.random() * 128 + 32);
		}
		_starsGeometry.vertices.push(_star);
	}
	for(i = 0; i < _numStars; i ++){
		var _star = new THREE.Vector3();
		if(i < _numStars/3.3){
			//In the sides
			if((i%2) == 0) _star.x = (THREE.Math.randFloatSpread(512) + 256);
			else _star.x = - (THREE.Math.randFloatSpread(512) + 256);
			if(Math.random() < .5) _star.y = -Math.random() * 64 - 32;
			else _star.y = Math.random() * 64 + 32;
			_star.z = Math.random() * 128 - 64;
		}
		else{
			_star.x = THREE.Math.randFloatSpread(1600);
			_star.y = THREE.Math.randFloatSpread(512);
			_star.z = - (Math.random() * 128 + 32);
		}
		_starsBGeometry.vertices.push(_star);
	}
	_starsMaterial = new THREE.PointsMaterial({size:.5, color:0x5959e3, depthTest:false, transparent:false, fog:false});
	_starsBMaterial = new THREE.PointsMaterial({size:1, color:0xaa90eb, depthTest:false, transparent:false, fog:false});
	var _starField = new THREE.Points(_starsGeometry, _starsMaterial);
	var _starBField = new THREE.Points(_starsBGeometry, _starsBMaterial);
	_starField.position.z = -64, _starBField.position.z = -32;
	_scene.add(_starField), _scene.add(_starBField);
	
	var _currentFunction;
	
	_this.animIn = function(){
		for(var i=0;i<_totalDrones;++i){
			//_drones[i].animIn(1.4 - Math.abs(i-_totalDrones*.5)*.1);
			_drones[i].animIn(1.0);
		}
		if(_currentFunction){
			//Resume from where we left
			_patternTimer = setTimeout(_currentFunction, 5000);
			return;
		}
		_pattern = 0;
		_this.radiusA = 0;
		_this.angleMul = 1;
		_this.radiusA = 400;
		_this.radiusB = 100;
		_this.turnSpeedA = .005;
		_this.turnSpeedB = .02;
		//Come from below and swarm into formation
		TweenLite.to(_this, 2, {radiusA:200, radiusB:200, delay:1, ease:Back.easeInOut});
		TweenLite.to(_this, 2, {turnSpeedA:1.3, turnSpeedB:1.3, delay:2, ease:Quad.easeInOut});
		//First pattern
		_currentFunction = spreadCircles;
		_patternTimer = setTimeout(_currentFunction, 4000);
	}
	//Called when coming from Home
	_this.animOut = function(){
		for(var i=0;i<_totalDrones;++i) _drones[i].animOut();
		clearTimeout(_patternTimer);
	}
	
	
	function spreadCircles(){
		_pattern = 0;
		TweenLite.to(_this, 1, {radiusA:225, radiusB:170, ease:Back.easeInOut});
		//TweenLite.to(_this, 2, {turnSpeedA:1, ease:Quad.easeInOut});
		_currentFunction = fadeDown;
		_patternTimer = setTimeout(_currentFunction, 1000);
	}
	function fadeDown(){
		TweenLite.to(_this, 2, {turnSpeedA:-.7, turnSpeedB:.7, _groupAy:60, _groupBy:130, ease:Quad.easeInOut});
		_currentFunction = sinusCurve;
		_patternTimer = setTimeout(_currentFunction, 2000);
	}
	function sinusCurve(){
		for(var i=0;i<_totalDrones;++i) _drones[i].switch();
		TweenLite.to(_this, 2, {sinFactor:1, radiusA:230, turnSpeedA:.5, turnSpeedB:.5, ease:Quad.easeInOut});
		//Move up and down
		TweenLite.to(_this, 2, {_groupAy:40, _groupBy:120, ease:Quad.easeInOut});
		TweenLite.to(_this, 2.5, {_groupAy:0, _groupBy:100, delay:3, ease:Quad.easeInOut});
		TweenLite.to(_this, 1, {sinFactor:0, delay:7, ease:Quad.easeInOut});
		
		if(Math.random() < .5) _currentFunction = moveVertical;
		else _currentFunction = moveVerticalB;
		_patternTimer = setTimeout(_currentFunction, 9000);
	}
	/*function fadeUp(){
		//Reverse
		TweenLite.to(_this, 1.2, {turnSpeedA:-.3, turnSpeedB:.3, radiusB:225, radiusA:170, _groupAy:130, _groupBy:60, ease:Quad.easeInOut});
		_currentFunction = slowDownVertical;
		_patternTimer = setTimeout(_currentFunction, 1000 * Math.random() + 1000);
	}*/
	/*function slowDownVertical(){
		TweenLite.to(_this, 1, {turnSpeedA:-1.6, turnSpeedB:1.6, radiusB:175, radiusA:215, _groupAy:120, _groupBy:50, ease:Quad.easeInOut});
		TweenLite.to(_this, 2, {turnSpeedA:1.9, turnSpeedB:1.1, _groupAy:30, _groupBy:90, delay:1, ease:Quad.easeInOut});
		if(Math.random() < .5) _currentFunction = moveVertical;
		else _currentFunction = moveVerticalB;
		_patternTimer = setTimeout(_currentFunction, 3000);
	}*/
	function moveVertical(){
		for(var i=0;i<_totalDrones;++i) _drones[i].switch();
		TweenLite.to(_this, 1, {_groupAy:130, turnSpeedA:-1.2, turnSpeedB:-1.2, ease:Quad.easeInOut});
		TweenLite.to(_this, 1.5, {_groupBy:60, ease:Quad.easeInOut});
		TweenLite.to(_this, 1, {radiusA:200, radiusB:200, ease:Quad.easeInOut});
		_currentFunction = spreadCircles;
		_patternTimer = setTimeout(_currentFunction, 2000);
		
		TweenLite.to(_groupA.rotation, .5, {z:8 * Math.PI/180, ease:Quad.easeInOut});
		TweenLite.to(_groupA.rotation, .5, {z:0, delay:.5, ease:Quad.easeInOut});
	}
	function moveVerticalB(){
		for(var i=0;i<_totalDrones;++i) _drones[i].switch();
		TweenLite.to(_this, 1, {_groupBy:80, turnSpeedA:-1.2, turnSpeedB:-1.2, ease:Quad.easeInOut});
		TweenLite.to(_this, 1.5, {_groupAy:130, ease:Quad.easeInOut});
		TweenLite.to(_this, 1, {radiusA:200 + Math.random()*50-25, radiusB:200, ease:Quad.easeInOut});
		_currentFunction = spreadCircles;
		_patternTimer = setTimeout(_currentFunction, 2000);
	}
	
	/*function colorSeperated(){
		_aoB = _ao;
		for(var i=0;i<_totalDrones;++i){
			_drones[i].switch();
			_drones[i].toggleY(false);
			_drones[i].toColor();
		}
		TweenLite.to(_groupA.rotation, 2, {z:-35 * Math.PI/180, ease:Quad.easeInOut});
		TweenLite.to(_groupB.rotation, 2, {z:35 * Math.PI/180, ease:Quad.easeInOut});
		TweenLite.to(_this, 2, {sinFactor:0, radiusA:200, turnSpeedA:.4, radiusB:200, turnSpeedB:2, ease:Quad.easeInOut});
		TweenLite.to(_this, 2, {radiusA:230, turnSpeedA:2, radiusB:230, turnSpeedB:.4, delay:2, ease:Quad.easeInOut});
		TweenLite.to(_this, 2, {radiusA:200, turnSpeedA:.3, radiusB:200, turnSpeedB:.3, delay:4, ease:Quad.easeInOut});
		_pattern = 1;
		_currentFunction = finishColorSeperate;
		_patternTimer = setTimeout(_currentFunction, 8000);
	}
	function finishColorSeperate(){
		for(var i=0;i<_totalDrones;++i){
			_drones[i].switch();
			_drones[i].toWhite();
		}
		TweenLite.to(_groupA.rotation, 2, {z:0, ease:Quad.easeInOut});
		TweenLite.to(_groupB.rotation, 2, {z:0, ease:Quad.easeInOut});
		spreadCircles();
	}*/
	
	
	//Mouse is controlling drones
	_this.mouseInteractionInit = function(){
		_mouseControlling = true;
		clearTimeout(_patternTimer);
		_this._mouseControlSpeed = 0;
		for(var i=0;i<_totalDrones;++i) _drones[i].switch();
		TweenLite.killTweensOf(_this, false, {_groupAy:true, _groupBy:true, radiusA:true, radiusB:true});
		TweenLite.to(_this, .8, {_groupAy:40, _groupBy:130, radiusA:230, radiusB:170, _mouseControlSpeed:.1, ease:Quad.easeInOut});
	}
	_this.resumeAfterMouse = function(){
		_mouseControlling = false;
		for(var i=0;i<_totalDrones;++i) _drones[i].switch();
		TweenLite.to(_groupA.rotation, .6, {y:0, ease:Quad.easeInOut});
		TweenLite.to(_groupB.rotation, .8, {y:0, ease:Quad.easeInOut});
		_patternTimer = setTimeout(_currentFunction, 800);
	}
	
	_this.render = function(_scrolledOutP, _mx, _my, _randomFloatFactor, _atHome){
		if(_atHome){
			//Mouse moving drones
			if(_mouseControlling){
				_this.turnSpeedA += (_mx*5 - _this.turnSpeedA) * _this._mouseControlSpeed;
				_this.turnSpeedB += (_mx*5 - _this.turnSpeedB) * _this._mouseControlSpeed;
				_groupA.rotation.y += (-_mx * 40 * Math.PI/180 - _groupA.rotation.y) * _this._mouseControlSpeed;
				_groupB.rotation.y += (_mx * 50 * Math.PI/180 - _groupB.rotation.y) * _this._mouseControlSpeed;
				_groupA.position.y += ((_my * -80+20 + _this._groupAy*(_my+.75)) - _groupA.position.y) * _this._mouseControlSpeed;
				_groupB.position.y += ((_my * -80+20 + _this._groupBy*(_my+.75)) - _groupB.position.y) * _this._mouseControlSpeed;
			}
			else{
				_groupA.position.y += (_this._groupAy-_groupA.position.y)*.05;
				_groupB.position.y += (_this._groupBy-_groupB.position.y)*.05;
			}
			
			//Wavy pattern with white lights
			_ao += _this.turnSpeedA * Math.PI/180;
			_aoB += _this.turnSpeedB * Math.PI/180;
			_sin += .03;
			
			for(var i=0;i<_numDronesPrGroup;++i){
				//Stitch ends
				var _sinI = i;
				if(i > _numDronesPrGroup*.5) _sinI -= (_numDronesPrGroup*.5-_sinI);
				
				_drones[i*2].x(_this.radiusA*Math.cos(_angle*_this.angleMul*(i*2)+_ao));
				_drones[i*2].z(_this.radiusA*Math.sin(_angle*_this.angleMul*(i*2)+_ao));
				_drones[i*2].y(Math.sin(_sin + (_sinI*2)*.4) * 40 * _this.sinFactor - 24);
				_drones[(i*2)].masterLight(_scrolledOutP);
				_drones[i*2+1].x(_this.radiusB*Math.cos(_angle*_this.angleMul*(i*2+1)+_aoB));
				_drones[i*2+1].z(_this.radiusB*Math.sin(_angle*_this.angleMul*(i*2+1)+_aoB));
				_drones[i*2+1].y(Math.sin(_sin + (_sinI*2+1)*.4) * 40 * _this.sinFactor - 24);
				_drones[(i*2+1)].masterLight(_scrolledOutP);
			}
		}
		//Float of starfields
		_starField.position.x = _randomFloatFactor*.25 -_mx * 16, _starField.position.y = _my * 8;
		_starBField.position.x = _randomFloatFactor -_mx * 32, _starBField.position.y = _randomFloatFactor * .5 + _my * 16;
		_starField.position.z = -64 - _scrolledOutP*32;
	}
}

function DroneThreeD(_id, _addLight, _parent, _droneGeometry, _droneFlareGeometry, _whiteMat, _flareMat){
	var _this  = this;
	_this.masterOpacity = 1;
	_this._x = 0;
	_this._y = 0;
	_this._z = 0;
	_this._masterY = 1;
	_this._speed = .05;
	var _animIn = false;
	
	//Create particle
	var _particle = new THREE.Group();
	var _white;
	if(_usePointForDrone) _white = new THREE.Points(_droneGeometry, _whiteMat.clone());//Clone in order for independent opacity
	else _white = new THREE.Mesh(_droneGeometry, _whiteMat.clone());//Clone in order for independent opacity
	var _whiteFlare = new THREE.Mesh(_droneFlareGeometry, _flareMat.clone());//Clone in order for independent opacity
	_white.position.z = 1;
	_particle.add(_whiteFlare);
	_particle.add(_white);
	
	_parent.add(_particle);
	var _activeMaterial = _white.material;
	var _atWhite = true;
	_this._activeMasterOpacity = 0;
	_this._offX = 1;
	_this._offY = 0;
	_this._offZ = 0;
	
	//Create light	
	var _pointLight;
	if(GLB._isTouch) _addLight = false;
	if(_addLight){
		_pointLight = new THREE.PointLight(0xfdffe0, 0.3);
		_parent.add(_pointLight); //Only add light to every second particle
	}
	var _lightOff = 48, _flareFactor = 1;
	if(_addLight && _id%4 == 0) _lightOff = 64, _flareFactor = -1;

	
	_this.x = function(_v){
		_v *= _this._offX;
		_this._x += (_v - _this._x) * _this._speed;
		_particle.position.x = _this._x;
		if(_addLight) _pointLight.position.x = _this._x;
	}
	_this.y = function(_v){
		_this._y += (_v - _this._y) * _this._speed;
		renderY();
	}
	function renderY(){
		_particle.position.y = _this._y * _this._masterY + _this._offY;
		if(_addLight) _pointLight.position.y = _this._y * _this._masterY + _this._offY - _lightOff;
	}
	_this.z = function(_v){
		_v += _this._offZ;
		_this._z += (_v - _this._z) * _this._speed;
		_particle.position.z = _this._z;
		if(_addLight){
			if(_this._z < -156) _pointLight.position.z = -156;
			else if(_this._z > 156) _pointLight.position.z = 156;
			else _pointLight.position.z = _this._z - 16;
		}
		renderOpacity();
	}
	var _flareScale = 1;
	function renderOpacity(){
		var _inViewP = Math.max(0, Math.min(1, ((_this._z)/220) * _this._activeMasterOpacity)), _inViewX = Math.min(1, (_this._x)/220);
		_activeMaterial.opacity = _this._activeMasterOpacity * Math.max(0, .5 + (_this._z/256) * .5) * _this.masterOpacity;
		if(_addLight){
			_pointLight.intensity = Math.max(0, .5 + (_this._z/164) * .4) * .3 * (.45+_this.masterOpacity*.3) + _inViewX*.2;//No light when behind hero
			if(_animIn) _pointLight.intensity = Math.min(_pointLight.intensity, .3);
		}

		//Adjust flare
		if(_inViewP > .5){
			_whiteFlare.rotation.z -= _inViewX * .04;
			_whiteFlare.rotation.y = _inViewX*8 * (Math.PI/180);
			if(_addLight) _whiteFlare.rotation.x = -_inViewX*8 * (Math.PI/180);
		}
		_whiteFlare.material.opacity = _inViewP * _this._activeMasterOpacity;
		_flareScale = Math.max(0.02, Math.min(2.5, Math.pow(_inViewP*3, 4) / 25));
		_whiteFlare.scale.x = _flareScale * _flareFactor;
		_whiteFlare.scale.y = _flareScale;
	}
	_this.masterLight = function(_v){
		_this.masterOpacity = 1 - _v;
	}
	_this.toggleY = function(_on){
		if(_on) TweenLite.to(_this, 3, {_masterY:1, ease:Quad.easeInOut});
		else TweenLite.to(_this, 3, {_masterY:0, ease:Quad.easeInOut, onUpdate:renderY});
	}
	/*_this.fadeDown = function(){
		TweenLite.killTweensOf(_this, false, {_activeMasterOpacity:true});
		TweenLite.to(_this, 1, {_activeMasterOpacity:0, ease:Quad.easeInOut});
	}
	_this.fadeUp = function(){
		TweenLite.killTweensOf(_this, false, {_activeMasterOpacity:true});
		TweenLite.to(_this, 1.2, {_activeMasterOpacity:1, delay:.2, ease:Quad.easeInOut});
	}*/
	_this.animOut = function(){
		TweenLite.killTweensOf(_this, false, {_activeMasterOpacity:true});
		/*if(_this._activeMasterOpacity > 0) TweenLite.to(_this, .4, {_activeMasterOpacity:0, ease:Quad.easeOut, onUpdate:renderOpacity});
		else renderOpacity();*/
		_this._activeMasterOpacity = 0;
		renderOpacity();
	}
	
	//Switch color
	/*_this.toWhite = function(){
		if(_atWhite) return;
		_atWhite = true;
		_this._activeMasterOpacity = 0;
		_activeMaterial = _white.material;
		TweenLite.to(_this, 1, {_activeMasterOpacity:1, delay:.4, ease:Quad.easeInOut});
		TweenLite.to(_colored.material, 1, {opacity:0, ease:Quad.easeInOut});
	}
	_this.toColor = function(){
		if(!_atWhite) return;
		_atWhite = false;
		_this._activeMasterOpacity = 0;
		_activeMaterial = _colored.material;
		TweenLite.to(_this, 1, {_activeMasterOpacity:1, delay:.4, ease:Quad.easeInOut});
		TweenLite.to(_white.material, 1, {opacity:0, ease:Quad.easeInOut});
	}*/
	
	_this.switch = function(){
		//Temporary set speed slower
		_speed = .001;
		TweenLite.to(_this, 2.5, {_speed:.05, ease:Quad.easeIn});
	}
	
	//Anim in with fading up
	_this.animIn = function(_d){
		TweenLite.to(_this, 1.0, {_activeMasterOpacity:1, delay:_d+.2 + Math.random()*1, ease:Quad.easeInOut});
		
		//Random entrance points
		if(Math.random() < .5) _this._offX = - Math.random() * 8 - 4;
		else _this._offX = Math.random() * 8 + 4;
		_this._offY = Math.random() * 400 + 100;
		if(Math.random() < .5) _this._offY *= -1;
		_this._offZ = -Math.random() * 200 - 500;

		TweenLite.to(_this, 2.0 + Math.random()*.5, {_offX:1, delay:_d + Math.random()*.4, ease:Back.easeOut});
		TweenLite.to(_this, 2.0, {_offZ:0, delay:_d, ease:Quad.easeOut, onComplete:animInOver});
		TweenLite.to(_this, 3.5, {_offY:0, delay:_d + Math.random()*.8, ease:Back.easeOut});
		_animIn = true;
				
		/*_this._offY = -220;		
		TweenLite.to(_this, 2.5, {_offY:1, delay:_d, ease:Cubic.easeOut});*/
	}
	function animInOver(){
		_animIn = false;
	}
}

function lostDrone(_parent, _droneGeometry, _droneFlareGeometry, _whiteMat, _flareMat){
	var _this  = this;
	
	//Create particle
	var _particle = new THREE.Group();
	var _white;
	if(_usePointForDrone) _white = new THREE.Points(_droneGeometry, _whiteMat.clone());//Clone in order for independent opacity
	else _white = new THREE.Mesh(_droneGeometry, _whiteMat.clone());//Clone in order for independent opacity
	var _whiteFlare = new THREE.Mesh(_droneFlareGeometry, _flareMat.clone());//Clone in order for independent opacity
	_white.position.z = 1;
	_particle.add(_whiteFlare);
	_particle.add(_white);
	
	_this.start = function(){
		_parent.add(_particle);
		TweenLite.set(_particle.position, {x:700, y:64, z:0});
		TweenLite.to(_particle.position, 2, {x:64, ease:Expo.easeInOut});
		//Move towards us
		TweenLite.to(_particle.position, 2, {z:64, delay:2, ease:Quad.easeInOut, onStart:randomPos});
	}
	function randomPos(){
		TweenLite.to(_particle.position, 1+Math.random()*2, {x:Math.random() * 256 + 64, y:64+Math.random() * 64 - 32, delay:Math.random(), ease:Cubic.easeInOut, onComplete:randomPos});
	}
	_this.stop = function(){
		TweenLite.killTweensOf(_particle.position);
		_parent.remove(_particle);
	}
}

var _3dController = new ThreeDController();