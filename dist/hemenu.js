/* 
 * heMenu v1.0.1
 * https://github.com/meceware/heMenu 
 * 
 * Made by Mehmet Celik (https://www.meceware.com/) 
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.heMenu = factory());
}(this, (function () { 'use strict';

  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function(s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i = matches.length;
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;
      };
  }

  var index = ((global, document) => {
    // If the global wrapper (window) is undefined, do nothing
    if ('undefined' === typeof global.document) {
      return;
    } // Default options


    const defaults = {
      menu: '.hemenu-menu',
      trigger: null,
      title: 'Menu',
      selected: 'selected',
      theme: 'light',
      position: 'left'
    };

    const forEach = (array, callback, scope) => {
      for (let i = 0; i < array.length; i++) {
        callback.call(scope, array[i]); // passes back stuff we need
      }
    };

    const closest = (element, selector, parent = document) => {
      while (element && element.nodeType === 1 && element !== parent) {
        if (element.matches(selector)) {
          return element;
        }

        element = element.parentElement || element.parentNode;
      }

      return null;
    };

    class heMenu {
      constructor(wrapper, options = {}) {
        // const isIE11 = navigator.userAgent.indexOf( 'MSIE' ) > -1 || navigator.appVersion.indexOf( 'Trident/' ) > -1;
        const getElement = (el, parent = document) => {
          if (el) {
            return 'string' === typeof el ? parent.querySelector(el) : el;
          }

          return null;
        }; // Extend options


        Object.keys(defaults).forEach(key => {
          if (!Object.prototype.hasOwnProperty.call(options, key)) {
            options[key] = defaults[key];
          }
        }); // Set options

        this.options = options; // Get the container

        this.wrapper = getElement(wrapper); // Check if wrapper exists

        if (!this.wrapper) {
          return;
        } // Disable double initialization


        if (this.wrapper.heMenu) {
          return;
        } // Set position


        forEach(['hemenu', `hemenu-${this.options.position}`, `hemenu-theme-${this.options.theme}`], cls => {
          this.wrapper.classList.add(cls);
        }); // Get menu element

        this.menu = getElement(this.options.menu, this.wrapper); // Check if the menu exists

        if (this.menu) {
          this.menu.classList.add('hemenu-navbar'); // Create title element and append it as the first child of the menu

          this.menuTitle = document.createElement('div');
          this.menuTitle.classList.add('hemenu-menu-title');
          this.menu.parentElement.insertBefore(this.menuTitle, this.menu); // Add menu title click event

          this.menuTitle.addEventListener('click', (event => {
            /** The opened ULs. */
            const panels = this.menu.querySelectorAll('.hemenu-menu-parent');
            /** The last opened UL. */

            const panel = panels[panels.length - 1];

            if (panel) {
              this.openPanel(panel);
              event.stopImmediatePropagation();
              return true;
            }

            return false;
          }).bind(this)); // Open selected panel initially

          const setSelectedList = (() => {
            /** All selected LIs. */
            const listitems = this.menu.querySelectorAll(`.${this.options.selected}`);
            /** The last selected LI. */

            const listitem = listitems[listitems.length - 1];
            /** The opened UL. */

            let panel = null;

            if (listitem) {
              panel = closest(listitem, 'ul', this.menu);
            }

            if (!panel) {
              panel = this.menu.querySelector('ul');
            }

            this.openPanel(panel);
          }).bind(this);

          setSelectedList(); // Set li's with level

          forEach(this.menu.querySelectorAll('ul li'), el => {
            if (el.querySelector('ul')) {
              el.classList.add('hemenu-menu-level');
            }
          });
          this.menu.addEventListener('click', (event => {
            /** The clicked element */
            const target = event.target;

            if (target.matches('a')) {
              return;
            }
            /** Parent listitem for the submenu.  */


            let listitem; //  Find the parent listitem.

            if (closest(target, 'span', this.menu)) {
              listitem = target.parentElement;
            } else if (closest(target, 'li', this.menu)) {
              listitem = target;
            } else {
              listitem = false;
            }

            if (listitem) {
              forEach(listitem.children, panel => {
                if (panel.matches('ul')) {
                  this.openPanel(panel);
                }
              });
              event.stopImmediatePropagation();
            }
          }).bind(this));
        } // Backdrop


        const addBackdrop = (self = this) => {
          //  Create the backdrop.
          const backdrop = document.createElement('div');
          backdrop.classList.add('hemenu-bg'); //  Backdrop close event.

          const close = event => {
            self.close();
            event.preventDefault();
            event.stopImmediatePropagation();
          };

          backdrop.addEventListener('touchstart', close.bind(self));
          backdrop.addEventListener('mousedown', close.bind(self));
          return backdrop;
        };

        this.wrapper.appendChild(addBackdrop()); // Add trigger event

        const triggerClick = event => {
          event.preventDefault();
          this.open();
        };

        const trigger = getElement(this.options.trigger);

        if (trigger) {
          trigger.addEventListener('click', triggerClick.bind(this));
        } // Store the instance in the container


        this.wrapper.heMenu = this;
        this.wrapper.setAttribute('data-hemenu-initialized', true);
      }

      openPanel(panel) {
        //Title above the panel to open.
        let title = this.options.title; // Get panel title

        forEach(panel.parentElement.children, child => {
          if (child.matches('a, span')) {
            title = child.textContent;
          }
        }); //  Set the title.

        this.menuTitle.textContent = title; //  Unset all panels from being opened and parent.

        forEach(panel.querySelectorAll('.hemenu-menu-parent'), open => {
          open.classList.remove('hemenu-menu-parent');
        });
        forEach(panel.querySelectorAll('.hemenu-menu-open'), open => {
          open.classList.remove('hemenu-menu-open');
        }); //  Set the current panel as being opened.

        panel.classList.remove('hemenu-menu-parent');
        panel.classList.add('hemenu-menu-open'); //  Set all parent panels as being parent.

        let parent = panel;
        let depth = 0;

        do {
          parent = closest(parent.parentElement, 'ul', this.menu);

          if (parent) {
            parent.classList.add('hemenu-menu-open');
            parent.classList.add('hemenu-menu-parent');
            depth++;
          }
        } while (parent);

        if (depth !== 0) {
          this.menuTitle.classList.add('hemenu-title-back');
        } else {
          this.menuTitle.classList.remove('hemenu-title-back');
        }
      }

      open() {
        this.wrapper.classList.add('hemenu-open');
        document.body.classList.add('hemenu-opened');
      }

      close() {
        this.wrapper.classList.remove('hemenu-open');
        document.body.classList.remove('hemenu-opened');
      } // Destroys and unloads the player


      destroy() {
        // We wrap this next part in try...catch in case the element is already gone for some reason
        try {
          if (!(this.wrapper.hasAttribute('data-hemenu-initialized') && this.wrapper.getAttribute('data-hemenu-initialized') === 'true' && this.wrapper.heMenu)) {
            return;
          }

          document.body.classList.remove('hemenu-opened');
          forEach([`hemenu-${this.options.position}`, `hemenu-theme-${this.options.theme}`, 'hemenu-open'], cls => {
            this.wrapper.classList.remove(cls);
          });
          this.wrapper.querySelector('.hemenu-bg').remove();
          this.wrapper.querySelector('.hemenu-menu-title').remove();

          if (this.menu) {
            this.menu.classList.remove('hemenu-navbar');
            this.menuTitle.remove();
            forEach(this.menu.querySelectorAll('.hemenu-menu-level'), el => {
              el.classList.remove('hemenu-menu-level');
            });
            forEach(this.menu.querySelectorAll('.hemenu-menu-parent'), el => {
              el.classList.remove('hemenu-menu-parent');
            });
            forEach(this.menu.querySelectorAll('.hemenu-menu-open'), el => {
              el.classList.remove('hemenu-menu-open');
            });
          } // TODO: remove click events


          this.wrapper.removeAttribute('data-hemenu-initialized'); // Delete the instance

          delete this.menu.heMenu;
        } catch (e) {// Nothing to do when error is invoked
        }
      }

    }

    heMenu.destroy = () => {
      forEach(document.querySelectorAll('[data-hemenu-initialized]'), el => {
        el.heMenu.destroy();
      });
    }; // Provide method for scanning the DOM and initializing heMenu from attribute


    heMenu.scan = () => {
      // API method for scanning the DOM and initializing vide instances from data-vide attribute
      // Scan the DOM for elements that have data-hemenu attribute and initialize new heMenu instance based on that attribute
      const scan = () => {
        forEach(document.querySelectorAll('[data-hemenu]'), el => {
          // Get the element
          // Check if the element is already instantiated
          if ('undefined' !== typeof el.heMenu) {
            // this element already has an instance
            return;
          }

          try {
            new heMenu(el, JSON.parse(decodeURIComponent(el.getAttribute('data-hemenu'))));
          } catch (e) {// Nothin to do when an error is invoked
          }
        });
      };

      if (document.readyState !== 'loading') {
        scan();
      } else {
        document.addEventListener('DOMContentLoaded', scan);
      }
    };

    heMenu.scan();
    window.heMenu = heMenu; // Return heMenu

    return heMenu;
  })('undefined' !== typeof window ? window : undefined, document);

  return index;

})));
