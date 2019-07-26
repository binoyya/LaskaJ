jQuery(document).ready(function(jQuery) {

    /* Smooth scrolling */

    let pageContainer  = jQuery('html, body');
    
    jQuery('.scroll-target[href^="#"]').click(function () {
        pageContainer.animate({
            scrollTop: jQuery( jQuery.attr(this, 'href') ).offset().top
        }, 500);

        return false;
    });

});