const person = {
    name: 'John',
    greet: function (message) {
        console.log(`${message}, ${this.name}!`);
    }
};

const anotherPerson = {
    name: 'Alice'
};

const greetWithAlice = person.greet.bind(anotherPerson);
greetWithAlice('Hello'); // Hello, Alice!
