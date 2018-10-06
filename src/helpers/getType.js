const LITERALS = ["Number", "String", "Array", "Object"]
export default value => {
    let type = value.__proto__.constructor.name
    type = LITERALS.some(x => x === type)
        ? type
        : "ClassInstance"
    return type
}