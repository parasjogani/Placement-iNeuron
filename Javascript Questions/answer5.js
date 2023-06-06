// Original function with multiple arguments
function add(x, y, z) {
    return x + y + z;
}

// Currying the add function
function curryAdd(x) {
    return function (y) {
        return function (z) {
            return x + y + z;
        };
    };
}

// Example
const curriedAdd = curryAdd(1)(2);
console.log(curriedAdd(3)); // 6
