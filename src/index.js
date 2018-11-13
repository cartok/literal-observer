// this file is used when compiling to es5 with webpack to expose the bundled version to the window object.
import _Observable from "./Observable"
const Observable = _Observable

export default Observable
window.Observable = Observable