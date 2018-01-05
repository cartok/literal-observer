// add chai to env
import { should } from "chai"
import { expect } from "chai"
should()

// add jquery to env
import $ from "jquery"

// actual imports
import Observable from "../build/Observable"

let o = new Observable({
    bounds: {
        left: 0,
        right: 1,
        top: 0,
        bottom: 0
    },
    points: [{ x:0, y:0 }, { x:1, y:1 }]
})
// new API?
o.update(o.bounds.left, 100)
/**
 * to be able to reserve all namespace for an observable object,
 * - prefix all observable attributes with '_'.
 * - or put them in a object named 'observable'.
 */