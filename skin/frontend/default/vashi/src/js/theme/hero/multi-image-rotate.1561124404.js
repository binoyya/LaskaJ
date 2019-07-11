; (function ($, window, document, undefined) {

    let pluginName = 'VashiMultiImageRotate',
        defaults = {
            slideContainer: '.widget__image-rotate',
            slideClass: '.image-rotate__image',
            headClass: '.widget__head',
            actionsClass: '.widget__actions',
            transitionSpeed: 4000,
        };

    function VashiMultiImageRotate(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, defaults, options);

        this.$container = this.$element.find(this.options.slideContainer);
        this.$head = this.$element.find(this.options.headClass);
        this.$actions = this.$element.find(this.options.actionsClass);


        //array of slides
        this.$slides = this.$element.find(this.options.slideClass);

        this.slideCount = this.$slides.length;
        this.prevSlide = 0;
        this.activeSlide = 0;

        this.bindButtons();
        this.init();
    }

    VashiMultiImageRotate.prototype.init = function () {
        this.addImageClasses();
        this.initialAnimation();
        this.startRotating = this.startRotating.bind(this);

        var _this = this;
        setTimeout(function () {
            this.interval = setInterval(_this.startRotating, _this.options.transitionSpeed);            
        }, 500)
    }

    VashiMultiImageRotate.prototype.addImageClasses = function () {
        var that = this;
        _.each(this.$slides, function (el, i) {
            if (i === that.activeSlide) {
                that.setActiveSlide(el);
            } else {
                that.setInactiveSlide(el);
            }
        });
    }

    VashiMultiImageRotate.prototype.setActiveSlide = function (el) {
        $(el).removeClass('slide-inactive');
        $(el).addClass('slide-active');
    }

    VashiMultiImageRotate.prototype.setInactiveSlide = function (el) {
        $(el).removeClass('slide-active');
        $(el).addClass('slide-inactive');
    }

    VashiMultiImageRotate.prototype.initialAnimation = function () {
        _.each([this.$head, this.$actions, this.$container], function ($el, i) {
            setTimeout(function () {
                $el.addClass('active');
            }, i * 300);
        });
    }

    VashiMultiImageRotate.prototype.startRotating = function () {
        var prevSlide = this.activeSlide;
        var nextSlide = this.activeSlide === this.slideCount - 1 ? 0 : this.activeSlide + 1;

        this.setInactiveSlide(this.$slides[prevSlide]);
        this.setActiveSlide(this.$slides[nextSlide]);

        this.toggleContainerClass();

        this.prevSlide = prevSlide;
        this.activeSlide = nextSlide;
    }

    VashiMultiImageRotate.prototype.toggleContainerClass = function () {
        this.$element.removeClass('widget--slide-' + this.prevSlide);
        this.$element.addClass('widget--slide-' + this.activeSlide);
    }

    VashiMultiImageRotate.prototype.bindButtons = function () {
        if (this.$element.hasClass('book-viewing')) {
            this.$actions.find('.button').addClass('book-a-viewing-drawer-trigger');
        }
    }

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(
                    this, 'plugin_' + pluginName,
                    new VashiMultiImageRotate(this, options)
                );
            }
        });
    }

})(jQuery, window, document);