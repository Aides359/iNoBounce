/*! iNoBounce - v0.1.2
 * https://github.com/lazd/iNoBounce/
 * Copyright (c) 2013 Larry Davis <lazdnet@gmail.com>; Licensed BSD */
(function(global) {
    // Stores the X & Y position where the touch started
    var startY = 0;
    var startX = 0;

    // Store enabled status
    var enabled = false;

    // List of classes that allow X scrolling on element
    var relaxedClasses = [];

    var handleTouchmove = function(evt) {
        // Get the element that was scrolled upon
        var el = evt.target;


        // Check all parent elements for scrollability
        while (el !== document.body) {
            // Get some style properties
            var style = window.getComputedStyle(el);

            if (!style) {
                // If we've encountered an element we can't compute the style for, get out
                break;
            }

			// Check if element has one of the relaxed classes
            var strict = !(relaxedClasses.length > 0 && relaxedClasses.some(function(value) { return el.classList.contains(value) }))

            var scrolling = style.getPropertyValue('-webkit-overflow-scrolling');

            // Handle Y
            var overflowY = style.getPropertyValue('overflow-y');
            var height = parseInt(style.getPropertyValue('height'), 10);

            // Determine if the element should scroll in Y
            var isYScrollable = scrolling === 'touch' && (overflowY === 'auto' || overflowY === 'scroll');
            var canYScroll = el.scrollHeight > el.offsetHeight;

            if (!strict) {
                // Handle X
                var overflowX = style.getPropertyValue('overflow-x');
                var width = parseInt(style.getPropertyValue('width'), 10);

                // Determine if the element should scroll in X
                var isXScrollable = scrolling === 'touch' && (overflowX === 'auto' || overflowX === 'scroll');
                var canXScroll = el.scrollWidth > el.offsetWidth;
            }

            if ((isYScrollable && canYScroll) || (!strict && (isXScrollable && canXScroll))) {
                var curY, curX;
                var isAtTop, isAtBottom, isAtLeft, isAtRight;

                // Get the current Y position of the touch
                curY = evt.touches ? evt.touches[0].screenY : evt.screenY;

                // Determine if the user is trying to scroll past the top or bottom
                // In this case, the window will bounce, so we have to prevent scrolling completely
                isAtTop = (startY <= curY && el.scrollTop === 0);
                isAtBottom = (startY >= curY && el.scrollHeight - el.scrollTop === height);

                if (!strict) {
                    // Get the current X position of the touch
                    curX = evt.touches ? evt.touches[0].screenX : evt.screenX;

                    // Determine if the user is trying to scroll past the left or right
                    // In this case, the window will bounce, so we have to prevent scrolling completely
                    isAtLeft = (startX <= curX && el.scrollLeft === 0);
                    isAtRight = (startX >= curX && el.scrollWidth - el.scrollLeft === width);
                }

                // Stop a bounce bug when at the bottom or top of the scrollable element or at left or right if not in strict mode
                if ((isAtTop || isAtBottom) && (strict || isAtLeft || isAtRight)) {
                    evt.preventDefault();
                }

                // No need to continue up the DOM, we've done our job
                return;
            }

            // Test the next parent
            el = el.parentNode;
        }
        // Stop the bouncing -- no parents are scrollable
        evt.preventDefault();
    };

    var handleTouchstart = function(evt) {
        // Store the first X & Y position of the touch
        startY = evt.touches ? evt.touches[0].screenY : evt.screenY;
        startX = evt.touches ? evt.touches[0].screenX : evt.screenX;
    };

    var enable = function() {
        // Listen to a couple key touch events
        window.addEventListener('touchstart', handleTouchstart, false);
        window.addEventListener('touchmove', handleTouchmove, false);
        enabled = true;
    };

    var disable = function() {
        // Stop listening
        window.removeEventListener('touchstart', handleTouchstart, false);
        window.removeEventListener('touchmove', handleTouchmove, false);
        enabled = false;
    };

    var isEnabled = function() {
        return enabled;
    };

    var addRelaxedClass = function(className) {
        if (relaxedClasses.indexOf(className) === -1) {
            relaxedClasses.push(className);
        }
    }

    var removeRelaxedClass = function(className) {
        var index = relaxedClasses.indexOf(className);
        if (index > -1) {
            relaxedClasses.splice(index, 1);
        }
    }

    // Enable by default if the browser supports -webkit-overflow-scrolling
    // Test this by setting the property with JavaScript on an element that exists in the DOM
    // Then, see if the property is reflected in the computed style
    var testDiv = document.createElement('div');
    document.documentElement.appendChild(testDiv);
    testDiv.style.WebkitOverflowScrolling = 'touch';
    var scrollSupport = 'getComputedStyle' in window && window.getComputedStyle(testDiv)['-webkit-overflow-scrolling'] === 'touch';
    document.documentElement.removeChild(testDiv);

    if (scrollSupport) {
        enable();
    }

    // A module to support enabling/disabling iNoBounce
    var iNoBounce = {
        enable: enable,
        disable: disable,
        isEnabled: isEnabled,
        addRelaxedClass: addRelaxedClass,
        removeRelaxedClass: removeRelaxedClass
    };

    if (typeof module !== 'undefined' && module.exports) {
        // Node.js Support
        module.exports = iNoBounce;
    }
    if (typeof global.define === 'function') {
        // AMD Support
        (function(define) {
            define(function() { return iNoBounce; });
        }(global.define));
    } else {
        // Browser support
        global.iNoBounce = iNoBounce;
    }
}(this));