// add chai to env
import { should } from "chai"
import { expect } from "chai"
should()

// actual imports
import Observable from "../dist/Observable"
import getClassName from "../dist/helpers/getClassName"

describe("testing negative number", () => {
    it("should be able to handle negative number", () => {
        const o = new Observable(-1)
        getClassName(o.value).should.not.be.an("undefined")
        getClassName(o.initialValue).should.not.be.an("undefined")
    })
    it("should throw an error when initializing with null or undefined", (done) => {
        try {
            const o = new Observable(undefined)
        } catch(e){
            console.log(e.message)
            done()
        }
    })

})
