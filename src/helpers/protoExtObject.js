
if(Object.prototype.isNumber === undefined){
    Object.defineProperty(Object.prototype, "isNumber", {
        value: function() { return !isNaN(this) },
        enumerable: false,
        writable: true,
    })
}
if(Object.prototype.isObject === undefined){
    Object.defineProperty(Object.prototype, "isObject", {
        value: function(){ return typeof(this) == typeof({}) },
        enumerable: false,
        writable: true,
    })
}
if(Object.prototype.getClassName === undefined){
    Object.defineProperty(Object.prototype, "getClassName", {
        value: function() {
            console.warn("u may just use instanceof.")
            return this.__proto__.constructor.name
        },
        enumerable: false,
        writable: true,
    })
}
if(Object.prototype.getClassNames === undefined){
    Object.defineProperty(Object.prototype, "getClassNames", {
        value: function() {
            console.warn("u may just use instanceof.")
            // iterate object member's member named constructor.name
            const classNames = []
            let finished = false
            let currentClass = this.__proto__.constructor
            while(!finished){
                if(currentClass.name === "Function"){
                    finished = true
                } else {
                    classNames.push(currentClass.name)
                    currentClass = currentClass.constructor
                }
            }
            return classNames
        },
        enumerable: false,
        writable: true,
    })
}
if(Object.prototype.clone === undefined){
    Object.defineProperty(Object.prototype, "clone", {
        value: function(){ return Object.assign({}, this) },
        enumerable: false,
        writable:true,
    })
}
