# AHU Javascript Notes

## Additional Project Ideas

  - move form into a separate view class
  - make subscribe not clobber a potential subscribers property on the observed 
    object

## Get Your Truth out of the DOM

The mantra of DRY code popularized by Rails is essentially a pithy way of stating that there should only ever be a single source of truth for any given item of information in your code.

I recently heard Jeremy Ashkenas refer to this idea when he said that client-side HTML application developers should try to moe their truth out  f the DOM. For example, don't scrape your DOM elements to build up an idea of what the data representation of something should be.

## Two Patterns

### MVC

MVC, aka MVP, MVVM, etc.

If we're moving truth out of the DOM, where do we store it? In a model, of course.

How do we display that model to a user? With a view, of course.

I'll really only be looking at the M and the V anyway.

There's a lot of fuzzy nomenclature around how to best describe what people are doing on the web. Maybe traditional MVC doesn't fit, maybe we're looking at more of a view/view controller type of situation. There are some blurred lines where web programming is concerned.

Regarding models, there's a lot of hooplah about how using Node on the server is awesome because you can use the same model code on the server as the client. I think this is wrong; you shouldn't worry about making them the same. A lot of the time, client-side models will be simplified versions of their server counterparts—because all they have to deal with is the presentation logic. They could even be amalgamations of two or more server models. The point is, don't worry about it.

### Publish/subscribe

aka Observer pattern

Really, a lot of what we're building today is going to depend on the idea of the Observer pattern. It's a relatively straightforward way to make some pretty clean, decoupled code.

## Roll Our Own

We'll be kinda cheating; starting with a hard-coded form which should probably be its own view model.

## Bad

What's wrong with this?

Stores data in the DOM. Let's say we're doing something to manipulate this sucker after the fact; votes, comments, or the like. When we update this stuff, we have to have a bunch of complex code that parses the DOM anew to get a grasp of what's going on with the link. Like good ol' PHP, we're mudding all sorts of concerns.

Not exactly awesome that I'm using hard-coded HTML right there in the JS too. Hmm.

What if we moved it into a model?

## Aside

Okay, so this is showing some stuff that is only here for demonstration purposes, but if you haven't seen anything like this before, it's good to know. Anyway, I got sick of having to specify the precise URL while I was testing this stuff; I just wanted to type in a few characters and have it grab a close match.

So one of the big deals with functional languages is so-called first class functions. That means you can pass functions around, for example as parameters to other functions.

You can also compose functions, or write functions that return other functions. That's what I'm doing here with the link_info function. I've moved the original object literal inside of a self-executing function expression, and then I return a function that actually searches through the URL keys of the objet literal looking for a match. A closure at work. Note that the object literal is now inaccessible from the outside world.

See what I'm doing there with for/in? Why is that dangerous in some cases?

Also, see how I'm assigning the URL property to the retrieved link info? What happens the second time I grab the same link info?

Last point, since I mentioned self-executing function expressions. It's generally a good idea to wrap all of your code in one. Why? (Limited damage to the global scope, less chance of conflicts, etc.) I didn't do it in my main.js because, well, it's already wrapped in a function because of the call to jQuery.

## Pubsub

Here's my implementation of the publish/subscribe pattern for use in this project.

Subscribe is relatively straightforward. It's just a function you call, passing the object you want to observe, the name of the event you want to observe, and the callback to trigger when that event happens.

Note that I'm just adding a "subscribers" property to the observed object. This shows off the extremely malleable nature of Javascript objects—they're really little more than dictionaries. You could argue that this is kind of sloppy; for example, what if the observed object already has a "subscribers" property used for some other purpose? Well, there are definitely ways around this, but I think the simplicity is a definite benefit here.

The other thing to note with subscribe is that I'm not passing the object doing the observing. I'm not passing a string representing the name of some method to call. Nope, I'm just padding a plain old function. That's gonna give me the most flexibility, because it could be an object's method, but it doesn't have to be.

Publish is perhaps a little more interesting, because it's intended to be called as a method on the object invoking it. But it's not a part of any class. It's just a standalone function. No problem, once again because Javascript is so malleable.

This last way is the way I'll generally set up the code to work. But grokking this idea—in addition to closures and other first-class-function stuff—is a key part to really understanding Javascript.

Maybe also note the way I'm wrapping each callback in a call to setTimeout, in an effort to keep things moving relatively fast. Probably not necessary in a demo app of this size, but hey, it's a useful trick to keep in mind for larger projects, an easy perceived performance win.

## Hello, Model

I'm throwing a bunch of stuff in here because we sort of need it all to get going.

### Link

First up is the Link model. It's a pretty straightforward Javascript constructor. There's nothing actually special about constructor functions in Javascript. The capitalized letter is just a convention, so you can tell it's supposed to be invoked with "new". It doesn't mean anything. There's no special class keyword. It's just a regular Javascript function. The magic happens when I call it with the "new" keyword, which actually shifts it into constructor mode. This basically means it takes a plain ol' object and injects it into the function, so that all references to "this" in the function refer to the injected object. Also, the object's internal [[Prototype]] property is pointed at the function's prototype object.

Yeah, so functions all have a prototype property. It's publicly available, so you can augment it. Objects have an internal [[Prototype]] property, but you can't reliably get access to it currently. It's how property lookup and inheritance work in Javascript: Does the object itself have the property? No? How about its prototype? No? How about its prototype's prototype? And so on, until you get to Object, which doesn't have a prototype.

Incidentally, calling a function designed to be a constructor without "new" has some weird side effects, since when "this" has no other meaning, it defaults to the global scope. So you get this strange side effect of setting up a lot of global variables. This is why some JS programmers advocate against using "new", and lobby for factory-style functions instead. There are some other benefits to that approach, like being able to set up fake "private" variables, but I'm going to be relatively straightforward here.

So after the initial Link function declaration, I add a couple of function to its prototype, get and set. That's a pretty common pattern in Javascript. It's a bit verbose, but it's another manifestation of the idea that Javascript doesn't give you much in the way of a language, but it gives you plenty of tools to build one.

Incidentally, I pretty much lifted the idea of .get and .set from Backbone. I don't really like it, but JS doesn't really have its own answer to Ruby's method_missing—maybe someday, though—so this is really the only way to wrap supplemental functionality around get/set calls.

Note the call to publish whenever set changes the value of a property.

### SharedLinkCollection

Another idea I stole from Backbone. It makes it handy to deal with collections of stuff, in my case, adding and maybe removing elements of the collection.

Note how it publishes an event whenever a link is added to the collection.

### SharedLinkCollectionView

The names are getting rather unwieldy here. I feel like a Java or Objective-C programmer.

Anywhow, I've created a view object for dealing with the collection as a whole.

There's our first call to "subscribe": Whenever a link is added to the collection, we want to know about it so we can generate a new SharedLinkView object.

Note that not a whole lot else is going on here—actually dealing with individual links gets delegated to SharedLinkView objects.

### SharedLinkView

As SharedLinkCollectionView is tied to a SharedLinkCollection, so SharedLinkView is tied to an individual link.

This is where all the logic for actually displaying an individual link takes place. Everything is very nicely decoupled. Even the communication is often indirect, via the publish/subscribe mechanism. Good times.

However, the actual view stuff is still hard-coded HTML sitting in the midst of my otherwise clean Javascript code. What do we do about that?

## Templates

So the current answer is templates. There are hella templating libraries out there. Now, I know we're rolling our own here, but I figured I'd punt on this one and just grab a library, and I chose Mustache.

Anyhow, so we're able to move the template file into its own script tag, with a type of "text/x-mustache" so it doesn't get parsed as JS by the browser. Note that it's got an id, so it can be grabbed trivially by jQuery.

Cool. So, my current thinking about how this relates to a more traditional pattern like view/view-controller. The templates, and how they integrate with the DOM (e.g., event handlers and such) really make them the views. The user interacts with them more or less directly. The classes I've suffixed with View actually act more like view controllers. User interaction gets passed up to these guys, and we deal with it there.

Anyway, so now I have no HTML in my JS. Cool. Cool cool cool.

## Pending

This is another big jump. Basically, in apparently one fell swoop, I've changed the app so that initially shared links are marked as pending first (simulating a remote call to the server or something) before being added to the shared-link list.

This purpose of this is to try and show the advantages of moving to this sort of model. It's all driven by changes to the underlying model. When the model is "saved", its id property gets updated, which the pending-link collection is waiting for, so that it can remove the link from its list. Meanwhile, the shared-link collection has been modified to watch the pending-link collection; when it sees that a link has been removed from the list, it knows that it can add it to its own list.

Note the little one-off subscribe call that I added to simulate the whole request process. When a link is initially created, it's only provided with a URL. This little simulation just spins for a couple seconds, then updates the link with the rest of the stored information. This shows the flexibility of the subscribe function, and the utility of designing Javascript code to operate on functions as much as possible. I just threw this shim in there without having to tie it to any sort of class.

One problem that comes to mind is the case where the "save" call errors out—the shared-link collection adds links whenever they're rmoved from the pending link collection. What if they were removed because the request couldn't be completed? So obviously this demo app has some cracks around the seams.

Note also that there's a lot of very similar code here, with the pending-link collection and views looking quite close to their shared-link cousins. Some of this stuff is looking ripe for pulling out into their own classes. Maybe I'll add yet another client-side MVC framework into the pool. Maybe not.

## Likes

So this adds the ability to "like" shared links. I added this to show what the bubble-up interaction between a view object and its associated model might look like. Obviously there's some more problems; being able to like the same link any number of times, for example. But it's still a good example of encapsulating business logic at the model level, and just handling display concerns at the view level.

## Modules

Looking at the code, like so many Javascript projects, it's become a big ball of mud. The methods are small and pretty understandable all by themselves, but looking at the code as a whole, it's hard to tell where one segment ends and another begins.

Like so much else in JS land, there are a ton of competing ways to handle this situation. Rails concatenates and minifies all project files itself. This is obviously pretty good, but it's sort of hacky in that it's not really being handled at the language level. That is, the order in which Javascript dependencies are loaded are ofttimes configured merely by the order of script tags in an HTML document.

Enter AMD, which stands for Asynchronous Model Definition. It provides a mechanism for Javascript code to specify its own requirements. Require.js, the library I used for this project, is an implementation of AMD.

There are two main functions in the AMD API: require and define. The former is pretty much a mechanism for loading script files; the latter is a variant that specifically defines modules that can be required by other scripts. Both take as their first argument an array of strings representing the file names of their dependencies. These are then injected into the functions' second argument, a function.

The really great thing about this is how decoupled it makes your modules; indeed, they can be renamed whatever you want when they get injected into the requiring module. The define API is flexible enough to allow you to provide an object literal to be returned, or—as will usually be the case—a function that gets executed, and whose return value is what the module provides when it's required. It feels really Javascripty.

The bad part of its feeling Javascripty is that it also feels like a lot of ceremony. Not only do you specify the paths to the dependencies, but then you have to specify what you're going to call them. It can get unwieldy with a lot of dependencies. That's the cost of configuration over convention, I suppose.

However, it seems like it would be beneficial for testing, since it seems like it'd be a good mechanism for injecting mock versions of dependencies.

All in all, I really like the idea of require.js. For best performance, especially in production, it generally needs something like a compile step that resolves all the dependencies and produces a single file, but hey, most web apps of any size are already doing something like it already.

There are also the competing standards. Node uses something very similar with its CommonJS exports system, which is also pretty badass. And of course ECMA is preparing a future version of Javascript, dubbed Harmony, that has its own syntax for modules.

