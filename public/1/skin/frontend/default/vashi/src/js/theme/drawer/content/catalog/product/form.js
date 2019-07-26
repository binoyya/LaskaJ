(function ($) {

    /**
     * Handles add to cart actions & validates form
     *
     * @param {VashiDrawerContentCatalogProductForm} $instance
     * @constructor
     */
    var VashiDrawerContentCatalogProductAddToCart = function ($instance) {
        this.init($instance);
    };

    _.extend(VashiDrawerContentCatalogProductAddToCart.prototype, {
        init: function ($instance) {
            this.$instance = $instance;

            this.actions();
        },

        actions: function () {
            var fnUpdate = function (instance, data) {
                if (data !== false) {
                    this.toggleDisabled();
                }
            };

            /**
             * update/query fail
             * this is typically due to the product not being configurable
             * however, simple products may have custom options
             * therefore we validate the form (toggleDisabled) before enabling the add to cart button
             *
             * @param instance
             * @param data
             */
            var fnFailed = function (instance, data) {
                if (data === true) {
                    fnUpdate.apply(this, [instance, data]);
                }
            };

            this.$instance.on('after_update', fnUpdate.bind(this));

            this.$instance.on('failed_update', fnFailed.bind(this));

            this.$instance.$btnAddToCart.on('click', this.add.bind(this));
        },

        add: function () {
            var $instance = this.$instance;

            this.addButton();

            if (this.isValid()) {
                $.event.trigger({type: 'form-valid'});

                $instance.$form.submit();

                return;
            }

            this.$instance.setState({
                error: 'Please select all required options.'
            });

            $instance.$btnCustomise.trigger('click');
        },

        isValid: function () {
            var valid = true;

            this.$instance.$form.find('.required').each(function () {
                var val = $(this).val();

                if (val === '' || val === null) {
                    valid = false;
                }
            });

            return valid;
        },

        toggleDisabled: function () {
            var $instance = this.$instance;

            if (this.isValid() || $instance.$btnConfirm.text() === 'Confirm') {
                $instance.$btnConfirm.attr('disabled', false);

                return;
            }

            $instance.$btnConfirm.attr('disabled', true);
        },

        addButton: function () {
            this.$instance.$btnConfirm.text('Add to basket');
            this.$instance.$btnConfirm.attr('disabled', true);
            this.$instance.$btnConfirm.unbind('click').on('click', this.add.bind(this));
        }
    });


    /**
     * Handles option menu actions
     *
     * @param {VashiDrawerContentCatalogProductForm} $instance
     * @constructor
     */
    var VashiDrawerContentCatalogProductOptionMenu = function ($instance) {
        this.init($instance);
    };

    _.extend(VashiDrawerContentCatalogProductOptionMenu.prototype, {

        init: function ($instance) {
            this.$instance = $instance;
            this.setDefaultValues();
            this.actions();
            this.reset();
        },

        setDefaultValues: function () {
            var $instance = this.$instance;

            if ($instance.$config === false) {
                $instance.$config = {
                    values: {},
                    config: {}
                }
            }

            if (typeof $instance.$config.values !== 'object') {
                $instance.$config.values = {};
            }

            var metal = this.getUrlParam('metal');
            if (metal > 0) {
                $instance.$config.values[166] = metal;
            }

            var $this = this;

            $instance.$container.find('select[name^="super_attribute"]').each(function () {
                var attrId = $(this).attr('name').replace(/\D/g, '');
                if (typeof $instance.$config.values[attrId] !== 'undefined' && ! $this.isOptionAvailable(attrId, $instance.$config.values[attrId])) {
                    $instance.$config.values[attrId] = undefined;
                }
                if (typeof $instance.$config.values[attrId] === 'undefined') {
                    var options = $(this).find('option');
                    options.each(function () {
                        var optionId = $(this).val();
                        if ($this.isOptionAvailable(attrId, optionId)) {
                            $instance.$config.values[attrId] = optionId;
                            return false;
                        }
                    });
                }
            });

            Object.keys($instance.$config.values).forEach(function (attrId) {
                $instance.$container.find('select[name="super_attribute[' + attrId + ']"]')
                    .first()
                    .val($instance.$config.values[attrId]);
            });

            $instance.$container.find('select, textarea').not('[name^=super_attribute]')
                .each(function () {
                    $(this).val('');
                });
        },

        isOptionAvailable: function (attrId, optionId) {
            var $instance = this.$instance;
            var attr = $instance.$config.config.attributes[attrId];
            var isAvailable = false;
            attr.options.forEach(function (option) {
                if (option.id === optionId) {
                    if (option.products.length > 0) {
                        var stock = 0;
                        option.products.forEach(function (productId) {
                            stock += parseInt($instance.$config.config.stock[productId]);
                        });
                        if (stock > 0) {
                            isAvailable = true;
                        }
                    }
                }
            });
            return isAvailable;
        },

        getUrlParam: function (param) {
            var pageUrl = window.location.search.substring(1);
            var urlParams = pageUrl.split('&');
            for (var i = 0; i < urlParams.length; i++) {
                var parts = urlParams[i].split('=');
                if (parts[0] === param) {
                    return parts[1];
                }
            }
            return 0;
        },

        actions: function () {
            var $instance = this.$instance;

            fn = function () {
                var elem = $(this);
                var ul = $('ul[data-menu-label="' + elem.data('menu-label') + '"]');
                var option = elem.find('.drawer__list__label').text();

                $instance.setState({
                    code: ul.data('attribute_code'),
                    option: option
                });

                $('ul[data-menu-label]').hide();

                ul.show();

                $instance.hideHelpers();

                $instance.$helpers.find('a[data-option="' + option + '"]').first().show();
            };

            $instance.$menu.find('li').on('click', fn);

            $instance.$btnResetAll.on('click', this.reset.bind(this));

            $.VashiDrawer.on('after_open', function () {
                var option = $instance.$container.find('.drawer__product-form__list .drawer__list:visible').first().attr('data-menu-label');
                $instance.$helpers.find('a[data-option="' + option + '"]').first().show();
            });
        },

        reset: function () {
            this.setDefaultValues();

            var reset = function () {
                var elm = $(this);
                var opt = elm.data('menu-label').trim();
                var txt = $('select[data-menu-label="' + opt + '"] option:selected').first().text();

                elm.find('.current-selection').text(txt);
                if (txt.length > 0) {
                    elm.addClass('drawer__list__item--answered');
                } else {
                    elm.removeClass('drawer__list__item--answered');
                }
            };

            this.$instance.$menu.find('li').each(reset);

            $.event.trigger({type: 'form-reset'});
        }
    });

    /**
     * Filters out available options
     *
     * @param {VashiDrawerContentCatalogProductForm} $instance
     * @constructor
     */
    var VashiDrawerContentCatalogProductAvailableOptions = function ($instance) {
        if ($instance.$config === false) {
            return;
        }
        this.init($instance);
    };

    _.extend(VashiDrawerContentCatalogProductAvailableOptions.prototype, {

        init: function ($instance) {
            this.$instance = $instance;
            this.reset();
            this.actions();
            this.filter();
        },

        actions: function () {
            var $instance = this.$instance;

            $instance.$menu.find('li').on('click', this.filter.bind(this));
        },

        /**
         * Remove all "unavailable" classes before the filter method re-applies them.
         * Set the value of the current attribute's select AND any after it to be empty.
         */
        reset: function () {
            var $instance = this.$instance;
            $instance.$container.find('.drawer__list__item--unavailable')
                .removeClass('drawer__list__item--unavailable');

            $instance.$container.find('.drawer__list__item.selected').removeClass('selected');

            var code = $instance.getState('code');
            if (code === null || code === undefined) {
                return true;
            }

            var codes = [];
            $instance.$form.find('select[data-attribute-code]').each(function () {
                var attrCode = $(this).data('attribute-code');
                codes.push(attrCode);
            });

            var codeIndex = codes.indexOf(code);
            var x;
            for (x = codeIndex; x < codes.length; x++) {
                $instance.$form.find('select[data-attribute-code="' + codes[x] + '"]')
                    .first()
                    .val('');

                var label = $instance.$container
                    .find('.drawer__product-form__list .drawer__list[data-attribute_code="' + codes[x] + '"]')
                    .first()
                    .attr('data-menu-label');

                $instance.$container.find('.drawer__list__item[data-menu-label="' + label + '"]')
                    .removeClass('drawer__list__item--answered')
                    .first()
                    .find('.current-selection').first().html('');
            }

        },

        /**
         * Filter all products by the chosen selections to disable unavailable options
         */
        filter: function () {
            this.reset();

            var $instance = this.$instance;
            var products = [];

            /**
             * Get a unique list of all products to be filtered
             */
            Object.values($instance.$config.config.attributes).forEach(function (attr) {
                attr.options.forEach(function (option) {
                    products = products.concat(option.products);
                });
            });

            /**
             * Filter down the list of products to only include all products that are;
             * - filtered by the previous attributes in the list
             * - have all of the current attribute options products available
             */
            $instance.$form.find('select[data-attribute-code]').each(function () {
                var attrCode = $(this).data('attribute-code');
                if (attrCode === null) {
                    return true;
                }

                var attrVal = $(this).val();
                if (attrVal === '' || attrVal === null) {
                    return true;
                }

                Object.values($instance.$config.config.attributes).forEach(function (attr) {
                    if (attr.code === attrCode) {
                        attr.options.forEach(function (option) {
                            if (option.id === attrVal) {
                                products = products.filter(function(value) {
                                    return -1 !== option.products.indexOf(value);
                                });
                            }
                        });
                    }
                });
            });

            /**
             * Filter out the out of stock products
             */
            products.forEach(function (productId, index, object) {
                var inStock = $instance.$config.config.stock[productId] === "1";
                if (!inStock) {
                    object.splice(index, 1);
                }
            });

            /**
             * Get all attribute options that have available products
             */
            var validAttributeOptions = {};
            Object.values($instance.$config.config.attributes).forEach(function (attr) {
                validAttributeOptions[attr.code] = [];

                $instance.$config.config.attributes[parseInt(attr.id)].options.forEach(function (attrOption) {

                    var common = products.filter(function(value){
                        return -1 !== attrOption.products.indexOf(value);
                    });

                    if (common.length > 0) {
                        validAttributeOptions[attr.code].push(attrOption.label);
                    }
                });

            });

            /**
             * Make all invalid attribute options unavailable
             */
            Object.keys(validAttributeOptions).forEach(function (attrCode) {
                var $list = $instance.$container.find('.drawer__product-form__list .drawer__list[data-attribute_code="' + attrCode + '"]').first();
                if ($list.length > 0) {
                    $list.find('li').each(function () {
                        var optionText = $(this).find('.drawer__list__label').first().text();
                        if (validAttributeOptions[attrCode].indexOf(optionText) === -1) {
                            $(this).addClass('drawer__list__item--unavailable');
                        }
                    });
                }
            });
        }
    });


    /**
     * Handles option list rendering and actions
     *
     * @param {VashiDrawerContentCatalogProductForm} $instance
     * @constructor
     */
    var VashiDrawerContentCatalogProductOptionList = function ($instance) {
        this.init($instance);
    };

    _.extend(VashiDrawerContentCatalogProductOptionList.prototype, {

        init: function ($instance) {
            this.$instance = $instance;

            this.render();
            this.actions();

            $instance.$item = $instance.$list.find('.drawer__list__item');

            this.reset.bind($instance)();
        },

        actions: function () {
            var $instance = this.$instance;

            var fn = function () {
                var elm = $(this);
                if (elm.hasClass('drawer__list__item--unavailable')) {
                    return;
                }
                var idx = elm.parent().index();
                var txt = elm.find('.drawer__list__label').text();

                if (!txt) {
                    return;
                }

                $instance.$btnGoBack.hide();
                $instance.$btnUpdate.show();

                var li = $instance.$menu.find('li').eq(idx);
                li.find('.current-selection').html(txt);

                if (txt.length > 0) {
                    li.addClass('drawer__list__item--answered');
                } else {
                    li.removeClass('drawer__list__item--answered');
                }
            };

            $instance.$list.find('li').on('click', fn);

            $instance.$list.find('li').on('click', this.select);

            $instance.$btnResetAll.on('click', this.reset.bind($instance));
        },

        select: function () {
            var elem = $(this);
            if (elem.hasClass('drawer__list__item--unavailable')) {
                return;
            }

            var ul = elem.parent();

            if (!ul.hasClass('non-selectable')) {
                elem.parent().find('li.selected').removeClass('selected');
                elem.addClass('selected');
            }
        },

        reset: function () {
            var ul = this.$list.parent();

            ul.find('.selected').removeClass('selected');

            ul.each(function () {
                var $this = $(this);

                if (!$this.hasClass('non-selectable')) {
                    var li = $this.find('li').first();

                    li.addClass('selected');
                }
            });
        },

        create: function (elm) {
            var ul = $('<ul/>');
            ul.addClass('drawer__list');
            ul.attr('data-super_attribute', elm.attr('name'));
            ul.attr('data-attribute_code', elm.data('attribute-code'));
            ul.attr('data-menu-label', elm.data('menu-label'));
            ul.hide();

            var elmName = elm.attr('name');
            var self = this;

            var options = elm.find('option');

            if (options.length > 0) {
                options.each(function () {
                    var val = $(this).val();

                    var canRender = true;

                    if (elmName.indexOf('super_attribute') > -1) {
                        var attrId = elmName.replace(/\D/g, '');
                        if (! self.optionHasProducts(attrId, val)) {
                            canRender = false;
                        }
                    }

                    if (! canRender) {
                        return true;
                    }

                    var span = $('<span/>');
                    span.addClass('drawer__list__label');
                    span.text($(this).text());

                    var li = $('<li/>');
                    li.data('value', val);
                    li.addClass('drawer__list__item');
                    li.wrapInner(span);

                    if (val === '') {
                        li.hide();
                    }

                    ul.append(li);
                });

                return ul;
            }

            var h3 = $('<h3/>');
            h3.text(elm.data('menu-label'));

            var li = $('<li/>');
            li.addClass('drawer__list__item');
            li.append(h3);
            li.append(this.clone(elm));

            ul.addClass('non-selectable');
            ul.append(li);

            return ul;
        },

        clone: function (elm) {
            var $this = this;
            var clone = elm.clone();

            clone.attr('id', elm.attr('id') + '-clone');

            clone.keyup(function () {
                var that = $(this);
                var text = $this.stripEmojiCode(that.val());

                elm.val(text);

                that.val(text);

                var li = $this.$instance.$menu.find('li[data-menu-label="' + elm.data('menu-label') + '"]');

                li.find('.current-selection').html(text);
                if (text.length > 0) {
                    li.addClass('drawer__list__item--answered');
                } else {
                    li.removeClass('drawer__list__item--answered');
                }
            });

            clone.keydown(function () {
                $this.$instance.$btnGoBack.hide();
                $this.$instance.$btnUpdate.show();
            });

            return clone;
        },

        stripEmojiCode: function (txt) {
            if (typeof emojiStrip !== 'function') {
                return txt;
            }

            return emojiStrip(txt);
        },

        helper: function (elm) {
            var helperText = elm.data('helper-text'),
                helperContent = elm.data('helper-content'),
                helperClass = elm.data('helper-class');

            if (helperText === undefined || helperContent === undefined || helperClass === undefined) {
                return '';
            }

            var helper = $('<a/>');
            helper.hide();
            helper.addClass('drawer-trigger');
            helper.attr('data-option', elm.data('menu-label'));
            helper.attr('data-drawer', helperContent);
            helper.attr('data-drawer-root-class', helperClass);
            helper.attr('data-title', helperText);
            helper.html(helperText);
            helper.bind('click', function () {
                $(this).hide();
            });
            helper.VashiDrawer();

            return helper;
        },

        optionHasProducts: function (attrId, optionId) {
            var $instance = this.$instance;
            var attr = $instance.$config.config.attributes[attrId];
            var hasProducts = false;
            attr.options.forEach(function (option) {
                if (option.id === optionId) {
                    hasProducts = option.products.length > 0;
                }
            });
            return hasProducts;
        },

        render: function () {
            var $this = this;
            var $instance = this.$instance;

            $instance.$form.find('select, textarea').each(function () {
                $instance.$helpers.append($this.helper($(this)));
                $instance.$list.append($this.create($(this)));
            });

            $instance.$form.hide();
        }
    });


    /**
     * Handles updating the product form, option lists and actions
     *
     * @param {VashiDrawerContentCatalogProductForm} $instance
     * @constructor
     */
    var VashiDrawerContentCatalogProductFormUpdater = function ($instance) {
        this.init($instance);
    };

    _.extend(VashiDrawerContentCatalogProductFormUpdater.prototype, {

        init: function ($instance) {
            this.$instance = $instance;

            this.actions();
        },

        actions: function () {
            var $this = this;

            var fn = function () {
                $this.select.bind($this.$instance)(this);
            };

            $this.$instance.$item.on('click', fn);
        },

        select: function (elem) {
            elem = $(elem);

            var attr = elem.parents('ul').data('super_attribute');
            var select = this.$form.find('select[name="' + attr + '"]');

            select.val(elem.data('value'));
        }
    });


    /**
     * Handles updating the drawer interface, dependant elements and actions
     *
     * @param {VashiDrawerContentCatalogProductForm} $instance
     * @constructor
     */
    var VashiDrawerContentCatalogProductInterfaceUpdater = function ($instance) {
        this.init($instance);
    };

    _.extend(VashiDrawerContentCatalogProductInterfaceUpdater.prototype, {

        init: function ($instance) {
            this.$instance = $instance;

            this.actions();
            this.query();
        },

        actions: function () {
            $(document).on('form-reset', this.query.bind(this));

            this.$instance.$btnUpdate.on('click', this.query.bind(this));
        },

        hideProductLoading: function () {
            $('.product__loading').hide();
        },

        getQueryParameters: function () {
            var parameters = '';
            this.$instance.$form.find('select[name^=super_attribute]').each(function () {
                parameters += $(this).data('attribute-code') + '=' + $(this).find('option:selected').text() + '&';
            });

            parameters += "productId=" + this.$instance.$form.find('input[name^=product]').val();

            return parameters;
        },

        query: function () {
            this.$instance.hideHelpers();
            if (this.$instance.$container.data('product-type') !== 'configurable') {
                this.$instance.setState({
                    error: '',
                    option: null,
                    code: null
                });

                this.hideProductLoading();

                this.$instance.emit('failed_update', true);

                return;
            }

            var parameters = this.getQueryParameters();
            var onComplete = function (response) {
                response = JSON.parse(response.responseText);

                var isSaleable = response.salable !== false && response.sku !== null;

                if (!isSaleable) {
                    this.$instance.setState({
                        option: null,
                        error: 'The options selected are currently unavailable.'
                    });

                    this.hideProductLoading();

                    $.VashiDrawer.unsetBusy();

                    this.$instance.emit('after_update', false);

                    return;
                }

                var params = {};
                parameters.split('&').forEach(function (arg) {
                    var parts = arg.split('=');
                    params[parts[0]] = parts[1];
                });

                this.$instance.emit('after_update', {response: response, request: params});

                this.hideProductLoading();

                this.$instance.setState({
                    error: '',
                    option: null,
                    code: null
                });

                $.VashiDrawer.unsetBusy();
            };

            $.VashiDrawer.setBusy();

            new Ajax.Request('configurablesimples/index/index.html', {
                method: 'GET',
                parameters: parameters,
                onComplete: onComplete.bind(this)
            });

            return false;
        }
    });


    /**
     * Handles updating the product specs information
     *
     * @param {VashiDrawerContentCatalogProductForm} $instance
     * @constructor
     */
    var VashiDrawerContentCatalogProductSpecsUpdater = function ($instance) {
        this.init($instance);
    };

    _.extend(VashiDrawerContentCatalogProductSpecsUpdater.prototype, {

        /**
         * This could really do with being refactored so that the data comes from the backend, potentially as part
         * of the ajax response or in some way can be rendered to be similar to catalog/product/view/attributes.phtml
         * but at the time of writing and due to the complexity and deadlines we cannot do this right now.
         *
         * @param $instance
         */
        init: function ($instance) {
            this.$instance = $instance;

            this.$table = $('#productDetailsList .data-specs');
            if (this.$table.length === 0) {
                $('#productDetailsList').append(
                    $('<table/>').addClass('data-specs')
                        .append(
                            $('<tbody/>')
                        )
                );
                this.$table = $('#productDetailsList .data-specs');
            }

            this.specs = {
                metal: 'Metal',
                rhodium: 'Rhodium',
                band_width: 'Band Width',
                band_weight: 'Weight',
                profile: 'Profile',
                cs_shape: 'Shape',
                cs_carat_weight: 'Carat Weight',
                cs_colour: 'Colour',
                cs_cut: 'Cut',
                cs_setting: 'Setting',
                ss_count: 'Number Of Side Stones',
                ss_shape: 'Shape',
                ss_carat_weight: 'Carat Weight',
                ss_colour: 'Colour',
                ss_clarity: 'Clarity',
                ss_cut: 'Cut',
                ss_setting: 'Setting',
                ss_metal: 'Metal',
                shape: 'Shape',
                carat: 'Carat',
                color: 'Colour',
                clarity: 'Clarity',
                cut: 'cut',
                backing: 'backing',
                approx_weight: 'Approx. Weight',
                chain_type: 'Chain Type',
                prong_metal: 'Prong Metal',
                gs_count: 'Number Of Gem Stones',
                gs_type: 'Type',
                gs_shape: 'Shape',
                gs_size: 'Size',
                gs_colour: 'Colour',
                gs_clarity: 'Clarity',
                gs_cut: 'Cut',
                gs_setting: 'Setting',
                pearl_count: 'Number Of Pearls',
                pearl_type: 'Type',
                pearl_shape: 'Shape',
                pearl_lustre: 'Lustre',
                pearl_markings: 'Markings',
                pearl_uniformity: 'Uniformity'
            };

            this.actions();
        },

        getAttributeRow: function (attr, create) {
            var $tbody = this.$table.find('tbody').first();
            var $row = $tbody.find('td.' + attr);
            if ($row.length === 1) {
                return $row.parent();
            }
            if (create === false) {
                return false;
            }
            $row = $('<tr/>');
            $row.append($('<td/>').addClass(attr));
            $row.append($('<td/>'));
            $tbody.append($row);
            return this.getAttributeRow(attr);
        },

        updateSpec: function (attr, val) {
            var row;
            if (typeof val === 'undefined' || val === null || val === '') {
                row = this.getAttributeRow(attr, false);
            } else {
                row = this.getAttributeRow(attr);
            }
            if (row === false) {
                return;
            }
            var cells = row.find('td');
            if (typeof cells[0] !== 'undefined') {
                if ($(cells[0]).html().trim().length === 0) {
                    $(cells[0]).html(this.specs[attr]);
                }
            }
            if (typeof cells[1] !== 'undefined') {
                $(cells[1]).html(val);
            }
        },

        emptySpec: function (attr) {
            var row = this.getAttributeRow(attr, false);
            if (row === false) {
                return;
            }
            var cells = row.find('td');
            if (typeof cells[1] !== 'undefined') {
                $(cells[1]).html('');
            }
        },

        actions: function () {
            var fn = function (data) {
                if (data === false) {
                    Object.keys(this.specs).forEach(function (attr) {
                        this.emptySpec(attr);
                    }.bind(this));
                    return;
                }

                var attrData = {};
                _.merge(attrData, data.response);
                _.merge(attrData, data.request);


                Object.keys(this.specs).forEach(function (attr) {
                    this.updateSpec(attr, attrData[attr]);
                }.bind(this));
            };

            this.$instance.on('after_update', function (instance, data) {
                fn.apply(this, [data]);
            }.bind(this));
        }
    });


    /**
     * Handles updating the product price
     *
     * @param {VashiDrawerContentCatalogProductForm} $instance
     * @constructor
     */
    var VashiDrawerContentCatalogProductPriceUpdater = function ($instance) {
        this.init($instance);
    };

    _.extend(VashiDrawerContentCatalogProductPriceUpdater.prototype, {

        init: function ($instance) {
            this.$instance = $instance;

            this.actions();
        },

        updatePage: function (price) {
            this.$instance.$pricePage.text(price);
        },

        updateDrawer: function (price) {
            this.$instance.$priceDrawer.text(price);
        },

        actions: function () {
            var fn = function (data) {
                if (data === false) {
                    this.updatePage('');
                    this.updateDrawer('');
                    return;
                }

                this.updatePage(data.response.price);
                this.updateDrawer(data.response.price);
            };

            this.$instance.on('after_update', function (instance, data) {
                fn.apply(this, [data]);
            }.bind(this));
        }
    });

    /**
     * Handles updating the product sku
     *
     * @param {VashiDrawerContentCatalogProductForm} $instance
     * @constructor
     */
    var VashiDrawerContentCatalogProductSkuUpdater = function ($instance) {
        this.init($instance);
    };

    _.extend(VashiDrawerContentCatalogProductSkuUpdater.prototype, {

        init: function ($instance) {
            this.$instance = $instance;

            this.actions();
        },

        updateDetails: function (sku) {
            $('.product-details__sku .sku span').text(sku.toUpperCase());
        },

        updateBooking: function (sku) {
            window.bookingSkus[0] = sku;
        },

        actions: function () {
            var fn = function (data) {
                if (data === false) {
                    this.updateDetails('');
                    this.updateBooking('');
                    return;
                }

                this.updateDetails(data.response.sku);
                this.updateBooking(data.response.sku);
            };

            this.$instance.on('after_update', function (instance, data) {
                fn.apply(this, [data]);
            }.bind(this));
        }
    });

    /**
     * Handles updating the product images
     *
     * @param {VashiDrawerContentCatalogProductForm} $instance
     * @constructor
     */
    var VashiDrawerContentCatalogProductImagesUpdater = function ($instance) {
        this.init($instance);
    };

    _.extend(VashiDrawerContentCatalogProductImagesUpdater.prototype, {

        init: function ($instance) {
            this.$instance = $instance;

            this.actions();
        },

        updatePage: function (images) {
            $('.product__images').html(images);
        },

        updateDrawer: function (images) {
            $('.drawer__product-form__images').html(images);
        },

        actions: function () {
            var fn = function (data) {
                if (data === false) {
                    this.updateDrawer('');
                    return;
                }

                this.updateDrawer($(data.response.images).find('.product-main-image').html());
                this.updatePage(data.response.main_images);
            };

            this.$instance.on('after_update', function (instance, data) {
                fn.apply(this, [data]);
            }.bind(this));
        }
    });

    /**
     * Handles updating the product finance
     *
     * @param {VashiDrawerContentCatalogProductForm} $instance
     * @constructor
     */
    var VashiDrawerContentCatalogProductFinanceUpdater = function ($instance) {
        this.init($instance);
    };

    _.extend(VashiDrawerContentCatalogProductFinanceUpdater.prototype, {

        init: function ($instance) {
            this.$instance = $instance;

            this.actions();
        },

        actions: function () {
            var fn = function (data) {

                var elm = $('.finance-options');

                if (data === false) {
                    elm.hide();
                    return;
                }

                if (elm.length && data.response.finance === '') {
                    elm.hide();
                } else {
                    var parent = elm.parent();
                    elm.remove();

                    var html = parent.html();
                    html += data.response.finance;
                    parent.html(html);
                }
            };

            this.$instance.on('after_update', function (instance, data) {
                fn.apply(this, [data]);
            }.bind(this));
        }
    });

    /**
     * Main plugin & initialises dependencies
     *
     * @param $form
     * @param options
     * @constructor
     */
    var VashiDrawerContentCatalogProductForm = function ($form, options) {
        this.init($form, options);
    };

    _.extend(VashiDrawerContentCatalogProductForm.prototype, {
        init: function ($form, options) {
            if (!$form.length) {
                return;
            }

            this.state = {
                error: '',
                option: null
            };

            this.events = {};

            this.options = _.extend({}, {}, options || {});

            this.$config = false;
            if (typeof this.options.config !== 'undefined') {
                this.$config = this.options.config;
            }

            this.initElements($form);

            new VashiDrawerContentCatalogProductOptionList(this);

            new VashiDrawerContentCatalogProductOptionMenu(this);

            new VashiDrawerContentCatalogProductAvailableOptions(this);

            new VashiDrawerContentCatalogProductInterfaceUpdater(this);

            new VashiDrawerContentCatalogProductSpecsUpdater(this);

            new VashiDrawerContentCatalogProductPriceUpdater(this);

            new VashiDrawerContentCatalogProductSkuUpdater(this);

            new VashiDrawerContentCatalogProductImagesUpdater(this);

            new VashiDrawerContentCatalogProductFinanceUpdater(this);

            new VashiDrawerContentCatalogProductAddToCart(this);

            new VashiDrawerContentCatalogProductFormUpdater(this);

            this.actions();

            this.render();
        },

        initElements: function ($form) {
            this.$form = $form;

            this.$container = $form.parent();

            this.$errorContainer = $('.drawer__error');

            this.$btnAddToCart = $('.add-to-cart');

            this.$btnCustomise = $('.product-customise-btn');

            this.$btnConfirm = this.$container.parent().find('.drawer__actions .btn-confirm');

            this.$btnUpdate = this.$container.parent().find('.drawer__actions .btn-update');

            this.$btnGoBack = this.$container.parent().find('.drawer__actions .btn-go-back');

            this.$btnResetAll = this.$container.parent().find('.drawer__actions .btn-reset-all');

            this.$menu = this.$container.find('.drawer__product-form__menu');

            this.$list = this.$container.find('.drawer__product-form__list');

            this.$helpers = this.$container.parent().parent().find('.drawer__head .drawer__helpers');

            this.$pricePage = $('span.regular-price span.price');

            this.$priceDrawer = this.$container.find('.drawer__product-form__price');
        },

        actions: function () {

            this.$btnGoBack.on('click', function () {
                this.setState({ option: '', code: '' });
                this.hideHelpers();
            }.bind(this));

            this.$btnConfirm.on('click', function () {
                this.hideHelpers();
                $.VashiDrawer.close();
            }.bind(this));

            $.VashiDrawer.on('after_close', function () {
                this.$btnConfirm.text('Confirm');
                this.$btnConfirm.attr('disabled', false);
                this.$btnConfirm.unbind('click').on('click', function () {
                    this.hideHelpers();
                    $.VashiDrawer.close();
                }.bind(this));

                this.setState({
                    error: '',
                    option: '',
                });

            }.bind(this));
        },

        hideHelpers: function () {
            this.$helpers.find('a').each(function () {
                $(this).hide();
            });
        },

        setState: function (state) {
            _.merge(this.state, state);

            return this.render();
        },

        getState: function (key, def) {
            return _.get(this.state, key, def);
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
                    func.apply(null, [this, typeof data === 'undefined' ? {} : data]);
                }
            }.bind(this));

            return this;
        },

        render: function () {
            if (this.getState('option')) {

                this.$menu.addClass('minify');

                this.$list.show();

                this.$btnResetAll.hide();
                this.$btnConfirm.hide();
                this.$btnUpdate.hide();
                this.$btnGoBack.show();

                setTimeout(function () {
                    TweenLite.to(this.$container, 0.2, {
                        x: (this.$container.width() / 2) * -1,
                        onComplete: function () {
                            $.VashiDrawer.resize();
                        },
                    });
                }.bind(this), 0);

            } else {

                this.$menu.removeClass('minify');

                this.$list.hide();

                this.$btnResetAll.show();
                this.$btnConfirm.show();
                this.$btnUpdate.hide();
                this.$btnGoBack.hide();

                setTimeout(function () {
                    TweenLite.to(this.$container, 0.2, {
                        x: 0,
                        onComplete: function () {
                            $.VashiDrawer.resize();
                        },
                    });
                }.bind(this), 0);
            }

            if (this.getState('error')) {
                var p = $('<p/>');
                p.addClass('drawer__error--message');
                p.text(this.getState('error'));

                this.$errorContainer.html(p);

            } else {
                this.$errorContainer.html('');
            }
        }
    });

    $.fn.VashiDrawerContentCatalogProductForm = function (options) {
        new VashiDrawerContentCatalogProductForm(this, options);
    };
}(jQuery));
