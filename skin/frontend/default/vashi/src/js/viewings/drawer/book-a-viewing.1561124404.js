(function($){

    var SCREEN_CITY    = 'city';
    var SCREEN_FORM    = 'form';
    var SCREEN_CONFIRM = 'confirm';
    var SCREEN_SUCCESS = 'success';

    var ERROR_INVALID_STORE          = 'invalid_store_error';
    var ERROR_INVALID_DATE           = 'invalid_date_error';
    var ERROR_INVALID_SLOT           = 'invalid_slot_error';
    var ERROR_INVALID_CUSTOMER_EMAIL = 'invalid_customer_email_error';

    var VashiDrawerContentBookAViewing = function ($root, state) {
        this.init($root, state);
    };

    _.extend(VashiDrawerContentBookAViewing.prototype, {
        init: function ($root, state) {
            if (! $root.length) {
                return;
            }

            this.state = this.prevState = _.extend({}, {
                screen: SCREEN_CITY,
                active: false,
                initial_render: true,
            }, state);

            this.initElements($root);

            $(function(){
                this.initEventHandlers();
            }.bind(this));

            this.render();
        },

        initElements: function ($root) {
            this.$root          = $root;

            this.$container     = $root.find('.book-a-viewing__container');

            this.$cityScreen    = $root.find('.city-screen');
            this.$formScreen    = $root.find('.form-screen');
            this.$confirmScreen = $root.find('.confirm-screen');
            this.$successScreen = $root.find('.success-screen');

            this.$btnBack       = $root.find('.btn-back');
            this.$btnDone       = $root.find('.btn-done');
            this.$btnCancel     = $root.find('.btn-cancel');
            this.$btnConfirm    = $root.find('.btn-confirm');
        },

        initEventHandlers: function () {

            // new trigger
            $('body').on('click', '.book-a-viewing-drawer-trigger', this.show.bind(this));

            // legacy trigger
            window.bookViewingForm = { submit: this.show.bind(this) };

            this.$cityScreen.find('.city-picker ul').on('click', 'li', this.onSelectCity.bind(this));

            this.$formScreen.find('.store-picker ul').on('click', 'li', this.onSelectStore.bind(this));

            this.$formScreen.find('.date-picker .month ul').on('click', 'li', this.onSelectMonth.bind(this));

            this.$formScreen.find('.date-picker .date ul').on('click', 'li', this.onSelectDate.bind(this));

            this.$formScreen.find('.slot-picker ul').on('click', 'li', this.onSlotClick.bind(this));

            this.$formScreen.find('.slot-picker ul').on('scroll', this.onSlotScroll.bind(this));

            this.$formScreen.find('.email .customer-email').on('keyup', this.onEmailKeyUp.bind(this));

            this.$btnBack.on('click', this.onBack.bind(this));

            this.$btnDone.on('click', this.onDone.bind(this));

            this.$btnCancel.on('click', this.onCancel.bind(this));

            this.$btnConfirm.on('click', this.onConfirm.bind(this));

            $.VashiDrawer.on('before_open', this.onBeforeDrawerOpen.bind(this));

            $.VashiDrawer.on('before_close', this.onBeforeDrawerClose.bind(this));

            $.VashiDrawer.on('after_close', this.onAfterDrawerClose.bind(this));
        },

        show: function () {

            this.emitGAEvent('BookAppointment');

            var a = $('<a />');
            a.data('drawer', 'book-a-viewing-container');
            a.data('title', 'Book A Viewing');

            $.VashiDrawer.init({
                preventDefault: function () {},
                currentTarget: a[0]
            }, a);

            setTimeout(function () {
                this.setState({ active: true });
            }.bind(this), 10);
        },

        onSelectCity: function (e) {
            var city = $(e.currentTarget).data('city');

            this.setState({
                city: city,
                store: this.getStoresByCity(city)[0].id,
                screen: SCREEN_FORM,
            });

            this.update({}, function (state) {
                this.setState(state);
            });
        },

        onSelectStore: function (e) {
            var store = $(e.currentTarget).data('store');

            if (store === this.getSelectedStore().id) {
                return;
            }

            this.setState({ store: store });

            this.update({ store: store }, function (state) {
                this.setState(state);
                this.scrollDrawer(this.$formScreen.find('.screen-title__pick-date'));
            });
        },

        onSelectMonth: function (e) {
            var year  = $(e.currentTarget).data('year');
            var month = $(e.currentTarget).data('month');
            var day   = this.getEarliestDayForYearAndMonth(year, month);
            var date  = moment().set({year: year, month: month - 1, date: day}).format('Y-MM-DD');

            if (date === this.getSelectedDate()) {
                return;
            }

            this.setState({ date: date });

            this.update({ date: date }, function (state) {
                this.setState(state);
            });
        },

        onSelectDate: function (e) {
            var date = $(e.currentTarget).data('date');

            if (date === this.getSelectedDate()) {
                return;
            }

            this.setState({ date: date });

            this.update({ date: date }, function (state) {
                this.setState(state, true);
                this.scrollDrawer(this.$formScreen.find('.screen-title__pick-time'));
            });
        },

        setActiveSlot: function (slot) {
            this.setState({ slot: slot }, true);
        },

        onSlotClick: function(e) {
            var $el = $(e.currentTarget);
            var slot = $(e.currentTarget).data('slot');

            if (slot === this.getSelectedSlot()) {
                return;
            }

            this.setActiveSlot(slot);
            this.scrollSelectedSlotIntoView($el);
        },

        onSlotScroll: function(e) {
            var $slotContainer = this.$formScreen.find('.slot-picker');

            if (e.target.scrollTop > 10) {
                $slotContainer.addClass('top-fade');
            } else {
                $slotContainer.removeClass('top-fade');
            }

            if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
                $slotContainer.removeClass('bottom-fade');
            } else {
                $slotContainer.addClass('bottom-fade');
            }

            this.setActiveSlot(this.getCurrentSelectedSlot($(e.target)));
        },

        scrollSelectedSlotIntoView: function($el) {
            var selectedSlotOffsetTop = $el[0].offsetTop,
                $container = $el.closest('ul'),
                elementHeight = $el.outerHeight();

            $container.animate({
                scrollTop: selectedSlotOffsetTop - elementHeight
            }, 400);
        },

        getCurrentSelectedSlot: function($el) {
            var containerHeight = $el.outerHeight(), //180
            $items = $el.find('li'),
            elementHeight = $items.first().outerHeight(), //60
            scrollPos = $el.scrollTop(),
            targetPos = scrollPos + (containerHeight / 2),
            selectedIndex = Math.round(targetPos / elementHeight) - 2 //2 added to account for padding;

            $items.removeClass('selected');
            $items.eq(selectedIndex).addClass('selected');

            return $items.eq(selectedIndex).data('slot');
        },

        onEmailKeyUp: function (e) {
            var email = $(e.currentTarget).val();

            this.setState({ customer_email: email }, true);
        },

        onCancel: function (e) {
            this.setState({ screen: SCREEN_CITY });

            $.VashiDrawer.close();
        },

        onDone: function (e) {

            if (this.getCurrentScreen() === SCREEN_SUCCESS) {
                this.emitGAEvent('viewingsstepdone');
            }

            this.setState({ screen: SCREEN_CITY });

            $.VashiDrawer.close();
        },

        onBack: function (e) {
            switch (this.getCurrentScreen()) {
                case SCREEN_FORM:
                    this.setState({ 'screen': SCREEN_CITY });
                    break;

                case SCREEN_CONFIRM:
                    this.setState({ 'screen': SCREEN_FORM });
                    break;
            }
        },

        onConfirm: function (e) {
            switch (this.getCurrentScreen()) {
                case SCREEN_FORM:

                    this.clearErrors();

                    if (this.validate()) {
                        this.setState({ 'screen': SCREEN_CONFIRM });
                    }

                    break;

                case SCREEN_CONFIRM:

                    this.clearErrors();

                    if (this.validate()) {
                        this.submit(function (data) {

                            var success = _.get(data, 'success', false);
                            var errors  = _.get(data, 'errors', []);

                            this.setState({
                                errors: errors,
                                screen: (success ? SCREEN_SUCCESS : SCREEN_FORM),
                            });

                        }.bind(this));
                    } else {
                        this.setState({ 'screen': SCREEN_CONFIRM });
                    }

                    break;

                case SCREEN_SUCCESS:

                    this.setState({ 'screen': SCREEN_FORM });

                    break;
            }
        },

        onBeforeDrawerOpen: function () {
            // this ensures that this component is currently in the drawer
            if ($('.drawer__content .book-a-viewing').length === 1) {
                this.setState({ active: true });
            }
        },

        onBeforeDrawerClose: function () {
            this.setState({
                screen: SCREEN_CITY
            });
        },

        onAfterDrawerClose: function () {
            this.setState({
                active: false
            });
        },

        getAjaxUpdateUrl: function () {
            return this.getState('ajax_update_url');
        },

        getAjaxSubmitUrl: function () {
            return this.getState('ajax_submit_url');
        },

        getIsActive: function () {
            return this.getState('active', false);
        },

        getIsInitialRender: function () {
            return this.getState('initial_render', false);
        },

        getCurrentScreen: function () {
            return this.getState('screen');
        },

        getSelectedCity: function () {
            return this.getState('city');
        },

        getAllCities: function () {
            return this.getState('cities', []);
        },

        getSelectedDate: function () {
            return this.getState('date');
        },

        getMinDate: function () {
            return this.getState('min_date');
        },

        getMaxDate: function () {
            return this.getState('max_date');
        },

        getAllDates: function () {
            return this.getState('dates', []);
        },

        getSelectedSlot: function () {
            return this.getState('slot');
        },

        getAllSlots: function () {
            return this.getState('slots', []);
        },

        getSelectedStore: function () {
            return _.find(this.getValidStores(), function (store) {
                return this.getState('store') === store.id;
            }.bind(this));
        },

        getCustomerId: function () {
            return this.getState('customer_id', 0);
        },

        getCustomerEmail: function () {
            return this.getState('customer_email', '');
        },

        getValidStores: function () {
            return this.getStoresByCity(
                this.getSelectedCity()
            );
        },

        getStoresByCity: function (city) {
            return _.filter(this.getAllStores(), function (store) {
                return city === store.city;
            }.bind(this));
        },

        getAllStores: function () {
            return this.getState('stores', []);
        },

        getEarliestDayForYearAndMonth: function (year, month) {
            var day = -1;

            _.each(this.getAllDates(), function (date) {
                date = moment(date, 'Y-MM-DD');

                if (date.format('M') === month && date.format('Y') === year) {
                    day = date.format('D');

                    return false;
                }
            });

            return day;
        },

        getDatesForYearAndMonth: function (year, month) {
            var dates = [];

            _.each(this.getAllDates(), function (date) {
                date = moment(date, 'Y-MM-DD');

                if (date.format('M') === month && date.format('Y') === year) {
                    dates.push(date);
                }
            });

            return dates;
        },

        isValidStore: function () {
            return (typeof this.getSelectedStore() !== 'undefined');
        },

        isValidDate: function () {
            return this.getAllDates().indexOf(this.getSelectedDate()) !== -1;
        },

        isValidSlot: function () {
            return this.getAllSlots().indexOf(this.getSelectedSlot()) !== -1;
        },

        isValidCustomerEmail: function () {
            if (this.getCustomerId() > 0) {
                return true;
            }

            return /\S+@\S+\.\S+/.test(this.getCustomerEmail());
        },

        validate: function () {

            var errors = [];

            if (! this.isValidStore()) {
                errors.push(ERROR_INVALID_STORE);
            }

            if (! this.isValidDate()) {
                errors.push(ERROR_INVALID_DATE);
            }

            if (! this.isValidSlot()) {
                errors.push(ERROR_INVALID_SLOT);
            }

            if (! this.isValidCustomerEmail()) {
                errors.push(ERROR_INVALID_CUSTOMER_EMAIL);
            }

            this.setErrors(errors);

            return this.hasErrors() === false;
        },

        addError: function (error) {

            if (this.hasError(error)) {
                return;
            }

            var errors = this.getState('errors', []) || [];

            errors.push(error);

            this.setState({
                errors: errors
            });
        },

        hasError: function (error) {
            return this.getErrors().indexOf(error) !== -1;
        },

        setErrors: function (errors) {
            this.setState({ errors: (errors || []) });
        },

        getErrors: function () {
            return this.getState('errors', []);
        },

        hasErrors: function () {
            return this.getErrors().length > 0;
        },

        clearErrors: function () {
            this.setErrors([]);
        },

        update: function (data, success, error, complete) {

            $.VashiDrawer.setBusy();

            data = _.merge({}, {
                city: this.getSelectedCity(),
                date: this.getSelectedDate(),
                store: this.getSelectedStore().id,
                customer_email: this.getCustomerEmail()
            }, data);

            $.ajax({
                url: this.getAjaxUpdateUrl(),
                data: data,
                method: 'GET',
                error: function () {
                    if (typeof error === 'function') {
                        error.apply(this);
                    }
                }.bind(this),
                success: function (state) {
                    if (typeof success === 'function') {
                        success.apply(this, [state]);
                    }
                }.bind(this),
                complete: function () {

                    $.VashiDrawer.unsetBusy();

                    if (typeof complete === 'function') {
                        complete.apply(this);
                    }
                }.bind(this),
            });
        },

        submit: function (success, error, complete) {
            $.VashiDrawer.setBusy();

            var data = {
                city: this.getSelectedCity(),
                date: this.getSelectedDate(),
                slot: this.getSelectedSlot(),
                store: this.getSelectedStore().id,
                customer_email: this.getCustomerEmail()
            };

            $.ajax({
                url: this.getAjaxSubmitUrl(),
                data: data,
                method: 'GET',
                error: function () {
                    if (typeof error === 'function') {
                        error.apply(this);
                    }
                }.bind(this),
                success: function (data) {
                    if (typeof success === 'function') {
                        success.apply(this, [data]);
                    }
                }.bind(this),
                complete: function () {

                    $.VashiDrawer.unsetBusy();

                    if (typeof complete === 'function') {
                        complete.apply(this);
                    }
                }.bind(this),
            });
        },

        setState: function (state, bypassRender) {
            this.prevState = _.extend({}, this.state);
            this.state = _.extend({}, this.state, state);

            if (bypassRender !== true) {
                this.render();
            }
        },

        getState: function (path, def) {
            return _.get(this.state, path, def);
        },

        getPrevState: function (path, def) {
            return _.get(this.prevState, path, def);
        },

        isDiffState: function (path) {
            return this.getState(path, -1) !== this.getPrevState(path, -1);
        },

        render: function () {

            if (this.getIsActive() === false) {
                return;
            }

            this._switchScreen();
            this._decorateElements();
            this._toggleActionButtons();
            this._toggleEmailInput();

            this._populateDates();
            this._populateSlots();
            this._populateCities();
            this._populateStores();
            this._populateMonths();
            this._populateConfirmScreen();
            this._populateSuccessScreen();
            this._populateErrors();
            this.setActiveSlot(this.getCurrentSelectedSlot(this.$formScreen.find('.slot-picker ul')));

            if (this.getIsInitialRender()) {
                this.setState({ initial_render: false }, true);
            }
        },

        _switchScreen: function () {
            // we only continue if the screen key is different or
            // if this is the initial render
            if (! this.isDiffState('screen') && this.getIsInitialRender() === false) {
                return;
            }

            this.$container.show();
            this.$container.children('.screen').css('height', '10px');

            if (this.getCurrentScreen() === SCREEN_CITY) {
                $.VashiDrawer.setTitle(this.getState('translations.city_screen_title'));
                this.$cityScreen.css('height', 'auto');
                TweenLite.to(this.$container, 0.2, { x : 0 });
            }

            if (this.getCurrentScreen() === SCREEN_FORM) {
                this.emitGAEvent('viewingsstep1');
                $.VashiDrawer.setTitle(this.getSelectedCity());
                this.$formScreen.css('height', 'auto');
                TweenLite.to(this.$container, 0.2, { x : (this.$container.width() / 4) * -1 });
            }

            if (this.getCurrentScreen() === SCREEN_CONFIRM) {
                this.emitGAEvent('viewingsstep2');
                $.VashiDrawer.setTitle(this.getState('translations.confirm_screen_title'));
                this.$confirmScreen.css('height', 'auto');
                TweenLite.to(this.$container, 0.2, { x : (this.$container.width() / 4) * -2 });
            }

            if (this.getCurrentScreen() === SCREEN_SUCCESS) {
                this.emitGAEvent('ConfirmAppointment');
                $.VashiDrawer.setTitle(this.getState('translations.success_screen_title'));
                this.$successScreen.css('height', 'auto');
                TweenLite.to(this.$container, 0.2, { x : (this.$container.width() / 4) * -3 });
            }
        },

        _decorateElements: function() {
            this.$formScreen.find('.slot-picker').addClass('bottom-fade');
        },

        _toggleActionButtons: function () {

            if (this.getCurrentScreen() === SCREEN_CITY) {
                this.$btnBack.hide();
                this.$btnDone.hide();
                this.$btnCancel.show();
                this.$btnConfirm.hide();
            }

            if (this.getCurrentScreen() === SCREEN_FORM) {
                this.$btnBack.show();
                this.$btnDone.hide();
                this.$btnCancel.hide();
                this.$btnConfirm.show();
            }

            if (this.getCurrentScreen() === SCREEN_CONFIRM) {
                this.$btnBack.show();
                this.$btnDone.hide();
                this.$btnCancel.hide();
                this.$btnConfirm.show();
            }

            if (this.getCurrentScreen() === SCREEN_SUCCESS) {
                this.$btnBack.hide();
                this.$btnDone.show();
                this.$btnCancel.hide();
                this.$btnConfirm.hide();
            }
        },

        _toggleEmailInput: function () {
            if (this.getCustomerId() > 0) {
                this.$formScreen.find('div.email').hide();
            } else {
                this.$formScreen.find('div.email').show();
            }
        },

        _populateCities: function () {
            var $cities = this.$cityScreen.find('.city-picker ul').empty();

            var elements = [];

            _.each(this.getAllCities(), function (city) {

                var $li = $('<li />');

                $li.data('city', city);
                $li.text(city);

                if (city === this.getSelectedCity()) {
                    $li.addClass('selected');
                }

                elements.push($li);
            }.bind(this));

            $cities.append(elements);
        },

        _populateStores: function () {
            var $stores = this.$formScreen.find('.store-picker ul').empty();

            var elements = [];

            _.each(this.getValidStores(), function (store) {

                var $li = $('<li />');

                $li.data('store', store.id);
                $li.text(store.name);

                if (store.id === this.getSelectedStore().id) {
                    $li.addClass('selected');
                }

                elements.push($li);
            }.bind(this));

            $stores.append(elements);
        },

        _populateMonths: function () {

            var $months = this.$formScreen.find('.date-picker .month ul').empty();

            var date = moment(this.getSelectedDate(), 'Y-MM-DD');
            var min  = moment(this.getMinDate(), 'Y-MM-DD');
            var max  = moment(this.getMaxDate(), 'Y-MM-DD');

            var elements = [];

            while (min.format('M') <= max.format('M')) {
                var $li = $('<li />');

                $li.data('year', min.format('Y'));
                $li.data('month', min.format('M'));
                $li.text(min.format('MMM, Y'));

                if (date.format('M') === min.format('M')) {
                    $li.addClass('selected');
                }

                elements.push($li);

                min.add(1, 'month');
            }

            $months.append(elements);
        },

        _populateDates: function () {

            var $dates = this.$formScreen.find('.date-picker .date ul').empty();

            var date = moment(this.getSelectedDate(), 'Y-MM-DD');

            var dates = this.getDatesForYearAndMonth(date.format('Y'), date.format('M'));

            var elements = [];

            _.each(dates, function (_date) {
                var $li = $('<li />');

                $li.data('date', _date.format('Y-MM-DD'));
                $li.text(_date.format('Do'));

                if (date.format('Y-MM-DD') === _date.format('Y-MM-DD')) {
                    $li.addClass('selected');
                }

                elements.push($li);
            });

            $dates.append(elements);
        },

        _populateSlots: function () {
            var $slots = this.$formScreen.find('.slot-picker ul').empty();

            var elements = [];

            _.each(this.getAllSlots(), function (slot) {
                var $li = $('<li />');

                $li.data('slot', slot);
                $li.text(slot.substr(0, slot.length - 3));

                elements.push($li);
            });

            $slots.append(elements);
        },

        _populateConfirmScreen: function () {
            var store = this.getSelectedStore();

            if (! store) {
                return;
            }

            if (this.getCurrentScreen() !== SCREEN_CONFIRM) {
                return;
            }

            this.$confirmScreen.find('.selected-store .store-name').text(store.name);
            this.$confirmScreen.find('.selected-store .store-phone').text(store.phone);
            this.$confirmScreen.find('.selected-store .store-email').text(store.email);
            this.$confirmScreen.find('.selected-store .store-address').html(store.address.join('<br />'));

            this.$confirmScreen.find('.selected-date .date').text(moment(this.getSelectedDate(), 'Y-MM-DD').format('dddd, MMMM Do YYYY'));

            this.$confirmScreen.find('.selected-slot .slot').text(moment(this.getSelectedSlot(), 'HH:mm:ss').format('H:mma'));
        },

        _populateSuccessScreen: function() {

            var store = this.getSelectedStore();

            if (! store) {
                return;
            }

            if (this.getCurrentScreen() !== SCREEN_SUCCESS) {
                return;
            }

            this.$successScreen.find('.store-name').text(store.name);
        },

        _populateErrors: function () {
            if (!this.hasErrors()) {
                $('.drawer .drawer__error').empty();
                this.$formScreen.find('.customer-email').removeClass('highlight');
                this.$formScreen.find('.email-error').empty();
                return;
            }

            var errorArray = [];
            _.each(this.getErrors(), function(error) {
                switch (error) {
                    case ERROR_INVALID_CUSTOMER_EMAIL:
                        this.showEmailError(this.translate(error));
                        break;
                    default:
                        errorArray.push(this.translate(error));
                }
            }.bind(this));

            if (!errorArray.length) {
                return;
            }

            var errorString = errorArray.join('<br/>');
            this.showFormError(errorString);
        },

        showFormError: function(message) {
            var classes = 'drawer__error--message';
            var p = $('<p/>');

            p.addClass(classes);
            p.html(message);

            $('.drawer .drawer__error').html(p);

            setTimeout(function() {
                p.remove();
            }, 5000);
        },

        showEmailError: function(message) {
            this.$formScreen.find('.email-error').empty().text(message);
            this.$formScreen.find('.customer-email').addClass('highlight');
            this.scrollDrawer(this.$formScreen.find('.email-error'));
        },

        translate: function(key) {
            var path = 'translations.' + key;
            return this.getState(path, key);
        },

        scrollDrawer: function($element) {
            $('.drawer__contentcontainer').animate({
                scrollTop: $element[0].offsetTop
            }, 400);
        },

        emitGAEvent: function (event) {

            if (typeof event !== 'string' || ! event.length) {
                return;
            }

            if (typeof ga === 'undefined') {
                return;
            }

            try {
                // ga('send', 'event', eventCategory, eventAction, eventLabel);
                ga('send', 'event', event, 'click', event);
            } catch (e) {
                // handle gracefully
            }
        }
    });

    $.fn.VashiDrawerContentBookAViewing = function (state) {
        this.each(function (index, el) {
            new VashiDrawerContentBookAViewing($(el), (state || {}));
        });
    };
}(jQuery));
