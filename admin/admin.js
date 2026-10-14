const c=window.NVEC_CONFIG,s=supabase.createClient(c.supabaseUrl,c.supabasePublishableKey),$=x=>document.querySelector(x);let M=[],R=[],editMode='create';function esc(v){return String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}function view(ok){$('#login').classList.toggle('hidden',ok);$('#recovery').classList.add('hidden');$('#dash').classList.toggle('hidden',!ok);$('#logoutBtn').classList.toggle('hidden',!ok)}function recoveryView(){$('#login').classList.add('hidden');$('#dash').classList.add('hidden');$('#recovery').classList.remove('hidden');$('#logoutBtn').classList.add('hidden')}async function admin(u){const {data}=await s.from('members').select('role,is_active').eq('id',u.id).single();return data?.role==='admin'&&data?.is_active}async function invoke(body){const {data,error}=await s.functions.invoke('nvec-member-admin',{body});if(error){let detail='';try{const response=error.context;if(response&&typeof response.json==='function'){const body=await response.json();detail=body?.error||body?.message||JSON.stringify(body)}}catch(_){}throw new Error(detail||error.message||'회원관리 함수 호출 실패')}if(!data?.ok)throw new Error(data?.error||'처리하지 못했습니다.');return data}$('#form').onsubmit=async e=>{e.preventDefault();$('#msg').textContent='로그인 중...';const {data,error}=await s.auth.signInWithPassword({email:'rke8096@naver.com',password:$('#pw').value});if(error||!data.user||!(await admin(data.user))){$('#msg').textContent='관리자 정보를 확인해 주세요.';await s.auth.signOut();return}$('#msg').textContent='';view(true);load()};$('#logoutBtn').onclick=async()=>{await s.auth.signOut();view(false)};$('#recoveryForm').onsubmit=async e=>{e.preventDefault();const a=$('#newPw').value,b=$('#newPw2').value,m=$('#recoveryMsg');if(a!==b){m.textContent='비밀번호가 서로 다릅니다.';return}if(a.length<8){m.textContent='비밀번호는 8자 이상으로 설정해 주세요.';return}m.textContent='변경 중...';const {error}=await s.auth.updateUser({password:a});if(error){m.textContent='변경 오류: '+error.message;return}m.style.color='#18794e';m.textContent='비밀번호가 변경되었습니다.';setTimeout(()=>{view(true);load()},700)};function day(n=0){let d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-n);return d}async function load(){const a=await s.from('members').select('id,member_id,name,role,is_active').order('name'),b=await s.from('learning_records').select('user_id,course,mission,record_type,audio_path,repetition,completed_at').order('completed_at',{ascending:false}).limit(5000);if(a.error||b.error){$('#rows').innerHTML='<tr><td colspan="9">조회 오류: '+esc((a.error||b.error).message)+'</td></tr>';return}M=(a.data||[]).filter(x=>x.role!=='admin');R=b.data||[];render();showUsage()}async function showUsage(){const el=$('#usage');if(!el)return;try{const {data,error}=await s.functions.invoke('swift-processor',{body:{action:'usage'}});if(error||!data||!data.ok){el.textContent='';return}const mb=data.total_bytes/1048576;el.textContent='보관함 사용량 '+mb.toFixed(1)+'MB / 1,000MB · 녹음 '+data.file_count+'개 · '+(mb>=800?'곧 오래된 녹음부터 정리됩니다':'800MB가 넘으면 오래된 녹음부터 정리됩니다')}catch(_){el.textContent=''}}const HW={adult:[{k:'듣기',n:'메인교재 30번 듣기',t:30,listen:true},{k:'말하기',n:'메인교재 30번 말하기',t:30},{k:'교정',n:'교정문장 10번 녹음하기',t:10}],teen:[{k:'본문',n:'메인교재 5번 녹음',t:5},{k:'단어',n:'메인교재 단어 5번 녹음',t:5},{k:'원서',n:'원서 5번 녹음',t:5},{k:'NVOCA',n:'NVOCA 5번 녹음',t:5}]};function hw(tr,last){const course=(tr[0]||last||{}).course,L=HW[course];if(!L)return '<span class="hw-none">-</span>';let sum=0,tot=0,chips='';L.forEach(x=>{const rows=tr.filter(r=>r.course===course&&r.mission===x.n),c=x.listen?Math.max(rows.length,0,...rows.map(r=>Number(r.repetition)||0)):rows.filter(r=>r.record_type==='recording').length,ok=c>=x.t;sum+=Math.min(c,x.t);tot+=x.t;chips+='<span class="hw '+(ok?'ok':c>0?'part':'no')+'" title="'+esc(x.n)+' '+Math.min(c,x.t)+'/'+x.t+'">'+x.k+' '+(ok?'O':'X')+'</span>'});return '<b class="hw-pct">'+Math.round(sum/tot*100)+'%</b><div class="hw-chips">'+chips+'</div>'}function render(){const q=$('#search').value.trim().toLowerCase(),only=$('#active').checked,t=day(),t3=day(3),L=M.filter(m=>(!only||m.is_active)&&(!q||m.member_id.toLowerCase().includes(q)||m.name.toLowerCase().includes(q)));let n=0,o=0;$('#rows').innerHTML=L.map((m,i)=>{const rr=R.filter(r=>r.user_id===m.id),tr=rr.filter(r=>new Date(r.completed_at)>=t),last=rr[0],rec=rr.filter(r=>r.audio_path).length;if(tr.length)n++;if(!last||new Date(last.completed_at)<t3)o++;return '<tr><td style="color:#737986;font-weight:800">'+(i+1)+'</td><td><button class="member-link" data-id="'+m.id+'">'+esc(m.member_id)+'</button></td><td>'+esc(m.name)+'</td><td>'+(tr.length?'학습 '+tr.length+'건':'미학습')+'</td><td>'+hw(tr,last)+'</td><td>'+(last?new Date(last.completed_at).toLocaleString('ko-KR'):'기록 없음')+'</td><td><button class="listen-link" data-id="'+m.id+'">'+rec+'개 듣기</button></td><td>'+(m.is_active?'활동':'비활성')+'</td><td><button class="edit-link" data-id="'+m.id+'">수정</button></td></tr>'}).join('')||'<tr><td colspan="9">회원이 없습니다.</td></tr>';$('#total').textContent=M.filter(m=>m.is_active).length;$('#today').textContent=n;$('#miss').textContent=Math.max(0,L.filter(m=>m.is_active).length-n);$('#old').textContent=o;document.querySelectorAll('.member-link,.listen-link').forEach(b=>b.onclick=()=>detail(b.dataset.id,b.classList.contains('listen-link')));document.querySelectorAll('.edit-link').forEach(b=>b.onclick=()=>openEdit(b.dataset.id))}function openModal(){ $('#memberModal').classList.remove('hidden');$('#memberMsg').textContent='';document.body.classList.add('modal-open')}function closeModal(){$('#memberModal').classList.add('hidden');document.body.classList.remove('modal-open')}$('#addMember').onclick=()=>{editMode='create';$('#modalTitle').textContent='회원 추가';$('#editUserId').value='';$('#editName').value='';$('#editMemberId').value='';$('#editPassword').value='';$('#activeLabel').classList.add('hidden');$('#resetPassword').classList.add('hidden');openModal()};function openEdit(id){const m=M.find(x=>x.id===id);if(!m)return;editMode='update';$('#modalTitle').textContent='회원 수정';$('#editUserId').value=m.id;$('#editName').value=m.name;$('#editMemberId').value=m.member_id;$('#editPassword').value='';$('#editActive').checked=!!m.is_active;$('#activeLabel').classList.remove('hidden');$('#resetPassword').classList.remove('hidden');openModal()}$('#modalClose').onclick=closeModal;$('#memberModal').onclick=e=>{if(e.target===$('#memberModal'))closeModal()};$('#saveMember').onclick=async()=>{const msg=$('#memberMsg'),name=$('#editName').value.trim(),member_id=$('#editMemberId').value.trim(),password=$('#editPassword').value.trim();if(!name||!member_id){msg.textContent='이름과 회원 ID를 입력해 주세요.';return}msg.textContent='저장 중...';$('#saveMember').disabled=true;try{if(editMode==='create')await invoke({action:'create',name,member_id,password:password||member_id+'$'});else await invoke({action:'update',user_id:$('#editUserId').value,name,member_id,is_active:$('#editActive').checked});msg.style.color='#18794e';msg.textContent=editMode==='create'?'회원이 추가되었습니다.':'회원정보가 수정되었습니다.';await load();setTimeout(closeModal,500)}catch(e){msg.style.color='#b23b3b';msg.textContent='오류: '+e.message}finally{$('#saveMember').disabled=false}};$('#resetPassword').onclick=async()=>{const msg=$('#memberMsg'),member_id=$('#editMemberId').value.trim(),pw=$('#editPassword').value.trim()||member_id+'$';if(!confirm('비밀번호를 '+pw+' 로 변경할까요?'))return;msg.textContent='비밀번호 변경 중...';try{await invoke({action:'password',user_id:$('#editUserId').value,password:pw});msg.style.color='#18794e';msg.textContent='비밀번호가 변경되었습니다.'}catch(e){msg.style.color='#b23b3b';msg.textContent='오류: '+e.message}};async function detail(id,only){const m=M.find(x=>x.id===id),rr=R.filter(r=>r.user_id===id);let h='';for(const r of rr.slice(0,50)){const expired=r.record_type==='recording'&&!r.audio_path;if(only&&!r.audio_path&&!expired)continue;let a=expired?'<span class="hw-none">보관 기간 지남 (정리됨)</span>':'';if(r.audio_path){const {data}=await s.storage.from('recordings').createSignedUrl(r.audio_path,3600);if(data?.signedUrl){const fn=m.member_id+'_'+new Date(r.completed_at).toISOString().slice(0,10)+'_'+r.audio_path.split('/').pop(),dl=data.signedUrl+(data.signedUrl.includes('?')?'&':'?')+'download='+encodeURIComponent(fn);a='<div class="aud"><audio controls src="'+data.signedUrl+'"></audio><a class="dl-btn" href="'+dl+'" download>내려받기</a></div>'}}h+='<div class="timeline-item"><b>'+new Date(r.completed_at).toLocaleString('ko-KR')+'</b><span>'+esc(r.mission)+'</span>'+a+'</div>'}const d=$('#detail');d.innerHTML='<button id="close" class="detail-close">닫기 ×</button><h3>'+esc(m.member_id)+' · '+esc(m.name)+'</h3><div class="timeline">'+(h||'기록이 없습니다.')+'</div>';d.classList.remove('hidden');$('#close').onclick=()=>d.classList.add('hidden');d.scrollIntoView({behavior:'smooth'})}$('#search').oninput=render;$('#active').onchange=render;$('#refresh').onclick=load;s.auth.onAuthStateChange(async(event,session)=>{if(event==='PASSWORD_RECOVERY'&&session)recoveryView()});(async()=>{const hash=location.hash||'',isRecovery=hash.includes('type=recovery');const {data:{session}}=await s.auth.getSession();if(isRecovery&&session){recoveryView();return}if(session&&await admin(session.user)){view(true);load()}else if(session)await s.auth.signOut()})();
const NVEC_INITIAL_MEMBERS=[{"name":"황금빛","member_id":"gold0000"},{"name":"황금별","member_id":"star0000"},{"name":"최유정","member_id":"lena0803"},{"name":"조아름","member_id":"sia0627"},{"name":"조승호","member_id":"victor0206"},{"name":"조수민","member_id":"joy4867"},{"name":"정세리","member_id":"serena0618"},{"name":"정명준","member_id":"jmj0507"},{"name":"정규태","member_id":"maroo1099"},{"name":"전호진","member_id":"leo0309"},{"name":"전하윤","member_id":"bunny0725"},{"name":"장하은","member_id":"priti1114"},{"name":"장용국","member_id":"ronan1027"},{"name":"임태경","member_id":"lucy1124"},{"name":"임진혁","member_id":"jay0716"},{"name":"임승범","member_id":"beom0324"},{"name":"이채빈","member_id":"luna0717"},{"name":"이진","member_id":"jin0424"},{"name":"이홍희","member_id":"hans0419"},{"name":"이연재","member_id":"lyj0109"},{"name":"이시윤","member_id":"ethan0418"},{"name":"이승윤","member_id":"kevin0502"},{"name":"이승민","member_id":"sky0304"},{"name":"이수연","member_id":"elena0805"},{"name":"이소하","member_id":"soha0618"},{"name":"이서준","member_id":"sj0000"},{"name":"이상호","member_id":"evan0619"},{"name":"이규선","member_id":"sean0208"},{"name":"윤인탁","member_id":"max2015"},{"name":"윤서연","member_id":"bella2015"},{"name":"윤범돈","member_id":"david1017"},{"name":"유찬","member_id":"kai0919"},{"name":"우민지","member_id":"lynn1017"},{"name":"안채아","member_id":"angela0317"},{"name":"신예은","member_id":"ann0403"},{"name":"신수빈","member_id":"subin0503"},{"name":"서주원","member_id":"juwon0702"},{"name":"보충보충보충","member_id":"len1009"},{"name":"백시윤","member_id":"emily1006"},{"name":"배정우","member_id":"victor0819"},{"name":"배수지","member_id":"suzy1001"},{"name":"박태은","member_id":"tay0523"},{"name":"박현준","member_id":"lucas0423"},{"name":"박솔희","member_id":"sol0225"},{"name":"박리연","member_id":"iyeon0816"},{"name":"박기원","member_id":"kai0908"},{"name":"박가은","member_id":"gaia0601"},{"name":"류지환","member_id":"wyatt0826"},{"name":"김하람","member_id":"kabin0624"},{"name":"김유민","member_id":"sophia1008"},{"name":"김유균","member_id":"yk1108"},{"name":"김수아","member_id":"jenny0714"},{"name":"김세은","member_id":"sen0309"},{"name":"김범준","member_id":"freya0309"},{"name":"김민채","member_id":"ella0914"},{"name":"김리아","member_id":"eille1030"},{"name":"김동찬","member_id":"jjm0320"},{"name":"김도윤","member_id":"henrry1208"},{"name":"김나율","member_id":"aria0425"},{"name":"강영준","member_id":"jun0904"}];
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
