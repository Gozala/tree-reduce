"use strict";

var reducible = require("reducible/reducible")
var reduce = require("reducible/reduce")
var expand = require("reducers/expand")
var concat = require("reducers/concat")

function tree(form, isBranch, nodes) {
  /**
  Takes arbitrary `form` and returns reducible tree that can be walked via
  reduce. This also makes tree's filterable, mappable etc... Basically all the
  reducer functions become available. To define walking algorithm function take
  `isBranch` predicate function that is invoked with every node and is supposed
  to return `true` if node is branch or false otherwise. Another argument is
  `nodes` function that is invoked with every branch node and is supposed to
  reducible collection of the child nodes.

  Please note that this function recursively walks nodes but does not attempts
  to normalize order, which means that if branches are collections of eventual
  values their nodes will be walked as they arrive and not in sequential order.
  If order matters for you make sure to sequentialize given `form`.


  ## Example

      var ast = tree(esprima.parse(source), function isBranch(node) {
        return node && typeof(node) === "object"
      }, function(node) {
        return Object.keys(node).filter(function(value) {
          value && typeof(value) === "object"
        })
      })

      // Find all the identifier nodes
      var identifiers = filter(ast, function(node) {
        return node.type === esprima.Syntax.Identifier
      })
      // Get names for the identifiers.
      var names = map(ast, function(node) { return node.name })
  **/

  function traversable(node) { return tree(node, isBranch, nodes) }
  return reducible(function reduceTree(next, initial) {
    var children = isBranch(form) ? expand(nodes(form), traversable) : null
    reduce(concat(form, children), next, initial)
  })
}

module.exports = tree
