$(function () {
    
    $(".alert").hide(); // Hide notifications

    $('#termsOnContributeModal .form-check-input').on('click', function() {
       console.log('Initiated');
        var x = $('#termsOnContributeModal .form-check-input:checked').length;
        var y = $('#termsOnContributeModal .form-check-input').length;
       if( x == y ) {
           $('#pills-tabContent pre').text('Agree to terms above to view address');
       } else {
           $('#pills-tabContent pre').text('Agree to terms above to view address');
       }
       console.log('Closer');
    }); 

    function isValidEmail(emailAddress) {
        var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
        return pattern.test(emailAddress);
    };

    // SUBSCRIBE TO NEWSLETTER
    $('#formSubscribe').submit(function (e) {
        e.preventDefault();

        $(".requestButton").attr('disabled', true);
        $(".alert").hide();

        var email = $("#subscriber_email").val();

        function showEmailAlert(){
            $(".alert").hide();
            $("#subscribe-email").show();
        }

        function showDuplicateAlert(){
            $(".alert").hide();
            $("#subscribe-repeat").show();
        }

        function showEmptyAlert(){
            $(".alert").hide();
            $("#subscribe-empty").show();
        }

        function showSuccessAlert(){
            $(".alert").hide();
            $("#subscribe-success").show();
        }

        function showErrorAlert(){
            $(".alert").hide();
            $("#subscribe-error").show();
        }

        function showInvalidAlert(){
            $(".alert").hide();
            $("#subscribe-invalid").show();
        }

        if (email == ''){
            showEmptyAlert();
            $(".requestButton").attr('disabled', false);
            return;
        }

        if (isValidEmail(email)){
            var parameters = {
                email : email,
            };
            $.ajax({
                type: "POST",
                url: "/subscribe",
                contentType: "application/json",
                data: JSON.stringify(parameters),
                success: function (res) {
                    showSuccessAlert();
                    $(".requestButton").attr('disabled', false);
                },
                error: function (res){
                    var response = res.responseText;
                    if (response == "no email provided"){
                        showEmptyAlert();
                    } else if (response == "already subscribed"){
                        showDuplicateAlert();
                    } else{
                        showErrorAlert();
                    }
                    $(".requestButton").attr('disabled', false);
                }
            });
        } else{
            showInvalidAlert();
            $(".requestButton").prop('disabled', false);
        }
    });

    // SIGN UP FOR WAIT LIST
    $('#betaForm').submit(function (e) {
        e.preventDefault();

        $(".requestButton").attr('disabled', true);
        $(".alert").hide();

        var email = $("#signup-email").val();
        var name = $("#signup-username").val();
        
        function beta_showEmailAlert(){
            $(".alert").hide();
            $("#beta-email").show();
        }

        function beta_showDuplicateAlert(){
            $(".alert").hide();
            $("#beta-repeat").show();
        }

        function beta_showEmptyNameAlert(){
            $(".alert").hide();
            $("#beta-name").show();
        }

        function beta_showEmptyEmailAlert(){
            $(".alert").hide();
            $("#beta-email").show();
        }

        function beta_showSuccessAlert(){
            $(".alert").hide();
            $("#beta-success").show();
        }

        function beta_showErrorAlert(){
            $(".alert").hide();
            $("#beta-error").show();
        }

        function beta_showInvalidAlert(){
            $(".alert").hide();
            $("#beta-invalid").show();
        }

        if (email == ''){
            beta_showEmptyEmailAlert();
            $(".requestButton").attr('disabled', false);
            return;
        }

        if (name == ''){
            beta_showEmptyNameAlert();
            $(".requestButton").attr('disabled', false);
            return;
        }

        if (isValidEmail(email)){
            var parameters = {
                name,
                email,
                url : $(location).attr('search')
            };
            $.ajax({
                type: "POST",
                url: "/waitlist",
                contentType: "application/json",
                data: JSON.stringify(parameters),
                success: function (res) {
                    beta_showSuccessAlert();
                    $(".requestButton").attr('disabled', false);
                },
                error: function (res){
                    var response = res.responseText;
                    if (response == "no email provided"){
                        beta_showEmptyEmailAlert();
                    } else if (response == "no name provided"){
                        beta_showEmptyNameAlert();
                    } else if (response == "already subscribed"){
                        beta_showDuplicateAlert();
                    } else{
                        beta_showErrorAlert();
                    }
                    $(".requestButton").attr('disabled', false);
                }
            });
        } else{
            beta_showInvalidAlert();
            $(".requestButton").prop('disabled', false);
        }

    });

    $(document).on('closed', '.video-pop', function (e) {
      console.log('Modal is closed');
      var iframeSrc = $('.video-pop iframe').attr('src');
      $(".video-pop iframe").attr("src", iframeSrc);
    });

    //<![CDATA[
        $(function() {
            $('#status').fadeOut();
            $('#preloader').delay(350).fadeOut('slow');
            $('body').delay(350).css({'overflow':'visible'});
            // setTimeout(function() {
            //     notificationBarShow();
            // }, 2000);
          })
    //]]>

    $('#countDownInnerSection').countdown(new Date("2018-02-15T07:59:00Z")).on('update.countdown', function(event) {
      var $this = $(this).html(event.strftime(''
        + '<span>%-D <em>day%!H</em></span> '
        + '<span>%H <em>hours</em></span> '
        + '<span>%M <em>minutes</em></span> '
        + '<span>%S <em>seconds</em></span> '));
    });
    
    $('a[href*="#"]')
      .not('[href="#"]')
      .not('[href="#0"]')
      .not('a.noScrollLink')
      .click(function(event) {
        if (
          location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
          && 
          location.hostname == this.hostname
        ) {
          var target = $(this.hash);
          target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
          if (target.length) {
            event.preventDefault();
            $('html, body').animate({
              scrollTop: target.offset().top
            }, 1000, function() {
              var $target = $(target);
              $target.focus();
              if ($target.is(":focus")) {
                return false;
              } else {
                $target.attr('tabindex','-1');
                $target.focus();
              }; 
            });
          }
        }
      });
      
    
    function initReadMore() {
        $('.advisorBoxExt .advisorMeta p').readmore({
            speed: 400,
            moreLink: '<a href="#">Read more..</a>',
            lessLink: '<a href="#" class="showLess">Read less</a>',
            embedCSS: true,
            blockCSS: 'display: block; width: 100%;',
            collapsedHeight: 85,
            beforeToggle: function(trigger,element,more) {
                $('.advisorBoxExt .advisorMeta a.showLess').not($(element).next()).trigger( 'click' );
            }
            
        });
        
        $('.qaBox p').readmore({
            speed: 400,
            moreLink: '<a href="#">Read more..</a>',
            lessLink: '<a href="#" class="showLess">Read less</a>',
            embedCSS: true,
            blockCSS: 'display: block; width: 100%;',
            collapsedHeight: 22,
            beforeToggle: function(trigger,element,more) {
                $('.qaBox a.showLess').not($(element).next()).trigger( 'click' );
            }
        });
    } 

    initReadMore();

    $(document).ready(function() {
        $('#langController .dropdown-menu button.dropdown-item').on('click', function(ev) {
            ev.preventDefault();
            var lang = $(this).data('lang');  
            var fLang = $(this).text();
            var toggleButton = $('#langController > button.dropdown-toggle');
            $('body').removeClass('tinyText');
            if(lang == 'en') {
                $('body').attr('class', 'en');
                toggleButton.text(fLang);
            } else if (lang == 'rs') {
                $('body').attr('class', 'rs');
                $('body').addClass('tinyText');
                toggleButton.text(fLang);
            } else if (lang == 'ch') {
                $('body').attr('class', 'ch');
                toggleButton.text(fLang);
            } else if (lang == 'jp') {
                $('body').attr('class', 'jp');
                $('body').addClass('tinyText');
                toggleButton.text(fLang);
            } else if (lang == 'kr') {
                $('body').attr('class', 'kr');
                toggleButton.text(fLang);
            } else if (lang == 'pt') {
                $('body').attr('class', 'pt');
                $('body').addClass('tinyText');
                toggleButton.text(fLang);
            } else if (lang == 'sp') {
                $('body').attr('class', 'sp');
                $('body').addClass('tinyText');
                toggleButton.text(fLang);
            } else if (lang == 'it') {
                $('body').attr('class', 'it');
                $('body').addClass('tinyText');
                toggleButton.text(fLang);
            } else if (lang == 'fr') {
                $('body').attr('class', 'fr');
                $('body').addClass('tinyText');
                toggleButton.text(fLang);
            }   
            var lData = eval(lang);
            $('*[data-langswitch="1"]').each(function(element) {
                var lToken = $(this).data('langtoken');
                var $this = $(this); 
                $this.html(lData[lToken]); 
            });
            initReadMore();
        });


        var start = new Date("2018-01-15T08:00:00Z");
        var now = new Date();
        var diff = (now-start)/86400000
        var percent = diff*1.2698;
        $('#mainPageProgressBar').css('width',String(percent)+'%');

        /*
        var bonus = getSPNBonusCrowdsale();
        if (crowdsaleStarted()){
            if ( bonus == 1.00){
                $("#countdownTitle").text("Crowdsale Ends in:")
            }else {
                $("#countdownTitle").text(`${parseInt(String(bonus).split('.')[1])}% Bonus Ends in:`)
            }
        }else{
            console.log("LOG")
            $("#countdownTitle").text("Crowdsale Starts in:")
        }
        */
    });
    
    function notificationBarShow() {
        $('#notificationBar').fadeIn(600); 
        $('#mainNav').addClass('notificationBarActive');
        $('#mainBanner').addClass('notificationBarActive');
    }
    function notificationBarHide() {
        $('#notificationBar').fadeOut(600);  
        $('#mainNav').removeClass('notificationBarActive');
        $('#mainBanner').removeClass('notificationBarActive');
    }

    function crowdsaleStarted(){
        return ( (new Date("2018-03-20T19:00:00Z") - new Date()) < 0 );
    }

    function getSPNBonusCrowdsale() {
        var dates = [
        new Date("2018-03-28T18:00:00Z"),
        new Date("2018-03-29T06:00:00Z"),
        new Date("2018-03-30T06:00:00Z"),
        new Date("2018-03-31T06:00:00Z"),
        new Date("2018-04-01T06:00:00Z"),
        new Date("2018-04-02T06:00:00Z"),
        new Date("2018-04-03T18:00:00Z"),
        ];
        var bonuses = [
        1.15,
        1.15,
        1.12,
        1.09,
        1.06,
        1.03,
        1.00
        ];
        var index = 0;
        var now = new Date();
        for(i=0;i<dates.length;i++){
            if( (dates[i]-now) > 0 ){
                index = i;
                break;
            }else{
                index = i;
            }
        }
        if($('#countDownInnerSection').length!=0){
            $('#countDownInnerSection').countdown(dates[index]).on('update.countdown', function(event) {
                var $this = $(this).html(event.strftime(''
                    + '<span>%-D <em>day%!H</em></span> '
                    + '<span>%H <em>hours</em></span> '
                    + '<span>%M <em>minutes</em></span> '
                    + '<span>%S <em>seconds</em></span> '));
                }
            );
        }//*/
        
        //console.log("BONUS",bonuses[index]);
        $('#sidebarExchangeRate').text(`1 ETH = ${Math.round(6000*bonuses[index])} SPN (+${ parseInt( (bonuses[index]).toFixed(2).split('.')[1] )}%)`);
        $('#x-rate').text('1 ETH = '+String(Math.round(6000*bonuses[index]))+' SPN');



        return bonuses[index];
}

    
    $('#closeNotificationBar').on('click', notificationBarHide); 

    $("#contributeButton").click(function() {
        window.location.href = "/"
    });
    
    $(window).scroll(function(){
		if ($(this).scrollTop() > 100) {
			$('.scrollToTop').fadeIn();
		} else {
			$('.scrollToTop').fadeOut();
		}
    });


    // Partners
    $('.emlogo').click( function() {
        window.open('http://emerentius.com', '_blank');
    })
    $('.daostack').click( function() {
        window.open('https://www.daostack.io/', '_blank');
    })
    $('.backfeed').click( function() {
        window.open('https://backfeed.cc/', '_blank');
    })
    $('.wh').click( function() {
        window.open('https://www.wilmerhale.com/', '_blank');
    })
    $('.netobj').click( function() {
        window.open('https://www.netobjex.com/', '_blank');
    })

});