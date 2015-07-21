/**
 * jQuery Draggable Touch v0.5 (zirafa mod)
 * Jonatan Heyman | http://heyman.info 
 * Modified by zirafa | zirafaworks.com
 *
 *
 * Make HTML elements draggable by using uses touch events.
 * The plugin also has a fallback that uses mouse events, 
 * in case the device doesn't support touch events.
 * 
 * Licenced under THE BEER-WARE LICENSE (Revision 42):
 * Jonatan Heyman (http://heyman.info) wrote this file. As long as you retain this 
 * notice you can do whatever you want with this stuff. If we meet some day, and 
 * you think this stuff is worth it, you can buy me a beer in return.
 */  
;(function($){
    // Local reference to Math.abs method
    var abs = Math.abs;
  
    var startTime, endTime, duration, diff;

    // Threshold is the pixel distance element must be dragged to trigger transition
    var threshold = 50;
    
    // pressTime is length of time in millseconds touch/click occurs, useful for
    // detecting fast swipes in a direction (i.e. fast touchscreen swipes)
    var pressTime = 250;
  
    $.fn.draggableTouch = function(action) {
        // check if the device has touch support, and if not, fallback to use mouse
        // draggableMouse which uses mouse events
        if (!("ontouchstart" in document.documentElement)) {
            return this.draggableMouse(action);
        }
        
        // check if we shall make it not draggable
        if (action == "disable") {
            this.unbind("touchstart");
            this.unbind("touchmove");
            this.unbind("touchend");
            this.unbind("touchcancel");
            return this;
        }
        
        this.each(function() {
            var element = $(this);
            var width = element.width();
            var offset = null;
            var stopDrag = 0;
            
            var end = function(e) {
                //e.preventDefault();
                if (!stopDrag) {  
                  var orig = e.originalEvent;
                  var delta = orig.changedTouches[0].pageX - offset.x;

                  element.trigger("dragend", {
                    translateX:  (delta/width * 100) + '%'
                  });
                  endTime = new Date().getTime();
                  duration = endTime - startTime;
                  var distance = orig.changedTouches[0].pageX - offset.x;
                  swipeSpeed = Math.floor(abs(distance)/duration) * swipeScale;
                  if (!block && (distance < -threshold) || (distance < 0 && duration < pressTime)) {
                    location.hash = $('a.next').attr('href');
                  }
                  else if (!block && (distance > threshold) || (distance > 0 && duration < pressTime)) {
                    location.hash = $('a.previous').attr('href');
                  }
                }  
                // Bounce back window
                element.velocity({
                  translateX: ["0%", (delta/width * 100) + '%']
                }, animDuration, function() {   
                });                
            };
            
            element.bind("touchstart", function(e) {
              swipeSpeed = 0;
              var orig = e.originalEvent;
              var pos = $(this).position();
              startTime = new Date().getTime();
  
                offset = {
                    x: orig.changedTouches[0].pageX - pos.left,
                    y: orig.changedTouches[0].pageY - pos.top
                };
                element.trigger("dragstart", pos);
            });
            
            element.bind("touchmove", function(e) {
                var orig = e.originalEvent;
                
                // do now allow two touch points to drag the same element
                if (orig.targetTouches.length > 1)
                    return;
                  
                var distance = abs(orig.changedTouches[0].pageX - offset.x);
                var scrollDist = abs(orig.changedTouches[0].pageY - offset.y);
                var delta = orig.changedTouches[0].pageX - offset.x;
                // e.preventDefault() for touchmove will prevent normal vertical scrolling so
                // we need to make sure user isn't trying to scroll up/down before hijacking it

                if (distance > scrollDist) {
                  e.preventDefault();
                  element.css('transform', 'translateX(' + (delta/width * 100) + '%)');

                  stopDrag = 0;
                }
                else {
                  element.css('transform', 'translateX(0%)');
                  stopDrag = 1;
                }
            });

            element.bind("touchend", end);
            element.bind("touchcancel", end);
        });
        return this;
    };
    
    /**
     * Draggable fallback for when touch is not available
     */
    $.fn.draggableMouse = function (action) {
        // check if we shall make it not draggable
        if (action == "disable") {
            this.unbind("mousedown");
            this.unbind("mouseup");
            return this;
        }
        
        this.each(function() {
            var element = $(this);
            element.addClass('grab');
            var width = element.width();

            var offset = null;
            var ogPos = element.position();
            
            var move = function(e) {
              var delta = e.pageX - offset.x;
              element.css('transform', 'translateX(' + (delta/width * 100) + '%)');
            };
            
            var up = function(e) {
              element.removeClass('grabbing');

              element.unbind("mouseup", up);
              $(document).unbind("mousemove", move);
              var delta = e.pageX - offset.x;

              element.trigger("dragend", {
                translateX:  (delta/width * 100) + '%'
              });
              endTime = new Date().getTime();
              duration = endTime - startTime;
              distance = e.pageX - offset.x;
              swipeSpeed = Math.floor(abs(distance)/duration) * swipeScale;

              if ((distance < -threshold) || (distance < 0 && duration < pressTime)) {
                location.hash = $('a.next').attr('href');
              }
              else if ((distance > threshold) || (distance > 0 && duration < pressTime)) {
                location.hash = $('a.previous').attr('href');
              }
              // Bounce back window
              element.velocity({
                  translateX: ["0%", (delta/width * 100) + '%']
              }, animDuration, function() {   
              });
            };
            
            element.bind("mousedown", function(e) {
                swipeSpeed = 0;
                startTime = new Date().getTime();
                var pos = element.position();
                offset = {
                    x: e.pageX - pos.left,
                };
                element.addClass('grabbing');

                $(document).bind("mousemove", move);
                element.bind("mouseup", up);
                element.trigger("dragstart", pos);
            });
        });
        return this;
    };
  
})(jQuery);