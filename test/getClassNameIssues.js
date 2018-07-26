// add chai to env
import { should } from "chai"
import { expect } from "chai"
should()

// actual imports
import Observable from "../build/Observable"
import getClassName from "../build/helpers/getClassName"

describe("testing negative number", () => {
    it("should be able to handle negative number", () => {
        const o = new Observable(-1)
        getClassName(o.value).should.not.be.an("undefined")
        getClassName(o.initialValue).should.not.be.an("undefined")
    })
    it("should throw an error when initializing with null or undefined", (done) => {
        let errorThrown = false
        try {
            const o = new Observable(undefined)
        } catch(e){
            errorThrown = true
            console.log(e.message)
            done()
        }
        if(!errorThrown){
            done(new Error())
        }
    })

})
