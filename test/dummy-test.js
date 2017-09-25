// add chai to env
import { should } from "chai"
import { expect } from "chai"
should()

// add jquery to env
import $ from "jquery"

// actual imports
import Observable from "../build/Observable"

describe("testing obserable for string literal", () => {
    const o = new Observable("initial test literal")
    it("...", () => {
        o.should.not.be.an("undefined")
    })
})

