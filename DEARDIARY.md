
#Screen Machine
####A router.

##Status: Design Concepts
Screen Machine is currently under active development but there is no ETA and it is not useable.

##Idea
Screen Machine will attempt to decouple view rendering tech from screen composition, with support for focused view libs. It should provide a few features I have seen and liked, or would like to have seen, and try not to make server-side rendering impossible.

##Challenges/Features
- Interpret URL and querystring parameters (duh, it's a router)
- Run async tasks before transitions
- Support order-dependent async tasks
- Support ~~sibling views~~, nested views, ~~and ancestor state views~~
- Compile in-app hrefs within views
- Programatic navigation and redirects
- PushState or hash routing
- Leverage user-supplied Promise lib
- Call into user-supplied event bus
- Create adapters for some view libs.
- Keep the codebase maintainable
- Keep the API simple but powerful
- Migrate to ES6
- Offer server-side rendering


07-23-15 View composition
---
Targeting sibling and ancestor views has become unlikely. This feature may be present in UI-Router, but it is unclear to me how this is possible without [leaking DOM nodes](https://github.com/angular-ui/ui-router/issues/545) or re-rendering the entire component tree from its root on every state transition (This is not ok). The view tree becomes completely arbitrary and unpredectable when child states are allowed to define components that populate view tags higher in the hierarchy than ONE ancestor, i.e. parent state. My gut tells me sibling views create a similar problem. [Maybe React Router will pull it off](https://github.com/rackt/react-router/issues/1012#issuecomment-86227635), but again, I don't see how its possible without a bunch of bookkeeping to prevent leaks. I can't tell [if Ember even thinks its a good idea](https://github.com/emberjs/ember.js/issues/10104#issuecomment-121737912). It [may not even be necessary](https://youtu.be/dqJRoh8MnBo?t=37m17s). Every time I think of a use for it I quickly figure out an alternate approach that accomplishes the same effect with nesting.

####Nesting
---

Let's say that at the root of our app we've got an `<sm-view>`.

Implicit `root` state `/`:

```html
<body>
    <app-header></app-header>
    <sm-view></sm-view>
</body>
```

Add a new state, like `vendors`. Its parent state is the `root` of the app. Bear in mind, **this does not necessarily represent the final API and is effectively pseudo-code.**

```javascript
machine
    .state('vendors', {
        path: '/vendors',
        component: 'vendors-stuff' // <- populate root sm-view with vendors-stuff component
    })
```

Transitioning the app to the `vendors` state transforms the DOM into this:

```html
<body>
    <app-header></app-header>
    <sm-view>
        <vendors-stuff>
            <!-- [content specific to vendors] -->
            <!-- maybe a list of vendors or outstanding bills, etc -->
        </vendors-stuff>
    </sm-view>
</body>
```

Transforms? More like Crams an InnerChild in there. Easy. We could do that with Page.js. Let's *nest*.

```javascript
machine
    .state('customers', {
        path: '/customers',
        component: 'customers-stuff' // <- populate root sm-view with customers stuff component
    })
    .state('customers.profile', {
        path: '/:customerId',
        component: 'customer-profile', // <- view will target sm-view#customers in customers-stuff component
    })
```

The `customers` state will populate the root `<sm-view>` tag with the `customers-stuff` component. No big deal. But, it just so happens that the `customers-stuff` component includes another `<sm-view>`.

Entering `customers` state `/customers`:

```html
<body>
    <app-header></app-header>
    <sm-view>
        <customers-stuff>
            <!-- [content specific to customers] -->
            <!-- e.g. a sidebar list of customers -->
            <sm-view id="customers"></sm-view> 
        </customers-stuff>
    </sm-view>
</body>
```

Entering `customers.profile` state `/customers/42`

```html
<body>
    <app-header></app-header>
    <sm-view>
        <customers-stuff>
            <!-- [content specific to customers] -->
            <!-- e.g. a sidebar list of customers -->
            <sm-view id="customers">
                <customer-profile>
                    <!-- [content specific to customer #42] -->
                    <!-- e.g. Name, Email, etc -->
                    <sm-view id="customers.profile"></sm-view>
                </customer-profile>
            </sm-view>
        </customers-stuff>
    </sm-view>
</body>
```

This is all pretty straight-forward. A child `State` can choose a component that populates the "nested" `<sm-view>` of its parent's component. But there is something missing here. The `customer-profile` component has an `<sm-view>` too. But its kinda worthless right now. If we want it preloaded with something, like a high-level report component we can do that.

```javascript
machine
    .state('customers', {
        path: '/customers',
        component: 'customers-stuff' // <- populate root sm-view with customers stuff component
    })
    .state('customers.profile', {
        path: '/:customerId',
        component: 'customer-profile', // <- view will target #customers in customers-stuff component (defined in customers state above)
        preload: 'customer-report' // <- preload #customers.profile sm-view with 'customer-report' component for this customer
    })
```

Now going to `/customers/42` will render this:

```html
<body>
    <app-header></app-header>
    <sm-view>
        <customers-stuff>
            <!-- [content specific to customers] -->
            <!-- e.g. a sidebar list of customers -->
            <sm-view id="customers">
                <customer-profile>
                    <!-- [content specific to customer #42] -->
                    <!-- e.g. Name, Email, etc -->
                    <sm-view id="customers.profile">
                        <customer-report>
                            <!-- high-level report for customer #42 -->
                        </customer-report>
                    </sm-view>
                </customer-profile>
            </sm-view>
        </customers-stuff>
    </sm-view>
</body>
```

Add one more application state for editing a customer.

```javascript
machine
    .state('customers.profile.edit', {
        path: '/edit',
        component: 'customer-form' // <- put the customer-form in sm-view#customers.profile
    })
```

The result at `/customers/42/edit`:

```html
<body>
    <app-header></app-header>
    <sm-view>
        <customers-stuff>
            <!-- [content specific to customers] -->
            <!-- e.g. a sidebar list of customers -->
            <sm-view id="customers">
                <customer-profile>
                    <!-- [content specific to customer #42] -->
                    <!-- e.g. Name, Email, etc -->
                    <sm-view id="customers.profile">
                        <customer-form>
                            <!-- form for editing customer #42 -->
                        </customer-form>
                    </sm-view>
                </customer-profile>
            </sm-view>
        </customers-stuff>
    </sm-view>
</body>
```

07-27-15 Async Transition Tasks
---
UI-Router has a very cool feature that allows the developer to define `resolves`. A resolve is basically a function or value that will be injected into a view's controller. It can also just be something you want done during a transition into a given state.

The Ember router also supports asyncronous loading of Model data. This data is used to hydrate your templates and controllers.
