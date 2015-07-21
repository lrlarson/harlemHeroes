
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
var maxDuration = 400; // slower (no swipe contribution)
var minDuration = 100; // faster (when swiping quickly)

// Swipe speed in ms (for speeding up swipe animations)
var swipeSpeed = 0; // Dynamically set by draggableTouch

// This increases or decreases the effect of the initial swipe speed
// on the animation...higher values will greatly speed up the swipe
var swipeScale = 25;

// Flag variable to block multiple state changes from firing at once
var block = 0;

// Global variable controlling jQuery's animate refresh rate
//jQuery.fx.interval = 41; // 41 ~ 24fps

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
    }
    else {
      $('body').addClass('orientation-landscape');
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
        // Next -> Current
        next.velocity({
          left: "0"
        }, {
          duration:animDuration,
          complete: function() {
            next.addClass('page-current').removeClass('page-next').css('left', '0').data('page', page);
          }
        });
        // Current -> Previous
        current.velocity({
          left: "-100%"
        }, {
          duration:animDuration,
          complete: function() {
            current.addClass('page-previous').removeClass('page-current').css('left', '-100%').data('page', page - 1);
          }
        });
        // Previous -> Next (circles back)
        prev.velocity({
          left: "-200%"
        }, {
          duration:animDuration,
          complete:function() {
            prev.removeClass('hidden').addClass('page-next').removeClass('page-previous').css('left', '100%').data('page', page + 1);
            loadPage('.page-next');
            if (page >= lastPage) {
              // Special case - we want to hide the "next" page if page == lastPage
              prev.addClass('hidden');
            }
            else {
              prev.removeClass('hidden');
            }            
          }
        });

      }
      else if ((page == prevPage - 1) && page >= firstPage && event.type != 'load') {
        // Moving left (previous page)
        // Previous -> Current
        prev.velocity({
          left: "0"
        }, {
          duration: animDuration,
          complete: function() {
            prev.addClass('page-current').removeClass('page-previous').css('left', '0').data('page', page);
          }
        });
        // Current -> Next
        current.velocity({
          left: "100%"
        },
          {
          duration: animDuration,
          complete: function() {
            current.addClass('page-next').removeClass('page-current').css('left', '100%').data('page', page + 1);
          }
        });
        // Current -> Next (circles back)
        next.velocity({
          left: "200%"
        }, {
          duration: animDuration,
          complete: function() {
            next.addClass('page-previous').removeClass('page-next').css('left', '-100%').data('page', page - 1);
            loadPage('.page-previous');
            if (page <= firstPage) {
              // Special case - we want to hide the "previous" page if page == firstPage
              next.addClass('hidden');
            }
            else {
              next.removeClass('hidden');
            }
          }
        });        
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

