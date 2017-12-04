
if(Function.prototype.equals === undefined){
    Object.defineProperty(Function.prototype, "equals", {
        value: function(fn){
            return (this === fn || this.toString() === fn.toString())
        },
        enumerable: false,
        writable: true,
   })   
}