=== Wp Rest Api Search ===
- Contributors:      ocygankova
- Tags:              block, search, live search, instant search, REST API, ajax, Gutenberg, block editor, custom post types
- Tested up to:      6.7
- Stable tag:        0.1.0
- License:           GPL-2.0-or-later
- License URI:       https://www.gnu.org/licenses/gpl-2.0.html

# WP REST API Search (Live Searchbar Block)

Live searchbar block for WordPress. Lets editors select which post types to search and performs client-side queries to the WordPress REST API with debounced requests and sanitized rendering.
Switch to the `build` branch for the latest stable release.



## Stack
- WordPress plugin and block (Gutenberg)
  - PHP for plugin bootstrap and server-side render callback
  - JavaScript for editor (block editor) and frontend view logic
  - SCSS for styles (compiled via @wordpress/scripts)
- Build tooling: `@wordpress/scripts`
- Package manager: npm (presence of `package.json` and `package-lock.json`)
- Frontend dependency: `dompurify` for sanitizing generated HTML


## Entry points
- PHP plugin bootstrap: `wp-rest-api-search.php`
  - Hooks `init` to register block types from `build/blocks-manifest.php` and then `register_block_type` for each built block directory.
- Block metadata: `src/wp-rest-api-search/block.json`
  - `editorScript`: `file:./index.js`
  - `editorStyle`: `file:./index.css`
  - `style`: `file:./style-index.css`
  - `render`: `file:./render.php` (server-side markup for input, clear button, results container)
  - `viewScript`: `file:./view.js` (frontend behavior)
- Block editor implementation: `src/wp-rest-api-search/edit.js`
  - Fetches post types from `/wp/v2/types`, allows selecting which types to search, stores selection in block attributes.
- Frontend behavior: `src/wp-rest-api-search/view.js`
  - Debounced (600ms) search against the REST API with `_embed` enabled for featured images.
  - Uses `DOMPurify` to sanitize the rendered results HTML.
- Server-side render: `src/wp-rest-api-search/render.php`
  - Outputs the search input, clear button, and a results container; includes `data-post-types` attribute with selected types.


## Scripts (npm)
Defined in `package.json`:

- `npm run build` — Build block assets for production with webpack, copy PHP files, and generate the `blocks-manifest.php`.
- `npm run start` — Start development build with watch mode; also copies PHP and updates blocks manifest.
- `npm run format` — Format source files.
- `npm run lint:css` — Lint styles.
- `npm run lint:js` — Lint JavaScript.
- `npm run packages-update` — Update WordPress packages.
- `npm run plugin-zip` — Create a distributable plugin zip.


## == Description ==
A live searchbar block that queries the WordPress REST API for selected post types. Editors choose which post types to include (excluding internal types like `wp_*`, `attachment`, `nav_menu_item`). The frontend performs debounced searches and displays results including featured thumbnails when available.

Key behaviors:
- Minimum 3 characters before triggering a search
- Debounce (600ms) to reduce requests
- Cancel-in-flight requests on new input
- Click-outside to close the results panel
- Clear button toggles based on input value
- Sanitized result HTML via `DOMPurify`


## == Installation ==
1. Upload the plugin folder to `/wp-content/plugins/wp-rest-api-search` or install via the WordPress Plugins screen.
2. Activate the plugin from the Plugins screen.
3. In the block editor, add the “Live Searchbar” block to a post, page, or template and select the post types you want to include.

Requirements:
- WordPress 6.7+ (block registration APIs used are optimized for 6.7/6.8)
- PHP 7.4+


## == Frequently Asked Questions ==

### How are results fetched?
The frontend calls the REST API for each selected post type:
```
/wp-json/wp/v2/{type}?search={query}&_embed
```
It merges results and renders a simple list with an optional featured image.

### Why do I need to type at least 3 characters?
To reduce noise and limit network requests for very short queries.

### Does it search custom post types?
Yes—any post type that is exposed over the REST API (has a REST base) and is not filtered out in the block editor UI can be selected.

### Does it support pagination or “Load more”?
TODO: Not implemented in the current code. Results are the first page returned by each endpoint.


## == Screenshots ==
1. TODO: Editor UI where you select post types.
2. TODO: Frontend searchbar with results dropdown.


## == Changelog ==

### 0.1.0
- Initial release.


## Development

### Prerequisites
- Node.js and npm installed
- A WordPress environment (WordPress 6.7+; PHP 7.4+)

### Getting started
- Install dependencies:
  ```
  npm install
  ```
- Start development build (watch):
  ```
  npm run start
  ```
- Build for production:
  ```
  npm run build
  ```
- Create a zip for distribution:
  ```
  npm run plugin-zip
  ```

### Project layout
- `wp-rest-api-search.php` — plugin bootstrap and block registration
- `src/wp-rest-api-search/` — block source (editor, view, styles, render)
- `build/` — built assets and `blocks-manifest.php` generated by the build process


## Notes
- Uses WordPress core APIs to register block types from a manifest (optimized paths for WP 6.7/6.8).
- A GitHub Actions workflow exists at `.github/workflows/build-branch.yml` for building artifacts. (Details outside the scope of this README.)


## License
GPL-2.0-or-later. See `LICENSE` or the header in `wp-rest-api-search.php`.
