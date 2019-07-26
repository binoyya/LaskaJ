;(function ( $, window, document, undefined ) {

    let pluginName = 'VashiFinanceCalculator',
        defaults = {
            currencySymbol: '&pound;',
            financePlans: {},
            financeOptionsIdentifier: '',
            depositOptionsIdentifier: '',
            installmentsIdentifier: '',
            monthsIdentifier: '',
            depositIdentifier: '',
            loanIdentifier: '',
            interestIdentifier: '',
            totalPayableIdentifier: '',
            finalPriceIdentifier: '',
            purchasePriceIdentifier: '',
            finalPrice: 0
        };

    function VashiFinanceCalculator(element, options) {
        this.element = element;

        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;

        this._validate = this._validate.bind(this);
        this._update = this._update.bind(this);
        this._reset = this._reset.bind(this);
        this._updateFinalPrice = this._updateFinalPrice.bind(this);

        this.init();
    }

    /**
     * Initialises the customise plugin and binds the update function.
     */
    VashiFinanceCalculator.prototype.init = function() {
        var _this = this;

        try {
            this._validate();
        } catch (e) {
            return false;
        }

        jQuery(_this.options.financeOptionsIdentifier).dropkick({
            mobile: true,
            change: function () {
                value = this.value;
                jQuery(_this.options.financeOptionsIdentifier).val(value);
                _this._update();
            }
        });

        jQuery(_this.options.depositOptionsIdentifier).dropkick({
            mobile: true,
            change: function () {
                value = this.value;
                jQuery(_this.options.depositOptionsIdentifier).val(value);
                _this._update();
            }
        });

        jQuery(function () {
            jQuery.VashiDrawer.on('after_open', function (drawer) {
                if (drawer.getDrawerId() === _this.element.id) {
                    _this._reset();
                    _this._update();
                }
            });
        });

        _this._update();
    };

    /**
     * Validate that we can execute the plugin successfully.
     *
     * @private
     */
    VashiFinanceCalculator.prototype._validate = function() {
        if (typeof FinanceDetails === 'undefined') {
            throw '"FinanceDetails" object is undefined';
        }

        if (jQuery(this.options.financeOptionsIdentifier).length === 0) {
            throw '"finance options" select could not be found with identifier "' + this.options.financeOptionsIdentifier + '"';
        }

        if (jQuery(this.options.depositOptionsIdentifier).length === 0) {
            throw '"deposit options" select could not be found with identifier "' + this.options.depositOptionsIdentifier + '"';
        }

        if (jQuery(this.options.installmentsIdentifier).length === 0) {
            throw '"installments" field could not be found with identifier "' + this.options.installmentsIdentifier + '"';
        }

        if (jQuery(this.options.monthsIdentifier).length === 0) {
            throw '"months" field could not be found with identifier "' + this.options.monthsIdentifier + '"';
        }

        if (jQuery(this.options.depositIdentifier).length === 0) {
            throw '"deposit" field could not be found with identifier "' + this.options.depositIdentifier + '"';
        }

        if (jQuery(this.options.loanIdentifier).length === 0) {
            throw '"loan" field could not be found with identifier "' + this.options.loanIdentifier + '"';
        }

        if (jQuery(this.options.interestIdentifier).length === 0) {
            throw '"interest" field could not be found with identifier "' + this.options.interestIdentifier + '"';
        }

        if (jQuery(this.options.totalPayableIdentifier).length === 0) {
            throw '"total payable" field could not be found with identifier "' + this.options.totalPayableIdentifier + '"';
        }
    };

    /**
     * Reset the calculator output.
     *
     * @private
     */
    VashiFinanceCalculator.prototype._reset = function() {
        jQuery(this.options.installmentsIdentifier).html('');
        jQuery(this.options.monthsIdentifier).html('');
        jQuery(this.options.depositIdentifier).html('');
        jQuery(this.options.loanIdentifier).html('');
        jQuery(this.options.interestIdentifier).html('');
        jQuery(this.options.totalPayableIdentifier).html('');
        jQuery(this.options.purchasePriceIdentifier).html('');
        this.options.finalPrice = 0;
    };

    /**
     * Update the calculator output.
     *
     * @private
     */
    VashiFinanceCalculator.prototype._update = function() {
        var code = jQuery(this.options.financeOptionsIdentifier).val();
        var depositPerc = jQuery(this.options.depositOptionsIdentifier).val();

        if (code.toString().length === 0 || depositPerc.toString().length === 0) {
            this._reset();
            return;
        }

        this._updateFinalPrice();

        var deposit = parseFloat(this.options.finalPrice) * (depositPerc / 100);

        var _this = this;

        this.options.financePlans.forEach(function(product) {
            if (code === product.code) {
                var finance = new FinanceDetails(code, _this.options.finalPrice, product.interest_rate, deposit);

                // monthly installment figure
                jQuery(_this.options.installmentsIdentifier).html(_this.options.currencySymbol + finance.m_inst.toFixed(2));

                // number of months
                jQuery(_this.options.monthsIdentifier).html(finance.term);

                // deposit required
                jQuery(_this.options.depositIdentifier).html(_this.options.currencySymbol + finance.d_amount);

                // loan amount to be repaid
                jQuery(_this.options.loanIdentifier).html(_this.options.currencySymbol + finance.l_repay);

                // interest charged
                jQuery(_this.options.interestIdentifier).html(_this.options.currencySymbol + finance.l_truecost);

                // total payable
                jQuery(_this.options.totalPayableIdentifier).html(_this.options.currencySymbol + finance.total);
            }
        });
    };

    VashiFinanceCalculator.prototype._updateFinalPrice = function() {
        this.options.finalPrice = parseFloat(jQuery(this.options.finalPriceIdentifier).html().replace(/\D/, '').replace(',', ''));
        jQuery(this.options.purchasePriceIdentifier).html(this.options.currencySymbol + this.options.finalPrice);
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(
                    this, 'plugin_' + pluginName,
                    new VashiFinanceCalculator(this, options)
                );
            }
        });
    }

})( jQuery, window, document );
