const test = require("tape")
const sinon = require("sinon")

import Observable from "../src/Observable"

test("testing obserable for string literal", function(t){
    const o = new Observable("initial test literal")
    // .. do something, expect something 
    t.end()
})

