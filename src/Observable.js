import { merge } from "lodash"
import Callback from "./Callback"

import getClassName from "./helpers/getClassName"

if(Function.prototype.equals === undefined){
    Object.defineProperty(Function.prototype, "equals", {
        value: function(fn){
            return (this === fn || this.toString() === fn.toString())
        },
        enumerable: false,
        writable: true,
   })   
}


function Observe(value, options = { 
    noExec: false, 
    callBackOnlyChanges: false 
}){

    if(value instanceof Function){
        throw  new Error("functions are not supported to be observed.")
    }

    if(!value.allreadyObserved){

        // the value to return on update (etc.) event.
        let _value = value

        // the value to return on add event.
        let _lastAdd = undefined

        // the value to return on remove event.
        let _lastRemove = undefined

        // the value representing the changes on the observed value
        // right now its just the value you update/add or remove with.
        let _change = undefined

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

            callBackOnlyChanges: options.callBackOnlyChanges,
            noExec: options.noExec,

            // value changes
            update(value, options = { 
                noExec: false, 
                callBackOnlyChanges: false 
            }){
                // instead of using the .value setter one can use this method to update the value
                this.isInInitialState = false

                // BEFORE-UPDATE
                if(this.noExec === false || options.noExec === false){
                    eventExecCallback("before-update", { 
                        callBackOnlyChanges: options.callBackOnlyChanges 
                    }, value)
                }

                // the new value is represented as "_change" and can be
                // handeled to the callback functions on event. (instead of the updated "_value")
                _change = value

                // CHANGE
                switch(getClassName(_value).toLowerCase()){
                    case "boolean":
                        if(this.noExec === false || options.noExec === false){
                            if(_value !== _change){
                                eventExecCallback("change", { 
                                    callBackOnlyChanges: options.callBackOnlyChanges 
                                })
                            }
                        }
                        break
                    // default:
                    //     throw new Error("at the moment the 'change' event is only implemented for boolean.")
                }

                // the actual value update
                if(this.callBackOnlyChanges === true || options.callBackOnlyChanges === true){
                    switch(getClassName(_value).toLowerCase()){
                        case "object":
                            _value = merge(_value, value)
                            break
                        default:
                            throw new Error("at the moment 'callBackOnlyChanges' is only implemented for objects.")
                    }
                } 
                else {
                    _value = value
                }


                // UPDATE
                if(this.noExec === false || options.noExec === false){
                    eventExecCallback("update", { 
                        callBackOnlyChanges: options.callBackOnlyChanges 
                    })
                }

                // AFTER-UPDATE
                if(this.noExec === false || options.noExec === false){
                    eventExecCallback("after-update", { 
                        callBackOnlyChanges: options.callBackOnlyChanges 
                    })
                }
            },
            get value(){
                return _value
            },
            set value(newValue){
                this.update(newValue)
            },
            add: (function(){
                /**
                * the add and remove method function depends on the type of
                * the value that becomes an observable.
                */
                switch(getClassName(value).toLowerCase()){
                    case "boolean":
                        return new createNotifyingFunction("add", () => {
                             throw new Error("can not add something to a boolean value.")
                         })
                    case "number":
                        return new createNotifyingFunction("add", (newValue) => {
                            _value += newValue
                            _lastAdd = newValue
                            eventExecCallback("add")
                        })
                    case "string":
                        return new createNotifyingFunction("add", (newValue) => {
                            _value += newValue
                            _lastAdd = newValue
                            eventExecCallback("add")
                        })
                    case "array":
                        // @todo: finish handling different newValue types.
                        return new createNotifyingFunction("add", (newValue, options) => {
                            // when calling add on an observable u can pass extra options
                            // like: myObservable.add(["a","b"], {split:true})
                            switch (getClassName(newValue).toLowerCase()) {
                                case "array":
                                    if(options && options.split === true){
                                        newValue.forEach(val => _value.push(val))
                                    }
                                    break
                                default:
                                    _value.push(newValue)
                            }
                            _lastAdd = newValue
                            eventExecCallback("add")
                        })
                    case "object":
                        // @todo: handle options
                        return new createNotifyingFunction("add", (newValue, options) => {
                            Object.assign(_value, newValue)
                            _lastAdd = newValue
                            eventExecCallback("add")
                        })
                    default:
                        throw new Error("could not detect type of initial value.")
                }
            })(),
            remove: (function(){
                switch(getClassName(value).toLowerCase()){
                    case "boolean":
                        return new createNotifyingFunction("remove", () => {
                            throw  new Error("can not remove something from a boolean value.")
                        })
                    case "number":
                        return new createNotifyingFunction("remove", (valueToRemove) => {
                            _value -= valueToRemove
                            _lastRemove = valueToRemove
                            eventExecCallback("remove")
                        })
                    case "string":
                        return new createNotifyingFunction("remove", (valueToRemove) => {
                            let str = _value
                            if(str.includes(valueToRemove)){
                                _value = _value.replace(valueToRemove, "")
                                _lastRemove = valueToRemove
                            } else {
                                throw  new Error("the value you wanted to remove is not included in the string.")
                            }
                        })
                    case "array":
                        // @todo: implement value type handling. + split option etc?
                        return new createNotifyingFunction("remove", (valueToRemove, options) => {
                            let index = _value.indexOf(valueToRemove)
                            if(index >= 0){
                                _value.splice(index, 1)
                                _lastRemove = valueToRemove
                                eventExecCallback("remove")
                            } else {
                                throw  new Error("the value you wanted to remove does not exist.")
                            }
                            // if(options.callbackExecution){
                            //     _lastRemove = valueToRemove
                            //     console.log("valueToRemove:", valueToRemove)
                            //     options.callbackExecution()
                            // }
                        })
                    case "object":
                        return new createNotifyingFunction("remove", (valueToRemove, options) => {
                            switch(getClassName(valueToRemove).toLowerCase()){
                                case "boolean":
                                    throw new Error("can't remove a boolean from a object that straight. are u crazy?!")
                                case "string":
                                    if(_value.hasOwnProperty(valueToRemove)){
                                        _value[valueToRemove] = undefined
                                        _lastRemove = valueToRemove
                                        eventExecCallback("remove")
                                    } else {
                                        throw new Error("the substring you wanted to remove does not exist.")
                                    }
                                    break
                                case "array":
                                    valueToRemove.forEach((valueToRemove) => {
                                        if(_value.hasOwnProperty(valueToRemove)){
                                            _value[valueToRemove] = undefined
                                        } else {
                                            throw new Error("the substring you wanted to remove does not exist.")
                                        }
                                    })
                                    _lastRemove = valueToRemove
                                    eventExecCallback("remove")
                                    break
                                case "object":
                                    // deletes all matching keys
                                    console.warn("deleting all matching keys. more features not yet implemented. for deleting keys u may use an array of strings instead.")
                                    for(var member in valueToRemove){
                                        if(_value.hasOwnProperty(member)){
                                            _value[member] = undefined
                                        }
                                    }
                                    _lastRemove = valueToRemove
                                    eventExecCallback("remove")
                                    break
                                default:
                                    throw  new Error("the value you wanted to remove is not valid. use string, array of strings or object")
                            }
                        })
                    default:
                        throw new Error("could not detect type of initial value.")
                }
            })(),

            // callbacks
            Callbacks: [],
            on(eventIdentifier, callback, self, options = { noExec: false, callBackOnlyChanges: false }){
                // callback parameter
                if(callback == undefined) throw  new Error("the callback you wanted to add is undefined.")

                // options parameter
                if(arguments[2]){
                    if(arguments[3]){
                        this.callBackOnlyChanges = (arguments[2].callBackOnlyChanges === true)
                            || (arguments[3].callBackOnlyChanges === true) ? true : false
                        this.noExec = (arguments[2].noExec === true)
                            || (arguments[3].noExec === true) ? true : false
                    } else {
                        this.callBackOnlyChanges = (arguments[2].callBackOnlyChanges === true)
                            ? true : false
                        this.noExec = (arguments[2].noExec === true)
                            ? true : false
                    }
                }

                // look if the callback allready exists.
                let length = this.Callbacks.length
                let i = length - 1
                for(; i >= 0; i--){

                    // if the callback is allready listed:
                    if(this.Callbacks[i].callback.equals(callback)){
                        if(self){

                            // if the callback belongs to to the same object (self parameter):
                            if(Object.is(this.Callbacks[i].self, self)){

                                // if there are new events to trigger the callback, add them:
                                if(this.Callbacks[i].containsNewEvent(eventIdentifier)){
                                    this.Callbacks[i].addEvents(eventIdentifier)
                                    return "events added to the callback"
                                }
                                else {
                                    throw  new Error(`the callback you wanted to add allready exists. it belongs to the same object. your event identifier has no new events that could be added.`)
                                }
                            }

                            // if the callback exists but its object (self parameter) differs.
                            else {

                                // add a new callback linked to its object
                                this.Callbacks.push(new Callback(eventIdentifier, callback, self))
                                return "callback linked to its object was added"
                            }
                        }

                        // if the callback allready exists but no self parameter has been passed
                        else {
                            // add new events to trigger the callback if there are some in the event identifier
                            this.Callbacks[i].addEvents(eventIdentifier)
                            return "events added to the callback"
                        }
                    }
                    else {
                        this.Callbacks.push(new Callback(eventIdentifier, callback, self))
                        return "new callback added"
                    }
                }
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
                        if(cb.callback.equals(callback)){
                            cb.removeEvents(eventIdentifier)
                        }
                    })
                }
                // CASE: all parameters given.
                // EXAMPLE: foo.off("add", methodName, objectname)
                else if(eventIdentifier !== undefined && callback !== undefined && self !== undefined){
                    // remove all events for all callbacks that match and derive from the object (self)
                    this.Callbacks.forEach(cb => {
                        if(cb.callback.equals(callback) && Object.is(cb.self, self)){
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
                        if(cb.callback.equals(callback)){
                            Callbacks[idx].splice(idx, 1)
                        }
                    })
                }
                // CASE: callback and self given
                // EXAMPLE: foo.off(methodName, objectname)
                else if(eventIdentifier === undefined && callback !== undefined && self !== undefined){
                    // remove the callback that has a reference to self if it exists.
                    this.Callbacks.forEach((cb, idx, Callbacks) => {
                        if(cb.callback.equals(callback) && Object.is(cb.self, self)){
                            Callbacks[idx].splice(idx, 1)
                        }
                    })
                }
                else {
                    throw  new Error(`invalid arguments.`)
                }
            },
            reset(){
                // a reset function to reset the value to the one the observable
                // was initiated with. an observable, for example, that has been
                // initialized with an empty array, will become [] again.
                this.isInInitialState = true
                // update listeners
                eventExecCallback("reset")
                // copy old value and override current
                let valueCopy = undefined
                switch(getClassName(this.value).toLowerCase()){
                    case "object":
                        valueCopy = Object.assign({}, value)
                        break
                    case "array":
                        valueCopy = value.slice(0)
                        break
                    default:
                        // @note: instance of Object !== getClassName({}).toLowerCase().
                        // custom classes (constructor names) are
                        // not included in the switch statement.
                        if(value instanceof Object){
                            valueCopy = Object.assign({}, value)
                        } else {
                            // if its a literal just assign it.
                            valueCopy = value
                        }
                }
                _value = valueCopy
            },
            clearCallbacks(){
                this.Callbacks.length = 0
            },
        }

        // helpers
        function createNotifyingFunction(eventName, fn){
            return (...args) => {
                fn(...args)
            }
        }
        function eventExecCallback(eventName, options = { callBackOnlyChanges: false }, newValue){
            // @feature: add reason string like "add" etc. must propagate from setter, get() or remove()
            observable.Callbacks
            .filter( cb => cb.events.includes(eventName) )
            .forEach( validCb => {
                if((observable.callBackOnlyChanges === true) || options.callBackOnlyChanges === true){
                    validCb.callback(_change)
                } else {
                    switch(eventName){
                        case "before-update":
                            validCb.callback(_value, newValue)
                            break
                        case "update":
                        case "after-update":
                            validCb.callback(_value)
                            break
                        case "change":
                            validCb.callback(_value)
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