---


---

<h1 id="procedurejs">ProcedureJS</h1>
<p>ProcedureJS is a lightweight framework for building clean, readable software. It aims to reduce the side-effects of large, complicated functions by organizing code into linear procedures comprised of actions that “do only one thing”. It maintains a singleton store for each transaction to persist data between actions, include return values and logs. Each Action can resolve and mutate the data in this store. Each Procedure maintains its own unique transaction store, so there’s no overlap between multiple Procedures executing at the same time.</p>
<h2 id="installation">Installation</h2>
<p>NOTE: ProcedureJS uses decorators! If you’re not using Typescript, you’ll need to use another pre-compiler like Babel to translate the decorators. Read more on this <a href="https://hackernoon.com/playing-around-with-your-standard-run-of-the-mill-javascript-decorator-example-28d0445307e1">here</a>.</p>
<p>ProcedureJS can be installed easily from npm:<br>
<code>npm install procedurejs</code></p>
<h1 id="usage">Usage</h1>
<p>The examples in this documentation use <a href="https://www.typescriptlang.org">Typescript</a> to help outline the different datatypes returned from the framework, but Typescript is <strong>not</strong> required to use ProcedureJS. You can remove the typings syntax from the  examples and run them in any Javascript file.</p>
<h2 id="actions">Actions</h2>
<p>Actions are small, simple functions that do one thing and have no side effects. For example, an Action might take an object as a parameter and insert that object into a database. Or perhaps it takes an object and mutates it in some way, returning the new object. As a good rule of thumb, if an Action is doing more than one thing, it should be two Actions.</p>
<h3 id="declaring-an-action">Declaring an Action</h3>
<p>ProcedureJS leverages decorators to extract boilerplate away from the developer. For this reason, Actions must be declared as members of a class. Actions can also be asynchronous and utilize the <a href="https://javascript.info/async-await">async/await</a> pattern. Let’s declare a set of actions for retrieving a user from a database and changing its name.</p>
<pre class=" language-typescript"><code class="prism  language-typescript"><span class="token keyword">export</span> <span class="token keyword">class</span> <span class="token class-name">Actions</span> <span class="token punctuation">{</span>

	@<span class="token function">action</span><span class="token punctuation">(</span><span class="token string">'fetch user'</span><span class="token punctuation">)</span>
	@<span class="token function">resolve</span><span class="token punctuation">(</span><span class="token string">'userId'</span><span class="token punctuation">)</span>
	<span class="token keyword">async</span> <span class="token function">fetchUser</span><span class="token punctuation">(</span>props<span class="token punctuation">:</span> <span class="token punctuation">{</span> userId<span class="token punctuation">:</span> <span class="token keyword">string</span> <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		<span class="token comment">// pseudocode for fetching the specified user from a database</span>
		<span class="token keyword">const</span> user <span class="token operator">=</span> <span class="token keyword">await</span> <span class="token function">fetch</span><span class="token punctuation">(</span>userId<span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token keyword">return</span> <span class="token punctuation">{</span> user <span class="token punctuation">}</span> 
	<span class="token punctuation">}</span>

	@<span class="token function">action</span><span class="token punctuation">(</span><span class="token string">'change name'</span><span class="token punctuation">)</span>
	@<span class="token function">resolve</span><span class="token punctuation">(</span><span class="token string">'user'</span><span class="token punctuation">,</span> <span class="token string">'name'</span><span class="token punctuation">)</span>
	<span class="token function">changeName</span><span class="token punctuation">(</span>props<span class="token punctuation">:</span> <span class="token punctuation">{</span> user<span class="token punctuation">:</span> <span class="token punctuation">{</span> name<span class="token punctuation">:</span> <span class="token keyword">string</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> name<span class="token punctuation">:</span> <span class="token keyword">string</span> <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
		props<span class="token punctuation">.</span>user<span class="token punctuation">.</span>name <span class="token operator">=</span> props<span class="token punctuation">.</span>name<span class="token punctuation">;</span>
		<span class="token keyword">return</span> <span class="token punctuation">{</span> user<span class="token punctuation">:</span> props<span class="token punctuation">.</span>user <span class="token punctuation">}</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre>
<h3 id="action-decorators">Action Decorators</h3>
<p>You may have noticed the decorators in the above example code. Each action <strong>must</strong> have the <code>@action</code> decorator. This decorator is responsible for naming the action and registering it with the application. Later on in our procedures, this name will be how we identify which Actions to include.</p>
<p>Most of the Actions you’ll write will need to access properties from the transaction store. This process can be handled easily with the optional <code>@resolve</code> decorator. This decorator takes a comma-separated list of property names to resolve from the store and passes them to the function as key-vaue pairs in a standard Javascript object.</p>
<h2 id="procedures">Procedures</h2>
<h3 id="declaring-a-procedure">Declaring a Procedure</h3>
<p>For example purposes, we’ll implement a procedure that uses the Actions we specified in the previous section.</p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token keyword">const</span> p <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Procedure</span><span class="token punctuation">(</span><span class="token string">'fetch user'</span><span class="token punctuation">,</span> <span class="token string">'change name'</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<p>That’s it. This Procedure, when executed, will retrieve user from a database and modify the <code>name</code> property of user.</p>
<h3 id="running-a-procedure">Running a Procedure</h3>
<p>Now that we’ve defined a Procedure, we can run it using the <code>run()</code> method. Remember how Actions work: they resolve their function properties from the Procedure’s transaction store. Notice that the first Action in our procedure, <code>fetch user</code> requires a property called <code>userId</code> to start. Notice also that the <code>change name</code> Action requires a <code>name</code> property to specify the user’s new name. Since neither of these properties exist yet in the transaction store, we’ll need to add them by handing them to the run method as properties. For example purposes, we’ll continue in the next example where we left off in the previous example.</p>
<pre class=" language-javascript"><code class="prism  language-javascript">p<span class="token punctuation">.</span><span class="token function">run</span><span class="token punctuation">(</span><span class="token punctuation">{</span> userId<span class="token punctuation">:</span> <span class="token string">'someUserId'</span><span class="token punctuation">,</span> name<span class="token punctuation">:</span> <span class="token string">'John Doe'</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<p>This Procedure will now execute the specified Actions in order and start with the specified <code>userId</code> and <code>name</code> properties already in the store. The Actions can resolve the necessary initial data from the store to complete their tasks.</p>
<h3 id="handling-the-results-of-a-procedure">Handling the results of a Procedure</h3>
<p>Each Procedure returns a Promise of a Transaction. When a Procedure has successfully completed its last Action, it returns the entire transaction as an object and resolves the promise. Data can be retrieved from the transaction as follows:</p>
<pre class=" language-typescript"><code class="prism  language-typescript">p<span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token punctuation">(</span>transaction<span class="token punctuation">:</span> Transaction<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
	<span class="token comment">// print the user's new name</span>
	console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">'User\'s name:'</span><span class="token punctuation">,</span> transaction<span class="token punctuation">.</span>attributes<span class="token punctuation">.</span>user<span class="token punctuation">.</span>name<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token keyword">catch</span><span class="token punctuation">(</span><span class="token punctuation">(</span>transaction<span class="token punctuation">:</span> Transaction<span class="token punctuation">)</span> <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
	console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">'An error occured!'</span><span class="token punctuation">,</span> transaction<span class="token punctuation">.</span>log<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>

