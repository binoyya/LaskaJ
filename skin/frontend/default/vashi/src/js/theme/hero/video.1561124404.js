; (function ($, window, document, undefined) {

    let pluginName = 'VashiVideo',
        defaults = {
            videoContainer: '.widget__video',
        };

    function VashiVideo(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, defaults, options);

        this.$container = this.$element.find(this.options.videoContainer);
        this.$videoElement = $('<video autoplay loop muted playsinline></video>');

        this.handleResize = this.handleResize.bind(this);

        this.init();
    }

    VashiVideo.prototype.init = function () {
        this.createVideoElement();
        this.setVideoType();
        $(window).on('resize', _.throttle(this.handleResize, 150));
    }

    VashiVideo.prototype.createVideoElement = function () {
        this.$container.append(this.$videoElement);
    }

    VashiVideo.prototype.setVideoSrc = function () {
        this.$videoElement.attr('src', this.options[this.videoType]);
    }

    VashiVideo.prototype.handleResize = function (e) {
        this.setVideoType(this.videoType);
    }

    VashiVideo.prototype.setVideoType = function (type) {
        if (Modernizr.mq('(min-width: 768px)')) {
            this.videoType = 'desktop';
        } else {
            this.videoType = 'mobile';
        }

        if (type !== this.videoType) {
            this.setVideoSrc();
        }
    }

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(
                    this, 'plugin_' + pluginName,
                    new VashiVideo(this, options)
                );
            }
        });
    }

})(jQuery, window, document);