import objectAssignDeep from "@cartok/object-assign-deep"
import Callback from "./Callback"

import getClassName from "./helpers/getClassName"

function functionsAreEqual(a, b){
    return (a === b || a.toString() === b.toString())
}

function Observe(value, options = { 
    onlyReceiveChanges: false 
}){
    if(value === undefined || value === null){
        throw new Error(`The initial value must not be undefined or null. (Use a JS-Literal)`)
    }
    if(value instanceof Function){
        throw  new Error("Functions are not supported as Observables.")
    }

    if(!value || !value.allreadyObserved){

        // the value to return on update (etc.) event.
        let _value = value

        // the value to return on add event.
        let _lastAdd = undefined

        // the value to return on remove event.
        let _lastRemove = undefined

        // the value to return on reset event.
        let _lastReset = undefined

        // the value representing the changes on the observed value
        // right now its just the value you update/add or remove with.
        let _change = undefined

        // methods that have access to stuff above
        const methods = {
            add: {
                boolean: null,
                number: (...args) => {
                    let len = args.length
                    if(len === 0){
                        throw new Error("Empty argument.")
                    } else if(len === 1){
                        _value += args[0]
                        _lastAdd = args[0]
                    } else if(len > 1){
                        let sum = 0
                        for(let i = 0; i < len; i++){
                            sum += args[i]
                        }
                        _lastAdd = sum
                        _value += sum
                        sum = null
                    }
                    len = null
                    args = null
                    fire("add")
                },
                string: (...args) => {
                    let len = args.length
                    if(len === 0){
                        throw new Error("Empty argument.")
                    } else if(len === 1){
                        _value += args[0]
                        _lastAdd = args[0]
                    } else if(len > 1){
                        let sum = ""
                        for(let i = 0; i < len; i++){
                            sum += args[i]
                        }
                        _lastAdd = sum
                        _value += sum
                        sum = null
                    }
                    len = null
                    args = null
                    fire("add")
                },
                array: (...args) => {
                    let len = args.length
                    if(len === 0){
                        throw new Error("Empty argument.")
                    } else if(len === 1){
                        _lastAdd = args[0]
                        _value.push(args[0])
                    } else if(len > 1){
                        _lastAdd = args
                        for(let i = 0; i < len; i++){
                            _value.push(args[i])
                        }
                    }
                    len = null
                    args = null
                    fire("add")  
                },
                object: null,
                reference: null,
            },
            remove: {
                boolean: null,
                number: (...args) => {
                    let len = args.length
                    if(len === 0){
                        throw new Error("Empty argument.")
                    } else if(len === 1){
                        _value -= args[0]
                        _lastRemove = args[0]
                    } else if(len > 1){
                        let sum = 0
                        for(let i = 0; i < len; i++){
                            sum += args[i]
                        }
                        _lastRemove = sum
                        _value -= sum
                        sum = null
                    }
                    len = null
                    args = null
                    fire("remove")
                },
                string: (...args) => {
                    let len = args.length
                    if(len === 0){
                        throw new Error("Empty argument.")
                    } else if(len === 1){
                        if(_value.includes(args[0])){
                            // not optimized
                            _value = _value.replace(args[0], "")
                            _lastRemove = args[0]
                        }
                    } else if(len > 1){
                        for(let i = 0; i < len; i++){
                            // not optimized
                            _value = _value.replace(args[i], "")
                        }
                        _lastRemove = args
                    }
                    len = null
                    args = null
                    fire("remove")
                },
                array: (...args) => {
                    let len = args.length
                    if(len === 0){
                        throw new Error("Empty argument.")
                    } else if(len === 1){
                        let index = _value.indexOf(args[0])
                        if(index >= 0){
                            _value.splice(index, 1)
                            _lastRemove = args[0]
                        } else {
                            throw new Error("The value you wanted to remove does not exist.")
                        }
                    } else if(len > 1){
                        let index = undefined
                        for(let i = 0; i < len; i++){
                            index = _value.indexOf(args[i])
                            if(index >= 0){
                                _value.splice(index, 1)
                            } else {
                                throw new Error("The value you wanted to remove does not exist.")
                            }
                        }
                        _lastRemove = args
                        index = null
                    }
                    len = null
                    args = null
                    fire("remove")  
                },
                object: null,
                reference: null,
            },
        }

        // construct new observable and return it.
        const observable = {

            // value init
            allreadyObserved : true,
            isInInitialState: true,
            initialValue : (() => {
                // the original value is saved here
                // if the object to observe is an array or an object
                // a reference to the object would be saved to initialValue
                // by only assigning 'value' to it.
                // thats why in that case the value must be copied.
                let valueCopy = null
                switch(getClassName(value).toLowerCase()){
                    case "object":
                        valueCopy = Object.assign({}, value)
                        break
                    case "array":
                        valueCopy = value.slice(0)
                        break
                    default:
                        // @note: instance of Object !== getClassName({}).
                        // custom classes (constructor names) are
                        // not included in the switch statement.
                        if(value instanceof Object){
                            valueCopy = Object.assign({}, value)
                        } else {
                            // if its a literal just assign it.
                            valueCopy = value
                        }
                }
                return valueCopy
            })(),

            onlyReceiveChanges: options.onlyReceiveChanges,

            // value changes
            update(value, options = { 
                onlyReceiveChanges: false 
            }){
                // should not update a undefined or null value
                if(value === undefined || value === null){
                    throw new Error(`The value for an update must not be undefined or null.`)
                }

                // instead of using the .value setter one can use this method to update the value
                this.isInInitialState = false

                // TRIGGER: BEFORE-UPDATE
                fire("before-update", { 
                    onlyReceiveChanges: options.onlyReceiveChanges 
                }, value)

                // the new value is represented as "_change" and can be
                // passed in to the callback functions on event. (instead of the updated "_value")
                _change = value

                // TRIGGER: CHANGE
                switch(getClassName(_value).toLowerCase()){
                    case "string":
                    case "number":
                    case "boolean":
                        if(_value !== _change){
                            fire("change", { 
                                onlyReceiveChanges: options.onlyReceiveChanges 
                            })
                        }
                        break
                    default:
                        console.warn("At the moment the 'change' event is only implemented for boolean, string and number literals.")
                }

                // Do the actual value update!
                if(this.onlyReceiveChanges === true || options.onlyReceiveChanges === true){
                    switch(getClassName(_value).toLowerCase()){
                        case "object":
                            _value = objectAssignDeep(_value, value)
                            break
                        default:
                            throw new Error("at the moment 'onlyReceiveChanges' is only implemented for objects.")
                    }
                } else {
                    _value = value
                }

                // TRIGGER: UPDATE
                fire("update", { 
                    onlyReceiveChanges: options.onlyReceiveChanges 
                })
            },
            get value(){
                return _value
            },
            set value(newValue){
                this.update(newValue)
            },
            add: (function(){
                switch(getClassName(value).toLowerCase()){
                    case "boolean":
                        return methods.add.boolean
                    case "number":
                        return methods.add.number
                    case "string":
                        return methods.add.string
                    case "array":
                        return methods.add.array
                    case "object":
                        return methods.add.object
                    default:
                        return methods.add.reference
                }
            })(),
            remove: (function(){
                switch(getClassName(value).toLowerCase()){
                    case "boolean":
                        return methods.remove.boolean
                    case "number":
                        return methods.remove.number
                    case "string":
                        return methods.remove.string
                    case "array":
                        return methods.remove.array
                    case "object":
                        return methods.remove.object
                    default:
                        return methods.remove.reference
                }
            })(),
            // add to methods object above? need to pass this.initialValue.
            reset(){
                fire("reset")
                switch(getClassName(_value).toLowerCase()){
                    case "object":
                        _lastReset = _value
                        _value = Object.assign({}, this.initialValue)
                        break
                    case "array":
                        _lastReset = _value
                        // _value.length = 0
                        _value = this.initialValue.slice(0)
                        break
                    default:
                        if(value instanceof Object){
                            _lastReset = _value
                            _value = Object.assign({}, this.initialValue)
                        } else {
                            _lastReset = _value
                            _value = this.initialValue
                        }
                }
                this.isInInitialState = true
            },
            // callbacks
            Callbacks: [],
            on(eventIdentifier, callback, self, options = { onlyReceiveChanges: false }){
                // check callback
                if(typeof callback !== "function"){
                    throw new Error("You need to pass a callback function as second parameter.")
                }

                // option handling
                if(arguments[2]){
                    if(arguments[3]){
                        this.onlyReceiveChanges = (arguments[3].onlyReceiveChanges === true) 
                            ? true 
                            : false
                    } else {
                        this.onlyReceiveChanges = (arguments[2].onlyReceiveChanges === true)
                            ? true 
                            : false
                    }
                }

                // @todo: document this better
                // Don't add a callback if it allready exists.
                let length = this.Callbacks.length
                let i = length - 1
                for(; i >= 0; i--){
                    // If the callback is allready exists...
                    if(functionsAreEqual(this.Callbacks[i], callback)){
                        if(self){
                            // If the callback belongs to to the same object...
                            if(Object.is(this.Callbacks[i].self, self)){
                                // If there are new events to trigger the callback, add them...
                                if(this.Callbacks[i].containsNewEvent(eventIdentifier)){
                                    this.Callbacks[i].addEvents(eventIdentifier)
                                    return
                                }
                                else {
                                    throw new Error(`The callback you wanted to add allready exists. It belongs to the same object.`)
                                }
                            }
                            // If the callback exists but its object differs...
                            else {
                                // Add a new callback linked to its object
                                this.Callbacks.push(new Callback(eventIdentifier, callback, self))
                                return
                            }
                        }
                        // If the callback allready exists but no self parameter has been passed...
                        else {
                            // Add new events to trigger the callback if there are some in the event identifier...
                            this.Callbacks[i].addEvents(eventIdentifier)
                            return
                        }
                    } else {
                        this.Callbacks.push(new Callback(eventIdentifier, callback, self))
                        return
                    }
                }
                // Guess this line can be removed.
                this.Callbacks.push(new Callback(eventIdentifier, callback, self))
            },
            off(eventIdentifier, callback, self){
                // CASE: only "eventIdentifier" given
                // EXAMPLE: foo.off("update") || foo.off(["update", "add"])
                if(eventIdentifier !== undefined && callback === undefined && self === undefined){
                    // remove the event(s) from all callbacks.
                    this.Callbacks.forEach(cb => {
                        cb.removeEvents(eventIdentifier)
                    })
                }
                // CASE: eventIdentifier and callback given
                // EXAMPLE: foo.off("add", methodName)
                else if(eventIdentifier !== undefined && callback !== undefined && self === undefined){
                    // remove all events from all callbacks that match
                    this.Callbacks.forEach(cb => {
                        if(functionsAreEqual(cb.callback, callback)){
                            cb.removeEvents(eventIdentifier)
                        }
                    })
                }
                // CASE: all parameters given.
                // EXAMPLE: foo.off("add", methodName, objectname)
                else if(eventIdentifier !== undefined && callback !== undefined && self !== undefined){
                    // remove all events for all callbacks that match and derive from the object (self)
                    this.Callbacks.forEach(cb => {
                        if(functionsAreEqual(cb.callback, callback) && Object.is(cb.self, self)){
                            cb.removeEvents(eventIdentifier)
                        }
                    })
                }
                // CASE: eventIdentifier and self given
                // EXAMPLE: foo.off("update", objectname)
                else if(eventIdentifier !== undefined && callback === undefined && self !== undefined){
                    // remove all events of all callbacks that derive from the object (self)
                    this.Callbacks.forEach(cb => {
                        if(Object.is(cb.self, self)){
                            cb.removeEvents(eventIdentifier)
                        }
                    })
                }
                // CASE: only "callback" given
                // EXAMPLE: foo.off(methodName)
                else if(eventIdentifier === undefined && callback !== undefined && self === undefined){
                    // remove all callbacks that match.
                    this.Callbacks.forEach((cb, idx, Callbacks) => {
                        if(functionsAreEqual(cb.callback, callback)){
                            Callbacks[idx].splice(idx, 1)
                        }
                    })
                }
                // CASE: callback and self given
                // EXAMPLE: foo.off(methodName, objectname)
                else if(eventIdentifier === undefined && callback !== undefined && self !== undefined){
                    // remove the callback that has a reference to self if it exists.
                    this.Callbacks.forEach((cb, idx, Callbacks) => {
                        if(functionsAreEqual(cb.callback, callback) && Object.is(cb.self, self)){
                            Callbacks[idx].splice(idx, 1)
                        }
                    })
                }
                else {
                    throw  new Error(`invalid arguments.`)
                }
            },
            clearCallbacks(){
                this.Callbacks.length = 0
            },
        }

        function fire(eventName, options = { onlyReceiveChanges: false }, newValue){
            // @feature: add reason string like "add" etc. must propagate from setter, get() or remove()
            observable.Callbacks
            .filter( cb => cb.events.includes(eventName) )
            .forEach( validCb => {
                if((observable.onlyReceiveChanges === true) || options.onlyReceiveChanges === true){
                    validCb.callback(_change)
                } else {
                    switch(eventName){
                        case "before-update":
                            validCb.callback(_value, newValue)
                            break
                        case "update":
                            validCb.callback(_value)
                            break
                        case "change":
                            validCb.callback(_change)
                            break
                        case "add":
                            validCb.callback(_lastAdd)
                            break
                        case "remove":
                            validCb.callback(_lastRemove)
                            break
                        case "reset":
                            validCb.callback(_value)
                            break
                    }
                }
            })
        }

        return observable
    } else {
        return value
    }
}

export default class Observable {
    constructor(value){
        return Observe(value)
    }
}