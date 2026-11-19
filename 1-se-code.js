
/* ===== RBH self-entry v24: local entries, undo, restore, two-way Drive sync ===== */
(function(){
if(typeof open_!=='function'||typeof render!=='function')return;
var LKEY='rbh_local_v1';
function locals(){try{return JSON.parse(localStorage.getItem(LKEY)||'[]')}catch(x){return[]}}
function saveLocals(a){try{localStorage.setItem(LKEY,JSON.stringify(a))}catch(x){}}
function ck(pn,e){return [pn,e.date,e.type,e.amount,(e.note||'')].join('|')}
function h10(s){var x=0;for(var i=0;i<s.length;i++){x=((x<<5)-x+s.charCodeAt(i))|0}return (x>>>0).toString(36)}
var HI=(typeof LANG!=='undefined'&&LANG==='hi');
function t(en,hi){return HI?hi:en}
var MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function todayISO(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function isoToDisp(v){var m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return '';return (+m[3])+' '+MN[+m[2]-1]+' '+m[1]}
TR.seUndo=t('Hatayein','हटाएं');TR.seLocal=t('on this phone','इस फोन पर');TR.seRestored=t('restored from backup','बैकअप से रिस्टोर');
TR.backupNote2=t('Backup is encrypted with the existing PIN and includes the salt needed for future recovery. Use Restore below to bring missing entries back onto this phone. CSV is readable financial data, so store it privately.','बैकअप मौजूदा PIN से एन्क्रिप्टेड है और भविष्य की रिकवरी के लिए जरूरी जानकारी रखता है। नीचे Restore से गायब entries इस फोन पर वापस आ जाएंगी। CSV पढ़ने योग्य है, इसे निजी रखें।');
var FS={party:0,kind:'maal',amount:'',note:'',date:todayISO(),step:'edit'};
function kindLabel(k){return k==='maal'?t('GOODS RECEIVED (purchase)','माल आया (खरीद)'):k==='payment'?t('PAYMENT MADE','पेमेंट दिया'):t('ADJUSTMENT (kata)','कटौती (एडजस्टमेंट)')}
function applyLocal(){
 var ls=locals();if(!ls.length)return;
 PARTIES.forEach(function(p){
  var mIds={},mKeys={};
  p.entries.forEach(function(e){if(e.id)mIds[e.id]=(mIds[e.id]||0)+1;mKeys[ck(p.name,e)]=(mKeys[ck(p.name,e)]||0)+1});
  var sIds={},sKeys={};
  ls.forEach(function(le){
   if(le.party!==p.name)return;
   if(le.id){sIds[le.id]=(sIds[le.id]||0)+1;if((mIds[le.id]||0)>=sIds[le.id])return}
   var k0=ck(p.name,le);sKeys[k0]=(sKeys[k0]||0)+1;if((mKeys[k0]||0)>=sKeys[k0])return;
   p.entries.push({id:le.id,date:le.date,type:le.type,amount:le.amount,note:le.note,local:true,restored:!!le.restored});
  });
 });
 PARTIES.forEach(function(p){p.entries.sort(function(a,b){var da=dateISO(a.date),db=dateISO(b.date);return (da?da.getTime():0)-(db?db.getTime():0)})});
}
var _render=window.render;
window.render=function(){applyLocal();_render();fixFooter();injectUI()};
function fixFooter(){
 var ver=document.querySelector('.ver');if(!ver)return;
 ver.innerHTML='v28 · <a href="#" id="lk">'+t('Lock','लॉक')+'</a> · <a href="#" id="lg">'+(HI?'English':'हिंदी')+'</a>';
 var lk2=document.getElementById('lk');if(lk2)lk2.addEventListener('click',function(e){e.preventDefault();try{localStorage.removeItem('rbh_k')}catch(x){}location.reload()});
 var lg2=document.getElementById('lg');if(lg2)lg2.addEventListener('click',function(e){e.preventDefault();try{localStorage.setItem('rbh_lang',HI?'en':'hi')}catch(x){}location.reload()});
}
function afterVals(){var p=PARTIES[FS.party];if(!p)return null;var b=bal(p.entries);var n=parseInt(String(FS.amount).replace(/\D/g,''),10)||0;var nb=FS.kind==='maal'?b+n:b-n;var T=0;PARTIES.forEach(function(x,i){T+=i===FS.party?nb:bal(x.entries)});return{p:p,b:b,n:n,nb:nb,T:T}}
function seMsg(m){var el=document.getElementById('seMsg');if(el){el.textContent=m;el.hidden=false}}
function injectUI(){
 var hv=document.getElementById('homeView');if(!hv||document.getElementById('seCard'))return;
 var card=document.createElement('section');card.className='feature se-card';card.id='seCard';
 var ls=locals();
 var h='<h2>'+t('New entry (add yourself)','नई एंट्री (खुद हिसाब)')+'</h2>';
 h+='<p class="feature-note">'+t('Add a purchase, payment or adjustment yourself. Totals update at once. Entries save on this phone first; send the update to Jadoo or keep a backup so the master khata matches.','खरीद, पेमेंट या कटौती खुद जोड़ें। कुल तुरंत अपडेट होगा। एंट्री पहले इस फोन पर सेव होती है; मास्टर खाता मिलान के लिए Jadoo को अपडेट भेजें या बैकअप रखें।')+'</p>';
 if(ls.length)h+='<p class="se-banner">'+ls.length+t(' entry(s) are only on this phone so far.',' एंट्री अभी सिर्फ इस फोन पर हैं।')+'</p>';
 if(FS.step==='edit'){
  h+='<label for="seParty">'+t('Supplier','सप्लायर')+'</label><select id="seParty">'+PARTIES.map(function(p,i){return '<option value="'+i+'"'+(i===FS.party?' selected':'')+'>'+esc(dname(p.name))+'</option>'}).join('')+'</select>';
  h+='<div class="se-kinds">'+['maal','payment','kata'].map(function(k){return '<button type="button" class="btn se-kind'+(FS.kind===k?' active':'')+'" data-se-kind="'+k+'">'+kindLabel(k)+'</button>'}).join('')+'</div>';
  h+='<div class="filter-row"><input id="seAmt" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="'+t('Amount ₹','रकम ₹')+'" value="'+esc(FS.amount)+'" autocomplete="off"><input id="seDate" type="date" value="'+esc(FS.date)+'"></div>';
  h+='<input id="seNote" type="text" placeholder="'+t('Note - item, qty, rate (e.g. sports sandal 6 pair @260)','नोट - आइटम, संख्या, रेट')+'" value="'+esc(FS.note)+'" autocomplete="off">';
  if(FS.kind==='payment'){var av=afterVals();if(av&&av.b>0)h+='<button type="button" class="btn se-full" id="seFull">'+t('Full balance ','पूरा बैलेंस ')+inr(av.b)+'</button>'}
  h+='<p class="se-preview" id="sePrev"></p><p class="amsg" id="seMsg" hidden></p>';
  h+='<button type="button" class="btn se-go" id="seNext">'+t('Next','आगे बढ़ें')+'</button>';
 }else{
  var av=afterVals();
  h+='<div class="se-confirm"><p><b>'+t('Check the entry:','एंट्री जांचें:')+'</b></p><p>'+esc(dname(av.p.name))+' · '+kindLabel(FS.kind)+' · '+inr(av.n)+' · '+esc(isoToDisp(FS.date))+'</p>'+(FS.note?'<p>'+esc(FS.note)+'</p>':'')+'<p>'+t('Balance after entry: ','एंट्री के बाद बैलेंस: ')+inr(av.nb)+' · '+t('Total payable: ','कुल बाकी: ')+inr(av.T)+'</p></div>';
  h+='<p class="amsg" id="seMsg" hidden></p><div class="se-kinds"><button type="button" class="btn se-go" id="seSave">'+t('Save','सेव करें')+'</button><button type="button" class="btn" id="seBack">'+t('Back','वापस')+'</button></div>';
 }
 if(ls.length)h+='<p class="next-help"><a href="#" id="seSend">'+t('Send update to Jadoo (WhatsApp)','Jadoo को अपडेट भेजें (WhatsApp)')+'</a> · '+t('plain text, nothing is sent automatically','साफ टेक्स्ट, कोई अपने-आप सेंड नहीं')+'</p>';
 card.innerHTML=h;
 var pv=hv.querySelector('.backup-feature');hv.insertBefore(card,pv);
 var ba=hv.querySelector('.backup-actions');
 if(ba&&!document.getElementById('seRestoreBtn')){
  var rb=document.createElement('button');rb.type='button';rb.className='btn';rb.id='seRestoreBtn';rb.textContent=t('Restore from backup','बैकअप से वापस लाएं');ba.appendChild(rb);
  var fi=document.createElement('input');fi.type='file';fi.id='seRestoreFile';fi.accept='.json,application/json';fi.hidden=true;ba.appendChild(fi);
  var fb=document.createElement('button');fb.type='button';fb.className='btn';fb.id='seFullBackup';fb.textContent=t('Full backup (incl. phone entries)','फुल बैकअप (फोन एंट्री सहित)');ba.appendChild(fb);
  var gl=document.createElement('p');gl.className='feature-note';gl.id='seGBStatus';ba.appendChild(gl);
  var gb=document.createElement('button');gb.type='button';gb.className='btn';gb.id='seGBBtn';gb.textContent=t('Back up to Google now','Google बैकअप अभी करें');ba.appendChild(gb);
  var gr=document.createElement('button');gr.type='button';gr.className='btn';gr.id='seGBRestore';gr.textContent=t('Restore from Google Drive','Google ड्राइव से रिस्टोर');ba.appendChild(gr);
  var gn=document.createElement('p');gn.className='feature-note';gn.textContent=t('The encrypted backup is saved in the hidden app folder of your Google Drive - only the backup file, Google cannot see the hisaab. Tap "Back up to Google now" after new entries; until it shows saved, they are on this phone only.','एन्क्रिप्टेड बैकअप आपके Google Drive के हिडन ऐप फोल्डर में सेव होता है। नई एंट्री के बाद "अभी Google बैकअप करें" दबाएं; जब तक सेव न दिखे, एंट्री सिर्फ इस फोन पर है।');ba.appendChild(gn);
  setTimeout(gbStatusRender,0);
 }
 updPrev();
 injectPdfButtons();
}
function updPrev(){
 var el=document.getElementById('sePrev');if(!el)return;var av=afterVals();if(!av){el.textContent='';return}
 el.textContent=av.n>0?(t('After entry: ','एंट्री के बाद: ')+esc(dname(av.p.name))+' '+inr(av.nb)+' · '+t('Total ','कुल ')+inr(av.T)):(t('Balance now: ','अभी बैलेंस: ')+esc(dname(av.p.name))+' '+inr(av.b));
}
document.addEventListener('input',function(ev){if(!ev.target)return;if(ev.target.id==='seAmt'){FS.amount=ev.target.value.replace(/[^\d]/g,'');updPrev()}if(ev.target.id==='seNote')FS.note=ev.target.value});
document.addEventListener('change',function(ev){if(!ev.target)return;
 if(ev.target.id==='seParty'){FS.party=+ev.target.value;render()}
 if(ev.target.id==='seDate'){FS.date=ev.target.value||todayISO()}
 if(ev.target.id==='seRestoreFile'&&ev.target.files&&ev.target.files[0]){var f0=ev.target.files[0];ev.target.value='';doRestore(f0)}
});
document.addEventListener('click',function(ev){
 var k=ev.target.closest&&ev.target.closest('[data-se-kind]');if(k){FS.kind=k.getAttribute('data-se-kind');render();return}
 if(ev.target.closest&&ev.target.closest('#seFull')){var av=afterVals();if(av){FS.amount=String(av.b)}render();return}
 if(ev.target.closest&&ev.target.closest('#seNext')){
  var av2=afterVals();var m=document.getElementById('seMsg');
  function bad2(s){if(m){m.textContent=s;m.hidden=false}}
  if(!av2||av2.n<1)return bad2(t('Enter an amount greater than ₹0','₹0 से ज्यादा रकम डालें'));
  if(FS.kind!=='maal'&&av2.n>av2.b)return bad2(t('Balance after payment/adjustment (','पेमेंट/कटौती बैलेंस (')+inr(av2.b)+t(') - cannot be more',') से ज्यादा नहीं हो सकती'));
  if(!isoToDisp(FS.date))return bad2(t('Check the date','तारीख जांचें'));
  FS.step='confirm';render();return}
 if(ev.target.closest&&ev.target.closest('#seBack')){FS.step='edit';render();return}
 if(ev.target.closest&&ev.target.closest('#seSave')){
  var av3=afterVals();if(!av3||av3.n<1)return;
  var le={id:'L'+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36),party:av3.p.name,type:FS.kind,amount:av3.n,date:isoToDisp(FS.date),note:FS.note||''};
  var a=locals();a.push(le);saveLocals(a);gbMarkPending();
  FS={party:FS.party,kind:'maal',amount:'',note:'',date:todayISO(),step:'edit'};
  gbUpload(function(){location.reload()});setTimeout(function(){location.reload()},12000);return}
 var un=ev.target.closest&&ev.target.closest('[data-se-undo]');if(un){
  var id=un.getAttribute('data-se-undo');
  if(un.getAttribute('data-arm')!=='1'){un.setAttribute('data-arm','1');un.textContent=t('Sure? Tap again to confirm','पक्का? दोबारा दबाएं');setTimeout(function(){try{un.setAttribute('data-arm','0');un.textContent=t('Hatayein','हटाएं')}catch(x){}},4000);return}
  saveLocals(locals().filter(function(x){return x.id!==id}));location.reload();return}
 var sd=ev.target.closest&&ev.target.closest('#seSend');if(sd){
  ev.preventDefault();
  var ls2=locals();if(!ls2.length)return;
  var lines=['RBH KHATA phone entries (Jadoo ke liye):'];
  ls2.forEach(function(le,i){lines.push((i+1)+') '+le.date+' | '+le.party+' | '+le.type.toUpperCase()+' | Rs '+le.amount+' | '+(le.note||'-')+' | id '+le.id)});
  var T=0;PARTIES.forEach(function(p){T+=bal(p.entries)});
  PARTIES.forEach(function(p){lines.push(dname(p.name)+': Rs '+bal(p.entries))});
  lines.push('TOTAL: Rs '+T);
  window.open('https://wa.me/?text='+encodeURIComponent(lines.join('\n')),'_blank');return}
 if(ev.target.closest&&ev.target.closest('#seRestoreBtn')){var f=document.getElementById('seRestoreFile');if(f)f.click();return}
 if(ev.target.closest&&ev.target.closest('#seFullBackup')){dlFullBackup();return}
});
function mergePayload(D){
 var haveIds={},haveKeys={};
 PARTIES.forEach(function(p){p.entries.forEach(function(e){haveKeys[ck(p.name,e)]=(haveKeys[ck(p.name,e)]||0)+1;if(e.id)haveIds['id:'+e.id]=(haveIds['id:'+e.id]||0)+1})});
 locals().forEach(function(le){haveKeys[ck(le.party,le)]=(haveKeys[ck(le.party,le)]||0)+1;if(le.id)haveIds['id:'+le.id]=(haveIds['id:'+le.id]||0)+1});
 var add=[],seenIds={},seenKeys={};
 (D.p||[]).forEach(function(p){(p.entries||[]).forEach(function(e){
  if(e.id){var ik='id:'+e.id;seenIds[ik]=(seenIds[ik]||0)+1;if((haveIds[ik]||0)>=seenIds[ik])return}
  var k=ck(p.name,e);seenKeys[k]=(seenKeys[k]||0)+1;if((haveKeys[k]||0)>=seenKeys[k])return;
  add.push({id:e.id||('R'+h10(k)+'x'+seenKeys[k]),party:p.name,date:e.date,type:e.type,amount:e.amount,note:e.note||'',restored:true});
 })});
 var locIds={};locals().forEach(function(le){if(le.id)locIds[le.id]=1});
 var seenLKeys={};
 (D.local||[]).forEach(function(le){
  if(le.id&&locIds[le.id])return;
  if(le.id&&haveIds['id:'+le.id])return;
  var lk=ck(le.party,le);seenLKeys[lk]=(seenLKeys[lk]||0)+1;if((haveKeys[lk]||0)>=seenLKeys[lk])return;
  add.push({id:le.id||('L'+h10(le.party+le.date+le.type+le.amount+(le.note||''))),party:le.party,date:le.date,type:le.type,amount:le.amount,note:le.note||'',restored:true});
 });
 return add;
}
function rMsg(m){var el=document.getElementById('seRestoreMsg');if(!el){var ba=document.querySelector('.backup-actions');if(!ba)return;el=document.createElement('p');el.id='seRestoreMsg';el.className='next-help';ba.parentNode.appendChild(el)}el.textContent=m;el.hidden=false}
var restoring=false;
function doRestore(file){
 if(restoring)return;restoring=true;
 rMsg(t('Opening backup...','बैकअप खुल रहा है...'));
 var rd=new FileReader();
 rd.onload=function(){
  var o;try{o=JSON.parse(rd.result)}catch(x){restoring=false;return rMsg(t('Could not read that file.','फाइल समझ नहीं आई।'))}
  if(!o||o.format!=='RBH-KHATA-ENCRYPTED-BACKUP'){restoring=false;return rMsg(t('This is not an RBH backup file.','यह RBH बैकअप फाइल नहीं है।'))}
  var raw;try{raw=localStorage.getItem('rbh_k')}catch(x){}
  if(!raw){restoring=false;return rMsg(t('Unlock the app with the PIN first, then restore.','पहले ऐप PIN से खोलें, फिर रिस्टोर करें।'))}
  var keyP=Promise.resolve(b2u(raw));
  keyP.then(function(rawKey){return crypto.subtle.importKey('raw',rawKey,'AES-GCM',false,['decrypt']).then(function(k){return crypto.subtle.decrypt({name:'AES-GCM',iv:b2u(o.iv)},k,b2u(o.ciphertext))})}).then(function(buf){
   var D=JSON.parse(new TextDecoder().decode(buf));
   var add=mergePayload(D);
   if(!add.length){restoring=false;rMsg(t('Backup ki sab entries yahan maujood hain. Kuch naya nahi joda.','बैकअप की सब एंट्री यहां मौजूद हैं। कुछ नया नहीं जोड़ा।'));return}
   saveLocals(locals().concat(add));gbMarkPending();
   rMsg(add.length+t(' entries added from backup. Reloading.',' एंट्री बैकअप से जोड़ी गई। पेज रीलोड हो रहा है।'));
   setTimeout(function(){location.reload()},1500);
  }).catch(function(){restoring=false;rMsg(t('Backup did not open - check the file.','बैकअप नहीं खुला - फाइल जांचें।'))});
 };
 rd.readAsText(file);
}
/* ===== PDF export: client-side, no library, direct download ===== */
function pdfClean(s){return String(s==null?'':s).replace(/₹/g,'Rs ').replace(/[^\x20-\x7E]/g,'?')}
function pdfRs(n){return pdfClean(inr(n))}
function pdfWrap(s,w){var words=pdfClean(s).split(/\s+/),lines=[],cur='';words.forEach(function(wd){if((cur+' '+wd).trim().length>w){if(cur)lines.push(cur);cur=wd}else cur=(cur?cur+' ':'')+wd});if(cur)lines.push(cur);return lines.length?lines:['']}
function pdfPages(opsPerPage){
 var out='%PDF-1.4\n',offs=[],nPages=opsPerPage.length;
 function obj(num,bd){offs[num]=out.length;out+=num+' 0 obj\n'+bd+'\nendobj\n'}
 var kids=[];for(var i=0;i<nPages;i++)kids.push((5+2*i)+' 0 R');
 obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
 obj(2,'<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+nPages+' >>');
 obj(3,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
 obj(4,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
 opsPerPage.forEach(function(ops,i){
  var pn=5+2*i,cn=6+2*i;
  obj(pn,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /CropBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents '+cn+' 0 R >>');
  var s='';ops.forEach(function(o){
   if(o.line){s+=o.x1+' '+o.y1+' m '+o.x2+' '+o.y2+' l S\n';return}
   var tx=pdfClean(o.s).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
   s+='BT /'+(o.b?'F2':'F1')+' '+(o.z||10)+' Tf 1 0 0 1 '+o.x+' '+o.y+' Tm ('+tx+') Tj ET\n';
  });
  obj(cn,'<< /Length '+s.length+' >>\nstream\n'+s+'endstream');
 });
 var xoff=out.length;
 out+='xref\n0 '+(5+2*nPages)+'\n0000000000 65535 f \n';
 for(var j=1;j<5+2*nPages;j++){var o2=offs[j]||0;out+=String(10000000000+o2).slice(-10)+' 00000 n \n'}
 out+='trailer\n<< /Size '+(5+2*nPages)+' /Root 1 0 R >>\nstartxref\n'+xoff+'\n%%EOF';
 return out;
}
function partySums(p){var m=0,o=0,pd=0,a=0;p.entries.forEach(function(e){if(e.type==='maal')m+=e.amount;else if(e.type==='opening')o+=e.amount;else if(e.type==='payment')pd+=e.amount;else if(e.type==='kata')a+=e.amount});var g=m+o;return{m:m,o:o,g:g,p:pd,a:a,b:g-pd-a}}
function pdfType(t2){return t2==='maal'?'Maal aaya':t2==='payment'?'Payment diya':t2==='kata'?'Kata (adjustment)':'Opening'}
function supplierOps(p,ops){
 var s=partySums(p);
 var fd=p.entries.length?p.entries.slice().sort(function(a,b){var da=dateISO(a.date),db=dateISO(b.date);return (da?da.getTime():0)-(db?db.getTime():0)})[0].date:'';
 ops.push({x:50,y:780,z:16,b:1,s:'RBH KHATA BOOK'});
 ops.push({x:50,y:762,z:11,s:'Hisaab: '+pdfClean(dname(p.name))+'    Nikala gaya: '+pdfClean(isoToDisp(todayISO()))});
 ops.push({x:50,y:746,z:10,b:1,s:'Maal: '+pdfRs(s.m)+'   Opening: '+pdfRs(s.o)+'   Payment: '+pdfRs(s.p)+'   Kata: '+pdfRs(s.a)+'   Baaki: '+pdfRs(s.b)});
 ops.push({x:50,y:734,z:8.5,s:'Baaki = Maal + Opening - Payment - Kata   |   App record '+pdfClean(fd)+' se aaj tak'});
 ops.push({line:true,x1:50,y1:726,x2:545,y2:726});
 ops.push({x:50,y:712,z:10,b:1,s:'Date'});ops.push({x:130,y:712,z:10,b:1,s:'Entry'});ops.push({x:375,y:712,z:10,b:1,s:'Rakam'});ops.push({x:460,y:712,z:10,b:1,s:'Balance'});
 ops.push({line:true,x1:50,y1:704,x2:545,y2:704});
 return 690;
}
function partyPages(p){
 var pages=[],ops=[],y=supplierOps(p,ops),run=0;
 var es=p.entries.slice().sort(function(a,b){var da=dateISO(a.date),db=dateISO(b.date);return (da?da.getTime():0)-(db?db.getTime():0)});
 es.forEach(function(e){
  var amt=(e.type==='maal'||e.type==='opening')?e.amount:-e.amount;run+=amt;
  var lines=pdfWrap(pdfType(e.type)+(e.note?' - '+e.note:''),46);
  var need=lines.length*13+4;
  if(y-need<60){pages.push(ops);ops=[];y=supplierOps(p,ops)}
  ops.push({x:50,y:y,z:10,s:pdfClean(e.date)});
  lines.forEach(function(ln,li){ops.push({x:130,y:y-li*13,z:9,s:ln})});
  ops.push({x:375,y:y,z:10,s:(amt<0?'- ':'+ ')+pdfRs(Math.abs(amt))});
  ops.push({x:460,y:y,z:10,s:pdfRs(run)});
  y-=lines.length*13+4;
 });
 ops.push({line:true,x1:50,y1:y+6,x2:545,y2:y+6});
 ops.push({x:50,y:y-10,z:12,b:1,s:'Kul baaki: '+pdfRs(run)});
 pages.push(ops);
 return pages;
}
function buildPartyPdf(p){return pdfPages(partyPages(p))}
function buildAllPdf(){
 var ops=[],T=0;
 ops.push({x:50,y:780,z:16,b:1,s:'RBH KHATA BOOK'});
 ops.push({x:50,y:762,z:11,s:'Sabka hisaab ek saath    Nikala gaya: '+pdfClean(isoToDisp(todayISO()))});
 ops.push({line:true,x1:50,y1:752,x2:545,y2:752});
 var y=734;
 PARTIES.forEach(function(p){var s=partySums(p);T+=s.b;ops.push({x:50,y:y,z:11,s:pdfClean(dname(p.name))});ops.push({x:400,y:y,z:11,b:1,s:pdfRs(s.b)});y-=18});
 ops.push({line:true,x1:50,y1:y+8,x2:545,y2:y+8});
 ops.push({x:50,y:y-10,z:13,b:1,s:'TOTAL Baaki: '+pdfRs(T)});
 ops.push({x:50,y:y-30,z:8.5,s:pdfClean('App record Oct 2026 se aaj tak | Har supplier ka poora hisaab aage ke pages mein.')});
 var pages=[ops];
 PARTIES.forEach(function(p){partyPages(p).forEach(function(pg){pages.push(pg)})});
 return pdfPages(pages);
}
function dlPdf(text,name){
 var blob=new Blob([text],{type:'application/pdf'});var u=URL.createObjectURL(blob);
 var a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();
 setTimeout(function(){try{URL.revokeObjectURL(u);a.remove()}catch(x){}},5000);
}

/* ===== Full backup: master + phone entries, same PIN encryption ===== */
function u2b(s){var b=atob(s),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
function buildFullBackup(cb){
 var raw;try{raw=localStorage.getItem('rbh_k')}catch(x){}
 if(!raw)return cb(null);
 var payload={u:isoToDisp(todayISO()),p:PARTIES.map(function(p){return{name:p.name,short:p.short,phone:p.phone,entries:p.entries.filter(function(e){return!e.local}).map(function(e){var o={date:e.date,type:e.type,amount:e.amount,note:e.note};if(e.id)o.id=e.id;return o})}}),local:locals()};
 var iv=crypto.getRandomValues(new Uint8Array(12));
 var rawKey=u2b(raw);
 crypto.subtle.importKey('raw',rawKey,'AES-GCM',false,['encrypt']).then(function(k){
  return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},k,new TextEncoder().encode(JSON.stringify(payload))).then(function(ct){
   var b=function(a){var s='';var u=new Uint8Array(a);for(var i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s)};
   cb({format:'RBH-KHATA-ENCRYPTED-BACKUP',version:1,createdAt:new Date().toISOString(),salt:BLOB.s,iterations:300000,iv:b(iv),ciphertext:b(ct)});
  });
 }).catch(function(){cb(null)});
}
function dlFullBackup(){buildFullBackup(function(o){if(!o)return;var blob=new Blob([JSON.stringify(o,null,1)],{type:'application/json'});var u=URL.createObjectURL(blob);var a=document.createElement('a');a.href=u;a.download='RBH-khata-backup-'+todayISO()+'.json';document.body.appendChild(a);a.click();setTimeout(function(){try{URL.revokeObjectURL(u);a.remove()}catch(x){}},5000)})}

function injectPdfButtons(){
 document.querySelectorAll('details.party').forEach(function(d,i){
  if(!d.querySelector('[data-se-pdf]')){var b=document.createElement('button');b.type='button';b.className='btn';b.setAttribute('data-se-pdf',i);
  b.textContent=t('Full statement PDF','पूरा हिसाब PDF');b.style.marginTop='6px';d.appendChild(b)}
  var card=d.closest('.card'),wrow=card?card.querySelector('.wrow'):null;
  if(wrow&&!card.querySelector('[data-se-entry]')){var eb=document.createElement('button');eb.type='button';eb.className='btn';eb.setAttribute('data-se-entry',i);
  eb.textContent=t('+ New entry','+ नई एंट्री');wrow.insertBefore(eb,wrow.firstChild)}
  else if(!wrow&&!d.querySelector('[data-se-entry]')){var eb2=document.createElement('button');eb2.type='button';eb2.className='btn';eb2.setAttribute('data-se-entry',i);eb2.textContent=t('+ New entry','+ नई एंट्री');eb2.style.marginTop='6px';d.appendChild(eb2)}
 });
 var ba=document.querySelector('.backup-actions');
 if(ba&&!document.getElementById('seAllPdf')){
  var ab=document.createElement('button');ab.type='button';ab.className='btn';ab.id='seAllPdf';
  ab.textContent=t('All suppliers PDF (one file)','सबका हिसाब PDF (एक साथ)');ba.appendChild(ab);
 }
}
document.addEventListener('click',function(ev){
 var pb=ev.target.closest&&ev.target.closest('[data-se-pdf]');
 if(pb){var pi=+pb.getAttribute('data-se-pdf');var p=PARTIES[pi];if(p)dlPdf(buildPartyPdf(p),'RBH-hisaab-'+pdfClean(p.short||dname(p.name)).replace(/[^A-Za-z0-9]+/g,'')+'-'+todayISO()+'.pdf');return}
 if(ev.target.closest&&ev.target.closest('#seAllPdf')){dlPdf(buildAllPdf(),'RBH-sabka-hisaab-'+todayISO()+'.pdf');return}
 if(ev.target.closest&&ev.target.closest('#seGBBtn')){gbNow(true);return}
 if(ev.target.closest&&ev.target.closest('#seGBRestore')){gbRestoreDrive();return}
 var ent=ev.target.closest&&ev.target.closest('[data-se-entry]');if(ent){FS.party=parseInt(ent.getAttribute('data-se-entry'),10)||0;FS.step='edit';render();var sc=document.getElementById('seCard');if(sc)sc.scrollIntoView();return}
});
/* ===== Google Drive auto backup: encrypted blob to hidden appDataFolder, gesture-chained ===== */
var GCLIENT_ID='930855618562-vl8j0skui4dtjp83m6euiautdanmlmpc.apps.googleusercontent.com';
var GSCOPE='https://www.googleapis.com/auth/drive.appdata';
var GBKEY='rbh_gbackup_v1';
var GBTEST=/[?&]synctest=1/.test(location.search);
var GBFILE=GBTEST?'rbh-khata-backup-test.json':'rbh-khata-backup.json';
function gbDevId(){var d=null;try{d=localStorage.getItem('rbh_device_id')}catch(x){}
 if(!d){d='d'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);try{localStorage.setItem('rbh_device_id',d)}catch(x){}}
 return d}
function gbSideName(){return GBTEST?('rbh-khata-device-test-'+gbDevId()+'.json'):('rbh-khata-device-'+gbDevId()+'.json')}
var gTok=null,gTokExp=0,gBusy=false;
function gbState(){try{return JSON.parse(localStorage.getItem(GBKEY)||'{}')}catch(x){return {}}}
function gbSet(s){try{localStorage.setItem(GBKEY,JSON.stringify(s))}catch(x){}}
function gbMarkPending(){var s=gbState();s.pending=true;gbSet(s);gbStatusRender()}
function gisLoad(cb){if(window.google&&google.accounts&&google.accounts.oauth2)return cb(true);var sc=document.createElement('script');sc.src='https://accounts.google.com/gsi/client';sc.onload=function(){cb(true)};sc.onerror=function(){cb(false)};document.head.appendChild(sc)}
function gbToken(withPrompt,cb){
 if(gTok&&Date.now()<gTokExp)return cb(gTok);
 gisLoad(function(ok){if(!ok)return cb(null);
  try{
   var tc=google.accounts.oauth2.initTokenClient({client_id:GCLIENT_ID,scope:GSCOPE,callback:function(r){if(r&&r.access_token){gTok=r.access_token;gTokExp=Date.now()+45*60*1000;cb(gTok)}else cb(null)},error_callback:function(){cb(null)}});
   tc.requestAccessToken({prompt:withPrompt?'consent':''});
  }catch(x){cb(null)}
 });
}
function gbKey(cb){
 var raw;try{raw=localStorage.getItem('rbh_k')}catch(x){}
 if(!raw)return cb(null);
 crypto.subtle.importKey('raw',u2b(raw),'AES-GCM',false,['decrypt']).then(function(k){cb(k)}).catch(function(){cb(null)});
}
function gbDecrypt(o,cb){
 if(!o||o.format!=='RBH-KHATA-ENCRYPTED-BACKUP')return cb(null,'format');
 gbKey(function(k){
  if(!k)return cb(null,'locked');
  crypto.subtle.decrypt({name:'AES-GCM',iv:u2b(o.iv)},k,u2b(o.ciphertext)).then(function(buf){
   var D;try{D=JSON.parse(new TextDecoder().decode(buf))}catch(x){return cb(null,'format')}
   cb(D);
  }).catch(function(){cb(null,'decrypt')});
 });
}
function gbFindName(tok,name,cb){
 fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q='+encodeURIComponent("name='"+name+"'")+'&fields=files(id,name)',{headers:{Authorization:'Bearer '+tok}}).then(function(r){return r.json()}).then(function(list){cb((list.files||[])[0]||null)}).catch(function(){cb(null,'net')});
}
/* every snapshot this mode can read: the shared main file plus every phone's own file (single writer each) */
function gbListAll(tok,cb){
 var q="name='"+GBFILE+"' or name contains 'rbh-khata-device-'";
 fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q='+encodeURIComponent(q)+'&fields=files(id,name)&pageSize=100',{headers:{Authorization:'Bearer '+tok}}).then(function(r){return r.json()}).then(function(list){
  var fs=(list.files||[]).filter(function(f){
   if(f.name===GBFILE)return true;
   if(GBTEST)return f.name.indexOf('rbh-khata-device-test-')===0;
   return f.name.indexOf('rbh-khata-device-')===0&&f.name.indexOf('-test-')<0;
  });
  cb(fs);
 }).catch(function(){cb(null,'net')});
}
/* pull every snapshot and merge; saves merged rows as it goes. cb({adds,ids,keys}, err) */
function gbPullAll(tok,cb){
 gbListAll(tok,function(files,err){
  if(err)return cb(null,err);
  var adds=[],ids={},keys={},i=0;
  if(!files.length)return cb({adds:adds,ids:ids,keys:keys});
  (function next(){
   if(i>=files.length)return cb({adds:adds,ids:ids,keys:keys});
   gbDownload(tok,files[i++],function(D){
    if(D){
     (D.p||[]).forEach(function(p){(p.entries||[]).forEach(function(e){if(e.id)ids['id:'+e.id]=1;keys[ck(p.name,e)]=1})});
     (D.local||[]).forEach(function(le){if(le.id)ids['id:'+le.id]=1;keys[ck(le.party,le)]=1});
     var a=mergePayload(D);if(a.length){saveLocals(locals().concat(a));adds=adds.concat(a)}
    }
    next();
   });
  })();
 });
}
function gbDownload(tok,f,cb){
 fetch('https://www.googleapis.com/drive/v3/files/'+f.id+'?alt=media',{headers:{Authorization:'Bearer '+tok}}).then(function(r){
  if(!r.ok)return cb(null,'http'+r.status);
  return r.json();
 }).then(function(o){if(o===undefined)return;gbDecrypt(o,function(D,derr){cb(D,derr)})}).catch(function(){cb(null,'net')});
}
function gbWrite(tok,id,name,payload,cb){
 var body=JSON.stringify(payload);
 var meta=id?{name:name}:{name:name,parents:['appDataFolder'],mimeType:'application/json'};
 var bd='xxrbhbk'+Date.now();
 var mp='--'+bd+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(meta)+'\r\n--'+bd+'\r\nContent-Type: application/json\r\n\r\n'+body+'\r\n--'+bd+'--';
 fetch(id?('https://www.googleapis.com/upload/drive/v3/files/'+id+'?uploadType=multipart'):'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',{method:id?'PATCH':'POST',headers:{Authorization:'Bearer '+tok,'Content-Type':'multipart/related; boundary='+bd},body:mp}).then(function(r){cb(!!(r&&r.ok),r&&r.ok?null:('http'+(r?r.status:'')))}).catch(function(){cb(false,'net')});
}
function gbUpload(cb){
 gbToken(false,function(tok){
  if(!tok)return cb(false,'token');
  buildFullBackup(function(payload){
   if(!payload)return cb(false,'locked');
   /* 1) this phone's own snapshot file: only this phone ever writes it, so no other device can clobber it */
   var sn=gbSideName();
   gbFindName(tok,sn,function(sf){
    gbWrite(tok,sf?sf.id:null,sn,payload,function(ok1,e1){
     if(!ok1)return cb(false,e1||'net');
     /* 2) pull every snapshot in Drive so this phone heals rows it is missing */
     gbPullAll(tok,function(){
      /* 3) merge-write the shared main file (best effort; the per-phone files are the safety net) */
      gbFindName(tok,GBFILE,function(f,ferr){
       var go=function(){buildFullBackup(function(p2){if(!p2)return cb(true,'mainpending');gbWrite(tok,f?f.id:null,GBFILE,p2,function(ok2){cb(true,ok2?null:'mainpending')})})};
       if(!f)return go();
       gbDownload(tok,f,function(D,derr){
        if(derr||!D)return cb(false,'conflict');
        var add=mergePayload(D);if(add.length)saveLocals(locals().concat(add));
        go();
       });
      });
     });
    });
   });
  });
 });
}
function gbRestoreDrive(){
 rMsg(t('Getting the backup from Google Drive...','Google Drive से बैकअप ला रहे हैं...'));
 gbToken(true,function(tok){
  if(!tok)return rMsg(t('Google sign-in failed - try again.','Google साइन-इन नहीं हुआ - दोबारा कोशिश करें।'));
  gbPullAll(tok,function(res,err){
   if(err)return rMsg(t('Network problem - try again.','नेटवर्क दिक्कत - दोबारा कोशिश करें।'));
   var add=res.adds;
   if(!add.length)return rMsg(t('Backup ki sab entries yahan maujood hain. Kuch naya nahi joda.','बैकअप की सब एंट्री यहां मौजूद हैं। कुछ नया नहीं जोड़ा।'));
   rMsg(add.length+t(' entries Google backup se jodi gayi. Page reload ho raha hai.',' एंट्री Google बैकअप से जोड़ी गई। पेज रीलोड हो रहा है।'));
   setTimeout(function(){location.reload()},1500);
  });
 });
}
function gbNow(fromTap){
 if(gBusy)return; gBusy=true; gbStatusRender();
 gbUpload(function(ok,why){
  gBusy=false;
  if(ok){gbSet({at:new Date().toISOString(),pending:false,warn:why==='mainpending'?'main':'',checked:new Date().toISOString()});gbStatusRender();return}
  var s=gbState();s.pending=true;s.err=why||'';gbSet(s);gbStatusRender();
  if(why==='token'&&fromTap){gbToken(true,function(t2){if(t2){gBusy=false;gbNow(false)}})}
 });
}
function gbStatusRender(){
 var el=document.getElementById('seGBStatus');if(!el)return;
 var s=gbState();
 if(gBusy){el.textContent=t('Backing up to Google...','Google बैकअप हो रहा है...');el.style.color='#666';return}
 if(s.pending&&s.err==='conflict'){el.textContent=t('Google backup: old backup uses a different PIN/key - NOT overwritten. Tell Jadoo.','Google बैकअप: पुराना बैकअप अलग PIN/की का है - ओवरराइट नहीं किया। Jadoo को बताएं।');el.style.color='#b3261e';return}
 if(s.pending){el.textContent=t('Google backup: PENDING - new entries are on this phone only - tap the button below','Google बैकअप: बाकी है - नई एंट्री अभी सिर्फ इस फोन पर है - नीचे बटन दबाएं');el.style.color='#b3261e';return}
 if(s.at){var d=new Date(s.at);el.textContent=t('Google backup: saved to Google ','Google बैकअप: Google पर सेव ')+'('+d.toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})+')'+(s.warn==='main'?t(' - shared copy refreshes on next backup',' - साझा कॉपी अगले बैकअप में अपडेट होगी'):'');el.style.color='#1a7f37';return}
 if(s.checked){var d2=new Date(s.checked);el.textContent=t('Google backup: connected, checked ','Google बैकअप: जुड़ा है, जांचा ')+'('+d2.toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})+')'+t(' - nothing new to save',' - सेव करने को नया कुछ नहीं');el.style.color='#666';return}
 el.textContent=t('Google backup: never done yet - tap the button below','Google बैकअप: अभी तक नहीं हुआ - नीचे बटन दबाएं');el.style.color='#666';
}
/* initial paint: base render ran before this script loaded, so kick one render to inject the new UI. Never on the PIN lock screen - a fresh device must see the lock, not an empty ledger. */
try{if(!document.getElementById('lf'))render()}catch(x){}
/* silent sync on open: pull rows other devices backed up. No popup ever here; if Google is not connected on this phone, nothing happens. */
setTimeout(function(){
 gbToken(false,function(tok){
  if(!tok)return;
  gbPullAll(tok,function(res,err){
   if(err||!res)return;
   var add=res.adds;
   var missing=locals().filter(function(le){return !((le.id&&res.ids['id:'+le.id])||res.keys[ck(le.party,le)])});
   var s=gbState();s.checked=new Date().toISOString();gbSet(s);gbStatusRender();
   if(add.length){try{render()}catch(x){}rMsg(add.length+t(' entry(s) added from the other phone backup.',' एंट्री दूसरे फोन के बैकअप से जोड़ी गई।'))}
   if(missing.length){gbUpload(function(){})}
  });
 });
},2000);
window.__sePdf={party:buildPartyPdf,all:buildAllPdf,backup:buildFullBackup};
})();


