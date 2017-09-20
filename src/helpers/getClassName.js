"use strict";

const getClassName = (object) => object.__proto__.constructor.name
module.exports = getClassName
