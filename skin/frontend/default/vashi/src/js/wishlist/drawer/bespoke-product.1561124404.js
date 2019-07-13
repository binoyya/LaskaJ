(function(w, $) {

    var defaultState = {
        image: '',
        price: '',
        item_id: 0,
        product: {},
        options: [],
        ring_size: '',
        ring_sizes: [],
    };

    var VashiWishlistDrawerBespokeProduct = function ($root, state) {
        this.init($root, state);
    };

    _.extend(VashiWishlistDrawerBespokeProduct.prototype, {
        init: function ($root, state) {

            if (!$root.length) {
                return;
            }

            this.state = this.prevState = _.extend({}, {
                // initial state
                active: false,
                initial_render: true
            }, defaultState, state);

            this.initElements($root);

            $(function () {
                this.initEventHandlers();
            }.bind(this));

            this.render();
        },

        initElements: function ($root) {
            // containers
            this.$root = $root;
            this.$container = $root.find('.bespoke-product-drawer-container');

            // data
            this.$title = $root.find('.bespoke-product__title');

            // form
            this.$sizes         = $root.find('.bespoke-product__sizes');
            this.$customOptions = $root.find('.bespoke-product__options');
            this.$imageUploader = $root.find('.bespoke-product__upload');
            this.$imagePreview  = $root.find('.bespoke-product__preview');

            // buttons
            this.$btnCancel  = $root.find('.btn-cancel');
            this.$btnConfirm = $root.find('.btn-confirm');
        },

        initEventHandlers: function () {

            $('body').on('click', '.wishlist-bespoke-product-drawer-trigger', this.show.bind(this));

            $.VashiDrawer.on('before_open', this.onBeforeDrawerOpen.bind(this));

            $.VashiDrawer.on('before_close', this.onBeforeDrawerClose.bind(this));

            $.VashiDrawer.on('after_close', this.onAfterDrawerClose.bind(this));

            this.$btnCancel.on('click', this.onCancel.bind(this));

            this.$btnConfirm.on('click', this.onConfirm.bind(this));

            this.$sizes.on('click', 'li', this.onSizeClick.bind(this));

            this.$customOptions.on('keyup', 'input, textarea', this.onCustomOptionKeyup.bind(this));

            this.$imageUploader.on('change', 'input', this.onImageUpload.bind(this));
        },

        show: function (e) {
            var a = $('<a />');

            a.data('drawer', 'bespoke-product-drawer-wrapper');
            a.data('title', this.translate('add_to_wishlist'));

            $.VashiDrawer.init({
                preventDefault: function () { },
                currentTarget: a[0]
            }, a);

            setTimeout(function () {
                this.setState({ active: true });

                setTimeout(function () {

                    var id = $(e.currentTarget).data('item');

                    if (id) {

                        this.setState({ item_id: id }, true);

                        this._populateForm(id);
                    }

                }.bind(this), 0);

            }.bind(this), 10);
        },

        onBeforeDrawerOpen: function () {
            // this ensures that this component is currently in the drawer
            if ($('.drawer__content .bespoke-product-drawer').length === 1) {
                this.setState({ active: true });
            }
        },

        onBeforeDrawerClose: function () {
            // do stuff
        },

        onAfterDrawerClose: function () {
            this.setState({
                active: false
            });
        },

        onCancel: function () {
            $.VashiDrawer.close();
        },

        onConfirm: function (e) {
            e.preventDefault();

            if (! this.validate()) {
                return;
            }

            var data = new FormData();

            this.$customOptions.find('input, textarea').each(function (index, field) {
                var $field = $(field);

                data.append($field.attr('name'), $field.val());
            });

            data.append('item_id', this.getItemId());
            data.append('ring_size', this.getSelectedRingSize());
            data.append('product_id', this.getProductId());

            try {
                var image = this.$container.find('#wishlist_image')[0].files[0];

                if (image) {
                    data.append('image', image);
                }
            } catch (e) {
                // handle gracefully
            }

            $.VashiDrawer.setBusy();

            $.ajax({
                url: this.getState('config.add_to_wishlist_url'),
                data: data,
                method: 'POST',
                processData: false,
                contentType: false
            }).done(function () {

                window.location.reload();

            }).fail(function () {

                $.VashiDrawer.unsetBusy();

            });
        },

        onSizeClick: function (e) {
            var size = $(e.currentTarget).data('size');

            if (size === this.getSelectedRingSize()) {
                return;
            }

            this.hideValidationAdvice(this.$sizes);

            this.setState({ ring_size: size });
        },

        onCustomOptionKeyup: function (e) {
            var $input = $(e.target);
            if ($input.hasClass('highlight')) {
                this.hideValidationAdvice($input);
            }
        },

        onImageUpload: function (e) {

            if (! e.target.files || ! e.target.files[0]) {
                return;
            }

            var reader = new FileReader();

            // noinspection HtmlRequiredAltAttribute,RequiredAttributes
            var $img = $('<img />');

            reader.onloadend = function (e) {
                $img.attr('src', _.get(e, 'target.result'));
            };

            reader.readAsDataURL(e.target.files[0]);

            this.$imagePreview.empty().append($img);
        },

        showValidationAdvice: function ($el) {
            $el.addClass('highlight');
            $el.after(
                $('<span />').addClass('product-options__error').text('This is a required field.')
            );
        },

        hideValidationAdvice: function ($el) {
            $el.removeClass('highlight');
            $el.siblings('.product-options__error').remove();
        },

        validate: function () {
            var $inputs = this.$customOptions.find('input, textarea');
            var isValid = true;

            if (!this.$sizes.find('li.selected').length) {
                if (this.$sizes.hasClass('highlight')) {
                    return;
                }

                this.showValidationAdvice(this.$sizes);
                isValid = false;
            }

            _.each($inputs, function (input) {
                var $input = $(input);
                if ($input.hasClass('required') && $input.val() === '') {
                    if ($input.hasClass('highlight')) {
                        isValid = false;
                        return;
                    }

                    this.showValidationAdvice($input);

                    isValid = false;
                }
            }.bind(this));

            return isValid;
        },

        getItemId: function () {
            return this.getState('item_id');
        },

        getProductId: function () {
            return this.getState('product.id');
        },

        getSelectedRingSize: function () {
            return this.getState('ring_size', '');
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

        getIsActive: function () {
            return this.getState('active') === true;
        },

        getIsInitialRender: function () {
            return this.getState('initial_render') === true;
        },

        render: function () {

            if (this.getIsActive() === false) {
                return;
            }

            this._populateProductName();
            this._populateProductSizes();

            if (this.isDiffState('price')) {
                this.$customOptions.find('input[name="price"]').val(this.getState('price'));
            }

            if (this.isDiffState('active')) {
                this._reset();
            }

            if (this.getIsInitialRender()) {
                this.setState({ initial_render: false }, true);

                // we only want to do this initially
                this.$btnCancel.show();
                this.$btnConfirm.show();

                this._populateProductCustomOptions();
                this._populateProductCustomPrice();
                this._populateImageUploader();
            }
        },

        _reset: function () {

            this.$customOptions.find('input, textarea').each(function (index, el) {
                var $el = $(el);

                $el.val('');
            });

            this.setState({ ring_size: '', price: '', item_id: 0 }, true);
        },

        _populateProductName: function() {
            this.$title.empty().text(this.getState('product.name'));
        },

        _populateProductSizes: function() {
            var $sizes = this.$sizes.empty();

            var elements = [];

            _.each(this.getState('ring_sizes'), function(size){
                var $li = $('<li />');

                $li.data('size', size);
                $li.text(size);

                if (this.getSelectedRingSize() === size) {
                    $li.addClass('selected');
                }

                elements.push($li);
            }.bind(this));

            $sizes.append(elements);
        },

        _populateProductCustomOptions: function() {
            var elements = [];

            _.each(this.getState('options'), function (option) {
                elements.push(
                    this._createField({
                        name: 'options[' + option.option_id + ']',
                        type: option.type,
                        title: option.title,
                        required: option.required,
                    })
                );
            }.bind(this));

            this.$customOptions.append(elements);
        },

        _populateProductCustomPrice: function () {
            var $field = this._createField({
                name: 'price',
                type: 'field',
                title: 'Price',
                required: true,
            });

            this.$customOptions.append($field);
        },

        _populateImageUploader: function () {
            var $uploader = this.$imageUploader.empty();

            var $label = $('<label>' + this.translate('upload_an_image') + '</label>').attr('for', 'wishlist_image');

            var $input = $('<input />').attr({
                'id': 'wishlist_image',
                'type': 'file',
                'name': 'option[image]',
                'accept': 'image/png, image/jpeg, image/jpg',
            });

            $uploader.append($input, $label);
        },

        _populateForm: function (itemId) {
            var data = _.find(_.get(window, 'wishlist_items', []), function (item) {
                return itemId === item.item_id;
            });

            if (! data) {
                return;
            }

            var state = {};

            _.forEach(_.get(data, 'options', {}), function (option, key) {

                var id = parseInt(key.split('_')[1]);

                if (id) {
                    this._populateOption(id, option);
                } else {

                    if (key === 'option_ringsize') {
                        state.ring_size = option.value;
                    }

                    if ((key === 'option_price')) {
                        state.price = option.value;
                    }
                }
            }.bind(this));

            this.setState(state);
        },

        _populateOption: function (optionId, data) {
            this.$customOptions.find('textarea, input').each(function (index, el) {

                var $el  = $(el);
                var name = 'options[' + optionId + ']';

                if ($el.attr('name') === name) {
                    $el.val(data.value);
                }
            });
        },

        _createField: function (data) {

            if (! data.id) {
                data.id = 'wishlist_item_field' + this.hash(data.name);
            }

            var $input, $wrapper, $label;

            if (data.type === 'field') {

                $input = $('<input />').attr({
                    'type': 'text',
                    'name': data.name,
                    'class': data.required ? 'required' : null,
                    'placeholder': data.title,
                    'id': data.id,
                });

                $wrapper = $('<li></li>');
                $label = $('<label></label>').attr('for', data.id).text(data.title);

                $wrapper.html([$label, $input]);

                return $wrapper;

            } else if (data.type === 'area') {

                $input = $('<textarea />').attr({
                    'name': data.name,
                    'class': data.required ? 'required' : null,
                    'placeholder': data.title,
                    'id': data.id,
                    'maxlength': 500,
                });

                $wrapper = $('<li></li>');
                $label = $('<label></label>').attr('for', data.id).text(data.title);

                $wrapper.html([$label, $input]);

                return $wrapper;

            }
        },

        hash: function (s) {
            return s.split('').reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0); // jshint ignore:line
        },

        translate: function(key) {
            return this.getState('translations.' + key, key);
        }
    });

    $.fn.VashiWishlistDrawerBespokeProduct = function (state) {
        this.each(function (index, el) {
            new VashiWishlistDrawerBespokeProduct($(el), (state || {}));
        });
    };

})(window, jQuery);
