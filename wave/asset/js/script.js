/* Author:
   Dan Mitchell / Creative Edge Design ltd
*/


var website = {
	
	init: function() {
		website.init_nav_burger();
		
		website.init_homepage();
		website.init_video();
		website.init_bgs();
		website.init_scaling();
		website.init_modal();
		website.init_forms();
		website.init_registration();
		
		mywave.init();
		mywaveline.init();
	}
	
	,init_nav_burger: function() {
		$('.menubutton').on('click', function() {
			$(this).blur();
			if( $('html').hasClass('subnavopen') ) {
				$('html').removeClass('subnavopen');
				$(this).removeClass('is-active');
			} else {
				$(this).addClass('is-active');
				$('html').addClass('subnavopen');
				if($('.dropdown-menu').is(':visible')) {
					$(".dropdown-toggle").trigger('click');
				}
			}
		});
		
		/*
		$('.menubutton').on('click', function(e) {
			e.preventDefault();
			$(this).trigger('blur');
			
			var $html = $('html'),
				$subnav = $('header .subnav');

			if(!$html.hasClass('subnavopen')) {
				$html.addClass('subnavopen');
			} else {
				$html.removeClass('subnavopen');
			}
		});
		*/
		
		$('.subnav a').on('click', function() {
			var href = $(this).attr('href');
			if(!href.match(/^http/i)) {
				$('.menubutton').trigger('click');
				window.location = $(this).attr('href');
			}
		});
		
		$('.newspanel').on('click', function() {
			var href = $(this).find('a').attr('href');
			if(href) {
				window.location = href;
			}
		});
	}
	
	,init_homepage: function() {
		if( !$('.home').length ) return;

		var positionLinker = function() {
			var top = '50%',
				$welcome = $('.welcome'),
				$linker = $('.welcome a.linker');

			if( $(window).height() < $welcome.height() ) {
				top = $(window).height() - ($linker.outerHeight() * 1.5);
			} else {
				//console.log('righton',top);
			}

			$linker.css('top', top+'px');
		};
		
		$('.welcome a.linker').on('click', function(e) {
			e.preventDefault();
			$(this).trigger('blur');

			var scrollTop = $('.welcome .preamble').position().top - 150;

			$('html,body').animate({
				scrollTop: scrollTop
			}, {
				duration: 1000,
				queue: false
			});
		});
		
		$(window).on('load', function() {
			$(window).on('resize', positionLinker).trigger('resize');
		});
	}

	,init_video: function() {
		if( !$('video').length) return;
		
		var $video = $('video'),
		    winWidth = $(window).width(),
			video_low = $video.data('low'),
			video_high = $video.data('high');

		if(winWidth <= 480) {
			$video.html('<source src="'+video_low+'" type="video/mp4">');
		} else {
			$video.html('<source src="'+video_high+'" type="video/mp4">');
		}
	}
	
	,init_bgs: function() {
		$('[data-bg]').each(function() {
			var bg = $(this).data('bg');
			if(bg) {
				$(this).css('background-image', 'url('+bg+')');
			}
		});
	}
	
	,init_scaling: function() {
		$('[data-ratio]').each(function() {
			$(this).addClass('scaleme');
		});
		
		var doScale = function() {
			var maxHeight = 0;
			$('.scaleme').each(function() {
				var $obj = $(this),
				    ratio = $obj.data('ratio'),
				    currentWidth = $obj.width();
					
				if(ratio) {
					var height = Math.ceil(parseInt(currentWidth * ratio));
					$obj.height(height);
					if(height > maxHeight) {
						maxHeight = height;
					}
				}
			});
			$('.scaleme').height(maxHeight);
		};
		
		$(window).on('resize', doScale).trigger('resize');
	}
	
	,init_modal: function() {
		var openModal = function() {
			if( $('html').hasClass('subnavopen') ) {
				$('.menubutton').trigger('click');
			}
			$('.veil').fadeIn('fast', function() {
				$('.modal').fadeIn('fast', function() {
					$(this).find('input:text:first').trigger('focus');
				});
			});
		};
		
		var closeModal = function() {
			$('.modal').fadeOut('fast', function() {
				$('.veil').fadeOut('fast');

				$('.registerinternet-part1').show();
				$('.registerinternet-part2').hide();
			});
		};
		
		$('.close').on('click', function() {
			$(this).trigger('blur');
			closeModal();
		});
		
		$('.registerbutton').on('click', function() {
			$(this).trigger('blur');
			openModal();
		});
	}
	
	,init_forms: function() {
		$('#interestform').on('submit', function(e) {
			e.preventDefault();
			
			var $form = $(this),
			    data = $(this).serialize();
			
			$.post('/ajax/controller.ajax.php', data, function(json) {
				var json = json || {};
				if(json.success) {
					$form.html('<h4>Thank you for registering your interest in Marine-i</h4><p>One of our team will be in touch with you shortly so we can help you.</p>');
				} else {
					alert('Could not submit the form - check and try again.');
				}
			}, 'json');
		});

		$('#newsletterform').on('submit', function(e) {
			e.preventDefault();

			var $form = $(this),
			    data = $(this).serialize();
			
			$.post('/ajax/controller.ajax.php', data, function(json) {
				var json = json || {};
				if(json.success) {
					$form.html('<p>Thank you for subscribing.</p>');
				} else {
					alert('Could not add  you to the newsletter mailing list - check and try again.');
				}
			}, 'json');
		});

		$('.show-modal-newhorizons').on('click', function() {
			$('.veil').fadeIn('fast');
			$('.modal-newhorizons').show();
		});
		$('.close-nh').on('click', function() {
			$('.veil').fadeOut('fast');
			$('.modal-newhorizons').hide();
		});
		$('#newhorizonsform').on('submit', function(e) {
			e.preventDefault();
			
			var $form = $(this),
			    data = $(this).serialize();
			
			$.post('/ajax/controller.ajax.php', data, function(json) {
				var json = json || {};
				if(json.success) {
					$form.html('<h4>Thank you for entering the New Horizons Awards.</h4><p>We will be in touch if your nomination is shortlisted.</p>');
				} else {
					alert('Could not submit the form - check and try again.');
				}
			}, 'json');
		});
		
		var newsletterModalDone = false;
		$('#newsletterform input').on('focus', function() {
			if(!newsletterModalDone) {
				$(this).trigger('blur');
				$('.veil').fadeIn('fast');
				$('.modal-newsletter').show();
				newsletterModalDone = true;
			}
		});
		$('.modal-newsletter-ok').on('click', function() {
			$('.modal-newsletter').hide();
			$('.veil').fadeOut('fast');
			$('#newsletterform input').trigger('focus');
		});

		$('#contactform').on('submit', function(e) {
			e.preventDefault();

			var $form = $(this),
			    data = $(this).serialize();
			
			$.post('/ajax/controller.ajax.php', data, function(json) {
				var json = json || {};
				if(json.success) {
					$form.html('<h2>Thank you for contact Marine-i</h2><p>One of our team will be in touch with you shortly so we can help you.</p>');
				} else {
					alert('Could not submit the form - check and try again.');
				}
			}, 'json');
		});

		$('.subtlelabels input').on('keyup', function() {
			var value = $(this).val();
			if(value && value.length >= 1) {
				$(this).parent().find('label').slideDown('fast');
			} else {
				$(this).parent().find('label').slideUp('fast');
			}
		});
		
		$('input, select, textarea').on('focus', function() {
			var $helper = $(this).parents('.row:first').find('.helper'),
				$firstField = $(this).parents('.row:first').find(':input:visible:first'),
				pos = $firstField.position().top-16;
			$helper.css({
				top: pos+'px'
			});
			$helper.removeClass('hidden');
		}).on('blur', function() {
			var $helper = $(this).parents('.row:first').find('.helper');
			$helper.addClass('hidden');
		});
		
		$('.gotostep').on('click', function(e) {
			e.preventDefault();
			var step = $(this).data('step');
			if( !$('.applicationstep-'+step).is(':visible') ) {
				$('html,body').animate({
					scrollTop: 0
				}, {
					duration: 500,
					queue: false
				});
				
				$('.applicationstep').slideUp('fast');
				$('.applicationstep-'+step).slideDown('fast');
				$('.dot.green').removeClass('green');
				var width = parseInt($('.dot'+step).css('left')) + 10;
				$('.barprogress').animate({
					width: width
				}, {
					duration: 200,
					queue: false,
					complete: function() {
						$('.dot'+step).addClass('green');
					}
				});
			}

			var formdata = $('#applicationform').serialize();
			$.post('/console/ajax/controller.ajax.php', {
				a: 'saveform',
				formdata: formdata
			}, function(ret) {
			}, 'json');
		});
		
		$('input[type=number]').on('keyup', function(e) {
			this.value = this.value.replace(/[^0-9\s]/g,'');
		});
		
		$('.addtosum').on('blur', function() {
			var whichsum = $(this).data('sum');
			var total = 0;
			
			$('.addtosum[data-sum='+whichsum+']').each(function() {
				if($(this).val()) {
					var t = $(this).val();
					t=t.replace(/[^0-9\s]/g,'');
					t = Number(t);
					total += t;
				}
			});
			
			if($('.totalsum[data-sum='+whichsum+']').data('rounded')) {
				total = total.toFixed(2);
			}
			
			if($('.totalsum[data-sum='+whichsum+']').is(':input')) {
				if(total > 100) {
					$('.totalsum[data-sum='+whichsum+']').val('');
				} else {
					$('.totalsum[data-sum='+whichsum+']').val(total);
				}
			} else {
				$('.totalsum[data-sum='+whichsum+']').html(total);
			}
			
			$('.employees').trigger('blur');
		}).trigger('blur');
		
		$('select.toggleshow-selector').on('change', function() {
			var toggle_name = $(this).data('toggleshowname'),
			    toggle_value = $(this).find('option:selected').data('toggleshowvalue');
			$('.toggleshow-'+toggle_name).removeClass('visible');
			if(toggle_value) {
				$('.toggleshow-'+toggle_name+'-'+toggle_value).addClass('visible');
			} else {
				$('.toggleshow-'+toggle_name+':first').addClass('visible');
			}
		}).trigger('change');
		
		$('.employees').on('blur', function() {
			var total = Number($('.employees_fulltime').val()) + Number($('.employees_parttime').val()),
			    totalcost = Number($('#projecttotal').text()),
				totalcostadjusted = totalcost;
			if(total < 50) {
				totalcostadjusted *= 0.45;
			} else if(total <= 250) {
				totalcostadjusted *= 0.35;
			} else {
				totalcostadjusted *= 0.35;
			}
			
			if(totalcostadjusted > 75000) {
				totalcostadjusted = 75000;
			}
			
			var contribution = totalcost - totalcostadjusted;
			contibution = contribution.toFixed(2);
			
			totalcostadjusted = totalcostadjusted.toFixed(2);
			
			$('.investmentrequired').text(totalcostadjusted);
			$('.yourcontribution').text(contribution);
		}).trigger('blur');
		
		$('.savebutton').on('click', function(e) {
			e.preventDefault();
			var formdata = $('#applicationform').serialize();
			$.post('/console/ajax/controller.ajax.php', {
				a: 'saveform',
				formdata: formdata
			}, function(ret) {
				if(ret && ret.success) {
					window.location = '/console/dashboard/';
				} else {
					alert('Something went wrong whilst saving the application form. Try again');
				}
			}, 'json');
		});
		
		if( $('.progress').data('progress') > 0 ) {
			var progress = $('.progress').data('progress'),
				companyname = $('.progress').data('companyname');
			$('.crumbs a').text('Continue Application');
			if(companyname) {
				$('.crumbsExtended').html('Welcome back <strong>'+companyname+'</strong>');
			}
			$('.progressbar .dot.green').animate({
				left: (progress-1)+'%'
			}, {
				duration: 1000,
				queue: false
			});
			$('.barslide').animate({
				width: progress+'%'
			}, {
				duration: 1000,
				queue: false
			});
		}
		
		$('#applicationform').on('submit', function(e) {
			e.preventDefault();
			if(confirm('Are you sure you want to submit the application form?')) {
				var formdata = $('#applicationform').serialize();
				$.post('/console/ajax/controller.ajax.php', {
					a: 'submitapplication',
					formdata: formdata
				}, function(ret) {
					if(ret && ret.success) {
						window.location = '/console/dashboard/';
					} else {
						alert('Something went wrong whilst submitting the application form. Try again');
					}
				}, 'json');
			}
		});
		
		$('.submitappformbutton').on('click', function(e) {
			$('#applicationform').trigger('submit');
		});

		$('.registerinterest-goto-part2').on('click', function(e) {
			$('.registerinternet-part1').hide();
			$('.registerinternet-part2').show();
		});

	}

	,init_registration: function() {
		var checkPrequalifying = function() {
			var proceed = false,
				points = 0,
				needed = 5,
				checked = $('.regform input[type=radio]:checked').length;
			
			if( $('[name=question1]:checked').val() == 'yes' ) { points++; }
			if( $('[name=question2]:checked').val() == 'yes' ) { points++; }
			if( $('[name=question3]:checked').val() == 'yes' ) { points++; }
			if( $('[name=question4]:checked').val() == 'yes' ) { points++; }
			if( $('[name=question5]:checked').val() == 'yes' ) { points++; }

			if(points >= needed) {
				proceed = true;
			}

			if(proceed) {
				$('.continuereg').show();
				$('.continuereg').removeClass('disabled').attr('disabled', false).data('href','');
				if(checked >= needed) {
					$('.row-yes').removeClass('hidden');
					$('.row-no').addClass('hidden');
				}
			} else {
				$('.continuereg').addClass('disabled').attr('disabled', true).data('href','');
				if(checked >= needed) {
					$('.row-yes').addClass('hidden');
					$('.row-no').removeClass('hidden');
					$('.continuereg').removeClass('disabled').attr('disabled', false).data('href', 'https://www.ciosgrowthhub.com/');
					$('.continuereg').hide();
				}
			}
			
			return proceed;
		};

		$('.regform input[type=radio]').on('change', function() {
			checkPrequalifying();
		});
		
		$('.continuereg').on('click', function() {
			var proceed = checkPrequalifying();
			if($(this).data('href')) {
				window.open($(this).data('href'));
			} else {
				if(proceed) {
					$('.preliminfo').slideUp('fast');
					$('.registrationinfo').slideDown('fast');
				}
			}
		});

		$('.radios label').on('mousedown', function() {
			$(this).parent().find('label.active').removeClass('active').find('input[type=radio]').attr('checked', false).trigger('change');
			$(this).addClass('active').find('input[type=radio]').attr('checked', true).trigger('change');
		});

		$('.checkboxes label').on('mousedown', function() {
			if( $(this).hasClass('active') ) {
				$(this).removeClass('active'); //.find('input[type=checkbox]').attr('checked', false);
			} else {
				$(this).addClass('active'); //.find('input[type=checkbox]').attr('checked', true);
			}
		});
		
		$('.gdpr-confirm').on('change', function() {
			var needed = 3;
			var got = $('.gdpr-confirm:checked').length;
			if(got >= needed) {
				$('.gdpr-button').removeClass('disabled').attr('disabled', false);
			} else {
				$('.gdpr-button').addClass('disabled').attr('disabled', true);
			}
		});

		$('.gdpr-button').on('click', function() {
			$('.gdprinfo').slideUp('fast');
			$('.registrationinfo').slideDown('fast');
		});
	}
	
};

var mywave = {
	 container: false
	,stats: false

	,camera: false
	,scene: false
	,renderer: false
	
	,particles: false
	,particle: false
	,count: 0
	,mouseX: 0
	,mouseY: 0
	
	,windowHalfX: window.innerWidth / 2
	,windowHalfY: window.innerHeight / 2
	
	,config: {
		SEPARATION: 80,
		AMOUNTX: 40,
		AMOUNTY: 40
	}
	
	,init: function() {
		if(!$('#mywave').length) return;
		mywave.setup();
		mywave.animate();
	}
	
	,setup: function() {
		mywave.container = document.getElementById('mywave');
		
		mywave.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
		mywave.camera.position.z = 1000;
	
		mywave.scene = new THREE.Scene();
		//mywave.scene.background = new THREE.Color(0x003351);
	
		mywave.particles = new Array();
	
		var PI2 = Math.PI * 2;
		var material = new THREE.SpriteCanvasMaterial({
			color: 0x00b2dd,
			program: function ( context ) {
				context.beginPath();
				context.arc( 0, 0, 0.5, 0, PI2, true );
				context.fill();
			}
		});
	
		var i = 0;
	
		for ( var ix = 0; ix < mywave.config.AMOUNTX; ix ++ ) {
			for ( var iy = 0; iy < mywave.config.AMOUNTY; iy ++ ) {
				mywave.particle = mywave.particles[ i ++ ] = new THREE.Sprite( material );
				mywave.particle.position.x = ix * mywave.config.SEPARATION - ( ( mywave.config.AMOUNTX * mywave.config.SEPARATION ) / 2 );
				mywave.particle.position.z = iy * mywave.config.SEPARATION - ( ( mywave.config.AMOUNTY * mywave.config.SEPARATION ) / 2 );
				mywave.scene.add( mywave.particle );
			}
		}
	
		mywave.renderer = new THREE.CanvasRenderer({ alpha: true });
		mywave.renderer.setPixelRatio( window.devicePixelRatio );
		mywave.renderer.setSize( window.innerWidth, window.innerHeight );
		mywave.container.appendChild( mywave.renderer.domElement );
	
		mywave.stats = new Stats();
		//container.appendChild( stats.dom );
	
		document.addEventListener( 'mousemove', mywave.onDocumentMouseMove, false );
		document.addEventListener( 'touchstart', mywave.onDocumentTouchStart, false );
		document.addEventListener( 'touchmove', mywave.onDocumentTouchMove, false );
	
		window.addEventListener( 'resize', mywave.onWindowResize, false );
	}
	
	,animate: function() {
		requestAnimationFrame( mywave.animate );
	
		mywave.render();
		mywave.stats.update();
	}
	
	,onWindowResize: function() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
	
		mywave.camera.aspect = window.innerWidth / window.innerHeight;
		mywave.camera.updateProjectionMatrix();
		
		mywave.renderer.setSize( window.innerWidth, window.innerHeight );
		//mywave.renderer.setSize( $('.welcome').width(), $('.welcome').width() );
	}
	
	,onDocumentMouseMove: function(event) {
		mywave.mouseX = event.clientX - mywave.windowHalfX;
		mywave.mouseY = event.clientY - mywave.windowHalfY;
	}
	
	,onDocumentTouchStart: function(event) {
		if ( event.touches.length === 1 ) {
			//event.preventDefault();
			mywave.mouseX = event.touches[ 0 ].pageX - mywave.windowHalfX;
			mywave.mouseY = event.touches[ 0 ].pageY - mywave.windowHalfY;
		}
	}
	
	,onDocumentTouchMove: function(event) {
		if ( event.touches.length === 1 ) {
			//event.preventDefault();
			mywave.mouseX = event.touches[ 0 ].pageX - mywave.windowHalfX;
			mywave.mouseY = event.touches[ 0 ].pageY - mywave.windowHalfY;
		}
	}
	
	,render: function() {
		mywave.camera.position.x += ( mywave.mouseX - mywave.camera.position.x ) * .05;
		mywave.camera.position.y += ( - mywave.mouseY - mywave.camera.position.y ) * .05;
		mywave.camera.lookAt( mywave.scene.position );
	
		var i = 0;
	
		for ( var ix = 0; ix < mywave.config.AMOUNTX; ix ++ ) {
	
			for ( var iy = 0; iy < mywave.config.AMOUNTY; iy ++ ) {
	
				mywave.particle = mywave.particles[ i++ ];
				mywave.particle.position.y = ( Math.sin( ( ix + mywave.count ) * 0.3 ) * 50 ) +
					( Math.sin( ( iy + mywave.count ) * 0.5 ) * 50 );
				mywave.particle.scale.x = mywave.particle.scale.y = ( Math.sin( ( ix + mywave.count ) * 0.3 ) + 1 ) * 4 +
					( Math.sin( ( iy + mywave.count ) * 0.5 ) + 1 ) * 4;
	
			}
	
		}
	
		mywave.renderer.render( mywave.scene, mywave.camera );
	
		mywave.count += 0.1;
	}
};

var mywaveline = {
	 container: false
	,stats: false

	,camera: false
	,scene: false
	,renderer: false
	
	,particles: false
	,particle: false
	,count: 0
	,mouseX: 0
	,mouseY: 0
	
	,windowHalfX: window.innerWidth / 2
	,windowHalfY: window.innerHeight / 2
	
	/*
	,config: {
		SEPARATION: 50,
		AMOUNTX: 1,
		AMOUNTY: 1
	}
	*/
	
	,init: function() {
		if(!$('#mywaveline').length) return;
		mywaveline.setup();
		mywaveline.animate();
	}
	
	,setup: function() {
		mywaveline.container = document.getElementById('mywaveline');

		mywaveline.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
		mywaveline.camera.position.z = 100;

		mywaveline.scene = new THREE.Scene();

		mywaveline.renderer = new THREE.CanvasRenderer({ alpha: true });
		mywaveline.renderer.setPixelRatio( window.devicePixelRatio );
		mywaveline.renderer.setSize( window.innerWidth, window.innerHeight );
		mywaveline.container.appendChild( mywaveline.renderer.domElement );

		// particles

		var PI2 = Math.PI * 2;
		var material = new THREE.SpriteCanvasMaterial( {

			color: 0x00b2dd,
			program: function ( context ) {

				context.beginPath();
				context.arc( 0, 0, 0.5, 0, PI2, true );
				context.fill();

			}

		} );

		var geometry = new THREE.Geometry();

		for ( var i = 0; i < 100; i ++ ) {

			mywaveline.particle = new THREE.Sprite( material );
			mywaveline.particle.position.x = Math.random() * 2 - 1;
			mywaveline.particle.position.y = Math.random() * 2 - 1;
			mywaveline.particle.position.z = Math.random() * 2 - 1;
			mywaveline.particle.position.normalize();
			mywaveline.particle.position.multiplyScalar( Math.random() * 10 + 450 );
			mywaveline.particle.scale.x = mywaveline.particle.scale.y = 10;
			mywaveline.scene.add( mywaveline.particle );

			geometry.vertices.push( mywaveline.particle.position );

		}

		// lines

		//var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.5 } ) );
		//mywaveline.scene.add( line );

		document.addEventListener( 'mousemove', mywaveline.onDocumentMouseMove, false );
		document.addEventListener( 'touchstart', mywaveline.onDocumentTouchStart, false );
		document.addEventListener( 'touchmove', mywaveline.onDocumentTouchMove, false );

		//

		window.addEventListener( 'resize', mywaveline.onWindowResize, false );
	}
	
	,animate: function() {
		requestAnimationFrame( mywaveline.animate );
	
		mywaveline.render();
		//mywaveline.stats.update();
	}
	
	,onWindowResize: function() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
	
		mywaveline.camera.aspect = window.innerWidth / window.innerHeight;
		mywaveline.camera.updateProjectionMatrix();
		
		mywaveline.renderer.setSize( window.innerWidth, window.innerHeight );
		//mywaveline.renderer.setSize( $('.welcome').width(), $('.welcome').width() );
	}
	
	,onDocumentMouseMove: function(event) {
		mywaveline.mouseX = event.clientX - mywaveline.windowHalfX;
		mywaveline.mouseY = event.clientY - mywaveline.windowHalfY;
	}
	
	,onDocumentTouchStart: function(event) {
		if ( event.touches.length === 1 ) {
			//event.preventDefault();
			mywaveline.mouseX = event.touches[ 0 ].pageX - mywaveline.windowHalfX;
			mywaveline.mouseY = event.touches[ 0 ].pageY - mywaveline.windowHalfY;
		}
	}
	
	,onDocumentTouchMove: function(event) {
		if ( event.touches.length === 1 ) {
			//event.preventDefault();
			mywaveline.mouseX = event.touches[ 0 ].pageX - mywaveline.windowHalfX;
			mywaveline.mouseY = event.touches[ 0 ].pageY - mywaveline.windowHalfY;
		}
	}
	
	,render: function() {
		mywaveline.camera.position.x += ( mywaveline.mouseX - mywaveline.camera.position.x ) * .05;
		mywaveline.camera.position.y += ( - mywaveline.mouseY + 200 - mywaveline.camera.position.y ) * .05;
		mywaveline.camera.lookAt( mywaveline.scene.position );
		mywaveline.renderer.render( mywaveline.scene, mywaveline.camera );
	}
};

$(document).ready(website.init);
