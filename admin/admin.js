const c=window.NVEC_CONFIG,s=supabase.createClient(c.supabaseUrl,c.supabasePublishableKey),$=x=>document.querySelector(x);let M=[],R=[],editMode='create';function esc(v){return String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}function view(ok){$('#login').classList.toggle('hidden',ok);$('#recovery').classList.add('hidden');$('#dash').classList.toggle('hidden',!ok);$('#logoutBtn').classList.toggle('hidden',!ok)}function recoveryView(){$('#login').classList.add('hidden');$('#dash').classList.add('hidden');$('#recovery').classList.remove('hidden');$('#logoutBtn').classList.add('hidden')}async function admin(u){const {data}=await s.from('members').select('role,is_active').eq('id',u.id).single();return data?.role==='admin'&&data?.is_active}async function invoke(body){const {data,error}=await s.functions.invoke('nvec-member-admin',{body});if(error){let detail='';try{const response=error.context;if(response&&typeof response.json==='function'){const body=await response.json();detail=body?.error||body?.message||JSON.stringify(body)}}catch(_){}throw new Error(detail||error.message||'회원관리 함수 호출 실패')}if(!data?.ok)throw new Error(data?.error||'처리하지 못했습니다.');return data}$('#form').onsubmit=async e=>{e.preventDefault();$('#msg').textContent='로그인 중...';const {data,error}=await s.auth.signInWithPassword({email:'rke8096@naver.com',password:$('#pw').value});if(error||!data.user||!(await admin(data.user))){$('#msg').textContent='관리자 정보를 확인해 주세요.';await s.auth.signOut();return}$('#msg').textContent='';view(true);load()};$('#logoutBtn').onclick=async()=>{await s.auth.signOut();view(false)};$('#recoveryForm').onsubmit=async e=>{e.preventDefault();const a=$('#newPw').value,b=$('#newPw2').value,m=$('#recoveryMsg');if(a!==b){m.textContent='비밀번호가 서로 다릅니다.';return}if(a.length<8){m.textContent='비밀번호는 8자 이상으로 설정해 주세요.';return}m.textContent='변경 중...';const {error}=await s.auth.updateUser({password:a});if(error){m.textContent='변경 오류: '+error.message;return}m.style.color='#18794e';m.textContent='비밀번호가 변경되었습니다.';setTimeout(()=>{view(true);load()},700)};function day(n=0){let d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-n);return d}async function load(){let a=await s.from('members').select('id,member_id,name,role,is_active,target_min').order('name');if(a.error)a=await s.from('members').select('id,member_id,name,role,is_active').order('name');let b=await s.from('learning_records').select('id,user_id,course,mission,record_type,audio_path,repetition,completed_at,duration_sec,voice_sec').order('completed_at',{ascending:false}).limit(5000);if(b.error)b=await s.from('learning_records').select('id,user_id,course,mission,record_type,audio_path,repetition,completed_at').order('completed_at',{ascending:false}).limit(5000);if(a.error||b.error){$('#rows').innerHTML='<tr><td colspan="9">조회 오류: '+esc((a.error||b.error).message)+'</td></tr>';return}M=(a.data||[]).filter(x=>x.role!=='admin');R=b.data||[];render();showUsage()}async function showUsage(){const el=$('#usage');if(!el)return;try{const {data,error}=await s.functions.invoke('swift-processor',{body:{action:'usage'}});if(error||!data||!data.ok){el.textContent='';return}const mb=data.total_bytes/1048576;el.textContent='보관함 사용량 '+mb.toFixed(1)+'MB / 1,000MB · 녹음 '+data.file_count+'개 · '+(mb>=800?'곧 오래된 녹음부터 정리됩니다':'800MB가 넘으면 오래된 녹음부터 정리됩니다')}catch(_){el.textContent=''}}const HW={adult:[{k:'듣기',n:'메인교재 30번 듣기',t:30,listen:true},{k:'말하기',n:'메인교재 30번 말하기',t:30},{k:'교정',n:'교정문장 10번 녹음하기',t:10}],teen:[{k:'본문',n:'메인교재 5번 녹음',t:3},{k:'단어',n:'메인교재 단어 5번 녹음',t:3},{k:'원서',n:'원서 5번 녹음',t:3},{k:'NVOCA',n:'NVOCA 5번 녹음',t:3}]};function fmtSec(v){v=Math.max(0,Math.round(Number(v)||0));return Math.floor(v/60)+'분 '+String(v%60).padStart(2,'0')+'초'}
function recScore(r,tgt){if(r.voice_sec===null||r.voice_sec===undefined)return 1;return Math.min(1,Number(r.voice_sec)/(Math.max(1,Number(tgt)||3)*60))}
function missionScore(rows,x,tgt){const rec=rows.filter(r=>r.record_type==='recording').slice().sort((a,b)=>new Date(a.completed_at)-new Date(b.completed_at)).slice(0,x.t);return rec.reduce((a,r)=>a+recScore(r,tgt),0)/x.t}
function hw(tr,last,tgt){const course=(tr[0]||last||{}).course,L=HW[course];if(!L)return '<span class="hw-none">-</span>';let sum=0,tot=0,chips='';L.forEach(x=>{const rows=tr.filter(r=>r.course===course&&r.mission===x.n);let frac,label;if(course==='teen'){frac=missionScore(rows,x,tgt);sum+=frac;tot+=1;label=frac>=0.995?'O':frac>0?Math.round(frac*100)+'%':'X'}else{const c=x.listen?Math.max(rows.length,0,...rows.map(r=>Number(r.repetition)||0)):rows.filter(r=>r.record_type==='recording').length;frac=Math.min(c,x.t)/x.t;sum+=Math.min(c,x.t);tot+=x.t;label=c>=x.t?'O':'X'}chips+='<span class="hw '+(frac>=0.995?'ok':frac>0?'part':'no')+'" title="'+esc(x.n)+' '+Math.round(frac*100)+'%">'+x.k+' '+label+'</span>'});return '<b class="hw-pct">'+Math.round(sum/tot*100)+'%</b><div class="hw-chips">'+chips+'</div>'}
function render(){const q=$('#search').value.trim().toLowerCase(),only=$('#active').checked,t=day(),t3=day(3),L=M.filter(m=>(!only||m.is_active)&&(!q||m.member_id.toLowerCase().includes(q)||m.name.toLowerCase().includes(q)));let n=0,o=0;$('#rows').innerHTML=L.map((m,i)=>{const rr=R.filter(r=>r.user_id===m.id),tr=rr.filter(r=>new Date(r.completed_at)>=t),last=rr[0],rec=rr.filter(r=>r.audio_path).length;if(tr.length)n++;if(!last||new Date(last.completed_at)<t3)o++;return '<tr><td style="color:#737986;font-weight:800">'+(i+1)+'</td><td><button class="member-link" data-id="'+m.id+'">'+esc(m.member_id)+'</button></td><td>'+esc(m.name)+'</td><td>'+(tr.length?'학습 '+tr.length+'건':'미학습')+'</td><td>'+hw(tr,last,m.target_min)+'</td><td>'+(last?new Date(last.completed_at).toLocaleString('ko-KR'):'기록 없음')+'</td><td><button class="listen-link" data-id="'+m.id+'">'+rec+'개 듣기</button></td><td>'+(m.is_active?'활동':'비활성')+'</td><td><button class="edit-link" data-id="'+m.id+'">수정</button> <button class="rep-link" data-id="'+m.id+'">성적표</button></td></tr>'}).join('')||'<tr><td colspan="9">회원이 없습니다.</td></tr>';$('#total').textContent=M.filter(m=>m.is_active).length;$('#today').textContent=n;$('#miss').textContent=Math.max(0,L.filter(m=>m.is_active).length-n);$('#old').textContent=o;document.querySelectorAll('.member-link,.listen-link').forEach(b=>b.onclick=()=>detail(b.dataset.id,b.classList.contains('listen-link')));document.querySelectorAll('.edit-link').forEach(b=>b.onclick=()=>openEdit(b.dataset.id));document.querySelectorAll('.rep-link').forEach(b=>b.onclick=()=>openReport(b.dataset.id))}function openModal(){ $('#memberModal').classList.remove('hidden');$('#memberMsg').textContent='';document.body.classList.add('modal-open')}function closeModal(){$('#memberModal').classList.add('hidden');document.body.classList.remove('modal-open')}$('#addMember').onclick=()=>{editMode='create';$('#modalTitle').textContent='회원 추가';$('#editUserId').value='';$('#editName').value='';$('#editMemberId').value='';$('#editPassword').value='';$('#activeLabel').classList.add('hidden');$('#targetLabel').classList.add('hidden');$('#resetPassword').classList.add('hidden');openModal()};function openEdit(id){const m=M.find(x=>x.id===id);if(!m)return;editMode='update';$('#modalTitle').textContent='회원 수정';$('#editUserId').value=m.id;$('#editName').value=m.name;$('#editMemberId').value=m.member_id;$('#editPassword').value='';$('#editActive').checked=!!m.is_active;$('#editTarget').value=String(m.target_min||3);$('#targetLabel').classList.remove('hidden');$('#activeLabel').classList.remove('hidden');$('#resetPassword').classList.remove('hidden');openModal()}$('#modalClose').onclick=closeModal;$('#memberModal').onclick=e=>{if(e.target===$('#memberModal'))closeModal()};$('#saveMember').onclick=async()=>{const msg=$('#memberMsg'),name=$('#editName').value.trim(),member_id=$('#editMemberId').value.trim(),password=$('#editPassword').value.trim();if(!name||!member_id){msg.textContent='이름과 회원 ID를 입력해 주세요.';return}msg.textContent='저장 중...';$('#saveMember').disabled=true;try{if(editMode==='create')await invoke({action:'create',name,member_id,password:password||member_id+'$'});else{const uid=$('#editUserId').value;await invoke({action:'update',user_id:uid,name,member_id,is_active:$('#editActive').checked});const cur=M.find(x=>x.id===uid),tv=Number($('#editTarget').value)||3;if(cur&&(cur.target_min||3)!==tv){const up=await s.from('members').update({target_min:tv}).eq('id',uid).select('id');if(up.error||!up.data||!up.data.length)throw new Error('1회 분량을 저장하지 못했어요. 안내서의 SQL을 먼저 실행해 주세요.')}}msg.style.color='#18794e';msg.textContent=editMode==='create'?'회원이 추가되었습니다.':'회원정보가 수정되었습니다.';await load();setTimeout(closeModal,500)}catch(e){msg.style.color='#b23b3b';msg.textContent='오류: '+e.message}finally{$('#saveMember').disabled=false}};$('#resetPassword').onclick=async()=>{const msg=$('#memberMsg'),member_id=$('#editMemberId').value.trim(),pw=$('#editPassword').value.trim()||member_id+'$';if(!confirm('비밀번호를 '+pw+' 로 변경할까요?'))return;msg.textContent='비밀번호 변경 중...';try{await invoke({action:'password',user_id:$('#editUserId').value,password:pw});msg.style.color='#18794e';msg.textContent='비밀번호가 변경되었습니다.'}catch(e){msg.style.color='#b23b3b';msg.textContent='오류: '+e.message}};async function detail(id,only){const m=M.find(x=>x.id===id);if(!m)return;const tgt=m.target_min||3,rr=R.filter(r=>r.user_id===id&&(!only||r.audio_path||r.record_type==='recording')).slice(0,200),paths=rr.filter(r=>r.audio_path).map(r=>r.audio_path),urls={};if(paths.length){try{const {data}=await s.storage.from('recordings').createSignedUrls(paths,3600);(data||[]).forEach(x=>{if(x.signedUrl)urls[x.path]=x.signedUrl})}catch(_){}}let h='';rr.forEach(r=>{const isRec=r.record_type==='recording',expired=isRec&&!r.audio_path;let a=expired?'<span class="hw-none">보관 기간 지남 (정리됨)</span>':'';if(r.audio_path&&urls[r.audio_path]){const sg=urls[r.audio_path],fn=m.member_id+'_'+new Date(r.completed_at).toISOString().slice(0,10)+'_'+r.audio_path.split('/').pop(),dl=sg+(sg.includes('?')?'&':'?')+'download='+encodeURIComponent(fn);a='<div class="aud"><audio controls src="'+sg+'"></audio><a class="dl-btn" href="'+dl+'" download>저장</a></div>'}let info='';if(isRec){if(r.duration_sec!==null&&r.duration_sec!==undefined){const hasV=r.voice_sec!==null&&r.voice_sec!==undefined;const sc=r.course==='teen'&&hasV?' · 점수 <b>'+Math.round(recScore(r,tgt)*100)+'%</b> (목표 '+tgt+'분)':'',mute=(hasV&&r.duration_sec>=10&&Number(r.voice_sec)<r.duration_sec*0.2)?' <span class="mute-flag">🔇 무음 의심</span>':'';info='<div class="rec-info">전체 '+fmtSec(r.duration_sec)+(hasV?' · 말한 시간 '+fmtSec(r.voice_sec):'')+sc+mute+'</div>'}else info='<div class="rec-info hw-none">시간 기록 없음 (이전 녹음)</div>'}const del=(isRec||r.audio_path)&&r.id!==undefined?'<button class="del-btn" data-rid="'+esc(r.id)+'" data-path="'+esc(r.audio_path||'')+'">삭제</button>':'';h+='<div class="timeline-item"><b>'+new Date(r.completed_at).toLocaleString('ko-KR')+'</b><span>'+esc(r.course==='teen'?String(r.mission).replace('5번','3번'):r.mission)+'</span>'+info+a+del+'</div>'});const d=$('#detail');d.innerHTML='<button id="close" class="detail-close">닫기 ×</button><h3>'+esc(m.member_id)+' · '+esc(m.name)+'</h3><p class="muted small-note">1회 녹음 분량 '+tgt+'분 · 최근 '+rr.length+'건'+(rr.length>=200?' (최대 200건)':'')+'</p><div class="timeline">'+(h||'기록이 없습니다.')+'</div>';d.classList.remove('hidden');$('#close').onclick=()=>d.classList.add('hidden');d.querySelectorAll('.del-btn').forEach(b=>b.onclick=async()=>{const rid=b.dataset.rid,path=b.dataset.path;if(!confirm('이 녹음 기록을 삭제할까요?\n파일과 학습기록이 함께 지워지고 되돌릴 수 없어요.'))return;b.disabled=true;try{const {data,error}=await s.from('learning_records').delete().eq('id',rid).select('id');if(error)throw error;if(!data||!data.length)throw new Error('삭제 권한이 없어요. 안내서의 SQL을 먼저 실행해 주세요.');if(path){try{await s.storage.from('recordings').remove([path])}catch(_){}}R=R.filter(x=>String(x.id)!==String(rid));render();detail(id,only)}catch(e){b.disabled=false;alert('삭제하지 못했어요: '+(e.message||e))}});d.scrollIntoView({behavior:'smooth'})}
$('#search').oninput=render;$('#active').onchange=render;$('#refresh').onclick=load;s.auth.onAuthStateChange(async(event,session)=>{if(event==='PASSWORD_RECOVERY'&&session)recoveryView()});(async()=>{const hash=location.hash||'',isRecovery=hash.includes('type=recovery');const {data:{session}}=await s.auth.getSession();if(isRecovery&&session){recoveryView();return}if(session&&await admin(session.user)){view(true);load()}else if(session)await s.auth.signOut()})();
const NVEC_INITIAL_MEMBERS=[{"name":"황금빛","member_id":"gold0000"},{"name":"황금별","member_id":"star0000"},{"name":"최유정","member_id":"lena0803"},{"name":"조아름","member_id":"sia0627"},{"name":"조승호","member_id":"victor0206"},{"name":"조수민","member_id":"joy4867"},{"name":"정세리","member_id":"serena0618"},{"name":"정명준","member_id":"jmj0507"},{"name":"정규태","member_id":"maroo1099"},{"name":"전호진","member_id":"leo0309"},{"name":"전하윤","member_id":"bunny0725"},{"name":"장하은","member_id":"priti1114"},{"name":"장용국","member_id":"ronan1027"},{"name":"임태경","member_id":"lucy1124"},{"name":"임진혁","member_id":"jay0716"},{"name":"임승범","member_id":"beom0324"},{"name":"이채빈","member_id":"luna0717"},{"name":"이진","member_id":"jin0424"},{"name":"이웅희","member_id":"hans0419"},{"name":"이연재","member_id":"lyj0109"},{"name":"이시윤","member_id":"ethan0418"},{"name":"이승윤","member_id":"kevin0502"},{"name":"이승민","member_id":"sky0304"},{"name":"이수연","member_id":"elena0805"},{"name":"이소하","member_id":"soha0618"},{"name":"이서준","member_id":"sj0000"},{"name":"이상호","member_id":"evan0619"},{"name":"이규선","member_id":"sean0208"},{"name":"윤인탁","member_id":"max2015"},{"name":"윤서연","member_id":"bella2015"},{"name":"윤병돈","member_id":"david1017"},{"name":"유찬","member_id":"kai0919"},{"name":"우민지","member_id":"lynn1017"},{"name":"안채아","member_id":"angela0317"},{"name":"신예은","member_id":"ann0403"},{"name":"신수빈","member_id":"subin0503"},{"name":"서주원","member_id":"juwon0702"},{"name":"보충보충보충","member_id":"len1009"},{"name":"백시윤","member_id":"emily1006"},{"name":"배정우","member_id":"victor0819"},{"name":"배수지","member_id":"suzy1001"},{"name":"박태온","member_id":"tay0523"},{"name":"박연준","member_id":"lucas0423"},{"name":"박솔희","member_id":"sol0225"},{"name":"박리연","member_id":"iyeon0816"},{"name":"박기원","member_id":"kai0908"},{"name":"박가은","member_id":"gaia0601"},{"name":"류지환","member_id":"wyatt0826"},{"name":"김하람","member_id":"kabin0624"},{"name":"김유민","member_id":"sophia1008"},{"name":"김유균","member_id":"yk1108"},{"name":"김수아","member_id":"jenny0714"},{"name":"김세은","member_id":"sen0309"},{"name":"김범준","member_id":"freya0309"},{"name":"김민채","member_id":"ella0914"},{"name":"김리아","member_id":"eille1030"},{"name":"김동찬","member_id":"jjm0320"},{"name":"김도윤","member_id":"henrry1208"},{"name":"김나율","member_id":"aria0425"},{"name":"강영준","member_id":"jun0904"}];
async function bulkRegisterInitialMembers(){if(!confirm('기존 회원 60명을 한꺼번에 등록할까요? 이미 등록된 ID는 건너뜁니다.'))return;const btn=$('#bulkMembers'),msg=$('#bulkMsg');btn.disabled=true;let ok=0,skip=0,fail=[];for(let i=0;i<NVEC_INITIAL_MEMBERS.length;i++){const m=NVEC_INITIAL_MEMBERS[i];msg.textContent=(i+1)+' / '+NVEC_INITIAL_MEMBERS.length+' 등록 중 · '+m.name+' ('+m.member_id+')';try{await invoke({action:'create',name:m.name,member_id:m.member_id});ok++}catch(e){const t=String(e.message||e);if(/already|registered|exists|duplicate|unique/i.test(t))skip++;else fail.push(m.member_id+': '+t)}}msg.textContent='완료 · 신규 '+ok+'명 · 기존 '+skip+'명'+(fail.length?' · 실패 '+fail.length+'명':'');msg.style.color=fail.length?'#b23b3b':'#18794e';if(fail.length){msg.textContent+=' · 첫 오류: '+fail[0];msg.title=fail.join('\n');}await load();btn.disabled=false;}
/* 여러 명 한꺼번에 추가 / 비밀번호 변경 */
function bulkParse(mode,text,existing){
  const rows=[],seen=new Set(),have=new Set(existing||[]);
  String(text||'').split(/\r?\n/).forEach((raw,i)=>{
    const line=raw.trim(); if(!line)return;
    const c=line.split(/\t|,/).map(s=>s.trim());
    let name='',id='',pw='';
    if(mode==='add'){
      if(c.length<2||!c[0]||!c[1]){rows.push({n:i+1,err:'이름과 아이디를 적어 주세요'});return}
      name=c[0];id=c[1].toLowerCase();pw=c[2]||'';
    }else{
      if(c.length===2){id=c[0].toLowerCase();pw=c[1]}
      else if(c.length>=3){name=c[0];id=c[1].toLowerCase();pw=c[2]}
      else{rows.push({n:i+1,err:'아이디와 비밀번호를 적어 주세요'});return}
    }
    const r={n:i+1,name,id,pw,pwShown:pw?'●'.repeat(Math.min(pw.length,8)):(mode==='add'?'아이디$':'')};
    if(!/^[a-z0-9._-]{3,30}$/.test(id))r.err='아이디는 영문 소문자·숫자 3~30자로 적어 주세요';
    else if(seen.has(id))r.err='같은 아이디가 목록에 두 번 있어요';
    else if(mode==='add'&&have.has(id))r.err='이미 등록된 아이디예요';
    else if(mode!=='add'&&!have.has(id))r.err='등록되지 않은 아이디예요';
    else{
      const finalPw=pw||(mode==='add'?id+'$':'');
      if(!finalPw)r.err='비밀번호를 적어 주세요';
      else if(finalPw.length<6)r.err='비밀번호는 6자 이상이어야 해요';
      else r.finalPw=finalPw;
    }
    seen.add(id);rows.push(r);
  });
  return rows;
}
(function(){
  const g=x=>document.querySelector(x);
  if(!g('#bulkOpen'))return;
  let plan=[],busy=false;
  const mode=()=>(document.querySelector('input[name=bulkMode]:checked')||{}).value||'add';
  function open(){g('#bulkModal').classList.remove('hidden');document.body.classList.add('modal-open');g('#bulkOut').innerHTML='';g('#bulkRun').disabled=true;plan=[]}
  function close(){if(busy)return;g('#bulkModal').classList.add('hidden');document.body.classList.remove('modal-open');g('#bulkText').value=''}
  function render(rows,done){
    const ok=rows.filter(r=>!r.err).length,bad=rows.length-ok;
    let h='<p class="bulk-sum"><b>'+rows.length+'줄</b> · 가능 <b class="bulk-ok">'+ok+'</b> · 문제 <b class="bulk-bad">'+bad+'</b></p>';
    h+='<div class="bulk-tbl"><table><thead><tr><th>줄</th><th>이름</th><th>아이디</th><th>비밀번호</th><th>상태</th></tr></thead><tbody>';
    rows.forEach(r=>{
      const st=r.result?esc(r.result):(r.err?'<span class="bulk-bad">'+esc(r.err)+'</span>':'준비됨');
      h+='<tr><td>'+r.n+'</td><td>'+esc(r.name||'')+'</td><td>'+esc(r.id||'')+'</td><td>'+esc(r.pwShown||'')+'</td><td>'+st+'</td></tr>';
    });
    g('#bulkOut').innerHTML=h+'</tbody></table></div>';
  }
  g('#bulkOpen').onclick=open;
  g('#bulkClose').onclick=close;
  g('#bulkModal').onclick=e=>{if(e.target===g('#bulkModal'))close()};
  document.querySelectorAll('input[name=bulkMode]').forEach(r=>r.onchange=()=>{
    g('#bulkHelp').textContent=mode()==='add'
      ?'한 줄에 한 명: 이름, 아이디, 비밀번호(비우면 아이디$)'
      :'한 줄에 한 명: 아이디, 비밀번호  (이름, 아이디, 비밀번호도 가능)';
    g('#bulkOut').innerHTML='';g('#bulkRun').disabled=true;plan=[];
  });
  g('#bulkCheck').onclick=()=>{
    const existing=(typeof M!=='undefined'?M:[]).map(m=>String(m.member_id||'').toLowerCase());
    plan=bulkParse(mode(),g('#bulkText').value,existing);
    if(!plan.length){g('#bulkOut').innerHTML='<p class="bulk-bad">적힌 내용이 없어요.</p>';g('#bulkRun').disabled=true;return}
    render(plan);
    g('#bulkRun').disabled=!plan.some(r=>!r.err);
  };
  g('#bulkRun').onclick=async()=>{
    if(busy)return;
    const todo=plan.filter(r=>!r.err);
    if(!todo.length)return;
    const m=mode(),label=m==='add'?'새 회원으로 추가':'비밀번호를 변경';
    if(!confirm(todo.length+'명을 '+label+'합니다. 계속할까요?'))return;
    busy=true;g('#bulkRun').disabled=true;g('#bulkCheck').disabled=true;
    let ok=0,fail=0;
    for(const r of todo){
      try{
        if(m==='add'){await invoke({action:'create',name:r.name,member_id:r.id,password:r.finalPw});r.result='✅ 추가됨'}
        else{
          const mem=M.find(x=>String(x.member_id||'').toLowerCase()===r.id);
          if(!mem)throw new Error('회원을 찾지 못했어요');
          await invoke({action:'password',user_id:mem.id,password:r.finalPw});r.result='✅ 변경됨';
        }
        ok++;
      }catch(e){r.result='❌ '+String(e.message||e).slice(0,60);fail++}
      render(plan);
    }
    g('#bulkText').value='';
    plan.forEach(r=>{delete r.finalPw;delete r.pw});
    try{await load()}catch(_){}
    busy=false;g('#bulkCheck').disabled=false;
    g('#bulkOut').insertAdjacentHTML('afterbegin','<p class="bulk-sum"><b>완료</b> · 성공 <b class="bulk-ok">'+ok+'</b> · 실패 <b class="bulk-bad">'+fail+'</b></p>');
  };
})();
/* 학부모 전달용 학습 성적표 */
function repKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function repDays(start,end){const out=[],d=new Date(start.getFullYear(),start.getMonth(),start.getDate()),e=new Date(end.getFullYear(),end.getMonth(),end.getDate());while(d<=e&&out.length<62){out.push(repKey(d));d.setDate(d.getDate()+1)}return out}
function buildReport(o){
  const days=o.days,set=new Set(days),all=o.all||[];
  const inSet=(r,s)=>s.has(repKey(new Date(r.completed_at)));
  const recs=all.filter(r=>inSet(r,set));
  const byDay={};recs.forEach(r=>{const k=repKey(new Date(r.completed_at));(byDay[k]=byDay[k]||[]).push(r)});
  const active=days.filter(k=>byDay[k]);
  let best=0,run=0;days.forEach(k=>{if(byDay[k]){run++;best=Math.max(best,run)}else run=0});
  const rec=recs.filter(r=>r.record_type==='recording').length;
  const mission={};recs.forEach(r=>{mission[r.mission]=(mission[r.mission]||0)+1});
  const top=Object.entries(mission).sort((a,b)=>b[1]-a[1])[0]||null;
  let goalDays=0;
  days.forEach(k=>{const rs=byDay[k];if(!rs)return;const L=HW[rs[0].course]||[];
    if(L.some(x=>{const mine=rs.filter(r=>r.mission===x.n);const c=x.listen?Math.max(mine.length,...mine.map(r=>Number(r.repetition)||0)):mine.filter(r=>r.record_type==='recording').length;return c>=x.t}))goalDays++});
  let prevActive=0;
  if(o.prevDays&&o.prevDays.length){const ps=new Set(o.prevDays);prevActive=new Set(all.filter(r=>inSet(r,ps)).map(r=>repKey(new Date(r.completed_at)))).size}
  const len=days.length,H=[];
  if(active.length>0)H.push((o.month?o.month+'월 ':'')+len+'일 중 '+active.length+'일 영어 학습을 했어요.');
  if(rec>0)H.push('영어로 '+rec+'번 녹음하며 말하기 연습을 했어요.');
  if(best>=2)H.push(best+'일 연속으로 꾸준히 학습한 기록이 있어요.');
  if(top&&top[1]>=2)H.push('‘'+top[0]+'’ 미션을 가장 열심히 해서 '+top[1]+'번 기록했어요.');
  if(goalDays>0)H.push('하루 미션 목표를 채운 날이 '+goalDays+'일 있었어요.');
  if(prevActive>0&&active.length>prevActive)H.push((o.month?'지난달보다':'지난 기간보다')+' 학습한 날이 '+(active.length-prevActive)+'일 늘었어요.');
  let nextGoal;
  if(active.length===0)nextGoal=(o.month?'다음 달에는':'다음 '+len+'일은')+' 하루 5분, 한 번의 녹음으로 가볍게 시작해 봐요.';
  else nextGoal=(o.month?'다음 달에는 ':'다음 '+len+'일은 ')+Math.min(o.month?28:len,active.length+3)+'일 학습하기에 도전해 봐요.'+(rec>0?' 녹음은 '+(rec+3)+'번을 목표로 해 볼까요?':' 말하기 녹음도 한 번 도전해 봐요.');
  const course=recs.length?recs[recs.length-1].course:'';
  return {title:(o.month?o.month+'월 학습 이야기':len+'일 학습 이야기'),len,active:active.length,rec,best,top,goalDays,prevActive,highlights:H,nextGoal,course,calendar:days.map(k=>({k,on:!!byDay[k],n:(byDay[k]||[]).length}))};
}
const NV_ALIAS={jjm0320:'jim0320'};
async function fetchNv(mid,month){try{const ids=[mid];if(NV_ALIAS[mid])ids.push(NV_ALIAS[mid]);const {data,error}=await s.from('nvoim_monthly').select('*').in('member_id',ids).eq('month',month).limit(1);if(error||!data||!data.length)return null;return data[0]}catch(_){return null}}
function nvSection(v){const att=[];if(v.att_great)att.push('매우 만족 '+v.att_great+'회');if(v.att_good)att.push('만족 '+v.att_good+'회');if(v.att_normal)att.push('보통 '+v.att_normal+'회');return '<h3>원어민 수업 결과</h3><div class="rp-stats"><div><span>수업 횟수</span><b>'+(v.lessons||0)+'회</b></div><div><span>평균 참여도</span><b>'+(v.avg_participation!==null&&v.avg_participation!==undefined?v.avg_participation+'%':'-')+'</b></div><div><span>수업 태도</span><b class="rp-small">'+esc(att.join(' · ')||'-')+'</b></div></div>'+(v.progress?'<p class="rp-goal">최근 진도: '+esc(v.progress)+'</p>':'')+(v.words?'<p class="rp-legend">함께 연습한 단어: '+esc(String(v.words).split('/').join(', '))+'</p>':'')+(v.comment_ko?'<p class="rp-note">원어민 강사 '+esc(v.teacher||'')+': '+esc(v.comment_ko)+'</p>':'')+(v.period?'<p class="rp-legend">※ 수업 결과 집계 기간: '+esc(v.period)+'</p>':'')}
function renderReport(name,start,end,r,x){
  x=x||{};
  const courseTxt=r.course==='adult'?'성인 과정':r.course==='teen'?'초·중·고 과정':'';
  const lines=r.highlights.slice();
  if(x.part)lines.push('수업 참여도는 평균 '+x.part+'였어요.');
  if(x.att)lines.push('수업에 '+x.att+' 참여했어요.');
  const cal=r.calendar.map(c=>'<span class="rp-d'+(c.on?' on':'')+'" title="'+esc(c.k)+(c.on?' · 기록 '+c.n+'건':'')+'">'+Number(c.k.slice(8))+'</span>').join('');
  return '<div class="rp-sheet"><div class="rp-head"><img src="../67.JPG" alt=""><div><b>NVEC 원어민어학원</b><span>MY CLASS 학습 성적표</span></div></div>'
  +'<h2 class="rp-title">'+esc(name)+' 학생의 '+esc(r.title||(r.len+'일 학습 이야기'))+'</h2>'
  +'<p class="rp-period">'+esc(start)+' ~ '+esc(end)+(courseTxt?' · '+esc(courseTxt):'')+'</p>'
  +'<div class="rp-stats"><div><span>학습한 날</span><b>'+r.active+'일</b></div><div><span>녹음</span><b>'+r.rec+'번</b></div><div><span>최장 연속</span><b>'+r.best+'일</b></div></div>'
  +'<h3>이번 기간의 칭찬 포인트</h3><ul class="rp-list">'+(lines.length?lines.map(l=>'<li>'+esc(l)+'</li>').join(''):'<li>새로운 시작을 응원해요. 다음 기간이 기대돼요.</li>')+'</ul>'
  +(x.nv?nvSection(x.nv):'')+(x.note?'<h3>선생님 한마디</h3><p class="rp-note">'+esc(x.note)+'</p>':'')
  +'<h3>날짜별 학습 기록</h3><div class="rp-cal">'+cal+'</div><p class="rp-legend"><span class="rp-d on">●</span> 학습한 날</p>'
  +'<h3>다음 목표</h3><p class="rp-goal">'+esc(r.nextGoal)+'</p>'
  +'<p class="rp-foot">NVEC 원어민어학원 · 경기도 이천시 증신로 81, 2층 · 010-2525-3999</p></div>';
}
async function fetchRecs(uid,from,to){
  const {data,error}=await s.from('learning_records').select('course,mission,record_type,audio_path,repetition,completed_at').eq('user_id',uid).gte('completed_at',from.toISOString()).lt('completed_at',to.toISOString()).order('completed_at',{ascending:true}).limit(5000);
  if(error)throw error;return data||[];
}
(function(){
  const g=x=>document.querySelector(x);
  if(!g('#repModal'))return;
  let member=null;
  const ym=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
  const setRange=(a,b)=>{g('#repStart').value=repKey(a);g('#repEnd').value=repKey(b)};
  function monthRange(y,m){
    const first=new Date(y,m,1),last=new Date(y,m+1,0),t=new Date();t.setHours(0,0,0,0);
    g('#repMonth').value=ym(first);
    setRange(first,(first.getFullYear()===t.getFullYear()&&first.getMonth()===t.getMonth())?t:last);
  }
  function thisMonth(){const n=new Date();monthRange(n.getFullYear(),n.getMonth())}
  function shiftMonth(k){
    const v=g('#repMonth').value||ym(new Date());const y=Number(v.slice(0,4)),m=Number(v.slice(5,7))-1;
    const d=new Date(y,m+k,1);monthRange(d.getFullYear(),d.getMonth());build();
  }
  function recent(n){const e=new Date();e.setHours(0,0,0,0);const st=new Date(e);st.setDate(st.getDate()-(n-1));g('#repMonth').value='';setRange(st,e)}
  window.openReport=function(id){
    member=(typeof M!=='undefined'?M:[]).find(m=>m.id===id);if(!member)return;
    g('#repName').textContent=member.name+' ('+member.member_id+')';
    g('#repPart').value='';g('#repAtt').value='';g('#repNote').value='';g('#repView').innerHTML='';g('#repMsg').textContent='';
    thisMonth();g('#repModal').classList.remove('hidden');document.body.classList.add('modal-open');build();
  };
  async function build(){
    if(!member)return;const msg=g('#repMsg');
    const sv=g('#repStart').value,ev=g('#repEnd').value;
    if(!sv||!ev){msg.textContent='시작일과 끝나는 날을 정해 주세요.';return}
    const st=new Date(sv+'T00:00:00'),en=new Date(ev+'T00:00:00');
    if(en<st){msg.textContent='끝나는 날이 시작일보다 빨라요.';return}
    const days=repDays(st,en);if(days.length>=62){msg.textContent='기간은 최대 60일까지 만들 수 있어요.';return}
    const t=new Date();t.setHours(0,0,0,0);
    const sameMonth=st.getDate()===1&&st.getMonth()===en.getMonth()&&st.getFullYear()===en.getFullYear();
    const lastDay=new Date(en.getFullYear(),en.getMonth()+1,0).getDate();
    const isCur=en.getFullYear()===t.getFullYear()&&en.getMonth()===t.getMonth();
    const monthMode=sameMonth&&(en.getDate()===lastDay||(isCur&&en.getTime()===t.getTime()));
    let prevStart,prevEnd;
    if(monthMode){prevStart=new Date(st.getFullYear(),st.getMonth()-1,1);prevEnd=new Date(st.getFullYear(),st.getMonth(),0)}
    else{prevEnd=new Date(st);prevEnd.setDate(prevEnd.getDate()-1);prevStart=new Date(prevEnd);prevStart.setDate(prevStart.getDate()-(days.length-1))}
    const to=new Date(en);to.setDate(to.getDate()+1);
    msg.style.color='';msg.textContent='불러오는 중...';
    try{
      const all=await fetchRecs(member.id,prevStart,to);
      const r=buildReport({days,prevDays:repDays(prevStart,prevEnd),all,month:monthMode?st.getMonth()+1:0});
      const x={part:g('#repPart').value.trim(),att:g('#repAtt').value.trim(),note:g('#repNote').value.trim()};
      x.nv=await fetchNv(member.member_id,monthMode?ym(st):ym(en));g('#repView').innerHTML=renderReport(member.name,sv,ev,r,x);msg.textContent='';
    }catch(e){msg.style.color='#b23b3b';msg.textContent='불러오지 못했어요: '+(e.message||e)}
  }
  g('#repBuild').onclick=build;
  g('#repPrevM').onclick=()=>shiftMonth(-1);
  g('#repNextM').onclick=()=>shiftMonth(1);
  g('#repMonth').onchange=()=>{const v=g('#repMonth').value;if(!v)return;monthRange(Number(v.slice(0,4)),Number(v.slice(5,7))-1);build()};
  g('#repR20').onclick=()=>{recent(20);build()};
  g('#repStart').onchange=()=>{g('#repMonth').value=''};
  g('#repEnd').onchange=()=>{g('#repMonth').value=''};
  g('#repClose').onclick=()=>{g('#repModal').classList.add('hidden');document.body.classList.remove('modal-open')};
  g('#repModal').onclick=e=>{if(e.target===g('#repModal'))g('#repClose').click()};
  g('#repPrint').onclick=()=>{
    if(!g('#repView').innerHTML){g('#repMsg').textContent='먼저 성적표를 만들어 주세요.';return}
    const sheet=document.createElement('div');sheet.id='reportSheet';sheet.innerHTML=g('#repView').innerHTML;
    document.body.appendChild(sheet);document.body.classList.add('printing');window.print();
    setTimeout(()=>{sheet.remove();document.body.classList.remove('printing')},600);
  };
})();
/* 앤보임 월 성적 넣기 */
(function(){
  const g=x=>document.querySelector(x);
  if(!g('#nvOpen'))return;
  let plan=null;
  const alias={jim0320:'jjm0320'};
  function open(){g('#nvModal').classList.remove('hidden');document.body.classList.add('modal-open');g('#nvOut').innerHTML='';g('#nvSave').disabled=true;plan=null}
  function close(){g('#nvModal').classList.add('hidden');document.body.classList.remove('modal-open');g('#nvText').value='';g('#nvFile').value=''}
  g('#nvOpen').onclick=open;g('#nvClose').onclick=close;
  g('#nvModal').onclick=e=>{if(e.target===g('#nvModal'))close()};
  g('#nvFile').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{g('#nvText').value=String(rd.result||'');g('#nvCheck').click()};rd.readAsText(f,'utf-8')};
  g('#nvCheck').onclick=()=>{
    try{
      const j=JSON.parse(g('#nvText').value);
      if(!j.month||!Array.isArray(j.students))throw new Error('월(month)과 학생 목록(students)이 있는 파일이어야 해요');
      const have=new Set((typeof M!=='undefined'?M:[]).map(m=>String(m.member_id).toLowerCase()));
      const rows=j.students.map(v=>({v,ok:have.has(String(v.id).toLowerCase())||have.has(alias[v.id]||'')}));
      plan={month:j.month,period:j.range||'',rows};
      const okN=rows.filter(r=>r.ok).length,bad=rows.filter(r=>!r.ok);
      g('#nvOut').innerHTML='<p class="bulk-sum"><b>'+esc(j.month)+'</b> · 학생 <b>'+rows.length+'명</b> · 회원과 연결됨 <b class="bulk-ok">'+okN+'</b> · 연결 안 됨 <b class="bulk-bad">'+bad.length+'</b></p>'+(bad.length?'<p class="muted small-note">연결 안 된 아이디: '+esc(bad.map(r=>r.v.id).join(', '))+' (그래도 저장은 돼요. 아이디를 맞추면 성적표에 나타나요.)</p>':'');
      g('#nvSave').disabled=!rows.length;
    }catch(e){plan=null;g('#nvOut').innerHTML='<p class="bulk-bad">읽지 못했어요: '+esc(e.message||e)+'</p>';g('#nvSave').disabled=true}
  };
  g('#nvSave').onclick=async()=>{
    if(!plan)return;
    if(!confirm(plan.month+' 앤보임 월 성적 '+plan.rows.length+'명을 저장할까요? 같은 달에 이미 저장된 내용은 덮어써요.'))return;
    g('#nvSave').disabled=true;g('#nvOut').insertAdjacentHTML('afterbegin','<p class="muted">저장 중...</p>');
    const out=plan.rows.map(({v})=>({member_id:v.id,month:plan.month,lessons:v.n,avg_participation:v.avg,att_great:v.great,att_good:v.good,att_normal:v.normal,teacher:v.teacher,progress:v.progress,words:v.words,comment_ko:v.comment,period:plan.period,updated_at:new Date().toISOString()}));
    const {error}=await s.from('nvoim_monthly').upsert(out,{onConflict:'member_id,month'});
    if(error){g('#nvOut').innerHTML='<p class="bulk-bad">저장하지 못했어요: '+esc(/nvoim_monthly|relation|schema/i.test(error.message||'')?'먼저 안내서의 SQL을 Supabase에서 실행해 주세요. ('+error.message+')':(error.message||error))+'</p>';g('#nvSave').disabled=false;return}
    g('#nvOut').innerHTML='<p class="bulk-ok"><b>저장 완료</b> · '+out.length+'명 · 이제 성적표에 "원어민 수업 결과"가 나와요.</p>';
  };
})();