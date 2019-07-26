// Handles display of configurable options and updates product prices and images based on selected configurable
// options

var CONFIGURABLE_OPTIONS = {
    init: function() {
        CONFIGURABLE_OPTIONS.setup.init();
    },
    setup: {
        init: function() {
            var gender = new Array();
            gender['Him'] = [];
            jQuery('.male-options option').each(function() {
                gender['Him'].push(jQuery(this).val());
            });
            gender['Her'] = [];
            jQuery('.female-options option').each(function() {
                gender['Her'].push(jQuery(this).val());
            });
            jQuery('.price-from').css('display', 'none');
            jQuery('.price-to').css('display', 'none');
            jQuery('#thumbs .details_thumbs').css('display', 'none');
            var that = this;
            /**
             * auto selects default options for ajax update
             */
            setTimeout(function() {
                preSelectMetal();
                enableLoading();
                updateProductInformation();
                jQuery('.configurable-options').on('click', '.switcher-label',function() {
                    that.updateOptions(gender);
                });
            }, 300);

            function openOption(container) {
                var $container = jQuery(container).parents('.option-wrapper');
                $container.find('.select-option').addClass('open').find('span').slideUp(100);
                $container.siblings().slideUp(100);

                setTimeout(function () {
                    $container.addClass('open');
                }, 300);
            }

            function closeOptions(container) {
                var $container = jQuery(container).parents('.option-wrapper');

                $container.removeClass('open');

                setTimeout(function () {
                    $container.siblings().slideDown(100);
                    $container.find('.select-option').removeClass('open').find('span').slideDown(100);
                }, 300);
            }

            jQuery(document).ready(function() {

                jQuery('.configurable-options .select-option').click(function (e) {
                    var $container = jQuery(this);
                    openOption($container);
                });

                jQuery('.filter-back').click(function() {
                    var $container = jQuery(this);
                    closeOptions($container);
                });

            });

            setTimeout(function() {
                updateConfigurableOption();
                jQuery('.configurable-options').on('click', '.switcher-label', function() {
                    var $container = jQuery(this);

                    setTimeout(function() {
                        updateConfigurableOption();
                        closeOptions($container);
                    }, 100);
                });
            }, 300);

            jQuery('.gender-option').click(function() {
                jQuery('.gender-option').each(function() {
                    jQuery(this).removeClass('active');
                });

                jQuery(this).addClass('active');

                that.updateOptions(gender);
            });

            jQuery('.gender-selection .clear-gender').click(function() {
                enableLoading();
                jQuery('.gender-option').each(function() {
                    jQuery(this).removeClass('active');
                });
                jQuery('.switcher-field .switcher-label').each(function() {
                    jQuery(this).show('slow');
                });
                setTimeout(function() {
                    disableLoading();
                }, 300);
            })
        },
        updateOptions: function(gender) {
            if (jQuery('.configurable-options').attr('updating') == '0') {
                enableLoading();
                var selectedGender = jQuery('.gender-selection .gender-option.active').text();
                jQuery('.configurable-options').attr('updating', '1');
                setTimeout(function() {
                    var selectedOption = jQuery('.switcher-metal').find('.selected').first();
                    if (selectedGender) {
                        if (gender[selectedGender].indexOf(selectedOption.text()) < 0) {
                            jQuery('.switcher-metal').find('.switcher-label').each(function() {
                                if (gender[selectedGender].indexOf(jQuery(this).text()) >= 0) {
                                    jQuery(this).click();
                                    return false;
                                }
                            });
                        }
                    } else {
                        if (selectedOption.length < 1) {
                            jQuery('.switcher-metal').find('.switcher-label').first().click();
                        }
                    }
                },50);
                setTimeout(function() {
                    var selectedOption = jQuery('.switcher-band_weight').find('.selected').first();
                    if (selectedGender) {
                        if (gender[selectedGender].indexOf(selectedOption.text()) < 0) {
                            jQuery('.switcher-band_weight').find('.switcher-label').each(function() {
                                if (gender[selectedGender].indexOf(jQuery(this).text()) >= 0) {
                                    jQuery(this).click();
                                    return false;
                                }
                            });
                        }
                    } else {
                        if (selectedOption.length < 1) {
                            jQuery('.switcher-band_weight').find('.switcher-label').first().click();
                        }
                    }
                },100);
                setTimeout(function() {
                    var selectedOption = jQuery('.switcher-band_width').find('.selected').first();
                    if (selectedGender) {
                        if (gender[selectedGender].indexOf(selectedOption.text()) < 0) {
                            jQuery('.switcher-band_width').find('.switcher-label').each(function() {
                                if (gender[selectedGender].indexOf(jQuery(this).text()) >= 0) {
                                    jQuery(this).click();
                                    return false;
                                }
                            });
                        }
                    } else {
                        if (selectedOption.length < 1) {
                            jQuery('.switcher-band_width').find('.switcher-label').first().click();
                        }
                    }
                },200);
                setTimeout(function() {
                    updateConfigurableOption();
                    updateProductInformation();
                    jQuery('.configurable-options').attr('updating', '0');
                    if (selectedGender.length) {
                        jQuery('.switcher-field .switcher-label').each(function() {
                            var option = jQuery.inArray(jQuery(this).find('span').text(), gender[selectedGender]);
                            if (option >= 0) {
                                jQuery(this).css('display', 'block');
                            } else {
                                jQuery(this).css('display', 'none');
                            }
                        });
                    }
                },300);
            };
        }
    }
}


jQuery(function() {
    if (typeof spConfig !== 'undefined') {
        if (spConfig.config.attributes[166] !== undefined) {
            CONFIGURABLE_OPTIONS.init();
        }
    }
});


function updateConfigurableOption() {

    //new requirements have static label. if they need adding back - uncomment
    
    /* jQuery('.configurable-options dt span').remove();

    jQuery('.switcher-field .selected').each(function() {
        var label = jQuery(this).text();
        jQuery(this).parent().parent().parent().prev().find('.filter-select').before("<span>"+label+"</span>");
    }); */
}


function updateProductInformation() {
    if (typeof jQuery().VashiCustomise !== 'undefined') {
        return;
    }
        enableLoading();
        setTimeout(function () {
            var parameters = '';
            jQuery('.switcher-field').each(function () {
                parameters += jQuery(this).attr('attribute-code') + '=' + jQuery(this).find('.selected span').html() + '&';
            });
            parameters += "productId=" + spConfig.config.productId;
            new Ajax.Request('configurablesimples/index/index.html', {
                method: 'GET',
                parameters: parameters,
                onComplete: function (response) {
                    var responseText = JSON.parse(response.responseText);
                    jQuery('.link-add-to-viewings').html(responseText.stock_alert);
                    if (responseText.salable == false) {
                        jQuery('.addtobasket').hide();
                        jQuery('p.availability').removeClass('hide');
                        jQuery('p.availability span').text(Translator.translate('out of stock'));
                        jQuery('.link-add-to-viewings').hide();
                        jQuery('div.order').hide();

                    }
                    else {
                        jQuery('.addtobasket').show();
                        jQuery('p.availability').addClass('hide');
                        jQuery('.link-add-to-viewings').show();
                        jQuery('div.order').show();

                    }
                    jQuery('p.old-price > span.price').html(responseText.starting_price);
                    jQuery('p.special-price > span.price').html(responseText.price);
                    jQuery('span.regular-price span.price').html(responseText.price);
                    jQuery('tr.metal_config, tr.rhodium_config').show();
                    jQuery('td.metal_value').text(responseText.metal);
                    jQuery('td.rhodium_value').text(responseText.rhodium);
                    jQuery('td.rhodium').hide(); jQuery('td.rhodium + td').hide();
                    jQuery('td.metal').hide(); jQuery('td.metal + td').hide();
                    jQuery('.sku-info .sku span').text(responseText.sku);
                    //needed globally for book a viewing request ajax request
                    window.bookingSkus[0] = responseText.sku;
                    jQuery('.product-media-load, #product-media-load').each(function(){
                        //there are two blocks for mobile and desktop both needs to be update, @todo refactore show be one #
                        jQuery(this).html(responseText.images);
                    })

                    jQuery('#product-options-wrapper-right').html(responseText.sizes);
                    jQuery('#configurable-chain-length-button').html(responseText.sizes);
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
                    disableLoading();

                }
            });
        }, 100);

}

function enableLoading() {
    if (typeof jQuery().VashiCustomise !== 'undefined') {
        return;
    }
    jQuery('.price-box .regular-price').css('opacity', '0');
    jQuery('.price-change-loader').css('display', 'block');
    // jQuery('#product-media-load').css('opacity', '0.5');
    jQuery('.configurable-options .product-options').css('opacity', '0.5');
}

function disableLoading() {
    if (typeof jQuery().VashiCustomise !== 'undefined') {
        return;
    }
    jQuery('.price-box .regular-price').css('opacity', '');
    jQuery('.price-change-loader').css('display', 'none');
    jQuery('#product-media-load').css('opacity', '1');
    jQuery('.configurable-options .product-options').css('opacity', '1');
}
function preSelectMetal() {
    var metalCode = getUrlParameter('metal');
    if (metalCode>0) {
        jQuery("label[id*='attribute166_']").removeClass('selected');
        jQuery('#attribute166_' + metalCode).addClass('selected');
        var easylifeSwitcherElement = jQuery('li[data-select="attribute166"][data-val="' + metalCode + '"]');
        if (easylifeSwitcherElement.length > 0) {
            easylifeSwitcherElement.trigger('click');
        }

        var switcherElement = jQuery('label#attribute166_' + metalCode);
        if (switcherElement.length > 0) {
            switcherElement.trigger('click');
        }

        var dkSelect = jQuery('div.dk-select')
            .filter(function() {
                return this.id.match(/dk[\d]+-attribute166/);
            });

        if (dkSelect.length > 0) {
            var dk = dkSelect.attr('id').replace('-attribute166', '');
            var metalElement = jQuery('#' + dk + '-' + metalCode);
            if (metalElement.length > 0) {
                metalElement.trigger('click').trigger('click');
            }
        }
    }
}

function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}

// script.aculo.us effects.js v1.8.2, Tue Nov 18 18:30:58 +0100 2008

// Copyright (c) 2005-2008 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
// Contributors:
//  Justin Palmer (http://encytemedia.com/)
//  Mark Pilgrim (http://diveintomark.org/)
//  Martin Bialasinki
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

// converts rgb() and #xxx to #xxxxxx format,
// returns self (or first argument) if not convertable
String.prototype.parseColor = function() {
  var color = '#';
  if (this.slice(0,4) == 'rgb(') {
    var cols = this.slice(4,this.length-1).split(',');
    var i=0; do { color += parseInt(cols[i]).toColorPart() } while (++i<3);
  } else {
    if (this.slice(0,1) == '#') {
      if (this.length==4) for(var i=1;i<4;i++) color += (this.charAt(i) + this.charAt(i)).toLowerCase();
      if (this.length==7) color = this.toLowerCase();
    }
  }
  return (color.length==7 ? color : (arguments[0] || this));
};

/*--------------------------------------------------------------------------*/

Element.collectTextNodes = function(element) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      (node.hasChildNodes() ? Element.collectTextNodes(node) : ''));
  }).flatten().join('');
};

Element.collectTextNodesIgnoreClass = function(element, className) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      ((node.hasChildNodes() && !Element.hasClassName(node,className)) ?
        Element.collectTextNodesIgnoreClass(node, className) : ''));
  }).flatten().join('');
};

Element.setContentZoom = function(element, percent) {
  element = $(element);
  element.setStyle({fontSize: (percent/100) + 'em'});
  if (Prototype.Browser.WebKit) window.scrollBy(0,0);
  return element;
};

Element.getInlineOpacity = function(element){
  return $(element).style.opacity || '';
};

Element.forceRerendering = function(element) {
  try {
    element = $(element);
    var n = document.createTextNode(' ');
    element.appendChild(n);
    element.removeChild(n);
  } catch(e) { }
};

/*--------------------------------------------------------------------------*/

var Effect = {
  _elementDoesNotExistError: {
    name: 'ElementDoesNotExistError',
    message: 'The specified DOM element does not exist, but is required for this effect to operate'
  },
  Transitions: {
    linear: Prototype.K,
    sinoidal: function(pos) {
      return (-Math.cos(pos*Math.PI)/2) + .5;
    },
    reverse: function(pos) {
      return 1-pos;
    },
    flicker: function(pos) {
      var pos = ((-Math.cos(pos*Math.PI)/4) + .75) + Math.random()/4;
      return pos > 1 ? 1 : pos;
    },
    wobble: function(pos) {
      return (-Math.cos(pos*Math.PI*(9*pos))/2) + .5;
    },
    pulse: function(pos, pulses) {
      return (-Math.cos((pos*((pulses||5)-.5)*2)*Math.PI)/2) + .5;
    },
    spring: function(pos) {
      return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
    },
    none: function(pos) {
      return 0;
    },
    full: function(pos) {
      return 1;
    }
  },
  DefaultOptions: {
    duration:   1.0,   // seconds
    fps:        100,   // 100= assume 66fps max.
    sync:       false, // true for combining
    from:       0.0,
    to:         1.0,
    delay:      0.0,
    queue:      'parallel'
  },
  tagifyText: function(element) {
    var tagifyStyle = 'position:relative';
    if (Prototype.Browser.IE) tagifyStyle += ';zoom:1';

    element = $(element);
    $A(element.childNodes).each( function(child) {
      if (child.nodeType==3) {
        child.nodeValue.toArray().each( function(character) {
          element.insertBefore(
            new Element('span', {style: tagifyStyle}).update(
              character == ' ' ? String.fromCharCode(160) : character),
              child);
        });
        Element.remove(child);
      }
    });
  },
  multiple: function(element, effect) {
    var elements;
    if (((typeof element == 'object') ||
        Object.isFunction(element)) &&
       (element.length))
      elements = element;
    else
      elements = $(element).childNodes;

    var options = Object.extend({
      speed: 0.1,
      delay: 0.0
    }, arguments[2] || { });
    var masterDelay = options.delay;

    $A(elements).each( function(element, index) {
      new effect(element, Object.extend(options, { delay: index * options.speed + masterDelay }));
    });
  },
  PAIRS: {
    'slide':  ['SlideDown','SlideUp'],
    'blind':  ['BlindDown','BlindUp'],
    'appear': ['Appear','Fade']
  },
  toggle: function(element, effect) {
    element = $(element);
    effect = (effect || 'appear').toLowerCase();
    var options = Object.extend({
      queue: { position:'end', scope:(element.id || 'global'), limit: 1 }
    }, arguments[2] || { });
    Effect[element.visible() ?
      Effect.PAIRS[effect][1] : Effect.PAIRS[effect][0]](element, options);
  }
};

Effect.DefaultOptions.transition = Effect.Transitions.sinoidal;

/* ------------- core effects ------------- */

Effect.ScopedQueue = Class.create(Enumerable, {
  initialize: function() {
    this.effects  = [];
    this.interval = null;
  },
  _each: function(iterator) {
    this.effects._each(iterator);
  },
  add: function(effect) {
    var timestamp = new Date().getTime();

    var position = Object.isString(effect.options.queue) ?
      effect.options.queue : effect.options.queue.position;

    switch(position) {
      case 'front':
        // move unstarted effects after this effect
        this.effects.findAll(function(e){ return e.state=='idle' }).each( function(e) {
            e.startOn  += effect.finishOn;
            e.finishOn += effect.finishOn;
          });
        break;
      case 'with-last':
        timestamp = this.effects.pluck('startOn').max() || timestamp;
        break;
      case 'end':
        // start effect after last queued effect has finished
        timestamp = this.effects.pluck('finishOn').max() || timestamp;
        break;
    }

    effect.startOn  += timestamp;
    effect.finishOn += timestamp;

    if (!effect.options.queue.limit || (this.effects.length < effect.options.queue.limit))
      this.effects.push(effect);

    if (!this.interval)
      this.interval = setInterval(this.loop.bind(this), 15);
  },
  remove: function(effect) {
    this.effects = this.effects.reject(function(e) { return e==effect });
    if (this.effects.length == 0) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  loop: function() {
    var timePos = new Date().getTime();
    for(var i=0, len=this.effects.length;i<len;i++)
      this.effects[i] && this.effects[i].loop(timePos);
  }
});

Effect.Queues = {
  instances: $H(),
  get: function(queueName) {
    if (!Object.isString(queueName)) return queueName;

    return this.instances.get(queueName) ||
      this.instances.set(queueName, new Effect.ScopedQueue());
  }
};
Effect.Queue = Effect.Queues.get('global');

Effect.Base = Class.create({
  position: null,
  start: function(options) {
    function codeForEvent(options,eventName){
      return (
        (options[eventName+'Internal'] ? 'this.options.'+eventName+'Internal(this);' : '') +
        (options[eventName] ? 'this.options.'+eventName+'(this);' : '')
      );
    }
    if (options && options.transition === false) options.transition = Effect.Transitions.linear;
    this.options      = Object.extend(Object.extend({ },Effect.DefaultOptions), options || { });
    this.currentFrame = 0;
    this.state        = 'idle';
    this.startOn      = this.options.delay*1000;
    this.finishOn     = this.startOn+(this.options.duration*1000);
    this.fromToDelta  = this.options.to-this.options.from;
    this.totalTime    = this.finishOn-this.startOn;
    this.totalFrames  = this.options.fps*this.options.duration;

    this.render = (function() {
      function dispatch(effect, eventName) {
        if (effect.options[eventName + 'Internal'])
          effect.options[eventName + 'Internal'](effect);
        if (effect.options[eventName])
          effect.options[eventName](effect);
      }

      return function(pos) {
        if (this.state === "idle") {
          this.state = "running";
          dispatch(this, 'beforeSetup');
          if (this.setup) this.setup();
          dispatch(this, 'afterSetup');
        }
        if (this.state === "running") {
          pos = (this.options.transition(pos) * this.fromToDelta) + this.options.from;
          this.position = pos;
          dispatch(this, 'beforeUpdate');
          if (this.update) this.update(pos);
          dispatch(this, 'afterUpdate');
        }
      };
    })();

    this.event('beforeStart');
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ?
        'global' : this.options.queue.scope).add(this);
  },
  loop: function(timePos) {
    if (timePos >= this.startOn) {
      if (timePos >= this.finishOn) {
        this.render(1.0);
        this.cancel();
        this.event('beforeFinish');
        if (this.finish) this.finish();
        this.event('afterFinish');
        return;
      }
      var pos   = (timePos - this.startOn) / this.totalTime,
          frame = (pos * this.totalFrames).round();
      if (frame > this.currentFrame) {
        this.render(pos);
        this.currentFrame = frame;
      }
    }
  },
  cancel: function() {
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ?
        'global' : this.options.queue.scope).remove(this);
    this.state = 'finished';
  },
  event: function(eventName) {
    if (this.options[eventName + 'Internal']) this.options[eventName + 'Internal'](this);
    if (this.options[eventName]) this.options[eventName](this);
  },
  inspect: function() {
    var data = $H();
    for(property in this)
      if (!Object.isFunction(this[property])) data.set(property, this[property]);
    return '#<Effect:' + data.inspect() + ',options:' + $H(this.options).inspect() + '>';
  }
});

Effect.Parallel = Class.create(Effect.Base, {
  initialize: function(effects) {
    this.effects = effects || [];
    this.start(arguments[1]);
  },
  update: function(position) {
    this.effects.invoke('render', position);
  },
  finish: function(position) {
    this.effects.each( function(effect) {
      effect.render(1.0);
      effect.cancel();
      effect.event('beforeFinish');
      if (effect.finish) effect.finish(position);
      effect.event('afterFinish');
    });
  }
});

Effect.Tween = Class.create(Effect.Base, {
  initialize: function(object, from, to) {
    object = Object.isString(object) ? $(object) : object;
    var args = $A(arguments), method = args.last(),
      options = args.length == 5 ? args[3] : null;
    this.method = Object.isFunction(method) ? method.bind(object) :
      Object.isFunction(object[method]) ? object[method].bind(object) :
      function(value) { object[method] = value };
    this.start(Object.extend({ from: from, to: to }, options || { }));
  },
  update: function(position) {
    this.method(position);
  }
});

Effect.Event = Class.create(Effect.Base, {
  initialize: function() {
    this.start(Object.extend({ duration: 0 }, arguments[0] || { }));
  },
  update: Prototype.emptyFunction
});

Effect.Opacity = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    // make this work on IE on elements without 'layout'
    if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
      this.element.setStyle({zoom: 1});
    var options = Object.extend({
      from: this.element.getOpacity() || 0.0,
      to:   1.0
    }, arguments[1] || { });
    this.start(options);
  },
  update: function(position) {
    this.element.setOpacity(position);
  }
});

Effect.Move = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      x:    0,
      y:    0,
      mode: 'relative'
    }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    this.element.makePositioned();
    this.originalLeft = parseFloat(this.element.getStyle('left') || '0');
    this.originalTop  = parseFloat(this.element.getStyle('top')  || '0');
    if (this.options.mode == 'absolute') {
      this.options.x = this.options.x - this.originalLeft;
      this.options.y = this.options.y - this.originalTop;
    }
  },
  update: function(position) {
    this.element.setStyle({
      left: (this.options.x  * position + this.originalLeft).round() + 'px',
      top:  (this.options.y  * position + this.originalTop).round()  + 'px'
    });
  }
});

// for backwards compatibility
Effect.MoveBy = function(element, toTop, toLeft) {
  return new Effect.Move(element,
    Object.extend({ x: toLeft, y: toTop }, arguments[3] || { }));
};

Effect.Scale = Class.create(Effect.Base, {
  initialize: function(element, percent) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      scaleX: true,
      scaleY: true,
      scaleContent: true,
      scaleFromCenter: false,
      scaleMode: 'box',        // 'box' or 'contents' or { } with provided values
      scaleFrom: 100.0,
      scaleTo:   percent
    }, arguments[2] || { });
    this.start(options);
  },
  setup: function() {
    this.restoreAfterFinish = this.options.restoreAfterFinish || false;
    this.elementPositioning = this.element.getStyle('position');

    this.originalStyle = { };
    ['top','left','width','height','fontSize'].each( function(k) {
      this.originalStyle[k] = this.element.style[k];
    }.bind(this));

    this.originalTop  = this.element.offsetTop;
    this.originalLeft = this.element.offsetLeft;

    var fontSize = this.element.getStyle('font-size') || '100%';
    ['em','px','%','pt'].each( function(fontSizeType) {
      if (fontSize.indexOf(fontSizeType)>0) {
        this.fontSize     = parseFloat(fontSize);
        this.fontSizeType = fontSizeType;
      }
    }.bind(this));

    this.factor = (this.options.scaleTo - this.options.scaleFrom)/100;

    this.dims = null;
    if (this.options.scaleMode=='box')
      this.dims = [this.element.offsetHeight, this.element.offsetWidth];
    if (/^content/.test(this.options.scaleMode))
      this.dims = [this.element.scrollHeight, this.element.scrollWidth];
    if (!this.dims)
      this.dims = [this.options.scaleMode.originalHeight,
                   this.options.scaleMode.originalWidth];
  },
  update: function(position) {
    var currentScale = (this.options.scaleFrom/100.0) + (this.factor * position);
    if (this.options.scaleContent && this.fontSize)
      this.element.setStyle({fontSize: this.fontSize * currentScale + this.fontSizeType });
    this.setDimensions(this.dims[0] * currentScale, this.dims[1] * currentScale);
  },
  finish: function(position) {
    if (this.restoreAfterFinish) this.element.setStyle(this.originalStyle);
  },
  setDimensions: function(height, width) {
    var d = { };
    if (this.options.scaleX) d.width = width.round() + 'px';
    if (this.options.scaleY) d.height = height.round() + 'px';
    if (this.options.scaleFromCenter) {
      var topd  = (height - this.dims[0])/2;
      var leftd = (width  - this.dims[1])/2;
      if (this.elementPositioning == 'absolute') {
        if (this.options.scaleY) d.top = this.originalTop-topd + 'px';
        if (this.options.scaleX) d.left = this.originalLeft-leftd + 'px';
      } else {
        if (this.options.scaleY) d.top = -topd + 'px';
        if (this.options.scaleX) d.left = -leftd + 'px';
      }
    }
    this.element.setStyle(d);
  }
});

Effect.Highlight = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({ startcolor: '#ffff99' }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    // Prevent executing on elements not in the layout flow
    if (this.element.getStyle('display')=='none') { this.cancel(); return; }
    // Disable background image during the effect
    this.oldStyle = { };
    if (!this.options.keepBackgroundImage) {
      this.oldStyle.backgroundImage = this.element.getStyle('background-image');
      this.element.setStyle({backgroundImage: 'none'});
    }
    if (!this.options.endcolor)
      this.options.endcolor = this.element.getStyle('background-color').parseColor('#ffffff');
    if (!this.options.restorecolor)
      this.options.restorecolor = this.element.getStyle('background-color');
    // init color calculations
    this._base  = $R(0,2).map(function(i){ return parseInt(this.options.startcolor.slice(i*2+1,i*2+3),16) }.bind(this));
    this._delta = $R(0,2).map(function(i){ return parseInt(this.options.endcolor.slice(i*2+1,i*2+3),16)-this._base[i] }.bind(this));
  },
  update: function(position) {
    this.element.setStyle({backgroundColor: $R(0,2).inject('#',function(m,v,i){
      return m+((this._base[i]+(this._delta[i]*position)).round().toColorPart()); }.bind(this)) });
  },
  finish: function() {
    this.element.setStyle(Object.extend(this.oldStyle, {
      backgroundColor: this.options.restorecolor
    }));
  }
});

Effect.ScrollTo = function(element) {
  var options = arguments[1] || { },
  scrollOffsets = document.viewport.getScrollOffsets(),
  elementOffsets = $(element).cumulativeOffset();

  if (options.offset) elementOffsets[1] += options.offset;

  return new Effect.Tween(null,
    scrollOffsets.top,
    elementOffsets[1],
    options,
    function(p){ scrollTo(scrollOffsets.left, p.round()); }
  );
};

/* ------------- combination effects ------------- */

Effect.Fade = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  var options = Object.extend({
    from: element.getOpacity() || 1.0,
    to:   0.0,
    afterFinishInternal: function(effect) {
      if (effect.options.to!=0) return;
      effect.element.hide().setStyle({opacity: oldOpacity});
    }
  }, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Appear = function(element) {
  element = $(element);
  var options = Object.extend({
  from: (element.getStyle('display') == 'none' ? 0.0 : element.getOpacity() || 0.0),
  to:   1.0,
  // force Safari to render floated elements properly
  afterFinishInternal: function(effect) {
    effect.element.forceRerendering();
  },
  beforeSetup: function(effect) {
    effect.element.setOpacity(effect.options.from).show();
  }}, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Puff = function(element) {
  element = $(element);
  var oldStyle = {
    opacity: element.getInlineOpacity(),
    position: element.getStyle('position'),
    top:  element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height
  };
  return new Effect.Parallel(
   [ new Effect.Scale(element, 200,
      { sync: true, scaleFromCenter: true, scaleContent: true, restoreAfterFinish: true }),
     new Effect.Opacity(element, { sync: true, to: 0.0 } ) ],
     Object.extend({ duration: 1.0,
      beforeSetupInternal: function(effect) {
        Position.absolutize(effect.effects[0].element);
      },
      afterFinishInternal: function(effect) {
         effect.effects[0].element.hide().setStyle(oldStyle); }
     }, arguments[1] || { })
   );
};

Effect.BlindUp = function(element) {
  element = $(element);
  element.makeClipping();
  return new Effect.Scale(element, 0,
    Object.extend({ scaleContent: false,
      scaleX: false,
      restoreAfterFinish: true,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping();
      }
    }, arguments[1] || { })
  );
};

Effect.BlindDown = function(element) {
  element = $(element);
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({
    scaleContent: false,
    scaleX: false,
    scaleFrom: 0,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makeClipping().setStyle({height: '0px'}).show();
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping();
    }
  }, arguments[1] || { }));
};

Effect.SwitchOff = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  return new Effect.Appear(element, Object.extend({
    duration: 0.4,
    from: 0,
    transition: Effect.Transitions.flicker,
    afterFinishInternal: function(effect) {
      new Effect.Scale(effect.element, 1, {
        duration: 0.3, scaleFromCenter: true,
        scaleX: false, scaleContent: false, restoreAfterFinish: true,
        beforeSetup: function(effect) {
          effect.element.makePositioned().makeClipping();
        },
        afterFinishInternal: function(effect) {
          effect.element.hide().undoClipping().undoPositioned().setStyle({opacity: oldOpacity});
        }
      });
    }
  }, arguments[1] || { }));
};

Effect.DropOut = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left'),
    opacity: element.getInlineOpacity() };
  return new Effect.Parallel(
    [ new Effect.Move(element, {x: 0, y: 100, sync: true }),
      new Effect.Opacity(element, { sync: true, to: 0.0 }) ],
    Object.extend(
      { duration: 0.5,
        beforeSetup: function(effect) {
          effect.effects[0].element.makePositioned();
        },
        afterFinishInternal: function(effect) {
          effect.effects[0].element.hide().undoPositioned().setStyle(oldStyle);
        }
      }, arguments[1] || { }));
};

Effect.Shake = function(element) {
  element = $(element);
  var options = Object.extend({
    distance: 20,
    duration: 0.5
  }, arguments[1] || {});
  var distance = parseFloat(options.distance);
  var split = parseFloat(options.duration) / 10.0;
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left') };
    return new Effect.Move(element,
      { x:  distance, y: 0, duration: split, afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance, y: 0, duration: split, afterFinishInternal: function(effect) {
        effect.element.undoPositioned().setStyle(oldStyle);
  }}); }}); }}); }}); }}); }});
};

Effect.SlideDown = function(element) {
  element = $(element).cleanWhitespace();
  // SlideDown need to have the content of the element wrapped in a container element with fixed height!
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({
    scaleContent: false,
    scaleX: false,
    scaleFrom: window.opera ? 0 : 1,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().setStyle({height: '0px'}).show();
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom}); }
    }, arguments[1] || { })
  );
};

Effect.SlideUp = function(element) {
  element = $(element).cleanWhitespace();
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, window.opera ? 0 : 1,
   Object.extend({ scaleContent: false,
    scaleX: false,
    scaleMode: 'box',
    scaleFrom: 100,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().show();
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom});
    }
   }, arguments[1] || { })
  );
};

// Bug in opera makes the TD containing this element expand for a instance after finish
Effect.Squish = function(element) {
  return new Effect.Scale(element, window.opera ? 1 : 0, {
    restoreAfterFinish: true,
    beforeSetup: function(effect) {
      effect.element.makeClipping();
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping();
    }
  });
};

Effect.Grow = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.full
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var initialMoveX, initialMoveY;
  var moveX, moveY;

  switch (options.direction) {
    case 'top-left':
      initialMoveX = initialMoveY = moveX = moveY = 0;
      break;
    case 'top-right':
      initialMoveX = dims.width;
      initialMoveY = moveY = 0;
      moveX = -dims.width;
      break;
    case 'bottom-left':
      initialMoveX = moveX = 0;
      initialMoveY = dims.height;
      moveY = -dims.height;
      break;
    case 'bottom-right':
      initialMoveX = dims.width;
      initialMoveY = dims.height;
      moveX = -dims.width;
      moveY = -dims.height;
      break;
    case 'center':
      initialMoveX = dims.width / 2;
      initialMoveY = dims.height / 2;
      moveX = -dims.width / 2;
      moveY = -dims.height / 2;
      break;
  }

  return new Effect.Move(element, {
    x: initialMoveX,
    y: initialMoveY,
    duration: 0.01,
    beforeSetup: function(effect) {
      effect.element.hide().makeClipping().makePositioned();
    },
    afterFinishInternal: function(effect) {
      new Effect.Parallel(
        [ new Effect.Opacity(effect.element, { sync: true, to: 1.0, from: 0.0, transition: options.opacityTransition }),
          new Effect.Move(effect.element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition }),
          new Effect.Scale(effect.element, 100, {
            scaleMode: { originalHeight: dims.height, originalWidth: dims.width },
            sync: true, scaleFrom: window.opera ? 1 : 0, transition: options.scaleTransition, restoreAfterFinish: true})
        ], Object.extend({
             beforeSetup: function(effect) {
               effect.effects[0].element.setStyle({height: '0px'}).show();
             },
             afterFinishInternal: function(effect) {
               effect.effects[0].element.undoClipping().undoPositioned().setStyle(oldStyle);
             }
           }, options)
      );
    }
  });
};

Effect.Shrink = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.none
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var moveX, moveY;

  switch (options.direction) {
    case 'top-left':
      moveX = moveY = 0;
      break;
    case 'top-right':
      moveX = dims.width;
      moveY = 0;
      break;
    case 'bottom-left':
      moveX = 0;
      moveY = dims.height;
      break;
    case 'bottom-right':
      moveX = dims.width;
      moveY = dims.height;
      break;
    case 'center':
      moveX = dims.width / 2;
      moveY = dims.height / 2;
      break;
  }

  return new Effect.Parallel(
    [ new Effect.Opacity(element, { sync: true, to: 0.0, from: 1.0, transition: options.opacityTransition }),
      new Effect.Scale(element, window.opera ? 1 : 0, { sync: true, transition: options.scaleTransition, restoreAfterFinish: true}),
      new Effect.Move(element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition })
    ], Object.extend({
         beforeStartInternal: function(effect) {
           effect.effects[0].element.makePositioned().makeClipping();
         },
         afterFinishInternal: function(effect) {
           effect.effects[0].element.hide().undoClipping().undoPositioned().setStyle(oldStyle); }
       }, options)
  );
};

Effect.Pulsate = function(element) {
  element = $(element);
  var options    = arguments[1] || { },
    oldOpacity = element.getInlineOpacity(),
    transition = options.transition || Effect.Transitions.linear,
    reverser   = function(pos){
      return 1 - transition((-Math.cos((pos*(options.pulses||5)*2)*Math.PI)/2) + .5);
    };

  return new Effect.Opacity(element,
    Object.extend(Object.extend({  duration: 2.0, from: 0,
      afterFinishInternal: function(effect) { effect.element.setStyle({opacity: oldOpacity}); }
    }, options), {transition: reverser}));
};

Effect.Fold = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height };
  element.makeClipping();
  return new Effect.Scale(element, 5, Object.extend({
    scaleContent: false,
    scaleX: false,
    afterFinishInternal: function(effect) {
    new Effect.Scale(element, 1, {
      scaleContent: false,
      scaleY: false,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping().setStyle(oldStyle);
      } });
  }}, arguments[1] || { }));
};

Effect.Morph = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      style: { }
    }, arguments[1] || { });

    if (!Object.isString(options.style)) this.style = $H(options.style);
    else {
      if (options.style.include(':'))
        this.style = options.style.parseStyle();
      else {
        this.element.addClassName(options.style);
        this.style = $H(this.element.getStyles());
        this.element.removeClassName(options.style);
        var css = this.element.getStyles();
        this.style = this.style.reject(function(style) {
          return style.value == css[style.key];
        });
        options.afterFinishInternal = function(effect) {
          effect.element.addClassName(effect.options.style);
          effect.transforms.each(function(transform) {
            effect.element.style[transform.style] = '';
          });
        };
      }
    }
    this.start(options);
  },

  setup: function(){
    function parseColor(color){
      if (!color || ['rgba(0, 0, 0, 0)','transparent'].include(color)) color = '#ffffff';
      color = color.parseColor();
      return $R(0,2).map(function(i){
        return parseInt( color.slice(i*2+1,i*2+3), 16 );
      });
    }
    this.transforms = this.style.map(function(pair){
      var property = pair[0], value = pair[1], unit = null;

      if (value.parseColor('#zzzzzz') != '#zzzzzz') {
        value = value.parseColor();
        unit  = 'color';
      } else if (property == 'opacity') {
        value = parseFloat(value);
        if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
          this.element.setStyle({zoom: 1});
      } else if (Element.CSS_LENGTH.test(value)) {
          var components = value.match(/^([\+\-]?[0-9\.]+)(.*)$/);
          value = parseFloat(components[1]);
          unit = (components.length == 3) ? components[2] : null;
      }

      var originalValue = this.element.getStyle(property);
      return {
        style: property.camelize(),
        originalValue: unit=='color' ? parseColor(originalValue) : parseFloat(originalValue || 0),
        targetValue: unit=='color' ? parseColor(value) : value,
        unit: unit
      };
    }.bind(this)).reject(function(transform){
      return (
        (transform.originalValue == transform.targetValue) ||
        (
          transform.unit != 'color' &&
          (isNaN(transform.originalValue) || isNaN(transform.targetValue))
        )
      );
    });
  },
  update: function(position) {
    var style = { }, transform, i = this.transforms.length;
    while(i--)
      style[(transform = this.transforms[i]).style] =
        transform.unit=='color' ? '#'+
          (Math.round(transform.originalValue[0]+
            (transform.targetValue[0]-transform.originalValue[0])*position)).toColorPart() +
          (Math.round(transform.originalValue[1]+
            (transform.targetValue[1]-transform.originalValue[1])*position)).toColorPart() +
          (Math.round(transform.originalValue[2]+
            (transform.targetValue[2]-transform.originalValue[2])*position)).toColorPart() :
        (transform.originalValue +
          (transform.targetValue - transform.originalValue) * position).toFixed(3) +
            (transform.unit === null ? '' : transform.unit);
    this.element.setStyle(style, true);
  }
});

Effect.Transform = Class.create({
  initialize: function(tracks){
    this.tracks  = [];
    this.options = arguments[1] || { };
    this.addTracks(tracks);
  },
  addTracks: function(tracks){
    tracks.each(function(track){
      track = $H(track);
      var data = track.values().first();
      this.tracks.push($H({
        ids:     track.keys().first(),
        effect:  Effect.Morph,
        options: { style: data }
      }));
    }.bind(this));
    return this;
  },
  play: function(){
    return new Effect.Parallel(
      this.tracks.map(function(track){
        var ids = track.get('ids'), effect = track.get('effect'), options = track.get('options');
        var elements = [$(ids) || $$(ids)].flatten();
        return elements.map(function(e){ return new effect(e, Object.extend({ sync:true }, options)) });
      }).flatten(),
      this.options
    );
  }
});

Element.CSS_PROPERTIES = $w(
  'backgroundColor backgroundPosition borderBottomColor borderBottomStyle ' +
  'borderBottomWidth borderLeftColor borderLeftStyle borderLeftWidth ' +
  'borderRightColor borderRightStyle borderRightWidth borderSpacing ' +
  'borderTopColor borderTopStyle borderTopWidth bottom clip color ' +
  'fontSize fontWeight height left letterSpacing lineHeight ' +
  'marginBottom marginLeft marginRight marginTop markerOffset maxHeight '+
  'maxWidth minHeight minWidth opacity outlineColor outlineOffset ' +
  'outlineWidth paddingBottom paddingLeft paddingRight paddingTop ' +
  'right textIndent top width wordSpacing zIndex');

Element.CSS_LENGTH = /^(([\+\-]?[0-9\.]+)(em|ex|px|in|cm|mm|pt|pc|\%))|0$/;

String.__parseStyleElement = document.createElement('div');
String.prototype.parseStyle = function(){
  var style, styleRules = $H();
  if (Prototype.Browser.WebKit)
    style = new Element('div',{style:this}).style;
  else {
    String.__parseStyleElement.innerHTML = '<div style="' + this + '"></div>';
    style = String.__parseStyleElement.childNodes[0].style;
  }

  Element.CSS_PROPERTIES.each(function(property){
    if (style[property]) styleRules.set(property, style[property]);
  });

  if (Prototype.Browser.IE && this.include('opacity'))
    styleRules.set('opacity', this.match(/opacity:\s*((?:0|1)?(?:\.\d*)?)/)[1]);

  return styleRules;
};

if (document.defaultView && document.defaultView.getComputedStyle) {
  Element.getStyles = function(element) {
    var css = document.defaultView.getComputedStyle($(element), null);
    return Element.CSS_PROPERTIES.inject({ }, function(styles, property) {
      styles[property] = css[property];
      return styles;
    });
  };
} else {
  Element.getStyles = function(element) {
    element = $(element);
    var css = element.currentStyle, styles;
    styles = Element.CSS_PROPERTIES.inject({ }, function(results, property) {
      results[property] = css[property];
      return results;
    });
    if (!styles.opacity) styles.opacity = element.getOpacity();
    return styles;
  };
}

Effect.Methods = {
  morph: function(element, style) {
    element = $(element);
    new Effect.Morph(element, Object.extend({ style: style }, arguments[2] || { }));
    return element;
  },
  visualEffect: function(element, effect, options) {
    element = $(element);
    var s = effect.dasherize().camelize(), klass = s.charAt(0).toUpperCase() + s.substring(1);
    new Effect[klass](element, options);
    return element;
  },
  highlight: function(element, options) {
    element = $(element);
    new Effect.Highlight(element, options);
    return element;
  }
};

$w('fade appear grow shrink fold blindUp blindDown slideUp slideDown '+
  'pulsate shake puff squish switchOff dropOut').each(
  function(effect) {
    Effect.Methods[effect] = function(element, options){
      element = $(element);
      Effect[effect.charAt(0).toUpperCase() + effect.substring(1)](element, options);
      return element;
    };
  }
);

$w('getInlineOpacity forceRerendering setContentZoom collectTextNodes collectTextNodesIgnoreClass getStyles').each(
  function(f) { Effect.Methods[f] = Element[f]; }
);

Element.addMethods(Effect.Methods);
var PRODUCT = {

    init: function() {

        $prevButton = {};
        PRODUCT.tabs.init();
        PRODUCT.relatedSlider.init();
        PRODUCT.mediaSlider.init();
        PRODUCT.dropkickSelect.init();
        PRODUCT.thumbsSlider.init();
    },

    /**
     * Product Tabs
     */
    tabs: {
        init: function() {
            jQuery('.tab-nav-item').click(function(e){
                e.preventDefault();
                var $this = jQuery(this);
                var tabId = $this.data('id');
                jQuery('.tab-item').removeClass('active');
                jQuery('.tab-nav-item').removeClass('active');

                if ($this.hasClass('tab-oc')) {
                    jQuery('.oc-ti').addClass('active');
                } else {
                    jQuery('.tab-item').addClass('active');
                    jQuery('.oc-ti').removeClass('active');
                }

                $this.addClass('active');
                return false;
            });
        }
    },

    /**
     * Slider for related products
     */
    relatedSlider: {
        init: function() {

            var slideNum   = 0;
            var $slide     = jQuery('.related-slider .slide');
            var slideWidth = $slide.width();
            var numSlides  = jQuery('.related-slider .slide').length;
            var $slider    = jQuery('.related-slider');
            var isAnimated = false;

            if (numSlides > 1) {
                jQuery('span.related-next').show();
            }

            // caclulate width on load
            calculateWidth();

            // update width on resize
            jQuery(window).resize(function() {
                calculateWidth();
            });

            // Next button
            jQuery('.related-next').click(function(e) {
                e.preventDefault();
                if (numSlides <= slideNum || isAnimated) {
                    return false;
                }
                slideNum++;
                animateSlider(slideNum, slideWidth);
                return false;
            });

            // Next button
            jQuery('.related-previous').click(function(e) {
                e.preventDefault();
                if (slideNum <= 0 || isAnimated) {
                    return false;
                }
                slideNum --;
                animateSlider(slideNum, slideWidth);
                return false;
            });

            // Animate Slider
            function animateSlider (slideNum, slideWidth) {
                isAnimated = true;
                $slider.animate({
                    'marginLeft': - slideNum * slideWidth
                }, 250, "linear", function() {
                    // animation completed
                    isAnimated = false;
                    if (slideNum >= 1) {
                        jQuery('span.related-previous').show();
                    } else {
                        jQuery('span.related-previous').hide();
                    }
                    if (slideNum == (numSlides - 1)) {
                        jQuery('span.related-next').hide();
                    } else {
                        jQuery('span.related-next').show();
                    }
                });
            }

            // Calculate width on load and resize
            function calculateWidth () {
                var slideWidth = $slide.width();
                jQuery('#previouslyviewed').css('width', slideWidth);
                $slider.css('width', slideWidth * numSlides);
            }

        }
    },

    /** Thumbnails Slider */
    mediaSlider: {
        init: function() {
            var currentThumb = 1;
            var numThumbs = jQuery('#thumbs a').length;

            if (numThumbs > 1) {
                // has thumbnails
                jQuery('span.thumbs-next').show();
                jQuery('span.thumbs-previous').show();
                toggleActiveState();
            }

            jQuery('.nav-dot').click(function(e) {
                e.preventDefault();
                currentThumb = jQuery(this).data('num');
                clickThumb();
                return false;
            });

            // swipe left
            jQuery('.colMob.prod-det-views, #product-media-load .product-image').on('swipeleft', function(e){
                return false; //asked to remove swipe but retained function in case of rollback request
                e.preventDefault();
                if (currentThumb > 1) {
                    currentThumb = currentThumb - 1;
                } else {
                    currentThumb = numThumbs;
                }
                clickThumb();
            });

            // swipe right
            jQuery('.colMob.prod-det-views, #product-media-load .product-image').on('swiperight', function(e){
                //asked to remove swipe but retained function in case of rollback request
                return false;
                e.preventDefault();
                if (currentThumb < numThumbs) {
                    currentThumb = currentThumb + 1;
                } else {
                    currentThumb = 1;
                }
                clickThumb();
            });


            //jQuery('.nav-dot').click(function(e) {
            //    e.preventDefault();
            //    currentThumb = jQuery(this).data('num');
            //    clickThumb();
            //    return false;
            //});

            //jQuery('.thumbs-next').click(function() {
            //    if (currentThumb < numThumbs) {
            //        currentThumb++;
            //    } else {
            //        currentThumb = 1;
            //    }
            //    clickThumb();
            //});
            //
            //jQuery('.thumbs-previous').click(function() {
            //    if (currentThumb > 1) {
            //        currentThumb--;
            //    } else {
            //        currentThumb = numThumbs;
            //    }
            //    clickThumb();
            //});

            jQuery('ul.details_thumbs li img').each(function(){

                jQuery(this).on('click',function(){
                    currentThumb = jQuery(this).parent().parent().index() + 1;
                    toggleActiveState();

                    var imgSrc = jQuery('ul.details_thumbs li:nth-child('+currentThumb+') a img').attr('src');
                    jQuery('.product-image img').attr('src',imgSrc);

                })

            });

            /**
             * Click Thumbnail
             */
            function clickThumb() {
                var imgSrc = jQuery('ul.details_thumbs li:nth-child('+currentThumb+') a img').attr('src');
                jQuery('.product-image img').attr('src',imgSrc);
                jQuery('ul.details_thumbs li:nth-child('+currentThumb+') a img').click();
                toggleActiveState();
            }

            /**
             * Toggle thumbnail active state
             */
            function toggleActiveState() {
                jQuery('ul.details_thumbs li a').removeClass('active');
                jQuery('ul.details_thumbs li:nth-child('+currentThumb+') a').addClass('active');
                jQuery('.nav-dot').removeClass('active');
                jQuery('ul.nav-dot-wrapper li:nth-child('+currentThumb+')').addClass('active');
            }
        }
    },
    
    /**
     * Dropkick Select
     */
    dropkickSelect: {
        init: function() {
            jQuery('#ring_sizes').dropkick({
                mobile: true
            });
            jQuery('#chain_length_config').dropkick({
                mobile: true
            });
        }
    },

    dropkickSelect: {
        init: function() {
            jQuery('#chain_length_config').dropkick({
                mobile: true
            });
        }
    },

    /**
     * Slider if more than 4 thumbnails
     */
    thumbsSlider: {
        init: function() {

            if (jQuery('.details_thumbs li').length > 4) {
                jQuery('#thumbs').append('<a class="arrow icon-chevron-down thumbs-next" href="#"></a>');
                jQuery('#thumbs').prepend('<a class="arrow icon-chevron-up thumbs-prev" href="#"></a>');
                var $nextButton = jQuery('.thumbs-next');
                var $prevButton = jQuery('.thumbs-prev');
                // $prevButton = jQuery('.ui-datepicker-prev');
                $nextButton.hide();
                $prevButton.hide();
                var $thumbImg  = jQuery('.details_thumbs li:lt(1) img');
                $thumbImg.on('load', function(){
                    var imgHeight = jQuery(this).height();
                    var imgWidth  = jQuery(this).width();
                    var $thumbs   = jQuery('.details_thumbs');
                    var $thumbsContainer = jQuery('#thumbs');
                    var thumbsHeight = (imgHeight + 12) * 4 + 10;
                    // $thumbsContainer.css('height', thumbsHeight);
                    $nextButton.css('marginLeft', (imgWidth / 2) - 5);
                    $prevButton.css('marginLeft', (imgWidth / 2) - 5);
                    $nextButton.show();
                    $nextButton.click(function(e) {
                        e.preventDefault();
                        $thumbs.css('marginTop', - thumbsHeight - 30);
                        $nextButton.hide();
                        $prevButton.show();
                        //$thumbs.animate({
                        //   marginTop:  - thumbsHeight - 30
                        //}, 100, function(){
                        //    $nextButton.hide();
                        //    $prevButton.show();
                        //});
                        return false;
                    });
                    $prevButton.click(function(e) {
                        e.preventDefault();
                        $thumbs.css('marginTop', 0);
                        $prevButton.hide();
                        $nextButton.show();
                        //$thumbs.animate({
                        //    marginTop:  - 0
                        //}, 100, function(){
                        //    $prevButton.hide();
                        //    $nextButton.show();
                        //});
                        return false;
                    });
                });

                jQuery(window).resize(function() {

                    // if (!$prevButton.isVisible()) {
                    if (!$prevButton.is(':visible')) {
                        $nextButton.show();
                        var imgHeight = $thumbImg.height();
                        //var $thumbs = jQuery('.details_thumbs');
                        var $thumbsContainer = jQuery('#thumbs');
                        var thumbsHeight = (imgHeight + 12) * 4 + 10;
                        $thumbsContainer.css('height', thumbsHeight);
                    }
                });


            }
        }


    }

};

jQuery(function() {
    PRODUCT.init();
});

function openRingSizeMenu() {
    jQuery('body').addClass('js-no-overflow');
    jQuery('#ring-size-slide-out-menu').addClass('active');
    jQuery('#ring-size-overlay').fadeIn(100);
    return false;
}

function closeRingSizeMenu() {
    jQuery('body').removeClass('js-no-overflow');
    jQuery('#ring-size-slide-out-menu').removeClass('active');
    jQuery('#ring-size-overlay').fadeOut(100);
    return false;
}

function isScrollingRingSizeList(){
    jQuery('#ring-size-slide-out-menu .ring-size-list').on('touchmove', function() {
        jQuery('#ring-size-slide-out-menu .ring-size-list').addClass('scrolling');
        
        setTimeout(function(){
            jQuery('#ring-size-slide-out-menu .ring-size-list').removeClass('scrolling');
        },600);
    });
};

function selectRingSize(elm, size) {
    jQuery('#ring_sizes').val(size);
    jQuery('.ring-size-list div').removeClass('selected');
    elm.addClass('selected');
    jQuery('.ring-size-continue-btn').removeClass('disabled');
}

function ringSizeClick() {
    jQuery('.ring-size-list div').on('touchstart click', function () {
        var elm  = jQuery(this);
        var size = elm.data('ring-size');
        var delay = 0;

        if (jQuery(window).width() < 1024) {
           delay = 600;
        }

        setTimeout(function(){
            if(!jQuery('#ring-size-slide-out-menu .ring-size-list').hasClass('scrolling')) {
                selectRingSize(elm, size);
            }
        },delay);
    });
}

function hasRingSizeOptionsOverflow() {
    var ul = jQuery('#ring-size-slide-out-menu .ring-size-list');

    if (ul.prop('scrollHeight') > ul.height()) {
        jQuery('#ring-size-slide-out-menu .overflow-arrow-container').show();
    }
}

function hasScrollRingSizeList() {
    jQuery('#ring-size-slide-out-menu .overflow-arrow-container').on('touchstart click', function () {
        var ul = jQuery('#ring-size-slide-out-menu .ring-size-list');

        if(jQuery('i', this).hasClass('up')) {
            ul.scrollTop(ul.scrollTop() - 50);
        } else {
            ul.scrollTop(ul.scrollTop() + 50);
        }
    });
}

function addToCartViaRingSizeMenu(elm) {
    if (jQuery(elm).hasClass('disabled')) {
        return false;
    }

    productAddToCartForm.submit(this);
}

jQuery(document).ready(function () {
    isScrollingRingSizeList();
    ringSizeClick();
    hasRingSizeOptionsOverflow();
    hasScrollRingSizeList();
});
