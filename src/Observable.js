import objectAssignDeep from "@cartok/object-assign-deep"
import Callback from "./Callback"

import getClassName from "./helpers/getClassName"
import getType from "./helpers/getType"

// array equals array, wont work with objects inside, need deep object comparison aswell... array > object
function AEQA(a,b){
	if(a.length !== b.length) 
		return false
	else
		return a.every((el, i) => {
            return el === b[i]
        })
}

// auslagern
function functionsAreEqual(a, b){
    return (a === b || a.toString() === b.toString())
}
// auslagern
const DEFAULT_OPTIONS = { 
    merge: false,
    changeImpliesUpdate: false,
}
const LITERAL_NAMES = ["Boolean", "Number", "String", "Object", "Array"]

// private members
const that = {
    supportsAdd: new WeakMap(),
    supportsRemove: new WeakMap(),
    supportsOnChange: new WeakMap(),
    lastAddedValue: new WeakMap(),
    lastRemovedValue: new WeakMap(),
    Callbacks: new WeakMap(),
}
const PRE = "Observable |"
export default class Observable {
    constructor(value, options){
        // > merge default options.
        this.options = Object.assign({}, DEFAULT_OPTIONS, options)

        // > check value.
        if(value === undefined || value === null){
            throw new Error(`${PRE} The initial value cannot be undefined or null. Use a JS-Literal.`)
        }
        if(value instanceof Function){
            throw new Error(`${PRE} Functions are not supported as Observables.`)
        }

        // > assign type string.
        this.type = value.__proto__.constructor.name
        this.type = ["Boolean", "Number", "String", "Object", "Array"].some(e => e === this.type)
            ? this.type
            : "ClassInstance"

        // > assign public properties (this.value returns that.value).
        that.value.set(this, value)
        this.initialState = true
        this.initialValue = (() => {
            // > if a literal is observed, a copy of value is returned
            // > if a class instance is observed, its reference is returned
            switch(this.type){
                case "Number":
                case "String":
                    return value
                case "Array":
                    return value.slice(0)
                case "Object":
                    return Object.assign({}, value)
                case "ClassInstance":
                    return value
            }
        })()
        
        // > assign private properties.
        that.Callbacks.set(this, [])
        if(["Number", "String", "Array"].some(e => e === this.type)){
            that.supportsAdd.set(this, true)
            that.supportsRemove.set(this, true)
        } else {
            console.warn(`${PRE} add() and remove() methods are only implemented for "Number", "String" and "Array" at the moment.`)
            delete this.add
            delete this.remove
        }
        if(["Boolean", "Number", "String", "ClassInstance"].some(e => e === this.type)){
            that.supportsOnChange.set(this, true)
        } else {
            console.warn(`${PRE} "on-change" listening is only implemented for "Boolean", "Number", "String" and Class Instances at the moment.`)
        }
    }
    get value(){
        return that.value.get(this)
    }
    set value(newValue){
        this.update(newValue)
    }
    update(newValue){
        // > the observable is no longer in initial state.
        this.initialState = false

        // > trigger "before-update" callbacks.
        execCallbacks("before-update", value)

        // > trigger "change" callbacks.
        if(this.supportsOnChange){
            switch(this.type){
                case "Boolean":
                case "Number":
                case "String":
                case "ClassInstance":
                    if(this.value !== newValue){
                        execCallbacks("change")
                    }
                    break
                // case "Object":
                //     break
                // case "Array":
                //     break
            }
        }

        // > execute the actual update
        // > objects may get merged.
        if(this.type === "Object" && this.options.merge){
            that.value.set(this, objectAssignDeep(that.value.get(this), newValue))
        } else { 
            that.value.set(this, newValue)
        }

        // > trigger "update" callbacks.
        execCallbacks("update")
    }
    add(){
        
    }
}
