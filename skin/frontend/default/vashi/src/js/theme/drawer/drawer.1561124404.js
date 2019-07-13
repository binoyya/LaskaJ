(function ($) {

    var defaults = {
        rootSelector: '.drawer',
        innerSelector: '.drawer__inner',
        titleSelector: '.drawer__title',
        loaderSelector: '.drawer__loader',
        overlaySelector: '.drawer__overlay',
        contentSelector: '.drawer__content',
        closeBtnSelector: '.drawer__button--close',
        headContainerSelector: '.drawer__headcontainer',
        contentContainerSelector: '.drawer__contentcontainer',
    };

    function VashiDrawer(options) {
        this.construct(options);
    }

    $.extend(VashiDrawer.prototype, {

        construct: function (options) {

            this.state = {
                init: false,
                open: false,
                html: $('<span />'),
                title: '',
            };

            this.options = _.extend({}, defaults, options || {});

            this.events = {};

            this.constructElements();
            this.constructEventHandlers();
        },

        constructElements: function () {
            this.$root = $(this.options.rootSelector);
            this.$inner = $(this.options.rootSelector + ' ' + this.options.innerSelector);
            this.$title = $(this.options.rootSelector + ' ' + this.options.titleSelector);
            this.$loader = $(this.options.rootSelector + ' ' + this.options.loaderSelector);
            this.$overlay = $(this.options.rootSelector + ' ' + this.options.overlaySelector);
            this.$content = $(this.options.rootSelector + ' ' + this.options.contentSelector);
            this.$btnClose = $(this.options.rootSelector + ' ' + this.options.closeBtnSelector);
            this.$headContainer = $(this.options.rootSelector + ' ' + this.options.headContainerSelector);
            this.$contentContainer = $(this.options.rootSelector + ' ' + this.options.contentContainerSelector);
        },

        constructEventHandlers: function () {
            this.$overlay.on('click', this.close.bind(this));
            this.$btnClose.on('click', this.close.bind(this));

            $(window).on('resize', _.debounce(this.resize.bind(this), 200).bind(this));
        },

        initManually: function (options) {

            if (typeof this.currentElement === 'undefined') {
                this.currentElement = 'manual';
            }

            if (this.currentElement !== 'manual') {
                this.detach();
                this.currentElement = 'manual';
            }

            this.setState({
                init: true,
                open: true,
                html: $(options.id),
                title: options.title || null,
                scroll_top: $(window).scrollTop(),
                element: $(options.id),
            });

            setTimeout(function () {
                this.resize();
            }.bind(this), 0)

            return this;
        },

        init: function (e, element) {

            e.preventDefault();

            if (typeof this.currentElement === 'undefined') {
                this.currentElement = element;
            }

            if (this.currentElement !== element) {
                this.detach();
                this.currentElement = element;
            }

            var $el = $(e.currentTarget);

            this.setState({
                init: true,
                open: true,
                html: this.getHtmlFromElement($el),
                title: this.getTitleFromElement($el),
                root_class: this.getRootClassFromElement($el),
                scroll_top: $(window).scrollTop(),
                element: $el
            });

            setTimeout(function () {
                this.resize();
            }.bind(this), 0)

            return this;
        },

        getTitleFromElement: function ($el) {
            return $el.data('title') || '';
        },

        getHtmlFromElement: function ($el) {
            return $('#' + $el.data('drawer')).first().children().detach();
        },

        getRootClassFromElement: function ($el) {
            return ($el.data('drawer-root-class') || '').toString();
        },

        getTitle: function () {
            return this.getState('title');
        },

        setTitle: function (title) {
            return this.setState({ title: (title || '') });
        },

        setBusy: function () {
            return this.setState({ busy: true });
        },

        unsetBusy: function () {
            return this.setState({ busy: false });
        },

        isBusy: function () {
            return this.getState('busy', false);
        },

        open: function () {
            if (this.getState('open') === false) {
                this.setState({ open: true });
            }

            return this;
        },

        close: function () {
            if (this.getState('open') === true && ! this.isBusy()) {
                this.setState({ open: false, root_class: '' });
            }

            return this;
        },

        detach: function () {
            this.emit('before_detach');

            if (this.currentElement !== 'manual') {
                var selector = '#' + this.getState('element').data('drawer');

                $(selector).first().html(this.getState('html').detach());
            }
            this.emit('after_detach');
        },

        resize: function () {
            if (! this.getState('open')) {
                return;
            }

            setTimeout(function () {
                this.emit('before_resize');

                var totalHeight  = $('.drawer__inner').height() || 0;
                var headHeight   = this.$headContainer.outerHeight(true) || 0;
                var actionHeight = this.$content.find('.drawer__actions').length > 0 ? 60 : 0;
                var height       = totalHeight - headHeight - actionHeight;

                this.$contentContainer.height(height);

                this.emit('after_resize', { height: height });
            }.bind(this), 200);
        },

        setState: function (state, bypassRender) {
            _.merge(this.state, state);

            if (bypassRender !== true) {
                this.render();
            }

            return this;
        },

        getState: function (key, def) {
            return _.get(this.state, key, def);
        },

        getDrawerId: function () {
            return this.getState('element').data('drawer') || '';
        },

        getOpeningAnimation: function () {
            if (typeof this.openingAnimation !== 'undefined') {
                return this.openingAnimation;
            }

            var timeline = new TimelineMax();

            timeline.add([
                TweenLite.to(this.$inner, 0.4, { right: 0, ease: Power1.easeOut }),
                TweenLite.to(this.$overlay, 0.4, { opacity: 0.9, ease: Power1.easeOut }),
            ], '+=0', 'start');

            timeline.eventCallback('onStart', this.onOpeningAnimationStart.bind(this));
            timeline.eventCallback('onComplete', this.onOpeningAnimationComplete.bind(this));

            this.openingAnimation = timeline;

            return this.openingAnimation;
        },

        onOpeningAnimationStart: function () {
            this.emit('before_open');
        },

        onOpeningAnimationComplete: function () {
            this.emit('after_open');
        },

        getClosingAnimation: function () {
            if (typeof this.closingAnimation !== 'undefined') {
                return this.closingAnimation;
            }

            var timeline = new TimelineMax();

            timeline.add([
                TweenLite.to(this.$inner, 0.4, { right: '-100%', ease: Power1.easeOut }),
                TweenLite.to(this.$overlay, 0.4, { opacity: 0, ease: Power1.easeOut }),
            ], '+=0', 'start');

            timeline.eventCallback('onStart', this.onClosingAnimationStart.bind(this));
            timeline.eventCallback('onComplete', this.onClosingAnimationComplete.bind(this));

            this.closingAnimation = timeline;

            return this.closingAnimation;
        },

        onClosingAnimationStart: function () {
            this.emit('before_close');

            if ($('.slide-menu').hasClass('active')) return;
            vashiGlobal.scrollUnlock();
        },

        onClosingAnimationComplete: function () {
            this.emit('after_close');

            this.$root.removeClass();
            this.$root.addClass('drawer');

            this.detach();

            setTimeout(function () {
                $(window).scrollTop(this.getState('scroll_top'));
            }.bind(this), 0);
        },

        on: function (event, callback) {
            if (typeof this.events[event] === 'undefined') {
                this.events[event] = [];
            }

            this.events[event].push(callback);

            return this;
        },

        emit: function (event, data) {
            _.each(this.events[event] || [], function (func) {
                if (typeof func === 'function') {

                    var eventData = _.merge({}, {
                        drawer: this
                    }, (data || {}));

                    func.apply(null, [this, eventData]);
                }
            }.bind(this));

            return this;
        },

        render: function () {

            this.emit('before_render');

            if (this.getState('title')) {
                this.$title.show().find('h3').text(this.getState('title'));
            } else {
                this.$title.hide();
            }

            if (this.isBusy()) {
                this.$loader.addClass('visible');
            } else {
                this.$loader.removeClass('visible');
            }

            if (this.getState('init')) {
                this.setState({ init: false }, true);

                window.setTimeout(function () {
                    if ($('.slide-menu').hasClass('active')) return;
                    vashiGlobal.scrollLock();
                }, 500);

                this.$root.removeClass();
                this.$root.addClass('drawer active ' + this.getState('root_class'));

                this.$content.empty().append(this.getState('html'));
            }

            if (this.getState('open') && ! this.getState('opened')) {
                this.setState({ opened: true, init: false }, true);
                this.getOpeningAnimation().restart();
            }

            if (! this.getState('open') && this.getState('opened')) {
                this.setState({ opened: false, init: false }, true);
                this.getClosingAnimation().restart();
            }

            this.resize();

            this.emit('after_render');

            return this;
        }
    });

    function getInstance(options) {

        if (typeof $.VashiDrawer === 'undefined') {
            $.VashiDrawer = new VashiDrawer(options);
        }

        return $.VashiDrawer;
    }

    $.fn.VashiDrawer = function () {

        var options = typeof arguments[0] === 'object' ? arguments[0] : {};
        var method  = typeof arguments[0] === 'string' ? arguments[0] : false;
        var args    = Array.prototype.slice.call(arguments, 1);

        var instance = getInstance(options);

        if (method === false && this.length > 0) {
            this.on('click', function (event) {
                instance.init.apply(instance, [event, this]);
            }.bind(this));
        }

        if (method !== false && typeof instance[method] === 'function') {
            instance[method].apply(instance, args);
        }

        //let the window know the drawer is ready
        let event = document.createEvent('Event');
        event.initEvent('drawer_ready', true, false);
        window.dispatchEvent(event);

        return instance;
    };
})(jQuery);
