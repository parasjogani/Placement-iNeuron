// Example 1
function greet() {
    console.log("Hello " + this.name);
}

var person = {
    name: "Paras",
    greet: greet
};

person.greet(); // Hello  Paras

// Example 2
function Person(name) {
    this.name = name;
    this.greet = function () {
        console.log("Hello " + this.name);
    };
}

var person1 = new Person("Paras");
var person2 = new Person("Harshil");

person1.greet(); // Hello Paras
person2.greet(); // Hello Harshil
