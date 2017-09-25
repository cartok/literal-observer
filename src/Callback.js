import getClassName from "./helpers/getClassName"

const VALID_EVENT_NAMES = [ "add", "remove", "update", "before-update", "reset" ]

// Callback
// ---------------------------------------------------------------------------
// add update methods for the original value.
// if custom functions were added to the constructor:
// use them as add() or/and remove() methods for the new object.
// RULE: only arrays and objects may have add() and remove() methods.
// RULE: both methods will trigger the callback functions,
// that are added on the observable object by a function call.
// if no custom functions were added to the constructor get the
// datatype of the original value and add default methods.
export default class Callback{
    constructor(eventIdentifier, callback, self){
        // @remove: id, should be no need for it.
        this.id = getCallbackIndex()
        this.callback = callback
        this.self = self
        this.events = []
        this.addEvents(eventIdentifier)
    }
    eventNameIsValid(eventName, optionalValidNames){
        let validEvents = VALID_EVENT_NAMES.clone()
        if(eventName){
            if(typeof eventName !== "string"){
                throw  new Error(`eventname must be a string.`)
            }
            if(optionalValidNames){
                validEvents.concat(optionalValidNames)
            }
            if(validEvents.includes(eventName)){
                return true
            } else {
                return false
            }
        } else {
            throw  new Error(`eventname is not defined, use ${validEvents}.`)
        }
    }
    eventIdentifierIsValid(eventIdentifier, optionalValidNames){
        switch(getClassName(eventIdentifier).toLowerCase()){
            case "string":
                return this.eventNameIsValid(eventIdentifier, optionalValidNames)
            case "array":
                // check if all values are strings
                if(eventIdentifier.every(elem => typeof elem === "string") === false){
                    throw  new Error("array must contain strings only.")
                }
                if(eventIdentifier.every(eventName => this.eventNameIsValid(eventName, optionalValidNames))){
                    return true
                } else {
                    return false
                }
            default:
                throw  new Error("event identifier must be a string or array of strings.")
        }
    }
    eventExists(eventName){
        return (this.events.indexOf(eventName) >= 0)
    }
    containsNewEvent(eventIdentifier){
        if(this.eventIdentifierIsValid(eventIdentifier)){
            switch(getClassName(eventIdentifier).toLowerCase()){
            case "string":
                if(!this.eventExists(eventIdentifier)){
                    return true
                }
            case "array":
                let length = eventIdentifier.length
                let i = length - 1
                for(; i >= 0; i--){
                    if(!this.eventExists(eventIdentifier[i])){
                        return true
                    }
                }
            }
        }
    }
    addEvents(eventIdentifier){
        if(this.eventIdentifierIsValid(eventIdentifier)){
            switch(getClassName(eventIdentifier).toLowerCase()){
                case "string":
                    // add the event if it's not allready inside the list
                    if(!this.eventExists(eventIdentifier)){
                        this.events.push(eventIdentifier)
                        return true
                    } else {
                        return false
                    }
                case "array":
                    let eventAdded = false
                    // and add all event names that are
                    // not allready inside the list to it.
                    eventIdentifier.forEach(eventName => {
                        if(!this.eventExists(eventName)){
                            this.events.push(eventName)
                            eventAdded = true
                        }
                    })
                    return eventAdded
            }
        }
    }
    removeEvents(eventIdentifier){
        if(this.eventIdentifierIsValid(eventIdentifier)){
            // remove an event if its inside the list
            switch(getClassName(eventIdentifier).toLowerCase()){
                case "string":
                    if(eventIdentifier === "all"){
                        this.clearEvents()
                    }
                    else if(this.eventExists(eventIdentifier)){
                        let idx = this.events.indexOf(eventIdentifier)
                        this.events.splice(idx, 1)
                    }
                    break
                case "array":
                    // and add all event names that are
                    // not allready inside the list to it.
                    eventIdentifier.forEach((eventName) => {
                        if(this.eventExists(eventName)){
                            let idx = this.events.indexOf(eventName)
                            this.events.splice(idx, 1)
                        }
                    })
                    break
                default:
                    throw  new Error("event identifier must be a string or an array of strings.")
            }
        }
    }
    clearEvents(){
        this.events.length = 0
    }
}

let counter = -1;
function getCallbackIndex(){
    return ++counter
}
// ---------------------------------------------------------------------------
