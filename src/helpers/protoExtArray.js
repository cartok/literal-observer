
if(Array.prototype.clone === undefined){
    Object.defineProperty(Array.prototype, "clone", {
        value: function(){
            return this.slice(0)
        },
        enumerable: false,
        writable: true,
    })
}
    
if(Array.prototype.top === undefined){
    Object.defineProperty(Array.prototype, "top", {
        value: function(){
            return this[this.length-1]
        },
        enumerable: false,
        writable: true,
    })
}
