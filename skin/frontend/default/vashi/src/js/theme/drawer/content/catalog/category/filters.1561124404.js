(function($){

    var VashiDrawerContentCatalogCategoryFilters = function ($root, options) {
        this.init($root, options);
    };

    _.extend(VashiDrawerContentCatalogCategoryFilters.prototype, {
        init: function ($root, options) {
            if (! $root.length) {
                return;
            }

            this.state = {
                filter: '',
            };

            this.options = _.extend({}, {}, options || {});

            this.initElements($root);

            this.initFilterMenu();

            this.initButtons();

            this.initEventHandlers();

            this.render();
        },

        initElements: function ($root) {
            this.$root      = $root;
            this.$container = $root.find('.filters__container');
            this.$menu      = $root.find('.filters__menu');
            this.$list      = $root.find('.filters__list');

            this.$btnUpdate         = $root.find('.btn-update');
            this.$btnGoBack         = $root.find('.btn-go-back');
            this.$btnClearAll       = $root.find('.btn-clear-all');
            this.$btnClearAllGlobal = $('.category-filter-buttons .btn-clear-all');
        },

        initFilterMenu: function () {
            this.$list.children().each(function (index, el) {

                var name = $(el).data('filter-name');

                var $a = $('<a />');

                $a.text(name);

                $a.on('click', function () {
                    this.setState({
                        filter: name
                    });
                }.bind(this));

                var $li = $('<li />').append($a).addClass('drawer__list__item arrow');

                this.$menu.append($li);

            }.bind(this));
        },

        initButtons: function () {
            this.$btnClearAll.on('click', this.onBtnClearAllClick.bind(this));

            this.$btnUpdate.on('click', this.onBtnUpdateClick.bind(this));

            this.$btnGoBack.on('click', this.onBtnGoBackClick.bind(this));

            this.$btnClearAllGlobal.on('click', this.onBtnClearAllClick.bind(this));
        },

        initEventHandlers: function () {

            $(window).on('on_gomage_ajax_request', this.onAjaxRequest.bind(this));
            $(window).on('on_gomage_ajax_success', this.onAjaxSuccess.bind(this));
            $(window).on('on_gomage_ajax_failure', this.onAjaxFailure.bind(this));

            $(function(){
                $.VashiDrawer.on('before_open', function () {
                    this.setState({
                        filter: ''
                    });
                }.bind(this));

                $.VashiDrawer.on('after_resize', this.resize.bind(this));
            }.bind(this));
        },

        getContainerElement : function () {
            return this.$container;
        },

        getAllFilters: function () {
            return this.$list.children();
        },

        getActiveFilter: function () {
            return this.$list.children().filter(function (index, el) {
                return this.getState('filter') === $(el).data('filter-name');
            }.bind(this));
        },

        onBtnClearAllClick: function () {
            try {
                GomageNavigation.setNavigationUrl(this.options.clearAllUrl);
            } catch (e) {
                // handle gracefully
            }
        },

        onBtnGoBackClick: function () {
            this.setState({
                filter: '',
                filter_selected: false,
            });
        },

        onBtnUpdateClick: function () {
            if (this.getState('filter')) {
                this.setState({
                    filter: '',
                    filter_selected: false,
                });
            } else {
                $.VashiDrawer.close();
            }
        },

        onAjaxRequest: function () {
            if (typeof $.VashiDrawer !== 'undefined') {
                $.VashiDrawer.setBusy();
            }

            this.render();
        },

        onAjaxSuccess: function () {
            if (typeof $.VashiDrawer !== 'undefined') {
                $.VashiDrawer.unsetBusy();
            }

            // if we are in a filter state
            if (this.getState('filter')) {
                this.setState({ filter_selected: true });
            }

            this.render();
        },

        onAjaxFailure: function () {
            if (typeof $.VashiDrawer !== 'undefined') {
                $.VashiDrawer.unsetBusy();
            }
        },

        /**
         * gomagenavigation doesn't really give us anything in terms
         * of filters applied so we gotta inspect the state of the URL
         * fragment and base our findings on that
         */
        hasFiltersApplied: function () {
            var filterCount = 0;

            try {
                var params = window.location.hash.substr(1).split('&');

                _.each(params, function (param) {

                    if (param.indexOf('=') <= 0) {
                        return;
                    }

                    var key = param.split('=')[0] || '';

                    if (! key) {
                        return;
                    }

                    if (key === 'vashi_theme') {
                        return;
                    }

                    if (key === 'gan_data') {
                        return;
                    }

                    filterCount++;
                });
            } catch (e) {
                // continue gracefully
            }

            return filterCount > 0;
        },

        isFilterActive: function ($el) {
            var param = ($el.find('.selection > a').data('param') || '').substr(1);

            if (! param) {
                return false;
            }

            return window.location.hash.indexOf(param) !== -1;
        },

        setState: function (state) {
            _.merge(this.state, state);

            return this.render();
        },

        getState: function (key, def) {
            return _.get(this.state, key, def);
        },

        resize: function (drawer, data) {
            this.resizePriceFilter(data.height);
        },

        resizePriceFilter: function (height) {
            var $el = this.$list.find('li.filter[data-filter-name="Price"] .filterOuter');

            $el.height(height);
            $el.find('.gan-track-grey').height(height / 2.2);
        },

        render: function () {

            var hasFiltersApplied = this.hasFiltersApplied();

            this.getAllFilters().hide();

            if (this.getState('filter')) {

                this.$btnUpdate.text('Update');

                this.$btnClearAll.hide();

                if (this.getState('filter_selected')) {
                    this.$btnUpdate.show();
                    this.$btnGoBack.hide();
                } else {
                    this.$btnUpdate.hide();
                    this.$btnGoBack.show();
                }

                this.getActiveFilter().show();

                TweenLite.to(this.getContainerElement(), 0.2, { x : (this.getContainerElement().width() / 2) * -1 });

            } else {

                this.$btnUpdate.text('Confirm');

                this.$btnGoBack.hide();

                if (hasFiltersApplied) {
                    this.$btnUpdate.show();
                    this.$btnClearAll.show();
                } else {
                    this.$btnUpdate.hide();
                    this.$btnClearAll.hide();
                }

                TweenLite.to(this.getContainerElement(), 0.2, { x : 0 });
            }

            if (hasFiltersApplied) {
                this.$btnClearAllGlobal.parent().removeClass('hidden');
            } else {
                this.$btnClearAllGlobal.parent().addClass('hidden');
            }

            this.$list.find('.container-option').each(function (index, el) {
                var $el = $(el);

                if (this.isFilterActive($el)) {
                    $el.addClass('active');
                } else {
                    $el.removeClass('active');
                }
            }.bind(this));

            return this;
        }
    });

    $.fn.VashiDrawerContentCatalogCategoryFilters = function (options) {
        this.each(function (index, el) {
            new VashiDrawerContentCatalogCategoryFilters($(el), options);
        });
    }
}(jQuery));
