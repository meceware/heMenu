# heMenu

A small no-dependency, simple yet effective, multi-level off-canvas menu library.

## Browser Compatibility

heMenu runs on IE11+ and all modern browsers.

## Overhead

```
JS: 13.8 KB (5.1 KB gzipped)
CSS: 5 KB (1.2 KB gzipped)
```

## How To Use

Include the library

```html
<link type="text/css" rel="stylesheet" href="dist/hemenu.min.css" />
<script type="text/javascript" src="dist/hemenu.min.js"></script>
```

The default options are

```javascript
{
  menu: '.hemenu-menu',
  trigger: null,
  title: 'Menu',
  selected: 'selected',
  theme: 'light',
  position: 'left',
}
```

`menu` option provides the `nav` element container.

`trigger` is the trigger element selector (or the element itself) that opens the menu.

`title` option provides the default title.

`selected` provides the class name that the menu item is active.

`theme` is the theme. The library comes with two themes: `light` and `dark`.

`position` is the off-canvas menu position. It can be `left` or `right`.

The required HTML markup is as the following:

```html
<div id="menu-wrapper" className="hemenu">
  <div class="hemenu-content">
    <div class="hemenu-header">You can put any content here, or remove this element.</div>
    <div class="hemenu-menu">
      <nav id="menu">
        <ul>
          <li class="selected"><a href="#">Home</a></li>
          <li><span>About us</span>
            <ul class="">
              <li><a href="#about/history">History</a></li>
              <li><span>The team</span>
                <ul class="">
                  <li><a href="#about/team/management">Management</a></li>
                  <li><a href="#about/team/sales">Sales</a></li>
                  <li class="selected"><a href="#about/team/development">Development</a></li>
                </ul>
              </li>
              <li><a href="#about/address">Our address</a></li>
            </ul>
          </li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

    </div>
    <div class="hemenu-footer">The footer goes here! This element can be removed.</div>
  </div>
</div>
```

`hemenu-header` and `hemenu-footer` elements are optional. These can be removed.

To initialize the heMenu, following script can be used:

```js
new heMenu( '#menu-wrapper', {
  menu: '.hemenu-menu',
  trigger: '#your-trigger-element',
  title: 'Menu',
  selected: 'selected',
  theme: 'light',
  position: 'left',
} );
```

`data-hemenu` attribute can be used for direct initialization. If `data-hemenu` is used, heMenu is initialized according to the given options. The attribute needs to be filled with default options as:

```js
encodeURIComponent( JSON.stringify( {
  menu: '.hemenu-menu',
  trigger: '#right-trigger',
  title: 'Menu',
  selected: 'selected',
  theme: 'dark',
  position: 'right',
} ) )
```

This is especially useful for React components. Check the demo file for more information.

## Build
Clone the repo, run
```
npm install
```
followed by
```
npm run build
```
The output minified JS file will be at the dist folder.

You can help out by reporting any issues and feature requests.

## Credits

The design is inspired from [mmenu-light.js](https://mmenujs.com/mmenu-light).

## License

MIT