;(function($) {

    this.VashiDragDropSlider = function (selector, options) {
        this.init(selector, options);
    }

    var DesktopSlider = function(selector, options){
        this.init(selector, options);
    };

    var MobileSlider = function(selector, options){
        this.init(selector, options);
    };

    $.extend(this.VashiDragDropSlider.prototype, {
        init: function (selector, options) {
            this.$root = $(selector);

            if (! this.$root.length) {
                return;
            }

            this.options = _.extend({}, {}, options);

            this.initSlide(
                this.$root.find('.text__left'),
                this.$root.find('.image__right'),
                this.getNextSlide()
            );

            this.initSlide(
                this.$root.find('.text__right'),
                this.$root.find('.image__left'),
                this.getNextSlide()
            );

            new MobileSlider(selector + ' .mobile-only');
            new DesktopSlider(selector + ' .desktop-only-no-tablet');
        },

        getSlides: function () {
            return this.options.slides || [];
        },

        getSlideCount: function () {
            return this.getSlides().length || 0;
        },

        getNextSlide: function () {
            return this.getSlides()[this.getIndex()];
        },

        getIndex: function () {
            var index = (window.localStorage.getItem('vashi_theme_widget_hero_dragdrop_slider_index') || 0) * 1;

            if (index >= this.getSlideCount()) {
                index = 0;
            }

            window.localStorage.setItem('vashi_theme_widget_hero_dragdrop_slider_index', (index + 1).toString());

            return index;
        },

        initSlide: function ($text, $image, data) {

            if (data.title_img) {
                $text.append($('<img draggable="false" />').attr('src', data.title_img));
            } else if (data.title) {
                $text.append($('<h3 />').text(data.title));
            }

            if (data.subtitle) {
                $text.append($('<p />').text(data.subtitle));
            }

            if (data.link_url && data.link_title) {
                (function(){
                    var $a = $('<a />').text(data.link_title).attr({
                        class: 'button vashi-btn primary',
                        href: data.link_url,
                        title: data.link_title,
                    });

                    $a.on('mousedown mouseup click', function (e) {
                        e.stopPropagation();
                    });

                    $text.append($a);
                }());
            }

            if (data.image_url) {
                $image.css('background-image', 'url(' + data.image_url + ')');
            }

            if (data.video_url) {
                $image.append(
                    $('<video autoplay loop muted playsinline />').attr('src', data.video_url)
                );
            }
        },
    });

    $.extend(DesktopSlider.prototype, {
        init: function(selector, options) {

            this.$root = $(selector);

            if (! this.$root.length) {
                return;
            }

            this.options = _.extend({}, {}, options);

            this.state = {
                state: 1
            };

            this.$cursor = this.$root.find('.dragdrop-cursor');

            this.initFirstStateTimeline();
            this.initSecondStateTimeline();
            this.initCursor();
            this.initSlider();
        },

        initFirstStateTimeline: function () {
            if (typeof this.timeline_a !== 'undefined') {
                return this.timeline_a;
            }

            var timeline = new TimelineLite({
                paused: true,
                onComplete: this.onTimelineComplete.bind(this),
            });

            var $leftTextContainer  = this.$root.find('.text.text__left');
            var $rightTextContainer = this.$root.find('.text.text__right');

            var tweens = [TweenLite.to($leftTextContainer, 2, { left: '0%', ease: Expo.easeOut })];

            var count = 0;

            _.each([
                $rightTextContainer.find('h3, img'),
                $rightTextContainer.find('p'),
                $rightTextContainer.find('.button'),
            ], function ($el) {
                if (! $el.length) {
                    return;
                }

                tweens.push(
                    TweenLite.to($el, 0.33, { opacity: 0, delay: 0.33 * count })
                );

                count++;
            });

            _.each([
                $leftTextContainer.find('h3, img'),
                $leftTextContainer.find('p'),
                $leftTextContainer.find('.button'),
            ], function ($el) {
                if (! $el.length) {
                    return;
                }

                tweens.push(
                    TweenLite.to($el, 0.33, { opacity: 1, delay: 0.3 * count })
                );

                count++;
            });

            timeline.add(tweens);
            timeline.add(TweenLite.to($rightTextContainer, 1, { right: '-50%', ease: Expo.easeOut }), '-=1');

            this.timeline_a = timeline;
        },

        initSecondStateTimeline: function () {
            if (typeof this.timeline_b !== 'undefined') {
                return this.timeline_b;
            }

            var timeline = new TimelineLite({
                paused: true,
                onComplete: this.onTimelineComplete.bind(this),
            });

            var $leftTextContainer  = this.$root.find('.text.text__left');
            var $rightTextContainer = this.$root.find('.text.text__right');

            var tweens = [TweenLite.to($rightTextContainer, 2, { right: '0%', ease: Expo.easeOut })];

            var count = 0;

            _.each([
                $leftTextContainer.find('h3, img'),
                $leftTextContainer.find('p'),
                $leftTextContainer.find('.button'),
            ], function ($el) {
                if (! $el.length) {
                    return;
                }

                tweens.push(
                    TweenLite.to($el, 0.33, { opacity: 0, delay: 0.33 * count })
                );

                count++;
            });

            _.each([
                $rightTextContainer.find('h3, img'),
                $rightTextContainer.find('p'),
                $rightTextContainer.find('.button'),
            ], function ($el) {
                if (! $el.length) {
                    return;
                }

                tweens.push(
                    TweenLite.to($el, 0.33, { opacity: 1, delay: 0.3 * count })
                );

                count++;
            });

            timeline.add(tweens);
            timeline.add(TweenLite.to($leftTextContainer, 1, { left: '-50%', ease: Expo.easeOut }), '-=1');

            this.timeline_b = timeline;
        },

        onTimelineComplete: function () {
            this.setState('state', (this.getState('state') === 1 ? 2 : 1));
            this.setState('busy', false);
        },

        initCursor: function () {

            if ($('html').hasClass('touch')) {
                return;
            }

            this.$root.find('a').on('mouseleave', function (e) {
                this.$cursor.children().css('opacity', 1);
            }.bind(this));

            this.$root.find('a').on('mouseenter', function (e) {
                this.$cursor.children().css('opacity', 0);
            }.bind(this));

            this.$root.on('mouseenter', function (e) {
                this.$cursor.children().css('opacity', 1);
            }.bind(this));

            this.$root.on('mouseleave', function (e) {
                this.$cursor.children().css('opacity', 0);
            }.bind(this));

            this.$root.on('mousemove', function (e) {
                var $el    = $(e.currentTarget);
                var offset = $el.offset();
                var x      = e.pageX - offset.left - 50;
                var y      = e.pageY - offset.top - 50;

                this.$cursor.css({
                    left: x,
                    top:  y,
                });

                this.$cursor.removeClass('static');

                if (this.timeout) {
                    clearTimeout(this.timeout);
                }

                this.timeout = setTimeout(function() {
                    this.$root.trigger('mousemoveend');
                }.bind(this), 200);

            }.bind(this));

            this.$root.on('mousemoveend', function () {
                this.$cursor.addClass('static');
            }.bind(this));

            this.$root.on('mousedown', function (e) {
                this.$cursor.addClass('shrink');
                this.$cursor.find('.text').css('opacity', 0).delay(220).remove();
            }.bind(this));

            this.$root.on('mouseup', function (e) {
                this.$cursor.removeClass('shrink');
            }.bind(this));
        },

        isTouchEvent: function (e) {
            return (e.type.indexOf('touch') !== -1);
        },

        getXValueFromEvent: function (e) {
            if (this.isTouchEvent(e)) {
                return e.originalEvent.touches[0].pageX - $(e.currentTarget).offset().left;
            } else {
                return e.pageX - $(e.currentTarget).offset().left;
            }
        },

        initSlider: function () {
            this.x         = false;
            this.diff      = 0;
            this.mousedown = false;

            this.$root.on('mousedown touchstart', function (e) {

                if (this.getState('busy')) {
                    return;
                }

                this.mousedown = true;

                this.x = this.getXValueFromEvent(e);

                this.diff = 0;

            }.bind(this));

            this.$root.on('mouseup touchend', function (e) {

                if (this.mousedown !== true) {
                    return;
                }

                this.mousedown = false;

                if (! this.diff) {
                    return;
                }

                if (this.getState('busy')) {
                    return;
                }

                this.x = false;

                if ((this.diff / this.$root.width()) >= 0.05) {
                    this.setState('busy', true);
                    this.getCurrentStateTimeline().play();
                } else {
                    this.getCurrentStateTimeline().reverse();
                }

            }.bind(this));

            this.$root.on('mousemove touchmove', function (e) {

                if (this.mousedown === false) {
                    return;
                }

                this.diff = Math.abs(this.getXValueFromEvent(e) - this.x);

                this.getCurrentStateTimeline().pause().progress((this.diff / this.$root.width()) / 2);

            }.bind(this));
        },

        getCurrentStateTimeline: function () {
            if (this.getState('state') === 2) {
                return this.initFirstStateTimeline();
            } else {
                return this.initSecondStateTimeline();
            }
        },

        setState: function (key, value) {
            _.set(this.state, key, value);

            this.render();
        },

        getState: function (key, def) {
            return _.get(this.state, key, def);
        },

        render: function () {}
    });

    $.extend(MobileSlider.prototype, {
        init: function(selector, options) {

            this.$root = $(selector);

            if (! this.$root.length) {
                return;
            }

            this.options = _.extend({}, {}, options);

            this.state = {
                state: 1
            };

            this.initFirstStateTimeline();
            this.initSecondStateTimeline();
            this.initSlider();
        },

        initFirstStateTimeline: function () {
            if (typeof this.timeline_a !== 'undefined') {
                return this.timeline_a;
            }

            var timeline = new TimelineLite({
                paused: true,
                onComplete: this.onTimelineComplete.bind(this),
            });

            var $leftTextContainer  = this.$root.find('.text.text__left');
            var $rightTextContainer = this.$root.find('.text.text__right');

            var tweens = [TweenLite.to($leftTextContainer, 2, { bottom: '0%', ease: Expo.easeOut })];

            var count = 0;

            _.each([
                $rightTextContainer.find('img, h3'),
                $rightTextContainer.find('p'),
                $rightTextContainer.find('.button'),
            ], function ($el) {
                if (! $el.length) {
                    return;
                }

                tweens.push(
                    TweenLite.to($el, 0.33, { opacity: 0, delay: 0.33 * count })
                );

                count++;
            });

            _.each([
                $leftTextContainer.find('img, h3'),
                $leftTextContainer.find('p'),
                $leftTextContainer.find('.button'),
            ], function ($el) {
                if (! $el.length) {
                    return;
                }

                tweens.push(
                    TweenLite.to($el, 0.33, { opacity: 1, delay: 0.3 * count })
                );

                count++;
            });

            timeline.add(tweens);
            timeline.add(TweenLite.to($rightTextContainer, 1, { top: '-50%', ease: Expo.easeOut }), '-=1');

            this.timeline_a = timeline;
        },

        initSecondStateTimeline: function () {
            if (typeof this.timeline_b !== 'undefined') {
                return this.timeline_b;
            }

            var timeline = new TimelineLite({
                paused: true,
                onComplete: this.onTimelineComplete.bind(this),
            });

            var $leftTextContainer  = this.$root.find('.text.text__left');
            var $rightTextContainer = this.$root.find('.text.text__right');

            var tweens = [TweenLite.to($rightTextContainer, 2, { top: '0%', ease: Expo.easeOut })];

            var count = 0;

            _.each([
                $leftTextContainer.find('img, h3'),
                $leftTextContainer.find('p'),
                $leftTextContainer.find('.button'),
            ], function ($el) {
                if (! $el.length) {
                    return;
                }

                tweens.push(
                    TweenLite.to($el, 0.33, { opacity: 0, delay: 0.33 * count })
                );

                count++;
            });

            _.each([
                $rightTextContainer.find('img, h3'),
                $rightTextContainer.find('p'),
                $rightTextContainer.find('.button'),
            ], function ($el) {
                if (! $el.length) {
                    return;
                }

                tweens.push(
                    TweenLite.to($el, 0.33, { opacity: 1, delay: 0.3 * count })
                );

                count++;
            });

            timeline.add(tweens);
            timeline.add(TweenLite.to($leftTextContainer, 1, { bottom: '-50%', ease: Expo.easeOut }), '-=1');

            this.timeline_b = timeline;
        },

        onTimelineComplete: function () {
            this.setState('state', (this.getState('state') === 1 ? 2 : 1));
            this.setState('busy', false);
        },

        initSlider: function () {
            this.$root.on('click', function (e) {
                if (this.getState('busy')) {
                    return;
                }

                this.setState('busy', true);

                this.getCurrentStateTimeline().restart();
            }.bind(this));
        },

        getCurrentStateTimeline: function () {
            if (this.getState('state') === 2) {
                return this.initFirstStateTimeline();
            } else {
                return this.initSecondStateTimeline();
            }
        },

        setState: function (key, value) {
            _.set(this.state, key, value);

            this.render();
        },

        getState: function (key, def) {
            return _.get(this.state, key, def);
        },

        render: function () {}
    });
})(jQuery);
