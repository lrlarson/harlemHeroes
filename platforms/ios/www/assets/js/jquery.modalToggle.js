/**
 * Custom Harlem Heroes Modal Toggle
 * Icon is stored in data-icon-class attribute, switches to close icon class when open
 * 
 * Example markup:
 * <a class="modal-button no-user-select modal-toggle-overlay" data-icon-class="fa fa-bars" data-toggle-target="modal-overlay"><i class="fa fa-bars"></i></a>
 * <div class="modal modal-overlay">AUDIO</div>      
 */
;(function($){
 
  $.fn.modalToggle = function(options) {
    var collection = this;
    
      // This is the easiest way to have default options.
    var settings = $.extend({
      closeIconClass: 'icon-close'
    }, options );      

    var toggleModal = function(e) {
      e.preventDefault();
      
      var $this = $(this);
      var target = $this.data('toggle-target');      
      // Grab markup if needed
      if ($this.attr('data-content')) {
        var content = $this.data('content');
        var html = $(content).html();
        $(target).html(html);    
      }
      
      var closeModal = function() {
        // Close the modal
        var icon = $this.data('icon-class');
        $this.html('<i class="'+ icon +'"></i>');
        $this.addClass('close').removeClass('open');
        $(target).addClass('close').removeClass('open');
        // Stop any audio/video playback when opening/closing modals
        stopMedia();        
      }      
      
      
      // Close parent when interior link clicked.
      $(target).find('a').not($('[class^=pt-], [target="_blank"]')).on('click', function(){
        // Close the modal
        var icon = $this.data('icon-class');
        $this.html('<i class="'+ icon +'"></i>');
        $this.addClass('close').removeClass('open');
        $(target).addClass('close').removeClass('open');  
      });
        
      // Open the modal      
      $(target).toggleClass('open');
      $this.toggleClass('open');
      if ($this.hasClass('open')) {
        $this.html('<i class="'+ settings.closeIconClass +'"></i>');
        $this.addClass('open').removeClass('close');
        $(target).addClass('open').removeClass('close');
        scrollRefresh();
        // Stop any audio/video playback when opening/closing modals
        stopMedia();
      }
      else {
        // Close the modal
        closeModal();      
      }

      // Close all other modals (so you can never have two open)
      // A little messy but the $(event.target).closest method isn't working for some reason
      collection.each(function(){
        if ($(this).hasClass('open') && $(this)[0] != $this[0]) {
          var target = $(this).data('toggle-target');
          var icon = $(this).data('icon-class');
          $(this).html('<i class="'+ icon +'"></i>');
          $(this).removeClass('open').addClass('close');
          $(target).removeClass('open').addClass('close');           
        }
      });
      // Close modal whenever the underlying page content is clicked. Depends on Fastclick.js to work correctly.
      $('.pane').not('.orientation-portrait .portrait-text').on('click', function() {
        closeModal();  
      });
      // Close modal during page transition
      $(window).on('hashchange', function() {
        closeModal(); 
      });      


    }
    return this.each(function(index) {
      if (!("ontouchstart" in document.documentElement)) {
        $(this).bind('load click', toggleModal);
      }
      else {
        $(this).bind('load touchstart', toggleModal);
      }   
    });
  };
})(jQuery);