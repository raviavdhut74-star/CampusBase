// CampusBase v2 portal — uses the SAME Supabase backend/files as the rest of the project (supabase.js, setup.sql).
import { supabase, BUCKET, CATALOG, isAdmin } from "./supabase.js";

// Social links are OFF for now. Set on:true and a url to enable later.
const SOCIAL={instagram:{on:true,url:"https://www.instagram.com/campus_base"},whatsapp:{on:true,url:"https://chat.whatsapp.com/ICt2INQ4g2JEKB8urgboBd"},telegram:{on:true,url:"https://t.me/campusbase_study_material"}};
const C={unis:["SPPU","BATU","SGBBU","AKTU"],branches:[...new Set(["AI & ML",...CATALOG.branches])],years:CATALOG.years,
  types:[...new Set(["Notes","Handwritten Notes","Question Bank","Answer Bank","Formula Notes","Previous Year Papers","Books","MCQ",...CATALOG.types])]};
const YL={FE:"First Year",SE:"Second Year",TE:"Third Year",BE:"Final Year"};
const $=id=>document.getElementById(id);
const toast=t=>{const e=$("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2600)};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const opts=(a,v,lab)=>a.map(x=>`<option value="${esc(x)}"${x===v?" selected":""}>${esc(lab?lab[x]:x)}</option>`).join("");
const fill=(id,a,lab)=>{$(id).innerHTML=opts(a,null,lab)};
const mk=(t,x,c)=>{const e=document.createElement(t);if(x!=null)e.textContent=x;if(c)e.className=c;return e};
const soon=()=>toast("Coming soon 🚀");
const social=k=>{const s=SOCIAL[k];s.on&&s.url?open(s.url,"_blank","noopener"):soon()};

// ---- session state ----
const S={user:null,prof:null,admin:false,sub:null};
async function load(){const{data:{session}}=await supabase.auth.getSession();S.user=session?session.user:null;S.prof=null;S.admin=false;S.sub=null;
  if(S.user){const[p,a,sb]=await Promise.all([supabase.from("profiles").select("*").eq("id",S.user.id).maybeSingle(),isAdmin(),supabase.from("subscriptions").select("expires_at").eq("user_id",S.user.id).order("expires_at",{ascending:false}).limit(1).maybeSingle()]);S.prof=p.data;S.admin=a;S.sub=sb.data&&new Date(sb.data.expires_at)>new Date()?sb.data.expires_at:null}}
const me=()=>{if(!S.user)return null;const p=S.prof||{};return{name:p.name||S.user.user_metadata?.full_name||S.user.email.split("@")[0],email:S.user.email,prn:p.prn||"—",uni:p.university||C.unis[0],branch:p.branch||C.branches[0],year:p.year||"FE",photo:p.photo,admin:S.admin,sub:S.sub}};
const sid=u=>"@"+u.name.toLowerCase().trim().replace(/\s+/g,".");
const avatar=u=>`<span class="av">${u&&u.photo?`<img src="${esc(u.photo)}" alt="">`:esc(u?u.name[0].toUpperCase():"👤")}</span>`;
async function logout(){await supabase.auth.signOut();await load();toast("Logged out");location.hash="home";route()}

// theme
const setTheme=d=>{document.documentElement.dataset.theme=d?"dark":"light";$("themeBtn").textContent=d?"🌙":"☀️"};
const th=(()=>{try{return localStorage.getItem("cb2_theme")}catch{return null}})();setTheme(th!=="light");$("themeBtn").onclick=()=>{const d=document.documentElement.dataset.theme!=="dark";setTheme(d);try{localStorage.setItem("cb2_theme",d?"dark":"light")}catch{}};

// drawer
const T=t=>"type:"+t;
const MENU=[["⭐","Premium","premium"],["👥","Social Mode","pg:social"],["🏠","Home","home"],["🎓","My Branch","branch"],["📗","Notes",T("Notes")],["✍️","Handwritten Notes",T("Handwritten Notes")],["🗄️","Question Bank",T("Question Bank")],["⭐","Answer Bank",T("Answer Bank")],["☑️","MCQ",T("MCQ")],["🏆","Leaderboard","pg:leader"],["💬","Doubt Solving","pg:doubt"],["√x","Formula Notes",T("Formula Notes")],["📄","Previous Year Papers",T("Previous Year Papers")],["📕","Books",T("Books")],["⬇️","Downloads","pg:dl"],["🎖️","Certificates","pg:cert"],["📝","Revaluation Score","pg:reval"],["🎁","Refer & Earn","pg:refer"],["📱","Download App","pg:apk"],["🧾","Payment Receipt","pg:receipt"],["ℹ️","About Us","foot"],["📸","Follow on Instagram","s:instagram"],["💚","Join WhatsApp Group","s:whatsapp"],["✈️","Join Telegram","s:telegram"],["✉️","Contact Us","foot"],["⚙️","Settings","pg:settings"]];
function drawer(){const u=me();
  $("dUser").innerHTML=avatar(u)+`<div><b>${esc(u?u.name:"Guest")}</b><div class="muted">${esc(u?u.branch:"Please login")}</div></div>`;
  const l=$("dList");l.innerHTML="";
  (u&&u.admin?[["📤","Upload Files","admin"],...MENU]:MENU).forEach(([i,t,a])=>{const li=document.createElement("li"),b=mk("button",null,(a==="soon"||(a.startsWith("s:")&&!SOCIAL[a.slice(2)].on))?"off":"");b.innerHTML=`<span style="width:22px;text-align:center">${i}</span>${esc(t)}`;b.onclick=()=>{go(a);setDrawer(false)};li.append(b);l.append(li)});
  const li=document.createElement("li"),b=mk("button",u?"⎋  Logout":"⎋  Login / Register","lo");b.onclick=()=>{setDrawer(false);u?logout():(location.hash="login")};li.append(b);l.append(li)}
const setDrawer=o=>{$("drawer").classList.toggle("on",o);$("scrim").classList.toggle("on",o)};
$("burger").onclick=()=>{drawer();setDrawer(true)};$("scrim").onclick=()=>setDrawer(false);
function go(a){if(a==="soon")return soon();if(a.startsWith("pg:"))return PAGES[a.slice(3)]();if(a==="premium")return paywall();if(a==="home"){location.hash="home";scrollTo(0,0)}else if(a==="branch")goBranch();else if(a==="admin")location.hash="admin";else if(a==="foot")$("foot").scrollIntoView({behavior:"smooth"});
  else if(a.startsWith("s:"))social(a.slice(2));else if(a.startsWith("type:"))browse(a.slice(5))}

// routing
function route(){const h=location.hash.slice(1)||"home",u=me();let v="home";
  if(h==="login"||h==="master"){if(u){location.hash=u.admin?"admin":"home";return}v="auth";setMode(h==="master"?"master":(mode==="register"?"register":"login"))}
  else if(h==="admin"){if(u&&u.admin)v="admin";else{location.hash="master";return}}
  else if(h==="branch"){if(!u){location.hash="login";return}v="branch"}
  document.querySelectorAll(".view").forEach(s=>s.hidden=s.id!=="v-"+v);$("backBtn").hidden=v==="home";
  if(v==="home")home();if(v==="branch")branchPage();if(v==="admin"){$("who").textContent="Signed in as admin: "+u.email;list();loadSubj()}
  document.querySelectorAll(".bnav button").forEach(b=>b.classList.toggle("on",b.dataset.n==="home"&&v==="home"))}
$("backBtn").onclick=()=>history.length>1?history.back():(location.hash="home");
addEventListener("hashchange",()=>{route();scrollTo(0,0)});

// home
const CARDS=[["🗄️","Question Bank","5000+ Questions","Question Bank","Explore"],["⭐","Answer Bank","Solved Answers","Answer Bank","Explore"],["📗","Notes","All Subject Notes","Notes","Explore"],["✍️","Handwritten Notes","Topper Handwritten Notes","Handwritten Notes","Explore"],["☑️","MCQ","Practice MCQ","MCQ","Explore"],["🏆","Leaderboard","Quiz Rankings","pg:leader","View"],["💬","Doubt Solving","Get your doubts solved","pg:doubt","Ask Now"],["√x","Formula Notes","All Formulas in one place","Formula Notes","Explore"],["🎖️","Certificates","Your Achievements","pg:cert","View All"]];
const MORE=[["📄","Previous Year Papers","Download previous year question papers","Previous Year Papers","Explore"],["📚","Study Materials","Important books & study materials","Books","Explore"]];
function card(c){const d=mk("div",null,"card dc");d.innerHTML=`<span class="ic">${c[0]}</span><b>${esc(c[1])}</b><span class="muted">${esc(c[2])}</span>`;
  const b=mk("button",c[4],"uni-btn");b.onclick=()=>c[3]==="@admin"?(location.hash="admin"):c[3]&&c[3].startsWith("pg:")?PAGES[c[3].slice(3)]():c[3]?browse(c[3]):soon();d.append(b);return d}
function home(){const u=me();
  $("greet").innerHTML=u?`${avatar(u)}<div><b>Hello, ${esc(u.name)}! 👋</b><div class="muted">Keep learning, keep growing.</div>${u.admin?'<span class="chip">Admin</span>':`<span class="chip">${esc(YL[u.year]||"")} Student</span>`}</div><div class="sp muted" style="text-align:right">Your Progress<br>Coming soon</div>`
    :`<span class="av">👋</span><div><b>Hello, Student!</b><div class="muted">Login with your PRN to personalise.</div></div><a class="uni-btn sp" href="#login">Login</a>`;
  $("branchCard").innerHTML=u&&!u.admin?`<span class="av" style="border-radius:12px">🤖</span><div><b>${esc(u.branch)}</b><div class="muted">${esc(u.uni)} · ${esc(YL[u.year])}</div></div><span class="chip sp">Open</span>`:`<div class="muted">${u?"Admin account":"Login to see your branch."}</div>`;
  $("branchCard").style.cursor=u&&!u.admin?"pointer":"";$("branchCard").onclick=u&&!u.admin?goBranch:null;
  $("soc").innerHTML="";[["ig","📸 Instagram","instagram"],["wa","💬 WhatsApp","whatsapp"],["tg","✈️ Telegram","telegram"]].forEach(([c,t,k])=>{const b=mk("button",t,c+(SOCIAL[k].on?"":" off"));b.onclick=()=>social(k);$("soc").append(b)});
  $("dash").replaceChildren(...(u&&u.admin?[["📤","Upload Files","Add or delete material","@admin","Open"]]:[]).concat(CARDS).map(card));$("more").replaceChildren(...MORE.map(card));
  const cb=$("commBtn");cb.className=SOCIAL.whatsapp.on?"":"off";cb.onclick=()=>social("whatsapp");$("apkBtn").onclick=()=>PAGES.apk()}
$("sidBtn").onclick=async()=>{if(!S.user){toast("Login to search students");return}const q=$("sidIn").value.trim().replace(/^@?/,"@");
  const{data}=await supabase.rpc("find_student",{p_sid:q});const r=data&&data[0];$("sidRes").textContent=r?`✓ ${r.name} · ${r.branch} · ${YL[r.year]||r.year} · ${r.university}`:"No student found with this SID."};
document.querySelectorAll("[data-soon]").forEach(a=>a.onclick=soon);document.querySelectorAll("[data-soc]").forEach(a=>a.onclick=()=>social(a.dataset.soc));
document.querySelectorAll(".bnav button").forEach(b=>b.onclick=()=>{const n=b.dataset.n;if(n==="home"){location.hash="home";scrollTo(0,0)}else if(n==="explore"){location.hash="home";setTimeout(()=>$("dash").scrollIntoView({behavior:"smooth"}),50)}else if(n==="prof")profile();else if(PAGES[n])PAGES[n]();else soon()});

// browse files
let tab=C.types[0];fill("fUni",C.unis);fill("fBranch",C.branches);fill("fYear",C.years,YL);
function browse(t,sem){const u=me();tab=t;SEM=sem||null;subSel=ALLSUB;if(u&&(!u.admin||sem)){$("fUni").value=u.uni;$("fBranch").value=u.branch;$("fYear").value=u.year}if(!$("modal").open)$("modal").showModal();show()}
const ALLSUB="__all__";
let subjCache=[],subjNames=[],subSel=ALLSUB,SEM=null;
const subOf=x=>(x.subject||"").trim()||"General";
// subject chips: every subject saved for this university/branch/year (even with 0 files) + subjects found on files
function renderSubj(){const bar=$("subjBar");bar.replaceChildren();
  const cnt={};subjCache.forEach(x=>{const k=subOf(x);cnt[k]=(cnt[k]||0)+1});
  const names=[...new Set([...subjNames,...Object.keys(cnt)])].sort((a,b)=>a.localeCompare(b));
  if(subSel!==ALLSUB&&!names.includes(subSel))subSel=ALLSUB;
  bar.hidden=!names.length;
  [[ALLSUB,"All subjects"],...names.map(n=>[n,n+(cnt[n]?" ("+cnt[n]+")":"")])].forEach(([v,t])=>{const b=mk("button",t,"sj"+(v!==ALLSUB&&!cnt[v]?" sj0":""));b.type="button";b.setAttribute("aria-pressed",v===subSel);b.onclick=()=>{subSel=v;renderSubj();renderRes()};bar.append(b)})}
function renderRes(){const l=$("resList");l.replaceChildren();
  let rows=subjCache.filter(x=>subSel===ALLSUB||subOf(x)===subSel);
  if(!rows.length)return l.append(mk("li","Nothing uploaded here yet.","none"));
  if(subSel===ALLSUB)rows=rows.map((x,i)=>[x,i]).sort((a,b)=>subOf(a[0]).localeCompare(subOf(b[0]))||a[1]-b[1]).map(r=>r[0]);
  const can=!!S.user&&(S.admin||!!S.sub);let last=null;
  rows.forEach(x=>{if(subSel===ALLSUB&&subOf(x)!==last){last=subOf(x);l.append(mk("li","📘 "+last,"grp"))}
    const li=document.createElement("li"),a=mk("a",(x.is_free?"🆓 ":can?"":"🔒 ")+x.title);a.href="#";
    a.onclick=e=>{e.preventDefault();if(!S.user){$("modal").close();toast("Please login first");location.hash="login";return}if(can||x.is_free)openFile(x);else paywall()};
    li.append(a);l.append(li)})}
async function show(){const t=$("tabs");t.replaceChildren();C.types.forEach(x=>{const b=mk("button",x);b.setAttribute("aria-selected",x===tab);b.onclick=()=>{tab=x;show()};t.append(b)});
  const l=$("resList");l.replaceChildren(mk("li","Loading…","none"));
  const U=$("fUni").value,B=$("fBranch").value,Y=$("fYear").value;
  const[r,s]=await Promise.all([supabase.from("resources").select("*").eq("university",U).eq("branch",B).eq("year",Y).eq("type",tab).order("created_at",{ascending:false}),
    supabase.from("subjects").select("name").eq("university",U).eq("branch",B).eq("year",Y)]);
  if(r.error){l.replaceChildren(mk("li",r.error.message,"none"));return}
  subjCache=r.data;subjNames=(s.data||[]).map(x=>x.name);
  if(SEM){const set=new Set(SEM);subjCache=subjCache.filter(x=>set.has(subOf(x)));subjNames=SEM}
  renderSubj();renderRes()}
["fUni","fBranch","fYear"].forEach(i=>$(i).onchange=()=>{SEM=null;subSel=ALLSUB;show()});$("mClose").onclick=()=>$("modal").close();

// profile sheet
async function saveProf(patch){const{error}=await supabase.from("profiles").update(patch).eq("id",S.user.id);if(error)return toast(error.message),false;await load();home();return true}
function profile(mode){const u=me();if(!u){toast("Please login first");location.hash="login";return}
  const s=$("sheet"),b=$("sheetBody");
  if(mode==="edit"||mode==="branch"){const br=mode==="branch";
    b.innerHTML=`<form id="pf" class="f"><h3>${br?"Change Branch":"Edit Profile"}</h3>`+(br?`<label>Branch<select id="pBranch">${opts(C.branches,u.branch)}</select></label>`:
      `<label>Full name<input id="pName" class="search" maxlength="60" value="${esc(u.name)}"></label><label>University<select id="pUni">${opts(C.unis,u.uni)}</select></label><label>Year<select id="pYear">${opts(C.years,u.year,YL)}</select></label>`)+
      `<button class="primary-btn wide">Save</button><button type="button" class="primary-btn wide ghost" id="pBack">Cancel</button></form>`;
    $("pBack").onclick=()=>profile();
    $("pf").onsubmit=async e=>{e.preventDefault();let p;if(br)p={branch:$("pBranch").value};else{const n=$("pName").value.trim();if(!n)return toast("Name required");p={name:n,university:$("pUni").value,year:$("pYear").value}}
      if(await saveProf(p)){toast("Saved ✓");if(br){$("sheet").close();goBranch()}else profile()}}}
  else{b.innerHTML=`<div style="text-align:center"><div class="pav">${avatar(u)}<label title="Change photo">📷<input type="file" id="pPhoto" accept="image/*" hidden></label></div><p class="muted">Tap the camera icon to update your photo.</p>
    <h2>${esc(u.name)}</h2><p class="muted">${esc(u.email)}</p><p class="muted">${u.admin?"":u.sub?"⭐ Premium till "+esc(new Date(u.sub).toLocaleDateString("en-IN")):"Free plan"}</p>${u.admin?'<p class="mt"><span class="chip">ADMIN</span></p>':`<p class="mt"><span class="chip">${esc((YL[u.year]||"").toUpperCase())}</span> <span class="chip">${esc(u.branch.toUpperCase())}</span></p>`}</div>
    <div class="pg"><div><small>Public S ID</small><b>${esc(sid(u))}</b></div><div><small>PRN</small><b>${esc(u.prn)}</b></div><div><small>Year</small><b>${esc(YL[u.year])}</b></div><div><small>Branch</small><b>${esc(u.branch)}</b></div><div><small>University</small><b>${esc(u.uni)}</b></div><div><small>Academic Year</small><b>2025–26</b></div></div>
    ${u.admin?"":`<button class="primary-btn wide" id="pSub">⭐ ${u.sub?"Extend":"Get"} Premium</button>`}<button class="primary-btn wide" id="pEdit">✎ Edit Profile</button><button class="primary-btn wide" id="pBr">⇄ Change Branch</button><button class="primary-btn wide ghost" id="pClose">Close</button>`;
    $("pEdit").onclick=()=>profile("edit");if($("pSub"))$("pSub").onclick=()=>{$("sheet").close();paywall()};$("pBr").onclick=()=>profile("branch");$("pClose").onclick=()=>s.close();
    $("pPhoto").onchange=e=>{const f=e.target.files[0];if(!f)return;const img=new Image();img.onload=async()=>{const c=document.createElement("canvas");c.width=c.height=160;const m=Math.min(img.width,img.height);c.getContext("2d").drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,160,160);if(await saveProf({photo:c.toDataURL("image/jpeg",.8)}))profile()};img.src=URL.createObjectURL(f)}}
  if(!s.open)s.showModal()}
$("profBtn").onclick=()=>profile();$("sheet").addEventListener("click",e=>{if(e.target.id==="sheet")e.target.close()});

// auth
let mode="login";fill("aUni",C.unis);fill("aBranch",C.branches);fill("aYear",C.years,YL);
const MODES={login:["Welcome Back","Login via Email or PRN Number","Email Address or PRN Number","Login","Don't have an account?","Sign up","register"],
 register:["Create Account","Register with your PRN Number","PRN Number","Register","Already registered?","Login","login"],
 master:["Admin Login","Admins only — upload & manage files","Admin Email","Login as Admin","Not an admin?","Student login","login"]};
function setMode(m){mode=m;const d=MODES[m],adm=m==="master";
  $("aTitle").textContent=d[0];$("aSub").textContent=d[1];$("idLbl").textContent=d[2];$("aSubmit").textContent=d[3];$("swapTxt").textContent=d[4];$("swap").textContent=d[5];
  $("regRows").hidden=m!=="register";$("toReg").textContent=m==="register"?"Login":"Sign Up";$("toReg").hidden=adm;$("neon").classList.toggle("reg",m==="register");$("nWelcome").innerHTML=m==="register"?"WELCOME!":m==="master"?"ADMIN<br>ACCESS":"WELCOME<br>BACK!";
  $("mLbl").textContent=adm?"Student Login":"Admin Login";$("forgot").hidden=false;$("aId").type=adm?"email":"text";$("aMsg").textContent="";$("aMsg").style.color="";
  $("aPass").autocomplete=m==="register"?"new-password":"current-password"}
$("toReg").onclick=()=>goMode(mode==="register"?"login":"register");
function flip(act){const n=$("neon");if(n.classList.contains("busy"))return;n.classList.add("busy");
  setTimeout(()=>{const was=n.classList.contains("reg");act();const is=n.classList.contains("reg"),ch=is!==was;
    n.classList.remove("to-reg","to-login");void n.offsetWidth;if(ch)n.classList.add(is?"to-reg":"to-login");
    setTimeout(()=>n.classList.remove("busy","to-reg","to-login"),ch?800:250)},320)}
const goMode=m=>flip(()=>{setMode(m);const h=m==="master"?"master":"login";if(location.hash.slice(1)!==h)location.hash=h});
$("swap").onclick=()=>goMode(mode==="master"?"login":MODES[mode][6]);
$("masterLink").onclick=()=>goMode(mode==="master"?"login":"master");
$("forgot").onclick=async()=>{const id=$("aId").value.trim();if(!id.includes("@"))return toast("Enter your email above, then tap Forgot password");
  const{error}=await supabase.auth.resetPasswordForEmail(id,{redirectTo:location.href.split("#")[0]});toast(error?error.message:"Password reset link sent to your email")};
$("joinBtn").onclick=()=>social("whatsapp");
const ok=(m,t)=>{m.style.color="#16a34a";m.textContent=t};
$("authForm").onsubmit=async e=>{e.preventDefault();const m=$("aMsg"),btn=$("aSubmit"),id=$("aId").value.trim(),pw=$("aPass").value;m.textContent="";m.style.color="";
  if(pw.length<6)return m.textContent="Password must be at least 6 characters.";
  btn.disabled=true;try{await doAuth(id,pw,m,e.target)}catch(x){m.textContent="Something went wrong: "+x.message}finally{btn.disabled=false}};
async function doAuth(id,pw,m,form){const em=id.toLowerCase();
  if(mode==="login"){let mail=em;
    if(!id.includes("@")){const{data}=await supabase.rpc("login_email",{p:id.toUpperCase()});if(!data)return m.textContent="PRN not found. Please register first.";mail=data}
    const{error}=await supabase.auth.signInWithPassword({email:mail,password:pw});
    if(error)return m.textContent=/confirm/i.test(error.message)?"Please confirm your email first (check inbox/spam).":"Wrong PRN/email or password.";
    await load();form.reset();location.hash=S.admin?"admin":"home";route()}
  else if(mode==="register"){const prn=id.toUpperCase(),n=$("aName").value.trim(),mail=$("aEmail").value.trim().toLowerCase();
    if(!/^[A-Z0-9]{5,20}$/.test(prn))return m.textContent="Enter a valid PRN (5–20 letters/digits).";
    if(!n||!/^\S+@\S+\.\S+$/.test(mail))return m.textContent="Enter your name and a valid email.";
    const{data:ex}=await supabase.rpc("login_email",{p:prn});if(ex)return m.textContent="This PRN is already registered.";
    const{data,error}=await supabase.auth.signUp({email:mail,password:pw,options:{data:{prn,name:n,university:$("aUni").value,branch:$("aBranch").value,year:$("aYear").value},emailRedirectTo:location.href.split("#")[0]}});
    if(error)return m.textContent=/registered|already/i.test(error.message)?"This email is already registered.":"Registration failed: "+error.message;
    form.reset();if(data.session){await load();location.hash="home";route()}else{setMode("login");ok(m,"Account created! Click the confirmation link in your email, then login.")}}
  else if(mode==="master"){const{error}=await supabase.auth.signInWithPassword({email:em,password:pw});if(error)return m.textContent="Wrong admin email or password.";
    await load();if(!S.admin){await supabase.auth.signOut();await load();return m.textContent="This account is not an admin."}
    form.reset();location.hash="admin";route()}
}
$("adOut").onclick=logout;

// admin: upload (any file, many at once) / delete
fill("uUni",C.unis);fill("uBranch",C.branches);fill("uYear",C.years,YL);fill("uType",C.types);
const MAXB=20*1024*1024;
// Subject = dropdown of subjects saved for the chosen university/branch/year. "＋ New" adds one to the list.
async function loadSubj(keep){const{data,error}=await supabase.from("subjects").select("name").eq("university",$("uUni").value).eq("branch",$("uBranch").value).eq("year",$("uYear").value).order("name");
  if(error)toast("Subjects: "+error.message+" (run subject_setup.sql)");
  const names=(data||[]).map(r=>r.name);
  const sems=({FE:[1,2],SE:[3,4],TE:[5,6],BE:[7,8]})[$("uYear").value]||[];
  $("newSem").innerHTML='<option value="">Semester (optional)</option>'+sems.map(n=>`<option value="${n}">Sem ${ROMAN[n]}</option>`).join("");
  $("uSubject").innerHTML=names.length?'<option value="">Select subject…</option>'+opts(names):'<option value="">No subjects yet — tap ＋ New</option>';
  const m=keep&&names.find(n=>n.toLowerCase()===keep.toLowerCase());if(m)$("uSubject").value=m}
["uUni","uBranch","uYear"].forEach(i=>$(i).addEventListener("change",()=>loadSubj()));
$("addSubj").onclick=()=>{const r=$("newSubRow");r.hidden=!r.hidden;if(!r.hidden)$("newSub").focus()};
$("newSub").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();$("saveSub").click()}};
$("saveSub").onclick=async()=>{if(!S.admin)return toast("Admins only");const n=$("newSub").value.trim().replace(/\s+/g," ");if(!n)return toast("Enter a subject name");
  const{error}=await supabase.from("subjects").insert({university:$("uUni").value,branch:$("uBranch").value,year:$("uYear").value,name:n,semester:+$("newSem").value||null});
  if(error&&!/duplicate|unique/i.test(error.message))return toast(error.message);
  $("newSub").value="";$("newSubRow").hidden=true;await loadSubj(n);toast(error?"Subject already exists — selected":"Subject added ✓")};

// file queue: drag & drop / browse, editable title per file
let Q=[];
const fmt=b=>b<1048576?Math.max(1,Math.round(b/1024))+" KB":(b/1048576).toFixed(1)+" MB";
const baseName=n=>n.replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").trim();
const fIcon=f=>/pdf/i.test(f.type)||/\.pdf$/i.test(f.name)?"📕":/^image\//.test(f.type)?"🖼️":/\.(docx?|rtf)$/i.test(f.name)?"📘":/\.(pptx?)$/i.test(f.name)?"📙":/\.(xlsx?|csv)$/i.test(f.name)?"📗":"📄";
function addFiles(fl){[...fl].forEach(f=>{if(f.size>MAXB)return toast(f.name+" is larger than 20 MB");if(Q.some(q=>q.file.name===f.name&&q.file.size===f.size))return;Q.push({file:f,title:baseName(f.name).slice(0,120),state:"ready"})});renderQ()}
function renderQ(){const ul=$("upQ");ul.replaceChildren();
  Q.forEach((q,i)=>{const li=document.createElement("li");li.className="q-"+q.state;const inp=document.createElement("input");inp.className="search";inp.maxLength=120;inp.value=q.title;inp.disabled=q.state==="up"||q.state==="done";inp.oninput=()=>{q.title=inp.value};
    const st={ready:"ready",up:"uploading…",done:"uploaded ✓",error:q.err||"failed"}[q.state],meta=mk("small",fmt(q.file.size)+" · "+st,"muted"),mid=mk("div",null,"q-mid");mid.append(inp,meta);
    const rm=mk("button","✕","icon-btn");rm.type="button";rm.setAttribute("aria-label","Remove");rm.disabled=q.state==="up";rm.onclick=()=>{Q.splice(i,1);renderQ()};li.append(mk("span",fIcon(q.file),"q-ic"),mid,rm);ul.append(li)});
  $("upSum").textContent=Q.length?Q.length+" file(s) in queue":""}
const drop=$("drop");drop.onclick=()=>$("uFile").click();drop.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();$("uFile").click()}};
["dragenter","dragover"].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add("over")}));
["dragleave","drop"].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove("over")}));
drop.addEventListener("drop",e=>addFiles(e.dataTransfer.files));$("uFile").onchange=e=>{addFiles(e.target.files);e.target.value=""};

$("upForm").onsubmit=async e=>{e.preventDefault();if(!S.admin)return toast("Admins only");
  const subject=$("uSubject").value;if(!subject)return toast("Select a subject first");
  const todo=Q.filter(q=>q.state==="ready"||q.state==="error");if(!todo.length)return toast("Add at least one file");
  if(todo.some(q=>!q.title.trim()))return toast("Every file needs a title");
  const btn=$("upGo");btn.disabled=true;let ok=0;
  const meta={university:$("uUni").value,branch:$("uBranch").value,year:$("uYear").value,type:$("uType").value,subject,is_free:$("uFree").checked};
  for(let i=0;i<todo.length;i++){const q=todo[i],f=q.file;q.state="up";btn.textContent=`Uploading ${i+1}/${todo.length}…`;renderQ();
    const path=`${crypto.randomUUID()}-${f.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
    const{error:ue}=await supabase.storage.from(BUCKET).upload(path,f,{contentType:f.type||"application/octet-stream"});
    if(ue){q.state="error";q.err=ue.message;continue}
    const{data:pub}=supabase.storage.from(BUCKET).getPublicUrl(path);
    const{error}=await supabase.from("resources").insert({...meta,title:q.title.trim(),file_path:path,file_url:pub.publicUrl});
    if(error){await supabase.storage.from(BUCKET).remove([path]);q.state="error";q.err=error.message;continue}
    q.state="done";ok++}
  Q=Q.filter(q=>q.state!=="done");renderQ();btn.disabled=false;btn.textContent="Upload";
  toast(ok?`${ok} file(s) uploaded ✓`+(Q.length?` · ${Q.length} failed`:""):"Upload failed");if(ok){$("uFree").checked=false;list()}};

// uploaded files: search + subject filter + delete
let UP=[];
function renderUp(){const l=$("upList"),q=$("upSearch").value.trim().toLowerCase(),sf=$("upFilt").value;l.replaceChildren();
  const rows=UP.filter(x=>(sf===ALLSUB||(x.subject||"General")===sf)&&(!q||(x.title+" "+(x.subject||"")+" "+x.type+" "+x.branch).toLowerCase().includes(q)));
  if(!rows.length)return l.append(mk("li",UP.length?"No matches.":"No files uploaded yet.","none"));
  rows.forEach(x=>{const li=document.createElement("li"),a=mk("a",x.title);a.href="#";a.onclick=e=>{e.preventDefault();openFile(x)};const b=mk("button","Delete","danger-btn");
    b.onclick=async()=>{if(!confirm(`Delete "${x.title}"?`))return;b.disabled=true;const{error:e1}=await supabase.storage.from(BUCKET).remove([x.file_path]);if(e1){b.disabled=false;return toast("File delete failed: "+e1.message)}
      const{error:e2}=await supabase.from("resources").delete().eq("id",x.id);if(e2){b.disabled=false;return toast(e2.message)}toast("Deleted ✓");list()};
    li.append(a,mk("span",`${x.university} · ${x.branch} · ${x.year} · ${x.type}${x.subject?" · "+x.subject:""}${x.is_free?" · FREE":""}`),b);l.append(li)})}
async function list(){const l=$("upList");l.replaceChildren(mk("li","Loading…","none"));
  const{data,error}=await supabase.from("resources").select("*").order("created_at",{ascending:false});
  if(error)return l.replaceChildren(mk("li",error.message,"none"));
  UP=data;const keep=$("upFilt").value,subs=[...new Set(UP.map(x=>x.subject||"General"))].sort((a,b)=>a.localeCompare(b));
  $("upFilt").innerHTML=`<option value="${ALLSUB}">All subjects (${UP.length})</option>`+opts(subs,subs.includes(keep)?keep:null);renderUp()}
$("upSearch").oninput=renderUp;$("upFilt").onchange=renderUp;




// ---- branch page: shown after the student's branch is known (like: Semester cards + Question Bank + Answer Bank) ----
const BR_FULL={"AI & ML":"Artificial Intelligence & Machine Learning","AI & DS":"Artificial Intelligence & Data Science",Computer:"Computer Engineering",IT:"Information Technology",Mechanical:"Mechanical Engineering",Civil:"Civil Engineering",Electrical:"Electrical Engineering","E&TC":"Electronics & Telecommunication",Chemical:"Chemical Engineering"};
const BR_ICON={"AI & ML":"🤖","AI & DS":"📊",Computer:"💻",IT:"🌐",Mechanical:"⚙️",Civil:"🏗️",Electrical:"⚡","E&TC":"📡",Chemical:"🧪"};
const YS={FE:"FY",SE:"SY",TE:"TY",BE:"Final Year"},ROMAN=["","I","II","III","IV","V","VI","VII","VIII"];
const goBranch=()=>{if(location.hash==="#branch")route();else location.hash="branch"};
const brief=a=>a.slice(0,5).join(", ")+(a.length>5?" & more":"");
async function branchPage(){const u=me();if(!u)return;const full=BR_FULL[u.branch]||u.branch,ys=YS[u.year]||u.year;
  $("brHead").innerHTML=`<span class="av" style="border-radius:14px">${BR_ICON[u.branch]||"🎓"}</span><div><b>${esc(full)}</b><div class="muted">${esc(u.uni)} | ${esc(YL[u.year]||u.year)} 2025–26</div><span class="chip">${esc(ys.toUpperCase())} ENGINEERING</span></div>`;
  $("brSub").textContent=`${ys} ${full} — Notes, PYQ, Question Bank & Answer Bank`;
  const g=$("brGrid");g.replaceChildren(mk("div","Loading…","muted"));
  const{data}=await supabase.from("subjects").select("name,semester").eq("university",u.uni).eq("branch",u.branch).eq("year",u.year).order("name");
  const by={};(data||[]).forEach(r=>{const k=r.semester||0;(by[k]=by[k]||[]).push(r.name)});
  const cards=Object.keys(by).map(Number).sort((a,b)=>a-b).map(k=>({ic:"📚",t:k?"Semester "+ROMAN[k]:"Subject-wise Notes",d:(k?"Semester "+ROMAN[k]+" — ":"")+"subject-wise notes ("+brief(by[k])+")",tag:k?"Sem "+ROMAN[k]:"All subjects",go:()=>browse("Notes",by[k])}));
  [["🗄️","Question Bank","Exam-focused question bank — subject-wise","Question Bank"],["⭐","Answer Bank","Solved answers — exam-focused answer bank","Answer Bank"],["📄","Previous Year Papers","Previous year question papers — subject-wise","Previous Year Papers"]]
    .forEach(([ic,t,d,ty])=>cards.push({ic,t,d,tag:t,go:()=>browse(ty)}));
  g.replaceChildren(...cards.map(c=>{const d=mk("div",null,"card dc br-card");d.innerHTML=`<span class="ic">${c.ic}</span><b>${esc(c.t)}</b><span class="muted">${esc(c.d)}</span>`;
    const b=mk("button","Open →","uni-btn");b.onclick=c.go;d.append(b,mk("span",c.tag,"chip"));return d}))}

// ---- info pages: every menu item / card / bottom-nav tab opens a real screen ----
const APK_URL=""; // paste your APK download link here when ready
const UNI_SITES={SPPU:"https://www.unipune.ac.in",BATU:"https://dbatu.ac.in",SGBBU:"https://www.sgbau.ac.in",AKTU:"https://aktu.ac.in"};
const dlKey=()=>"cb2_dl_"+(S.user?S.user.id:"guest");
const dlGet=()=>{try{return JSON.parse(localStorage.getItem(dlKey())||"[]")}catch{return[]}};
const dlAdd=x=>{try{const l=dlGet().filter(i=>i.id!==x.id);l.unshift({id:x.id,title:x.title,file_path:x.file_path});localStorage.setItem(dlKey(),JSON.stringify(l.slice(0,30)))}catch{}};
const needLogin=()=>{if($("sheet").open)$("sheet").close();toast("Please login first");location.hash="login"};
const empty=(ic,t,d)=>`<div class="empty-pg"><span>${ic}</span><b>${esc(t)}</b><p class="muted">${esc(d)}</p></div>`;
// wire(box) gets the sheet body; use add(text,fn,ghost) to put buttons above Close
function sheetPage(title,html,wire){const s=$("sheet"),b=$("sheetBody");
  b.innerHTML=`<h3>${esc(title)}</h3>${html}<button class="primary-btn wide ghost" id="pgX">Close</button>`;$("pgX").onclick=()=>s.close();
  const add=(t,f,cls)=>{const x=mk("button",t,"primary-btn wide"+(cls?" "+cls:""));x.onclick=f;b.insertBefore(x,$("pgX"));return x};
  if(wire)wire(b,add);if(!s.open)s.showModal()}
const PAGES={
  social(){sheetPage("👥 Social Mode",'<p class="muted">Join the CampusBase community — results, notices & new content first.</p>',(b)=>{
    [["wa","💬 WhatsApp Group","whatsapp"],["tg","✈️ Telegram Channel","telegram"],["ig","📸 Instagram","instagram"]].forEach(([c,t,k])=>{const x=mk("button",t,"wide soc-b "+c+(SOCIAL[k].on?"":" off"));x.onclick=()=>social(k);b.insertBefore(x,$("pgX"))})})},
  leader(){sheetPage("🏆 Leaderboard",empty("🏆","Rankings start soon","Quiz rankings will appear here once quizzes go live."))},
  cert(){sheetPage("🎖️ Certificates",empty("🎖️","No certificates yet","Your achievements will show up here."))},
  alerts(){sheetPage("🔔 Alerts",'<div class="card notice"><b>NOTICE</b><span>Welcome to CampusBase!</span></div>'+empty("🔔","You are all caught up","New notices & results will appear here."))},
  mail(){sheetPage("✉️ S-Mail",empty("✉️","Inbox is empty","Messages from CampusBase admins will appear here."))},
  doubt(){sheetPage("💬 Doubt Solving",'<p class="muted">Write your doubt, then post it in the community — friends & mentors will help.</p><div class="f"><textarea id="dbt" class="search" rows="4" maxlength="600" placeholder="Type your doubt…"></textarea></div>',(b,add)=>{
    const go2=k=>async()=>{const t=$("dbt").value.trim();if(t){try{await navigator.clipboard.writeText(t);toast("Copied — paste it in the group")}catch{}}social(k)};
    add("Copy & open WhatsApp group",go2("whatsapp"));add("Copy & open Telegram",go2("telegram"),"ghost")})},
  dl(){const l=dlGet();sheetPage("⬇️ Downloads",l.length?'<p class="muted">Files you opened recently on this device.</p><ul class="saved-list" id="dlList"></ul>':empty("⬇️","Nothing yet","Files you open will be listed here for quick access."),()=>{
    const ul=$("dlList");if(!ul)return;l.forEach(x=>{const li=document.createElement("li"),a=mk("a",x.title);a.href="#";a.onclick=e=>{e.preventDefault();openFile(x)};li.append(a);ul.append(li)})})},
  reval(){const u=me(),k=Object.keys(UNI_SITES);if(u&&UNI_SITES[u.uni])k.sort((a,b)=>(b===u.uni)-(a===u.uni));
    sheetPage("📝 Revaluation Score",'<p class="muted">Check your result and apply for revaluation on your university\'s official site. Dates & fees are in their notices.</p>',(b,add)=>{k.forEach(n=>add("🔗 "+n+" official site",()=>open(UNI_SITES[n],"_blank","noopener"),n===k[0]&&u?"":"ghost"))})},
  refer(){const u=me(),code=u?(u.prn&&u.prn!=="—"?u.prn:sid(u)):"",link=location.origin+location.pathname+(code?"?ref="+encodeURIComponent(code):""),msg="Join CampusBase — notes, question banks & papers for engineering students: "+link;
    sheetPage("🎁 Refer & Earn",`<p class="muted">Share CampusBase with your friends. Referral rewards are coming soon.</p><div class="card mt" style="word-break:break-all">${esc(link)}</div>`,(b,add)=>{
      add("📋 Copy link",async()=>{try{await navigator.clipboard.writeText(link);toast("Link copied ✓")}catch{toast("Copy failed")}});
      add("💬 Share on WhatsApp",()=>open("https://wa.me/?text="+encodeURIComponent(msg),"_blank","noopener"),"ghost")})},
  apk(){if(APK_URL)return sheetPage("📱 Download App",'<p class="muted">Download the APK and install it manually (allow "Install unknown apps" if asked).</p>',(b,add)=>add("⬇ Download APK",()=>open(APK_URL,"_blank","noopener")));
    sheetPage("📱 Download App",'<p class="muted">The APK is not published yet. Meanwhile, install CampusBase like an app:</p><ol class="muted" style="margin:10px 0 0 18px;line-height:1.7"><li>Open this site in Chrome</li><li>Tap the ⋮ menu</li><li>Tap <b>Add to Home screen</b> / <b>Install app</b></li></ol>')},
  async receipt(){if(!S.user)return needLogin();
    sheetPage("🧾 Payment Receipt",'<div id="pgBody" class="muted">Loading…</div>');
    const{data,error}=await supabase.from("payment_orders").select("*").eq("user_id",S.user.id).eq("status","paid");
    const box=$("pgBody");if(!box)return;
    if(error||!data||!data.length){box.outerHTML=empty("🧾","No receipts yet","Your Premium payments will be listed here.");return}
    data.sort((a,b)=>String(b.created_at||"").localeCompare(String(a.created_at||"")));
    box.innerHTML="";box.className="";const ul=mk("ul",null,"saved-list");
    data.forEach(r=>{const li=document.createElement("li");li.append(mk("b","₹"+(r.amount_paise/100)),mk("span",(r.created_at?new Date(r.created_at).toLocaleDateString("en-IN")+" · ":"")+"Order "+r.order_id));ul.append(li)});box.append(ul)},
  settings(){const u=me();sheetPage("⚙️ Settings","",(b,add)=>{
    add("🌓 Switch theme",()=>$("themeBtn").click());
    if(u){add("✎ Edit profile",()=>profile("edit"));add("🔑 Change password",()=>recover());
      add("🗑 Clear downloads history",()=>{try{localStorage.removeItem(dlKey())}catch{}toast("Cleared ✓")},"ghost");
      add("⎋ Logout",()=>{$("sheet").close();logout()},"ghost")}
    else add("Login / Register",()=>{$("sheet").close();location.hash="login"})})}
};

// ---- premium / subscription ----
async function openFile(x){dlAdd(x);const w=open("about:blank","_blank");if(w)w.opener=null;
  const{data,error}=await supabase.storage.from(BUCKET).createSignedUrl(x.file_path,300);
  if(error||!data){if(w)w.close();return toast("Cannot open file: "+(error?error.message:"locked"))}
  w?w.location.replace(data.signedUrl):(location.href=data.signedUrl)}
async function paywall(){if(!S.user){toast("Please login first");location.hash="login";return}
  if($("modal").open)$("modal").close();
  const s=$("sheet"),b=$("sheetBody");b.innerHTML='<h3>⭐ CampusBase Premium</h3><p class="muted">Loading plans…</p>';if(!s.open)s.showModal();
  const{data,error}=await supabase.from("plans").select("*").eq("active",true).order("price_paise");
  if(error||!data||!data.length){b.innerHTML='<h3>⭐ CampusBase Premium</h3><p class="muted">Plans are not available right now.</p><button class="primary-btn wide ghost" id="plX">Close</button>';$("plX").onclick=()=>s.close();return}
  b.innerHTML=`<h3>⭐ CampusBase Premium</h3><p class="muted">Unlock all notes, question banks, papers &amp; books.${S.sub?" Active till "+esc(new Date(S.sub).toLocaleDateString("en-IN"))+" — buying again extends it.":""}</p>`;
  const ph=document.createElement("label");ph.innerHTML='Mobile number (needed for payment)<input id="cfPhone" type="tel" inputmode="numeric" maxlength="10" class="search" placeholder="10-digit mobile">';b.append(ph);
  data.forEach(p=>{const bt=mk("button","₹"+(p.price_paise/100)+" — "+p.name,"primary-btn wide");bt.onclick=()=>buy(p);b.append(bt)});
  const c=mk("button","Close","primary-btn wide ghost");c.onclick=()=>s.close();b.append(c)}
const loadCf=()=>window.Cashfree?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement("script");s.src="https://sdk.cashfree.com/js/v3/cashfree.js";s.onload=ok;s.onerror=()=>no(new Error("Payment script blocked"));document.head.append(s)});
async function settleOrder(id){const{data:v,error:e}=await supabase.functions.invoke("verify-payment",{body:{order_id:id}});
  if(!e&&v&&v.ok){await load();home();toast("Premium activated ✓");return true}
  toast(v&&v.status==="ACTIVE"?"Payment not completed.":"Payment not confirmed yet. If money was deducted, Premium activates automatically in a few minutes.");return false}
async function buy(p){const ph=($("cfPhone")?$("cfPhone").value:"").trim();
  if(!/^[6-9]\d{9}$/.test(ph))return toast("Enter a valid 10-digit mobile number");
  try{const{data,error}=await supabase.functions.invoke("create-order",{body:{plan_id:p.id,phone:ph}});
    if(error||!data||!data.payment_session_id)return toast("Could not start payment. Try again.");
    await loadCf();$("sheet").close();
    const cf=Cashfree({mode:data.mode});
    await cf.checkout({paymentSessionId:data.payment_session_id,redirectTarget:"_modal"});
    await settleOrder(data.order_id)}catch(x){toast(x.message)}}
if($("gForm"))$("gForm").onsubmit=async e=>{e.preventDefault();if(!S.admin)return toast("Admins only");
  const{data,error}=await supabase.rpc("admin_grant_sub",{p_email:$("gEmail").value.trim(),p_days:+$("gDays").value});
  toast(error?error.message:"Premium active till "+new Date(data).toLocaleDateString("en-IN"));if(!error)e.target.reset()};

// ---- forgot password: set the new password after the reset link ----
function recover(){const b=$("sheetBody");b.innerHTML='<form id="rf" class="f"><h3>Set new password</h3><label>New password<input id="rPw" type="password" class="search" autocomplete="new-password" placeholder="Min 6 characters"></label><button class="primary-btn wide">Update password</button></form>';
  if(!$("sheet").open)$("sheet").showModal();
  $("rf").onsubmit=async e=>{e.preventDefault();const pw=$("rPw").value;if(pw.length<6)return toast("Min 6 characters");
    const{error}=await supabase.auth.updateUser({password:pw});if(error)return toast(error.message);$("sheet").close();toast("Password updated ✓")}}

supabase.auth.onAuthStateChange(ev=>{if(ev==="SIGNED_OUT")setTimeout(async()=>{await load();route()},0);if(ev==="PASSWORD_RECOVERY")setTimeout(async()=>{await load();route();recover()},0)});
load().then(()=>{route();const oid=new URLSearchParams(location.search).get("order_id");
  if(oid){history.replaceState(null,"",location.pathname+location.hash);if(S.user)settleOrder(oid)}});
