(function ($) {
    var name = 'VashiHeaderBasket';
    var defaults = {
        itemCountCssClass: '.cartNumber'
    };

    function VashiHeaderBasket(element, options) {
        this._name = name;
        this.element = element;
        this.options = $.extend({}, defaults, options);

        this.init();
    }

    VashiHeaderBasket.prototype.init = function () {
        return this._show();
    };

    VashiHeaderBasket.prototype._show = function () {
        $(this.element).show();
        return this;
    };

    VashiHeaderBasket.prototype._hide = function () {
        $(this.element).hide();
        return this;
    };

    VashiHeaderBasket.prototype._hasItems = function () {
        return $(this.element).find(this.options.itemCountCssClass).find('img').length > 0;
    };

    $.fn[name] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + name)) {
                $.data(
                    this, 'plugin_' + name,
                    new VashiHeaderBasket(this, options)
                );
            }
        });
    };
})(jQuery);
