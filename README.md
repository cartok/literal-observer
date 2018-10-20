# Observe-Literal
*An Observable implementation for javascript literals. The API style is leaned on the jQuery Event API.*

## Installation:
```npm install observe-literal```  

## Usage
+ module import
```javascript
import Observable from "literal-observer" 
```
+ html import
```html
<script src="https://cdn.jsdelivr.net/npm/literal-observer/dist/bundle.js"></script> 
```

+ create: 
```javascript
const obs = new Observable("")
const obs = new Observable([])
const obs = new Observable({})
const obs = new Observable(0)
```

#### What you get:
About the Observable: ...  
```javasript
{
    // fields
    initialValue: any,              // the initial value you passed in the constructor.
    isInInitialState: boolean,      // whether the value has been changed or not.

    // methods
    update: function,               // a method to override the value. you can use the setter aswell o.value = "new-value" 
    add: function,                  // a method to add information to the value. internally decides about the action depending on the type of the initial value.
    remove: function,               // add in reverse.
    on: function,                   // a method to add event listeners.
    off: function,                  // a method to remove event listeners.
    reset: function,                // a method to reset the value to its initial state.
    clearCallbacks: function,       // a method to clear all callbacks.
}
```

+ add event listener  
   *Available Events:* before-update, update, add, remove, reset
```javascript
// before the observable value gets update you can do something with its old value
obs.on("before-update", (oldValue) => doSomething(oldValue))
// if you listen to update you get your callback executed with the newest value 
// everytime there is an update.
obs.on("update", (newValue) => doSomething(newValue))
// you can listen to the reset of the observable, to maybe reset the view.
obs.on("reset", () => doSomething())
obs.on("add", (addedValue) => addSomething(addedValue))
obs.on("remove", (removedValue) => removeSomething(removedValue))

// you can listen on multiple events at once
obs.on(["update", "add", "remove"], someMethod)
```

+ remove event listener
```javascript
// remove a single callback from a single event
obs.off("update", cb)

// remove a single callback from all events
obs.off(cb)

// remove update event listeners
obs.off("update")
obs.off(["update", "before-update"])

// remove all callbacks at once
obs.off()
```

### Example