"use strict";
(function(App){

	App.Views.Topup = App.AmigoView.extend({

		el : '#view-container',

		templateName : 'topup',

		events : {
			'click 	.list-nav_item--recharge-my-number'		: 'myNumberSubmit',
			'click 	.topup-button' 							: 'savePhoneNumber',
			'click 	.carrier-button'						: 'saveCarrier',
			'click 	.final-step'							: 'goToPayment',
			'change .amount-selector-option-component'		: 'changeAmount',
			'change .carrier-selector-option-component'		: 'changeCarrier',
			'click  .favorite-link' 						: 'chooseFavorite',
			'click  .favs-link'								: 'scrollToFavs',
			'click  .step_back' 	 						: 'previousStep'
		},

		initialize : function(options){
			App.loaders.destroyOrderData();

			this.data = App.shared.sessionData;
			if (App.shared.CountryCodes) {
				this.countryCodes = App.shared.CountryCodes;
			}

			this.currentStep = 1;

			this.carrierFirstRend = true;
			this.amountFirstRend  = true;
		},

		render : function() {
			if (_.isEmpty(App.products)) {
				return;
			}
			App.helpers.removeFlash(5000);

			var isUserLogged 	= App.shared.isUserLogged();
			var fastOrders   	= App.shared.sessionData.fast_orders;
			var hasFastOrders 	= !_.isEmpty(fastOrders);

			var carriers	 	= App.images.carriers;
			var texts 		 	= App.texts[App.language];

			this.texts = texts;

			App.helpers.scrollTo();
			this.$el.html(this.template({texts: texts, data: this.data, isUserLogged: isUserLogged, hasFastOrders: hasFastOrders, fastOrders: fastOrders, carriers: carriers}));

			// create components;
			this.carrierSelector =  new App.Components.CarrierSelector({
			    el : '.carrier-selector-component'
			});
			this.amountSelector =  new App.Components.AmountSelector({
			    el : '.amount-selector-component'
			});
			this.carrierOptionSelector =  new App.Components.CarrierOptionSelector({
			    el : '.carrier-selector-option-component'
			});
			this.amountOptionSelector =  new App.Components.AmountOptionSelector({
			    el : '.amount-selector-option-component'
			});
			this.favoriteSelector = new App.Components.FavoriteSelector({
				el : '.favorites-selector-component'
			});

			// cache the button element
			this.$button = this.$el.find('.topup-button');
			this.$button.addClass('disabled');

			// hide follow me Basket button
			$(".follow-me").hide();

			this.activateStep($('.first-step'));

			/*this.phoneInput = new App.Views.PhoneInput({*/
				//countryCodes:this.countryCodes,
				//renderInto:this.$el.find('.phone-input-container'),
				//props:{
					//defaultCountryCode: (App.shared.countryCode || 1),
					//number : App.shared.Preferences.getItem('last-phone-number',null),
					//onValidInput : _.bind(this.onValidPhoneInput,this),
					//onInvalidInput : _.bind(this.onInvalidPhoneInput,this),
				//}
			/*});*/

            var phoneInputOptions = {
                el                  : '#phone-number',
                buttonEl            : '.topup-button',
                containerClass      : '.phone-input-container',
                defaultCountry      : App.shared.countryName || 'us',
                onlyCountries       : App.topupCountryISO,
                preferredCountries  : ['us', 'mx', 'gt'],
                autoPlaceholder     : false,
                utilsScript         : App.lib.Utils(),
                onValidPhone        : _.bind(this.onValidPhoneInput, this),
                onInvalidPhone      : _.bind(this.onInvalidPhoneInput, this),
                countryCodes        : this.countryCodes,
                noFlags             : false,
                noIdentify          : false,
                rawCountryCodes     : window._APDATA.country_codes
            };
            this.phoneInput = new App.Views.NewPhoneInput(phoneInputOptions);
            App.shared.countryName = '';
			App.shared.countryCode = '';

			this.favoriteSelector.setProps({
				favorites :  fastOrders,
				selected : fastOrders[0],
				onSelect : _.bind(this.onSelectFavorite ,this)
			}).render();

			ttlog();
		},

		onInvalidPhoneInput: function(input){
			this.$button.addClass('disabled');
		},

		onValidPhoneInput: function(input){
			this.$button.removeClass('disabled');
			console.log(this.phoneInput.content);
			var data = this.phoneInput.content;
			App.shared.orderData.carrier = data.carrier;
		},

		onSelectCarrier : function(carrier){
			App.shared.orderData.carrier = carrier.name;
			$('.carrier-button').removeClass('disabled');
			console.log("carrier name: ", carrier.name);
		},

		onSelectAmount : function(amount){
			// App.shared.orderData.amount 	= amount.topup_amount;
			App.shared.orderData.amount 	= amount.face_value;
			App.shared.orderData.product_id = amount.id;

			console.log("This is the amount selected: ", amount);

			if (amount.description[App.language]) {
				$('.product-description-text').text(amount.description[App.language]);
			}
			$('.amount-button').removeClass('disabled');
			this.updateBasket();

			if (amount.open_amount) {
				$('input.open-amount-input-inside').focus();
				if ($(window).width() < App.smallScreenWidth) {
					$('.open-amount-input-div').show();
				}
			} else {
				$('.open-amount-input-div').hide();
			}

		},

		onSelectFavorite : function(fav){
			this.chooseFavorite(fav);
		},

		savePhoneNumber: function(e){
			e.preventDefault();
			var $el = $(e.target);
			if ($el.hasClass('disabled')) { return; }

			var data = this.phoneInput.content;

			var code 	= data.country_code;
			var country = data.country;

			App.shared.orderData.country_code = code;
			App.shared.orderData.country 	  = country;
			App.shared.orderData.phone_number = data.phone_number;

			this.assignNumber(e);
			this.renderCarriers();
			this.nextStep(e);
		},

		saveCarrier: function(e){
			e.preventDefault();

			if ($('.carrier-button').hasClass('disabled')) { return; }

			this.assignCarrier(e);
			this.renderAmounts();

			// this.updateBasket();

			this.nextStep(e);
		},

		renderCarriers : function(){
			var carriers = App.carriers;
			var country  = App.shared.orderData.country.replace(/\s/g, "_");

			$('.carrier-selector-component').empty();
			$('.carrier-selector-option-component').empty();

			// var selectedCarrier    = App.shared.orderData.carrier;
			// this.carriersAvailable = carriers[country];

			this.carriersAvailable 	= _.sortBy(carriers[country], function(o) { return o.name; });
			var selectedCarrier 	= this.carriersAvailable[0].name;

			// if (!App.shared.orderData.carrier) {
			// this.onSelectCarrier(this.carriersAvailable[0]);
			// }
			var preselectedCarrier = App.shared.orderData.carrier_identified ?  App.shared.orderData.carrier : null;

			if (this.carrierFirstRend) {
				this.carrierSelector.setProps({
					carriers : this.carriersAvailable,
					selected : preselectedCarrier,
					onSelect : _.bind(this.onSelectCarrier,this)
				}).render();
				this.carrierOptionSelector.setProps({
					carriers : this.carriersAvailable,
					selected : selectedCarrier,
					onSelect : _.bind(this.onSelectCarrier,this)
				}).render();
			} else {
				this.carrierSelector.updateProps({
					carriers : this.carriersAvailable,
					selected : preselectedCarrier,
					onSelect : _.bind(this.onSelectCarrier,this)
				}).render();
				this.carrierOptionSelector.updateProps({
					carriers : this.carriersAvailable,
					selected : selectedCarrier,
					onSelect : _.bind(this.onSelectCarrier,this)
				}).render();
			}

			this.carrierFirstRend = false;

			if ($(window).width() < App.smallScreenWidth) {
				this.onSelectCarrier(this.carriersAvailable[0]);
			} else {
				if (preselectedCarrier) {
					$('.carrier-button').removeClass('disabled');
                } else {
					$('.carrier-button').addClass('disabled');
                }
			}
			console.log(this.carriersAvailable);
		},

		renderAmounts : function(){
			var carriers 		= App.carriers;
			var country  		= App.shared.orderData.country.replace(/\s/g, "_");
			var selectedCarrier = App.shared.orderData.carrier;

			console.log("Selected Carrier when rendering amounts: ", selectedCarrier);

			var amounts 	   	= _.result(_.find(carriers[country],{name:selectedCarrier}),'products');

			$('.amount-selector-component').empty();
			$('.amount-selector-options-component').empty();

			if (!App.shared.orderData.carrier) {
				App.shared.orderData.carrier = App.carriers[country][0].name;
			}
			var selectedCarrier = App.shared.orderData.carrier;

			if (amounts) {
				amounts = _.sortBy(amounts,function(amount){
					return 1-parseInt(amount.face_value,10);
				});
			}

			amounts = amounts.reverse();

			// Joins the category_name and amount and sorts it alphabetically
			amounts = _.sortBy(amounts, function(o) { return [o.category_description[App.language], App.helpers.padZero(o.face_value)].join("_"); });

			amounts = App.helpers.injectGroupID(amounts);

			var maxSize = (_.max(amounts, function(amount){ return amount.groupID; })).groupID;

			if (this.amountFirstRend) {
				this.amountSelector.setProps({
					amounts :  amounts,
					selected : null,
					groups   : maxSize,
					onSelect : _.bind(this.onSelectAmount,this)
				}).render();
				this.amountOptionSelector.setProps({
					amounts :  amounts,
					selected : amounts[0],
					groups   : maxSize,
					onSelect : _.bind(this.onSelectAmount,this)
				}).render();
			} else {
				this.amountSelector.updateProps({
					amounts :  amounts,
					selected : null,
					groups   : maxSize,
					onSelect : _.bind(this.onSelectAmount,this)
				}).render();
				this.amountOptionSelector.updateProps({
					amounts :  amounts,
					selected : amounts[0],
					groups   : maxSize,
					onSelect : _.bind(this.onSelectAmount,this)
				}).render();
			}

			this.amountFirstRend = false;

			// If screen is mobile, then match the default amount to the order
			if ($(window).width() < App.smallScreenWidth) {
				amounts = _.sortBy(amounts, function(o) { return [o.category_description[App.language], o.groupID, App.helpers.padZero(1000 - o.face_value)].join("_"); });
				this.onSelectAmount(amounts.reverse()[0]);
			} else {
				$('.open-amount-input-div').hide();
				$('.amount-button').addClass('disabled');
			}
		},

		goToRechargeMyNumber : function(e) {
			e.preventDefault();

			var code 			= App.shared.sessionData.phone_number.country_code;
			var country 		= App.shared.sessionData.phone_number.country;
			var phone_number	= App.shared.sessionData.phone_number.phone_number;
			var carrier			= App.shared.sessionData.phone_number.carrier;

			App.shared.orderData.country_code = code;
			App.shared.orderData.country 	  = country;
			App.shared.orderData.phone_number = phone_number;
			App.shared.orderData.carrier  	  = carrier;

			console.log("This is the data assigned: ", App.shared.orderData)

			App.shared.router.navigate('/recharge',true);
		},

		goToPayment: function(e){
			e.preventDefault();
			if ((App.shared.orderData.amount == null) || (App.shared.orderData.amount == '') ) {
				App.shared.orderData.amount = $('input.open-amount-input-inside').val() || $('.open-amount-input').val();
			}
			if (Number(App.shared.orderData.amount) == 0) {
				return;
			}
			App.shared.router.navigate('#/checkout', true);
		},

		close: function() {
			// this.phoneInput.close();
			this.$el.empty();
			this.undelegateEvents();
		},

		myNumberSubmit : function () {

			var user = App.shared.sessionData;

			App.shared.orderData.country_code = user.phone_number.country_code;
			App.shared.orderData.country 	  = user.phone_number.country.toLowerCase();
			App.shared.orderData.phone_number = user.phone_number.phone_number;
			App.shared.orderData.carrier  	  = user.phone_number.carrier.toLowerCase();

			App.shared.router.navigate('/recharge-my-number', true);
		},

		focusOnBotton : function(e) {
			// TODO:
			console.log(e.keyCode)
			if (e.keyCode == 13) {
				if (!$('.topup-button').hasClass('disabled')) {
					$('.topup-button').trigger('click');
				}
			}
		},

		assignNumber : function(e) {
			e.preventDefault();
			$('.step-text-1').text(this.texts.topup.steps.step_1.when_selected);
			$('.step-value-1').text('+' + App.shared.orderData.country_code + ' ' +  App.helpers.phoneStringFormat(App.shared.orderData.phone_number));
			// $('.selected-phone-number').text('+' + App.shared.orderData.country_code + ' ' +  App.shared.orderData.phone_number);
		},

		revertNumber : function(e) {
			e.preventDefault();
			$('.step-text-1').text(this.texts.topup.steps.step_1.title);
			$('.step-value-1').html('');
			this.revertCarrier(e);
			// $('.selected-phone-number').text('+' + App.shared.orderData.country_code + ' ' +  App.shared.orderData.phone_number);
		},

		assignCarrier : function(e){
			e.preventDefault();
			$('.step-text-2').text(this.texts.topup.steps.step_2.when_selected);
			$('.step-value-2').text(App.shared.orderData.carrier);
			// $('.selected-carrier').text(App.shared.orderData.carrier);
		},

		revertCarrier : function(e){
			e.preventDefault();
			$('.step-text-2').text(this.texts.topup.steps.step_2.title);
			$('.step-value-2').html('');
			// $('.selected-carrier').text(App.shared.orderData.carrier);
		},

		changeCarrier: function(e){
			e.preventDefault();
			var carrier = $('.carrier-selector-option-component option:selected').attr('carrier');
			App.shared.orderData.carrier = carrier;
		},

		changeAmount : function(e){
			e.preventDefault();
			var id 	   		= $('.amount-selector-option-component option:selected').attr('id');
			var amount 		= $('.amount-selector-option-component option:selected').attr('amount');
			var openAmount 	= $('.amount-selector-option-component option:selected').attr('open-amount');
			var category 	= $('.amount-selector-option-component option:selected').attr('category');

			if (category != null) {
				$('.product-description-text').text(category);
			}

			App.shared.orderData.product_id = id;
			App.shared.orderData.amount 	= amount;

			if (openAmount == 'true') {
				$('.open-amount-input-div').show();
			} else {
				$('.open-amount-input-div').hide();
			}
		},

		nextStep : function(e){
			e.preventDefault();
			var $el = $(e.target);

			// If the TopUp button is disabled we shouln't continue
			if ($el.hasClass('disabled')) { return; }

			var $activeStep = $el.closest('.step');
			App.helpers.scrollTo($activeStep, 400);

            var $nextStep = $activeStep.next('.step');
            this.finishStep($activeStep);
            this.activateStep($nextStep);

            // App.helpers.scrollTo($nextStep);

            this.currentStep++;
            console.log("STEP: ", this.currentStep);
            App.shared.router.navigate('topup/' + String(this.currentStep), {trigger: false});
		},

		previousStep: function(e, currentStep){
			console.log("EVENT: ", e)
			if (e != null) {
				e.preventDefault();
				var $el = $(e.target);
			} else {
				var currentStep = typeof currentStep !== 'undefined' ? currentStep : 1;
				this.currentStep = currentStep;
				var $el = $('.step_back_' + String(currentStep ) );

				console.log("THIS IS $el: ", '.step_back_' + String(currentStep ));
				return $el.click();
			}

        	$(".follow-me").removeClass('animated slideInUp');
			$(".follow-me").addClass('animated slideOutDown');

			if ($el.hasClass('phone-number')) {
				this.revertNumber(e);
			} else if ($el.hasClass('carrier')) {
				this.revertCarrier(e);
			}

			var $activeStep = $el.closest('.step');
            var $nextStep = $activeStep.next('.step');

            if ($nextStep.hasClass('done')) {
            	$nextStep.removeClass('done');
            	var $nextNext = $nextStep.next('.step');
            	this.undoStep($nextNext);
            }

            App.helpers.scrollTo($activeStep, 200);

            this.currentStep--;
            this.undoStep($nextStep);
            this.activateStep($activeStep);
		},

		activateStep : function(step){
        	step.removeClass('done');
       		step.addClass('active');
       		// step.velocity("fadeIn", { duration: 500 });

        },

        finishStep : function(step){
       		step.removeClass('active');
        	step.addClass('done');

        	var header = step.children('.home-hero__header');
        	var subHeader = step.children('.home-hero__subheader');
        	header.addClass('grayed-step');
        	subHeader.hide();
        	var icon = header.children('.check');
        	icon.addClass('check__done');
        },

        undoStep : function(step){
        	step.removeClass('active');

        	var lastStep = step.prev('.step');
        	var header = lastStep.children('.home-hero__header');
        	var subHeader = lastStep.children('.home-hero__subheader');
        	header.removeClass('grayed-step');
        	subHeader.show();
        	var icon = header.children('.check');
        	icon.removeClass('check__done');

        },

        scrollToFavs : function(e){
        	e.preventDefault();
        	App.helpers.scrollTo('.favorites-picker-container', 600);
        },

        chooseFavorite : function(fav){
        	App.shared.orderData.product_id			= fav.product_id;
        	App.shared.orderData.phone_number		= fav.phone_number;
			App.shared.orderData.country_code		= fav.country_code;
			App.shared.orderData.carrier 			= fav.carrier;
			App.shared.orderData.country 			= fav.country;
			App.shared.orderData.amount 			= fav.amount;

			var countryCodes = window._APDATA.country_codes;

			var countryName = App.helpers.toLowercaseAndUnderscores(App.shared.orderData.country);

			App.shared.orderData.country_code 		= _.result(_.find(countryCodes ,{country : countryName}), 'code');

			console.log(App.shared.orderData);
			App.shared.router.navigate('#/checkout', true);
        },

        updateBasket : function(){

        	$('.follow-me__country').text(App.helpers.fromLowercaseAndUnderscores(App.shared.orderData.country));
        	$('.follow-me__phone-number').text(App.helpers.phoneStringFormat(App.shared.orderData.phone_number));
        	$('.follow-me__carrier').text(App.shared.orderData.carrier);
        	$('.follow-me__amount').text("$ " + App.helpers.twoDigits(App.shared.orderData.amount));

        	$(".follow-me").show();
        	$(".follow-me").removeClass('animated slideOutDown');
        	$(".follow-me").addClass('animated slideInUp');
        }



	});

})(window.App);
