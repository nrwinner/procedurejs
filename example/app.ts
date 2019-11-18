import { action, resolve, Procedure } from '../source';

export class Actions {

  @action('fetch object')
  @resolve('id')
  async action1(props: { id: string }) {
    console.log('id is', props.id);
    // pretend this makes a database call to fetch an object from props.id
    return Promise.resolve({ object: { name: 'Im a little bean' } });
  }

  @action('mutate object')
  @resolve('object')
  async action2(props: { object: { name: string } }, log: (message: string, data?: any) => { }) {
    // log the value of object as it exists right now
    log('object at beginning of action2', props.object);
    // pretend to mutate props.object with a database call and return the new value
    return Promise.resolve({ object: Object.assign({ level: 'super user' }, props.object) });
  }
}

new Procedure('fetch object', 'mutate object').run({ id: 'someid' }).then(transaction => {
  console.log('The object is now', transaction.attributes.object, '\n\n', transaction);
}).catch(transaction => {
  console.log('An error occured!', transaction.log);
});