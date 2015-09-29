/**
 * Image tile plugin. Loads random preselected images as background-images
 * inside matching elements and fades in new ones randomly based on the delayFrequency.
 *
 * $('.my-div').imageTile({images: ['path1.png', 'path2.png'], delayFrequency:500});
 * 
 */  
;(function($){
  // These should be sized down to speed up load time
  var path = 'assets/images/portraits/thumb/';
  var portraits = [
                path + 'Anderson.jpg',
                path + 'Baldwin.jpg',
                path + 'Beardon.jpg',
                path + 'Bethune.jpg',
                path + 'Bontemps.jpg',
                path + 'Bubbles.jpg',
                path + 'Bunche.jpg',
                path + 'Cullen.jpg',
                path + 'Davis.jpg',
                path + 'Dee.jpg',
                path + 'Dubois.jpg',
                path + 'Dunham.jpg',
                path + 'Elzy.jpg',
                path + 'Fitzgerald.jpg',
                path + 'Gibson.jpg',
                path + 'Gillespie.jpg',
                path + 'Handy.jpg',
                path + 'Hayes.jpg',
                path + 'Hines.jpg',
                path + 'Holt.jpg',
                path + 'Horne.jpg',
                path + 'Hughes.jpg',
                path + 'Hurston.jpg',
                path + 'Jackson.jpg',
                path + 'Johnson,-Charles.jpg',
                path + 'Johnson,-J-Rosamond.jpg',
                path + 'Johnson,-James-Weldon.jpg',
                path + 'Lawrence.jpg',
                path + 'Locke.jpg',
                path + 'Lottie-Allen.jpg',
                path + 'Louis.jpg',
                path + 'McClendon.jpg',
                path + 'McKay.jpg',
                path + 'Perkins.jpg',
                path + 'Peterson.jpg',
                path + 'Pippin.jpg',
                path + 'Porter.jpg',
                path + 'Price.jpg',
                path + 'Robeson.jpg',
                path + 'Robinson.jpg',
                path + 'Sampson.jpg',
                path + 'Smith.jpg',
                path + 'Sullivan.jpg',
                path + 'Swanson.jpg',
                path + 'Victor.jpg',
                path + 'Walker.jpg',
                path + 'Washington.jpg',
                path + 'Waters.jpg',
                path + 'White.jpg',
                path + 'Wright.jpg'
                ];
  $.fn.imageTile = function(options) {
      // This is the easiest way to have default options.
      var settings = $.extend({
          // These are the defaults.
          // Random images are places if no images are given
          /*
          images: [
            'http://lorempixel.com/400/200/nature/1',
            'http://lorempixel.com/400/200/nature/2',
            'http://lorempixel.com/400/200/nature/3',
            'http://lorempixel.com/400/200/nature/4',
            'http://lorempixel.com/400/200/nature/5',
            'http://lorempixel.com/400/200/nature/6',
            'http://lorempixel.com/400/200/nature/7',
            'http://lorempixel.com/400/200/nature/8',
            'http://lorempixel.com/400/200/nature/9'
          ],*/
          images: portraits,
          delayFrequency: 600,
      }, options );      
      var randomIndex,
          image,
          images,
          delay;
      // Matching collection of jquery objects
      var elements = this;
      // Use history buffer to reduce duplicate tiles
      var tileHistory = [];
      var historySize = 20;

          
    var getRandomInt = function(min, max) {
      var array = new Uint8Array(1);
      window.crypto.getRandomValues(array);      
      var random = 1 - (array[0] / 255);      
      return Math.floor(Math.random() * (max - min)) + Math.floor(min);
    }

    // On every interval, pick 3 random elements and load in
    // 3 random images.
    var swapImage = function() {
      delay = settings.delayFrequency;
      images = settings.images;
      var randomIndex = getRandomInt(0, settings.images.length - 1);
      var image = images[randomIndex];
      var randomElement = getRandomInt(0, elements.length - 1);
      
      // Check against existing elements or recent images to prevent duplicates
      var dupe = false;
      elements.each(function(index, el){
        // Returns -1 if string is not found
        var check = String(el.style.backgroundImage).indexOf(String(image));
        if (check != -1) {
          dupe = true;
        }
      });
      $.each(tileHistory, function(index, value) {
        if (image == value) {
          dupe = true;
        }
      });

      if (!dupe) {
        /* Fade to black method (smoother/better cross browser behavior) */
        elements.eq(randomElement).fadeTo(delay - 1, 0, function(){
          $(this).css('background-image', 'url("'+ image +'")').fadeTo(delay*3, 1);
        });
        // Store previous images to avoid changing recently changed elements
        if(tileHistory.length < 8) {
          tileHistory.unshift(image);
        }
        else {
          tileHistory.unshift(image); 
          tileHistory.pop(); 
        }
       
        /* Crossfade method (doesn't work in FF, slightly glitchy) */
        /*
        elements.eq(randomElement).css('transition', 'filter background-image 1s ease-in-out').css('background-image', 'url("'+ image +'")');
        */
      }

      // Random timing allows for more chaotic motion
      //setTimeout(function(){ swapImage(); }, getRandomInt(delay, delay*1.25));
      setTimeout(function(){ swapImage(); }, getRandomInt(delay/1.2, delay*1.2));
    };
    swapImage();
    //setInterval(function(){swapImage();}, 500);
    /*
    return this.each(function(index) {
      var element = $(this);
    });
    */
  };
})(jQuery);