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
          delayFrequency: 1000,
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
      for(i = 0; i < historySize; i++) {
        if (settings.images[i] != null) {
          tileHistory[i] = settings.images[i];
        }
      }
          
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
      for (i = 0;i < 1; i++) {
        var anon = function() {
          var randomIndex = getRandomInt(0, settings.images.length - 1);
          var image = images[randomIndex];
          var randomElement = getRandomInt(0, elements.length - 1);
          
          // Check against tileHistory so we can reduce duplicate tiles
          var dupe = false;
          for (i=0; i < tileHistory.length; i++) {
            if (tileHistory[i] == image) {
              dupe = true;
            }   
          }
          
          if (!dupe) {
            
            /* Fade to black method (smoother/better cross browser behavior) */
            elements.eq(randomElement).fadeTo(800, 0, function(){
              $(this).css('background-image', 'url("'+ image +'")').fadeTo(1500, 1);
              // Add this image to history buffer, and remove old one if we've accumulated enough
              tileHistory.unshift(image);
              if (tileHistory.length >= historySize) {
                tileHistory.pop();
              } 
            });
            
            /* Crossfade method (doesn't work in FF, slightly glitchy) */
            /*
            elements.eq(randomElement).css('transition', 'background-image 1s ease-in-out').css('background-image', 'url("'+ image +'")');
            */
            
            
          }
        }();
      }
      // Random timing allows for more chaotic motion
      setTimeout(swapImage, getRandomInt(10, delay));
    };
    swapImage();    
    /*
    return this.each(function(index) {
      var element = $(this);
    });
    */
  };
})(jQuery);