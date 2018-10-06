// add chai to env
import { should } from "chai"
import { expect } from "chai"
should()

// add jquery to env
import $ from "jquery"

// actual imports
import Observable from "../dist/Observable"

describe("testing import", () => {
    it("should import Observable", () => {
        Observable.should.not.be.an("undefined")
    })
})

describe("testing execution of 'before-update' and 'update'", () => {
    // @todo: create tests for every type of value.
    const o = new Observable(0)

    let before = false
    let update = false
    let after = false

    o.on("before-update", () => { before = true })
    o.on("update", () => { update = true })

    o.update(10)
    it("validating before", () => {
        before.should.be.true
    })
    it("validating update", () => {
        update.should.be.true
    })
})

describe("testing add on an array observable", () => {
    // add should trigger update aswell
    describe("when using add() the update event should also be triggered cause the value changed", () => {
        let o = new Observable([])
        let updated = false
        o.on("update", () => updated = true)
        o.add(1)
        it("should have triggered update", () => {
            updated.should.be.true
        })
    })

    // "testing playback sound system" :D
    it("added should be 1; value should be [1]", () => {
        let o = new Observable([])
        let added = undefined
        o.on("add", value => added = value)
        o.add(1)
        added.should.equal(1)
        o.value.should.deep.equal([1])
    })
    it("added should be [2,3]; value should be [1,2,3]", () => {
        let o = new Observable([])
        let added = undefined
        o.on("add", value => added = value)
        o.add(1)
        o.add(2,3)
        added.should.deep.equal([2,3])
        o.value.should.deep.equal([1,2,3])
    })
    it("added should be [4,5,6]; value should be [1,2,3,[4,5,6]]", () => {
        let o = new Observable([])
        let added = undefined
        o.on("add", value => added = value)
        o.add(1)
        o.add(2,3)
        o.add([4,5,6])
        added.should.deep.equal([4,5,6])
        o.value.should.deep.equal([1,2,3,[4,5,6]])
    })

})
