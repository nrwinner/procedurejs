# ProcedureJS
ProcedureJS is a lightweight framework for building clean, readable software. It aims to reduce the side-effects of large, complicated functions by organizing code into linear procedures comprised of actions that "do only one thing". It maintains a singleton store for each transaction to persist data between actions, include return values and logs. Each Action can resolve and mutate the data in this store. Each Procedure maintains its own unique transaction store, so there's no overlap between multiple Procedures executing at the same time.

## Installation
NOTE: ProcedureJS uses decorators! If you're not using Typescript, you'll need to use another pre-compiler like Babel to translate the decorators. Read more on this [here](https://hackernoon.com/playing-around-with-your-standard-run-of-the-mill-javascript-decorator-example-28d0445307e1).

ProcedureJS can be installed easily from npm:
`npm install procedurejs`

# Usage
The examples in this documentation use [Typescript](https://www.typescriptlang.org) to help outline the different datatypes returned from the framework, but Typescript is **not** required to use ProcedureJS. You can remove the typings syntax from the  examples and run them in any Javascript file.

## Actions
Actions are small, simple functions that do one thing and have no side effects. For example, an Action might take an object as a parameter and insert that object into a database. Or perhaps it takes an object and mutates it in some way, returning the new object. As a good rule of thumb, if an Action is doing more than one thing, it should be two Actions.

### Declaring an Action
ProcedureJS leverages decorators to extract boilerplate away from the developer. For this reason, Actions must be declared as members of a class. Actions can also be asynchronous and utilize the [async/await](https://javascript.info/async-await) pattern. Let's declare a set of actions for retrieving a user from a database and changing its name.

```typescript
export class Actions {

	@action('fetch user')
	@resolve('userId')
	async fetchUser(props: { userId: string }) {
		// pseudocode for fetching the specified user from a database
		const user = await fetch(userId);
		return { user } 
	}

	@action('change name')
	@resolve('user', 'name')
	changeName(props: { user: { name: string }, name: string }) {
		props.user.name = props.name;
		return { user: props.user };
	}
}
```

### Action Decorators
You may have noticed the decorators in the above example code. Each action **must** have the `@action` decorator. This decorator is responsible for naming the action and registering it with the application. Later on in our procedures, this name will be how we identify which Actions to include.

Most of the Actions you'll write will need to access properties from the transaction store. This process can be handled easily with the optional `@resolve` decorator. This decorator takes a comma-separated list of property names to resolve from the store and passes them to the function as key-vaue pairs in a standard Javascript object.

## Procedures

### Declaring a Procedure
For example purposes, we'll implement a procedure that uses the Actions we specified in the previous section.

```javascript
const p = new Procedure('fetch user', 'change name');
```
That's it. This Procedure, when executed, will retrieve user from a database and modify the `name` property of user.

### Running a Procedure
Now that we've defined a Procedure, we can run it using the `run()` method. Remember how Actions work: they resolve their function properties from the Procedure's transaction store. Notice that the first Action in our procedure, `fetch user` requires a property called `userId` to start. Notice also that the `change name` Action requires a `name` property to specify the user's new name. Since neither of these properties exist yet in the transaction store, we'll need to add them by handing them to the run method as properties. For example purposes, we'll continue in the next example where we left off in the previous example.

```javascript
p.run({ userId: 'someUserId', name: 'John Doe' });
```

This Procedure will now execute the specified Actions in order and start with the specified `userId` and `name` properties already in the store. The Actions can resolve the necessary initial data from the store to complete their tasks.

### Handling the results of a Procedure
Each Procedure returns a Promise of a Transaction. When a Procedure has successfully completed its last Action, it returns the entire transaction as an object and resolves the promise. Data can be retrieved from the transaction as follows:
```typescript
p.then((transaction: Transaction) => {
	// print the user's new name
	console.log('User\'s name:', transaction.attributes.user.name);
}).catch((transaction: Transaction) => {
	console.log('An error occured!', transaction.log);
});
```
