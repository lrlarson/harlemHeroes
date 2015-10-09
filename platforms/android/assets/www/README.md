# Architecture
- SMACSS (https://smacss.com/) inspired architecture
- Hashchange event is used to trigger page transitions
- 3 container pages + AJAX in index.html are used to load current, previous, and next pages based on hash
- Individual pages stored as HTML fragments in /pages (max page count needs to be set in application.js)
- Bootstrap-grid-only used for layout (https://github.com/zirafa/bootstrap-grid-only)
- Draggable swipe interaction allows tactile page turning, can also navigate with arrow keys and changing/linking to hash value directly in browser

## Application.js
- The lastpage variable will need to be updated to reflect the actual number of pages you have, i.e. 8.html
- There are also various global variables used to set animation speeds.