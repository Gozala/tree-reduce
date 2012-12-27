# tree-reduce

[![Build Status](https://secure.travis-ci.org/Gozala/tree-reduce.png)](http://travis-ci.org/Gozala/tree-reduce)

Reducible tree walk for an arbitrary data structures.

## API

#### tree(form, isBranch, nodes)

Function takes arbitrary data structure as a `form` argument and returns
reducible tree, that can be walked via reduce. Since such trees are reducible
that also makes them `filter`-able, `map`-able etc... Basically all the
[reducer][reducers] functions can be used. To define a tree structure for
navigation two other arguments need to be supplied:

- `isBranch` predicate function that is invoked on every node and is supposed
  to return `true` if node is branch or `false` otherwise.

- `nodes` function invoked on every branch node (nodes to which `isBranch`
  returns `true`) and is expected to return reducible collection of the
  child nodes.

Please note that `tree` won't attempt to normalize order of child nodes during
recursively walk. More simply if results of `nodes` function are eventual
collections like `Stream` that emit data asynchronously order of nodes being
walked will depend on order in which those nodes arrive. If sequential walk
order is desired but underlying data structures are asynchronous it's up to
consumer to sequentialize `form` before passing it to `tree`.


```js
var tree = require("tree-reduce")
var filter = require("reducers/filter")
var map = require("reducers/map")

function isObject(value) { return value && typeof(value) === "object" }
function values(dictionary) {
  return Object.keys(dictionary).map(function(key) {
    return dictionary[key]
  })
}

// Make reducible AST tree of the source. If node is an object than it's
// a branch.
var ast = tree(esprima.parse(source), isObject, function nodes(form) {
  return values(form).filter(isObject).map(function(node) {
    // Add non-enumerable `parent` property to each node so that path to
    // global scope can be simply obtained. Define `parent` as non-enumerable
    // so it won't show up in `Object.keys` & won't be traversed again.
    Object.defineProperty(node, "parent", {
      parent: { value: form, enumerable: false }
    })
  })
})

// Find all the identifier nodes in the AST.
var allIdentifiers = filter(ast, function(node) {
  return node.type === esprima.Syntax.Identifier
})

// Accumulate only unique identifiers.
var uniqueIdentifiers = fold(allIdentifiers, function(node, unique) {
  var name = node.name
  var contains = unique.some(function(node) { return node.name === name })
  return contains ? unique : unique.concat(node)
}, [])

// Get names for all unique identifiers.
var names = map(uniqueIdentifiers, function(node) { return node.name })

// Find all the global identifiers
var globals = filter(ast, function(node) {
  var path = node.parent
  // That's an exercise to you my friend, but hopefully you got the idea!
  return isGlobal(path)
})
```


## Install

    npm install tree-reduce


[reducers]:https://github.com/Gozala/reducers
