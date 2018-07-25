export default (o: Object) => {
    if(o instanceof Object){
        return o.__proto__.constructor.name
    } 
    return undefined
}

