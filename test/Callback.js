// add chai to env
import { should } from "chai"
import { expect } from "chai"
should()

// add jquery to env
import $ from "jquery"

// actual imports
import Callback from "../dist/Callback"

describe("testing import", () => {
    it("should import Callback", () => {
        Callback.should.not.be.an("undefined")
        describe("testing object creation", () => {
            const self = "self-replacement"
            const c = new Callback("update", ()=>{ console.log("executed callback") }, self)
            it("should create a Callback object.", () => {
                c.should.not.be.an("undefined")
            })
            // it("should execute all methods", () => {
            //     // c.eventNameIsvalid
            // })
            // it("method x should...", () => {
            //     // c.
            // })
        })
    })
})
