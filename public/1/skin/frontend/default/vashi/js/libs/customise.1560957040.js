;(function ( $, window, document, undefined ) {

    let pluginName = 'VashiCustomise',
        defaults = {
            inputIdentifiers: [],
            updateBtn: '',
            loadingIdentifiers: '',
            errorIdentifier: '',
            formIdentifier: '',
            mainImagesIdentifier: ''
        };

    function VashiCustomise(element, options) {
        this.element = element;

        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    /**
     * Initialises the customise plugin and binds the update function.
     */
    VashiCustomise.prototype.init = function() {
        var _this = this;

        this.options.inputIdentifiers.forEach(function(identifier) {
            jQuery(document.body).on('click', identifier, function(e) {
                _this._update();
            });
            jQuery(document.body).on('blur', identifier, function(e) {
                _this._update();
            });
        });

        if (this.options.updateBtn.length > 0) {
            jQuery(document.body).on('click', this.options.updateBtn, function (e) {
                e.preventDefault();

                var customiseForm = new VarienForm(_this.options.formIdentifier);

                if (!customiseForm.validator.validate()) {
                    return false;
                }

                jQuery.fancybox.close();
            });
        }

        this._update();
    };

    /**
     * Update product information.
     *
     * @private
     */
    VashiCustomise.prototype._update = function () {
        this._showLoading();
        var _this = this;
        setTimeout(function () {
            if (typeof spConfig === 'undefined') {
                _this._hideLoading();
                return;
            }
            var parameters = '';
            jQuery(_this._getContainerIdentifier() + ' select[name^=super_attribute]').each(function () {
                parameters += jQuery(this).attr('data-attribute-code') + '=' + jQuery(this).parent().find('.dk-select .dk-select-options .dk-option-selected').html() + '&';
            });
            parameters += "productId=" + spConfig.config.productId;

            if (_this._canSendAjaxRequest(parameters)) {
                new Ajax.Request('configurablesimples/index/index.html', {
                    method: 'GET',
                    parameters: parameters,
                    onComplete: function (response) {
                        var responseText = JSON.parse(response.responseText);
                        jQuery('.link-add-to-viewings').html(responseText.stock_alert);

                        var isSaleable = responseText.salable !== false && responseText.sku !== null;

                        if (!isSaleable) {
                            _this._setError('The options selected are currently unavailable.');
                            _this._hideLoading();
                            return;
                        } else {
                            _this._enableUpdateButton();
                        }

                        jQuery('span.regular-price span.price').html(responseText.price);

                        // do we have sku displayed in new design??
                        // jQuery('.sku-info .sku span').text(responseText.sku);

                        //needed globally for book a viewing request ajax request
                        window.bookingSkus[0] = responseText.sku;

                        // update images - this is needed!
                        jQuery('.product-customise__media').each(function () {
                            jQuery(this).html(responseText.images);
                        });

                        jQuery(_this.options.mainImagesIdentifier).html(responseText.main_images);

                        if (jQuery('.finance-options').length && responseText.finance == '') {
                            jQuery('.finance-options').remove();
                        } else {
                            var parent = jQuery('.finance-options').parent();
                            jQuery('.finance-options').remove();
                            var html = parent.html();
                            html += responseText.finance;
                            parent.html(html);
                            // jQuery('.product-add-to-block').children().eq(1).before(responseText.finance);
                        }

                        _this._hideLoading();
                    }
                });
                } else {
                    _this._hideLoading();
            }
        }, 100);
    };

    /**
     * Show the loading section.
     *
     * @private
     */
    VashiCustomise.prototype._showLoading = function() {
        if (this.options.loadingIdentifiers.length > 0) {
            this.options.loadingIdentifiers.forEach(function(identifier) {
                jQuery(identifier).show();
            });
        }
        this._setError('');
        this._disableUpdateButton();
    };

    /**
     * Hide the loading section.
     *
     * @private
     */
    VashiCustomise.prototype._hideLoading = function() {
        if (this.options.loadingIdentifiers.length > 0) {
            this.options.loadingIdentifiers.forEach(function(identifier) {
                jQuery(identifier).hide();
            });
        }
    };

    /**
     * Set an error message.
     *
     * @private
     */
    VashiCustomise.prototype._setError = function(error) {
        if (this.options.errorIdentifier.length > 0) {
            jQuery(this.options.errorIdentifier).html(error);
        }
    };

    /**
     * Disable the update button.
     *
     * @private
     */
    VashiCustomise.prototype._disableUpdateButton = function() {
        if (this.options.updateBtn.length > 0) {
            jQuery(this.options.updateBtn).attr('disabled', true);
        }
    };

    /**
     * Enable the update button.
     *
     * @private
     */
    VashiCustomise.prototype._enableUpdateButton = function() {
        if (this.options.updateBtn.length > 0) {
            jQuery(this.options.updateBtn).attr('disabled', false);
        }
    };

    /**
     * Takes the classes of the {this.element} element and concatenates
     * into a dot-delimitered string to be used as a class name identifier.
     *
     * @private
     */
    VashiCustomise.prototype._getContainerIdentifier = function() {
        if (typeof this.element.id === 'string' && this.element.id.length > 0) {
            return '#' + this.element.id;
        }
        return '.' + this.element.className.replace(/\s/, '.');
    };

    /**
     * Checks if parameters have options selected
     * For example "metal=Select A Metal" will not be valid
     *
     * @private
     */
    VashiCustomise.prototype._canSendAjaxRequest = function(parameters) {
        return parameters.indexOf('metal=Select A Metal') < 0;
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(
                    this, 'plugin_' + pluginName,
                    new VashiCustomise(this, options)
                );
            }
        });
    }

})( jQuery, window, document );