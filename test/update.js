// add chai to env
import { should } from "chai"
import { expect } from "chai"
should()

// actual imports
import Observable from "../build/Observable"


describe("testing update method", () => {
    it("should throw an error when trying to update a undefined or null value", (done) => {
        let errorThrown = false
        const o = new Observable(true)
        try {
            o.update()        
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