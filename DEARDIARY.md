
#Screen Machine
####A router.

##Status: Dream + Code Snippets
Screen Machine is currently under active development but there is no ETA and it is not useable.

##Idea
Screen Machine will attempt to decouple view rendering tech from screen composition, with support for focused view libs. It should provide a few features I have seen and liked, or would like to have seen, and try not to make server-side rendering impossible.

##Challenges/Features
- Interpret URL and querystring parameters (duh, it's a router)
- Run async tasks before transitions
- Support order-dependent async tasks
- Support sibling views, nested views, and ancestor state views
- Compile in-app hrefs within views
- Programatic navigation and redirects
- PushState or hash routing
- Leverage user-supplied Promise lib
- Call into user-supplied event bus
- Create adapters for some view libs.
- Keep the codebase maintainable
- Keep the API simple but powerful
- Migrate to ES6+
- Offer server-side rendering
