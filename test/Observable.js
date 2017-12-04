// add chai to env
import { should } from "chai"
import { expect } from "chai"
should()

// add jquery to env
import $ from "jquery"

// actual imports
import Observable from "../build/Observable"

describe("testing import", () => {
    it("should import Observable", () => {
        Observable.should.not.be.an("undefined")
    })
})

describe("testing execution of 'before-update', 'update' and 'after-update'", () => {
    const o = new Observable(0)

    let before = false
    let update = false
    let after = false

    o.on("before-update", () => { before = true })
    o.on("update", () => { update = true })
    o.on("after-update", () => { after = true })

    o.update(10)
    it("validating before", () => {
        before.should.be.true
    })
    it("validating update", () => {
        update.should.be.true
    })
    it("validating after", () => {
        after.should.be.true
    })
})