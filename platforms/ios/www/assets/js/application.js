
// Folder path to partial HTML files, named 1.html, 2.html, etc
var pagePath = 'pages';

// The total number/range of pages available
var firstPage = 1;
var lastPage = 7;

// Initialize prevPage to track continuity (sequential or jump)
var prevPage;

// Regular expression for parsing integer hashes
var re = new RegExp("[0-9][0-9]{0,5}");

// Set speed/duration of animations. Value can be between maxDuration & minDuration.
// Swiping will reduce the duration, i.e. speed up the animation
// minDuration
var animDuration;

// Default animation speed range in ms
var maxDuration = 350; // slower (no swipe contribution)
var minDuration = 100; // faster (when swiping quickly)

// Swipe speed in ms (for speeding up swipe animations)
var swipeSpeed = 0; // Dynamically set by draggableTouch

// This increases or decreases the effect of the initial swipe speed
// on the animation...higher values will greatly speed up the swipe
var swipeScale = 25;

// Flag variable to block multiple state changes from firing at once
var block = 0;

// Global variable controlling jQuery's animate refresh rate
jQuery.fx.interval = 41; // 41 ~ 24fps

jQuery(document).ready(function($) {

  // Header/modal toggle
  $('.modal-button').modalToggle();
  
  // Wrapper is used as a drag window for transitions
  var wrapper = $('.wrapper');
  wrapper.draggableTouch();

  // Initial page load
  $('a.previous, a.next').addClass('hidden');
  $('a.next').attr('href', '#' + String(firstPage + 1)).addClass('hidden');
  $('a.previous').attr('href', '#' + String(firstPage)).addClass('hidden');
  prevPage = firstPage;
  // location.hash = location.hash ? location.hash : String('#' + firstPage);
  
  // Trigger page transitions with left/right arrow key press
  $(document).keydown(function(e) {
      switch(e.which) {
          case 37: // left
            if (!block) {
              location.hash = $('a.previous').attr('href');
            }
          break;
          case 39: // right
            if (!block) {
              location.hash = $('a.next').attr('href');
            }
          break;
          default: return; // exit this handler for other keys
      }
      e.preventDefault(); // prevent the default action (scroll / move caret)
  });    

  /**
   * Orientation event for detecting device orientation
   */
  $(window).on('orientationchange', function(event) {
    $('body').removeClass('orientation-landscape').removeClass('orientation-portrait');
    if (window.orientation == 0 || window.orientation == 180) {
      $('body').addClass('orientation-portrait');
      portraitFade(); 
    }
    else {
      $('body').addClass('orientation-landscape');
      portraitFade();

    }
  }).trigger('orientationchange');
  
  
  /**
   * The application state is determined via location.hash and the hashchange event
   * kicks off sliding animations and dynamic loading when the hash changes.
   */
  $(window).on('load hashchange', function(event){

    location.hash = location.hash ? location.hash : String('#' + firstPage);
    if (location.hash == '#') {
      return;
    }
    var hash = location.hash;
    if (hash.match(re) && block == 0) {
      block = 1;
      var page = Number(hash.substring(1));
      var next = $('.page-next');
      var current = $('.page-current');
      var prev = $('.page-previous');
      
      // Set speed of transition based on swipe speed
      animDuration = maxDuration - swipeSpeed;
      if (animDuration < minDuration) {
        animDuration = minDuration;
      }
      
      // When hash changes, if hash > prevHash advance
      // For advancing, slide next page in, current page to the left
      // change page-next to be page-current
      // change page-current to page-previous
      // repurpose page-previous to be page-next
      /**
       * The idea here is to make a 3 page circular buffer. The page classes and
       * data attributes are updated in such a way to always have the previous
       * and next pages loaded, which allows for smooth loading/swiping and sliding
       * animations.
       */
      if (page == prevPage + 1 && page <= lastPage && event.type != 'load') {
        // Moving right (next page)
        next.addClass('in');  
        current.addClass('out');  
        // Next -> Current
        next.hide().removeClass('page-next').addClass('page-current').show().data('page', page);
        // Current -> Previous
        current.hide().removeClass('page-current').addClass('page-previous').show().data('page', page - 1);
        // Previous -> Next (jumps back)
        prev.removeClass('hidden').hide().removeClass('page-previous').addClass('page-next').show().data('page', page + 1);
        if (page >= lastPage) {
          // Special case - we want to hide the "next" page if page == lastPage
          prev.addClass('hidden');
        }
        else {
          prev.removeClass('hidden');
        }
        loadPage('.page-next');

      }
      else if ((page == prevPage - 1) && page >= firstPage && event.type != 'load') {
        // Moving left (previous page)
        prev.addClass('in reverse');
        current.addClass('out reverse');
        // Previous -> Current
        prev.hide().removeClass('page-previous').addClass('page-current').show().data('page', page);
        // Current -> Next
        current.hide().removeClass('page-current').addClass('page-next').show().data('page', page + 1);
        // Next -> Prev (jumps forward)
        next.hide().removeClass('page-next').addClass('page-previous').show().data('page', page - 1);
        if (page <= firstPage) {
          // Special case - we want to hide the "previous" page if page == firstPage
          next.addClass('hidden');
        }
        else {
          next.removeClass('hidden');
        }
        loadPage('.page-previous');

      
      }
      else {
        // If the hashchange is not sequential, just load what we would expect with a simple fade in, no sliding
        prev.data('page', page - 1);
        current.data('page', page);
        next.data('page', page + 1);
        loadPage('.page');
      }

      // Update prev/next buttons
      setTimeout(function(){
        if (page < lastPage) {
          $('a.next').attr('href', '#' + String(page + 1)).removeClass('hidden');
        }
        else {
          $('a.next').addClass('hidden');
        }        
        if (page > firstPage) {
          $('a.previous').attr('href', '#' + String(page - 1)).removeClass('hidden');
        }
        else {
          $('a.previous').addClass('hidden');
        }
        block = 0;
        prevPage = page;
        
        // Remove animation classes
        next.removeClass('in out reverse');
        prev.removeClass('in out reverse');
        current.removeClass('in out reverse');
      scrollRefresh();

      }, animDuration);
      

    }
  });
           
});

/**
 * Load the page contents via ajax
 */
function loadPage(selector) {
  // Load individual content region with AJAX based on data-page attribute
  $(selector).each(function(index){
    var $this = $(this);
    var url = getPageUrl($this.data('page'));
    if (url.length > 0 && $this.data('page') >= firstPage && $this.data('page') <= lastPage) {
      // Stop video/audio playback on transition/load
      stopMedia();
      
      // Originally it seemed good to hide/show content as it loaded (fadeIn, etc)
      // but it actually feels snappier to avoid it
      // $this.find('.content').hide();
      
      // Loader (seems to distract more than help)
      // $this.find('.content').html('<div class="pane col-xs-12"><div class="loader"></div>');
      var jqxhr = $.get(url, function() {
      })
        .done(function(data) {
          $this.find('.content').html($(data));
        })
        .fail(function(data, status) {        
          $this.find('.content').html('<div class="pane col-xs-12"><div class="messages error">'+ data.status + ' ' + status + ' — Page could not be loaded.</div></div>');
        })
        .always(function() {
        });
    }
    else {
      // Request out of bounds
      // Disabling because blank page over an error message seems preferable here.
      // $this.find('.content').html('<div class="pane col-xs-12"><div class="messages error">Request out of bounds.</div></div>').fadeIn(animDuration);  
    }
  });  
}

/**
 * Helper function for page URL
 */
function getPageUrl(pageNumber) {
  return pagePath + '/' + pageNumber + '.html';
}

/**
 * Helper function to simply pause all audio and video playback.
 */
function stopMedia() {
  soundManager.stopAll();
  $("video").each(function () { this.pause() });  
}

// http://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

/**
 * For portrait mode pictures, the nav and caption should fade out after 2-3 seconds.
 * Tapping or clicking will make the elements appear again.
 */
var portraitFade = function() {
  // For portrait mode, fade out nav and titles after 2 seconds
  var fadeTimer;
  var fadeEls = function() {
    var els = $('.orientation-portrait .modal-button, .orientation-portrait .portrait-img .caption');
    els.show();
    clearTimeout(fadeTimer);
    // Limit fadeout behavior only to bio/portrait pages.
    if ($('.orientation-portrait .page-current .portrait').length && !$('.modal-button.open').length) { 
      fadeTimer = setTimeout(function(){
        // Check again before fading, since it is possible a swipe or transition is occurring
        if ($('.orientation-portrait .page-current .portrait').length && !$('.modal-button.open').length) {
          els.fadeOut('slow');
        }
      }, 2500);
    }
  };
  fadeEls();
  if (!("ontouchstart" in document.documentElement)) {
    $(document).on('click', fadeEls);
  }
  else {
    $(document).on('touchstart', fadeEls);
  }  
};


// Hack to make momentum scrolling work in iOS8
// [1] http://stackoverflow.com/questions/26738764/ios8-safari-webkit-overflow-scrolling-touch-issue
// [2] http://slytrunk.tumblr.com/post/33861403641/ios6-web-app-flickering-with
// [3] http://stackoverflow.com/questions/17747239/ios-flicker-bug-when-the-css-overflowscroll-is-changed-to-overflowhidden
// [4] http://patrickmuff.ch/blog/2014/10/01/how-we-fixed-the-webkit-overflow-scrolling-touch-bug-on-ios/
function scrollRefresh() {
  // Method [4]
  $('.pane').not($('.scroll-applied')).wrapInner('<div class="inner-scroll"></div>').addClass('scroll-applied momentum-scroll-on');
  
  // Method [1]
  var scrollable = $('.modal, .orientation-portrait .portrait-collapse');
  scrollable.removeClass('momentum-scroll-on').addClass('momentum-scroll-off');
  setTimeout(function(){
    scrollable.removeClass('momentum-scroll-off').addClass('momentum-scroll-on');
  }, 10);
}