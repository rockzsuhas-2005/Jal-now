const KEY='jalnow_orders_v1', SUP='jalnow_suppliers_v1';
const app=document.getElementById('app');
let orders=JSON.parse(localStorage.getItem(KEY)||'[]');
let suppliers=JSON.parse(localStorage.getItem(SUP)||'[]');
let role='customer', screen='home';

const save=()=>{localStorage.setItem(KEY,JSON.stringify(orders));localStorage.setItem(SUP,JSON.stringify(suppliers));};
const money=n=>'₹'+Number(n).toLocaleString('en-IN');
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);

function header(title='JalNow',sub='Water at Your Door'){
return `<div class="top"><div class="brand">💧 JalNow</div><div class="sub">${title} · ${sub}</div></div>`;
}
function nav(){
return `<div class="nav">
<button onclick="go('home')">🏠<br>Home</button>
<button onclick="go('orders')">📦<br>Orders</button>
<button onclick="go('account')">👤<br>Account</button>
</div>`;
}
function go(s){screen=s;render();}
function setRole(r){role=r;screen='home';render();}
function render(){
if(role==='customer') customer();
else if(role==='supplier') supplier();
else admin();
}

function customer(){
let body='';
if(screen==='home') body=customerHome();
if(screen==='orders') body=customerOrders();
if(screen==='account') body=account();
app.innerHTML=header(role==='customer'?'Customer app':'')+`<div class="wrap">${body}</div>`+nav();
}
function customerHome(){
return `<div class="hero"><h1>Water, when you need it.</h1><div>Book a tanker or drinking-water cans from local suppliers.</div></div>
<div class="card"><label>📍 Deliver to</label><input id="loc" class="input" placeholder="Enter delivery address / area"></div>
<h2>What do you need?</h2>
<div class="grid">
<button class="choice" onclick="booking('tanker')">🚚<b>Water Tanker</b><span class="muted">For home, apartment & business</span></button>
<button class="choice" onclick="booking('can')">🧴<b>Drinking Water</b><span class="muted">10L / 20L / 25L cans</span></button>
</div>
<div class="card"><div class="row"><b>⚡ Quick repeat</b><span class="pill">Coming next</span></div><p class="muted">Repeat your regular water-can order in one tap.</p></div>
<div class="card"><b>🚚 How JalNow works</b><p class="muted">Choose water → confirm location → supplier accepts → delivered to your door.</p></div>
<div class="card"><button class="secondary" onclick="role='supplier';screen='home';render()">Switch to Supplier Demo</button> <button class="secondary" onclick="role='admin';screen='home';render()">Admin Demo</button></div>`;
}
function booking(type){
const loc=document.getElementById('loc')?.value||'';
let content=type==='tanker'?`
<h2>🚚 Book a Water Tanker</h2>
<div class="card"><label>Tanker capacity</label><select id="qty" class="input"><option value="2000">2,000 L</option><option value="5000">5,000 L</option><option value="10000">10,000 L</option><option value="12000">12,000 L</option></select>
<label>Water type</label><select id="wt" class="input"><option>Utility water</option><option>Drinking water</option></select></div>`:`
<h2>🧴 Drinking Water Cans</h2>
<div class="card"><label>Can size</label><select id="qty" class="input"><option value="20">20 L</option><option value="10">10 L</option><option value="25">25 L</option></select>
<label>Number of cans</label><input id="count" class="input" type="number" min="1" value="1"></div>`;
return `<div class="card">${content}<label>📍 Delivery location</label><input id="bloc" class="input" value="${loc}" placeholder="Full address / area">
<label>🕐 Delivery</label><select id="when" class="input"><option>As soon as possible</option><option>Schedule for later</option></select>
<div class="notice">Price shown here is a demo estimate. In the live marketplace, suppliers can set/approve local prices.</div>
<button class="primary" onclick="placeOrder('${type}')">CONFIRM BOOKING</button>
<button class="secondary" style="width:100%;margin-top:8px" onclick="go('home')">Back</button></div>`;
}
function placeOrder(type){
let q=document.getElementById('qty').value, count=document.getElementById('count')?.value||1;
let price=type==='tanker'?({2000:700,5000:1000,10000:1500,12000:1800}[q]||700):(count*70);
let o={id:uid('JN-'),type,quantity:q,count:Number(count),location:document.getElementById('bloc').value||'Not specified',when:document.getElementById('when').value,status:'Pending',price,created:new Date().toLocaleString('en-IN'),supplier:'Unassigned'};
orders.unshift(o);save();screen='orders';render();
}
function customerOrders(){
return `<h2>My Orders</h2>${orders.length?orders.map(orderCard).join(''):`<div class="card"><p>No orders yet.</p><button class="primary" onclick="go('home')">Book Water</button></div>`}`;
}
function orderCard(o){
let item=o.type==='tanker'?`${Number(o.quantity).toLocaleString()} L tanker`:`${o.count} × ${o.quantity} L drinking-water can`;
return `<div class="card order"><div class="row"><b>${item}</b><span class="pill">${o.status}</span></div><p class="muted">📍 ${o.location}</p><p class="muted">🕐 ${o.when}</p><div class="row"><span class="price">${money(o.price)}</span><span class="small">${o.id}</span></div>${o.supplier!=='Unassigned'?`<p class="muted">🚚 Supplier: ${o.supplier}</p>`:''}</div>`;
}
function account(){
return `<h2>Account</h2><div class="card"><b>Customer</b><p class="muted">This demo stores data on this device only.</p><button class="secondary" onclick="role='supplier';screen='home';render()">Supplier Portal</button><button class="secondary" onclick="role='admin';screen='home';render()">Admin Portal</button></div>`;
}

function supplier(){
let incoming=orders.filter(o=>o.status==='Pending');
let mine=orders.filter(o=>o.supplier==='Demo Tankers');
let body=screen==='home'?`<div class="hero"><h1>Supplier Portal</h1><div>Manage tanker and drinking-water orders.</div></div>
<div class="card"><div class="row"><div><div class="muted">Today's jobs</div><div class="stat">${mine.length}</div></div><div><div class="muted">Status</div><div class="pill">ONLINE</div></div></div></div>
<h2>New orders</h2>${incoming.length?incoming.map(o=>supplierCard(o)).join(''):`<div class="card">No new orders.</div>`}`
:screen==='orders'?`<h2>Accepted Orders</h2>${mine.length?mine.map(o=>supplierCard(o,true)).join(''):`<div class="card">No accepted orders.</div>`}`
:`<h2>Supplier Account</h2><div class="card"><label>Business name</label><input class="input" id="sname" value="Demo Tankers"><label>Phone</label><input class="input" value="9999999999"><button class="primary" onclick="alert('Supplier profile saved for demo')">SAVE</button></div>`;
app.innerHTML=header('Supplier portal','Local partner')+`<div class="wrap">${body}</div>`+`<div class="nav"><button onclick="screen='home';render()">🏠<br>New</button><button onclick="screen='orders';render()">📦<br>Accepted</button><button onclick="role='customer';screen='home';render()">↩️<br>Customer</button></div>`;
}
function supplierCard(o,accepted=false){
return `<div class="card order"><div class="row"><b>${o.type==='tanker'?Number(o.quantity).toLocaleString()+' L tanker':o.count+' × '+o.quantity+' L cans'}</b><span class="pill">${o.status}</span></div><p class="muted">📍 ${o.location}</p><p>${money(o.price)}</p>${!accepted?`<button class="primary" onclick="acceptOrder('${o.id}')">ACCEPT ORDER</button>`:`<button class="primary" onclick="advance('${o.id}')">${o.status==='Accepted'?'MARK ON THE WAY':o.status==='On the way'?'MARK ARRIVED':o.status==='Arrived'?'MARK DELIVERED':'COMPLETED'}</button>`}</div>`;
}
function acceptOrder(id){let o=orders.find(x=>x.id===id);if(o){o.status='Accepted';o.supplier='Demo Tankers';save();render();}}
function advance(id){let o=orders.find(x=>x.id===id);if(!o)return;let next={Accepted:'On the way','On the way':'Arrived',Arrived:'Delivered'}[o.status];if(next)o.status=next;save();render();}

function admin(){
let pending=orders.filter(o=>o.status!=='Delivered').length, delivered=orders.filter(o=>o.status==='Delivered').length;
let body=screen==='home'?`<div class="hero"><h1>Admin Dashboard</h1><div>Control JalNow marketplace operations.</div></div>
<div class="grid"><div class="card"><div class="muted">Total orders</div><div class="stat">${orders.length}</div></div><div class="card"><div class="muted">Active</div><div class="stat">${pending}</div></div></div>
<div class="grid"><div class="card"><div class="muted">Delivered</div><div class="stat">${delivered}</div></div><div class="card"><div class="muted">Suppliers</div><div class="stat">${Math.max(1,suppliers.length)}</div></div></div>
<div class="card"><button class="primary" onclick="screen='orders';render()">MANAGE ORDERS</button></div>`
:screen==='orders'?`<h2>Manage Orders</h2>${orders.length?orders.map(adminCard).join(''):`<div class="card">No orders.</div>`}`
:`<h2>Supplier Management</h2><div class="card"><p class="muted">Supplier onboarding and verification.</p><button class="primary" onclick="addSupplier()">ADD DEMO SUPPLIER</button></div>${suppliers.map(s=>`<div class="card"><b>${s.name}</b><p class="muted">${s.phone} · ${s.capacity}</p><span class="pill">${s.status}</span></div>`).join('')}`;
app.innerHTML=header('Admin','JalNow operations')+`<div class="wrap">${body}</div>`+`<div class="nav"><button onclick="screen='home';render()">📊<br>Dashboard</button><button onclick="screen='orders';render()">📦<br>Orders</button><button onclick="screen='suppliers';render()">🚚<br>Suppliers</button><button onclick="role='customer';screen='home';render()">↩️<br>Customer</button></div>`;
}
function adminCard(o){
return `<div class="card order"><div class="row"><b>${o.id}</b><span class="pill">${o.status}</span></div><p>${o.type==='tanker'?Number(o.quantity).toLocaleString()+' L tanker':o.count+' × '+o.quantity+' L cans'} · ${money(o.price)}</p><p class="muted">📍 ${o.location}</p><select class="input" onchange="adminStatus('${o.id}',this.value)"><option ${o.status==='Pending'?'selected':''}>Pending</option><option ${o.status==='Accepted'?'selected':''}>Accepted</option><option ${o.status==='On the way'?'selected':''}>On the way</option><option ${o.status==='Arrived'?'selected':''}>Arrived</option><option ${o.status==='Delivered'?'selected':''}>Delivered</option><option>Cancelled</option></select></div>`;
}
function adminStatus(id,s){let o=orders.find(x=>x.id===id);if(o){o.status=s;save();render();}}
function addSupplier(){suppliers.push({name:'Demo Water Supplier '+(suppliers.length+1),phone:'9999999999',capacity:'Tanker + 20L cans',status:'Pending verification'});save();render();}

render();