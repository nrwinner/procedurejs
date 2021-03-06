import { Procedure } from '../lib';
import { action, resolve } from '../lib/decorators';
import { actions, alias, doIf } from '../lib/operators';

import * as request from 'request-promise-native';

export class Actions {

  @action('fetch objects')
  @resolve('id')
  async fetchObject(props: { id: string }) {
    // pretend this makes a database call to fetch an object from props.id
    return Promise.resolve({ objects: [ { name: 'Im a little bean' }, { name: 'Im a bigger bean' } ] });
  }

  @action('mutate object')
  @resolve('object')
  async mutateObject(props: { object: { name: string } }, log: (message: string, data?: any) => { }) {
    // log the value of object as it exists right now
    log('object at beginning of action2', props.object);
    // pretend to mutate props.object with a database call and return the new value
    return Promise.resolve({ object: Object.assign({ level: 'super user' }, props.object) });
  }

  @action('change object name')
  @resolve('object')
  async changeObjectName(props: { object: any }) {
    // generate a random number 1 <= x <= 10
    const id = Math.ceil(Math.random() * 10);

    // make a request to a dummy JSON api to fetch a user with the specified id
    return request('https://jsonplaceholder.typicode.com/users/' + id).then(user => {
      props.object.name = JSON.parse(user).name;
      return { object: props.object };
    })
  }

  @action('create object')
  @resolve('objects')
  async createObject(props: { objects: any[] }) {
    // generate a random number 1 <= x <= 10
    const id = Math.ceil(Math.random() * 10);
    const name = await request('https://jsonplaceholder.typicode.com/users/' + id).then(user => {
      return JSON.parse(user).name;
    });

    return { objects: props.objects.concat([{ name }]) };
  }
}

new Procedure(
  'fetch objects',
  actions('create object').apply(
    doIf({ objects: (o) => o.length < 10 })
  ),
  alias('objects', 'woohoo'),
).run({ id: 'someid' }).then(transaction => {
  console.log(transaction.attributes.objects)
}).catch(transaction => {
  console.log('An error occured!', transaction.log);
});