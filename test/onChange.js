// add chai to env
import { should } from "chai"
import { expect } from "chai"
should()

// add jquery to env
import $ from "jquery"

// actual imports
import Observable from "../build/Observable"

describe("testing on 'change'", () => {
    var o = new Observable(false)
    it("should not call change after updating same value (boolean)", () => {
        let changed = false
        o.on("change", () => { changed = true })
        o.update(false)
        changed.should.not.be.true
    })
    var oo = new Observable(false)
    it("should call change after updating a diffrent value (boolean)", () => {
        let changed = false
        oo.on("change", () => { changed = true })
        oo.update(true)
        changed.should.be.true
    })
})