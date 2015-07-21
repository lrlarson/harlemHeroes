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
      // This is the easiest way to have default options.
    var settings = $.extend({
      closeIconClass: 'fa fa-close'
    }, options );      
    
    var toggleModal = function() {
      var $this = $(this);
      var target = $this.data('toggle-target');
      // Grab markup if needed
      if ($this.attr('data-content')) {
        var content = $this.data('content');
        var html = $(content).html();
        $(target).html(html);    
      }
      // Open the modal      
      $(target).toggleClass('open');
      $this.toggleClass('open');
      if ($this.hasClass('open')) {
        $this.html('<i class="'+ settings.closeIconClass +'"></i>');
        $this.removeClass('close');
        $(target).removeClass('close');
      }
      else {
        // Close the modal
        var icon = $this.data('icon-class');
        $this.html('<i class="'+ icon +'"></i>');
        $this.addClass('close');
        $(target).addClass('close');        
      }
      // Stop any audio/video playback when opening/closing modals
      stopMedia();

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