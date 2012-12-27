"use strict";

var form = require("./fixtures/form")
var tree = require("../core")
var filter = require("reducers/filter")
var map = require("reducers/map")
var reductions = require("reducers/reductions")
var into = require("reducers/into")
var fold = require("reducers/fold")

exports["test walk"] = function(assert) {
  function isObject(value) { return value && typeof(value) === "object" }
  function values(dictionary) {
    return Object.keys(dictionary).map(function(key) {
      return dictionary[key]
    })
  }

  // Make reducible AST tree of the source. If node is an object than it"s
  // a branch.
  var ast = tree(form, isObject, function nodes(form) {
    return values(form).filter(isObject).map(function(node) {
      // Add non-enumerable `parent` property to each node so that path to
      // global scope can be simply obtained. Define `parent` as non-enumerable
      // so it won"t show up in `Object.keys` & won"t be traversed again.
      return Object.defineProperty(node, "parent", {
        parent: { value: form, enumerable: false }
      })
    })
  })

  // Find all the identifier nodes in the AST.
  var identifiers = filter(ast, function(node) {
    return node.type === "Identifier"
  })

  var unique = fold(identifiers, function(node, unique) {
    var name = node.name
    var contains = unique.some(function(node) { return node.name === name })
    return contains ? unique : unique.concat(node)
  }, [])

  assert.deepEqual(into(unique), [
    { type: "Identifier", name: "sum" },
    { type: "Identifier", name: "a" },
    { type: "Identifier", name: "b" },
    { type: "Identifier", name: "plus" },
    { type: "Identifier", name: "add" },
    { type: "Identifier", name: "exports" }
  ], "got all the identifiers")

  // Get names for all the identifier nodes.
  var names = map(unique, function(node) { return node.name })

  assert.deepEqual(into(names), ["sum", "a", "b", "plus", "add", "exports"],
                   "mapped exports to names")


}

require("test").run(exports)
