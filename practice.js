/* 메인교재 미션 안에 교재 음원 고르기 + 듣기와 녹음 동시 진행 */
(function(){
  const pad=n=>String(n).padStart(2,'0');
  const seq=(n,fn)=>Array.from({length:n},(_,i)=>fn(i+1));
  const tracks=(n,w)=>seq(n,i=>[(w||'Track')+' '+i,'t'+pad(i)+'.mp3']);
  const MM=['Reading','Picture Description','Solution · Opinion'],MF=['reading','picture','opinion'];
  const CATALOG={
    /* 아이들: 메인교재 3번 녹음 */
    '메인교재 20번 녹음':[
      ...[1,2,3].map(k=>({name:'Super Easy Reading '+k,dir:'audio/ser-'+k+'/',items:tracks(49)})),
      ...[1,2,3,4].map(k=>({name:'Very Easy Reading '+k,dir:'audio/ver-'+k+'/',items:tracks(49)})),
      ...[1,2,3].map(k=>({name:'School Subject Reading '+k,dir:'audio/ssr-'+k+'/',items:tracks(16)})),
      ...[1,2,3].map(k=>({name:'Reading Shelf '+k,dir:'audio/rs-'+k+'/',items:tracks(40)})),
      {name:'Talking Time 1',dir:'audio/tt-1/',items:[["Unit 1 · Student Book 1","t01.mp3"],["Unit 1 · Student Book 2","t02.mp3"],["Unit 1 · Student Book 3","t03.mp3"],["Unit 1 · Student Book 4","t04.mp3"],["Unit 1 · Student Book 5","t05.mp3"],["Unit 1 · Workbook 1","t06.mp3"],["Unit 2 · Student Book 1","t07.mp3"],["Unit 2 · Student Book 2","t08.mp3"],["Unit 2 · Student Book 3","t09.mp3"],["Unit 2 · Student Book 4","t10.mp3"],["Unit 2 · Student Book 5","t11.mp3"],["Unit 2 · Workbook 1","t12.mp3"],["Unit 3 · Student Book 1","t13.mp3"],["Unit 3 · Student Book 2","t14.mp3"],["Unit 3 · Student Book 3","t15.mp3"],["Unit 3 · Student Book 4","t16.mp3"],["Unit 3 · Student Book 5","t17.mp3"],["Unit 3 · Workbook 1","t18.mp3"],["Unit 4 · Student Book 1","t19.mp3"],["Unit 4 · Student Book 2","t20.mp3"],["Unit 4 · Student Book 3","t21.mp3"],["Unit 4 · Student Book 4","t22.mp3"],["Unit 4 · Student Book 5","t23.mp3"],["Unit 4 · Workbook 1","t24.mp3"],["Unit 5 · Student Book 1","t25.mp3"],["Unit 5 · Student Book 2","t26.mp3"],["Unit 5 · Student Book 3","t27.mp3"],["Unit 5 · Student Book 4","t28.mp3"],["Unit 5 · Student Book 5","t29.mp3"],["Unit 5 · Workbook 1","t30.mp3"],["Unit 6 · Student Book 1","t31.mp3"],["Unit 6 · Student Book 2","t32.mp3"],["Unit 6 · Student Book 3","t33.mp3"],["Unit 6 · Student Book 4","t34.mp3"],["Unit 6 · Student Book 5","t35.mp3"],["Unit 6 · Workbook 1","t36.mp3"],["Unit 7 · Student Book 1","t37.mp3"],["Unit 7 · Student Book 2","t38.mp3"],["Unit 7 · Student Book 3","t39.mp3"],["Unit 7 · Student Book 4","t40.mp3"],["Unit 7 · Student Book 5","t41.mp3"],["Unit 7 · Workbook 1","t42.mp3"],["Unit 8 · Student Book 1","t43.mp3"],["Unit 8 · Student Book 2","t44.mp3"],["Unit 8 · Student Book 3","t45.mp3"],["Unit 8 · Student Book 4","t46.mp3"],["Unit 8 · Student Book 5","t47.mp3"],["Unit 8 · Workbook 1","t48.mp3"],["Unit 9 · Student Book 1","t49.mp3"],["Unit 9 · Student Book 2","t50.mp3"],["Unit 9 · Student Book 3","t51.mp3"],["Unit 9 · Student Book 4","t52.mp3"],["Unit 9 · Student Book 5","t53.mp3"],["Unit 9 · Workbook 1","t54.mp3"],["Unit 10 · Student Book 1","t55.mp3"],["Unit 10 · Student Book 2","t56.mp3"],["Unit 10 · Student Book 3","t57.mp3"],["Unit 10 · Student Book 4","t58.mp3"],["Unit 10 · Student Book 5","t59.mp3"],["Unit 10 · Workbook 1","t60.mp3"],["Unit 11 · Student Book 1","t61.mp3"],["Unit 11 · Student Book 2","t62.mp3"],["Unit 11 · Student Book 3","t63.mp3"],["Unit 11 · Student Book 4","t64.mp3"],["Unit 11 · Student Book 5","t65.mp3"],["Unit 11 · Workbook 1","t66.mp3"],["Unit 12 · Student Book 1","t67.mp3"],["Unit 12 · Student Book 2","t68.mp3"],["Unit 12 · Student Book 3","t69.mp3"],["Unit 12 · Student Book 4","t70.mp3"],["Unit 12 · Student Book 5","t71.mp3"],["Unit 12 · Workbook 1","t72.mp3"],["Ending · Workbook 1","t73.mp3"]]},
      {name:'Talking Time 2',dir:'audio/tt-2/',items:[["Unit 1 · Student Book 1","t01.mp3"],["Unit 1 · Student Book 2","t02.mp3"],["Unit 1 · Student Book 3","t03.mp3"],["Unit 1 · Student Book 4","t04.mp3"],["Unit 1 · Student Book 5","t05.mp3"],["Unit 1 · Workbook 1","t06.mp3"],["Unit 2 · Student Book 1","t07.mp3"],["Unit 2 · Student Book 2","t08.mp3"],["Unit 2 · Student Book 3","t09.mp3"],["Unit 2 · Student Book 4","t10.mp3"],["Unit 2 · Student Book 5","t11.mp3"],["Unit 2 · Workbook 1","t12.mp3"],["Unit 3 · Student Book 1","t13.mp3"],["Unit 3 · Student Book 2","t14.mp3"],["Unit 3 · Student Book 3","t15.mp3"],["Unit 3 · Student Book 4","t16.mp3"],["Unit 3 · Student Book 5","t17.mp3"],["Unit 3 · Workbook 1","t18.mp3"],["Unit 4 · Student Book 1","t19.mp3"],["Unit 4 · Student Book 2","t20.mp3"],["Unit 4 · Student Book 3","t21.mp3"],["Unit 4 · Student Book 4","t22.mp3"],["Unit 4 · Student Book 5","t23.mp3"],["Unit 4 · Workbook 1","t24.mp3"],["Unit 5 · Student Book 1","t25.mp3"],["Unit 5 · Student Book 2","t26.mp3"],["Unit 5 · Student Book 3","t27.mp3"],["Unit 5 · Student Book 4","t28.mp3"],["Unit 5 · Student Book 5","t29.mp3"],["Unit 5 · Workbook 1","t30.mp3"],["Unit 6 · Student Book 1","t31.mp3"],["Unit 6 · Student Book 2","t32.mp3"],["Unit 6 · Student Book 3","t33.mp3"],["Unit 6 · Student Book 4","t34.mp3"],["Unit 6 · Student Book 5","t35.mp3"],["Unit 6 · Workbook 1","t36.mp3"],["Unit 7 · Student Book 1","t37.mp3"],["Unit 7 · Student Book 2","t38.mp3"],["Unit 7 · Student Book 3","t39.mp3"],["Unit 7 · Student Book 4","t40.mp3"],["Unit 7 · Student Book 5","t41.mp3"],["Unit 7 · Workbook 1","t42.mp3"],["Unit 8 · Student Book 1","t43.mp3"],["Unit 8 · Student Book 2","t44.mp3"],["Unit 8 · Student Book 3","t45.mp3"],["Unit 8 · Student Book 4","t46.mp3"],["Unit 8 · Student Book 5","t47.mp3"],["Unit 8 · Workbook 1","t48.mp3"],["Unit 9 · Student Book 1","t49.mp3"],["Unit 9 · Student Book 2","t50.mp3"],["Unit 9 · Student Book 3","t51.mp3"],["Unit 9 · Student Book 4","t52.mp3"],["Unit 9 · Student Book 5","t53.mp3"],["Unit 9 · Workbook 1","t54.mp3"],["Unit 10 · Student Book 1","t55.mp3"],["Unit 10 · Student Book 2","t56.mp3"],["Unit 10 · Student Book 3","t57.mp3"],["Unit 10 · Student Book 4","t58.mp3"],["Unit 10 · Student Book 5","t59.mp3"],["Unit 10 · Workbook 1","t60.mp3"],["Unit 11 · Student Book 1","t61.mp3"],["Unit 11 · Student Book 2","t62.mp3"],["Unit 11 · Student Book 3","t63.mp3"],["Unit 11 · Student Book 4","t64.mp3"],["Unit 11 · Student Book 5","t65.mp3"],["Unit 11 · Workbook 1","t66.mp3"],["Unit 12 · Student Book 1","t67.mp3"],["Unit 12 · Student Book 2","t68.mp3"],["Unit 12 · Student Book 3","t69.mp3"],["Unit 12 · Student Book 4","t70.mp3"],["Unit 12 · Student Book 5","t71.mp3"],["Unit 12 · Workbook 1","t72.mp3"]]},
      {name:'Talking Time 3',dir:'audio/tt-3/',items:[["Unit 1 · Student Book 1","t01.mp3"],["Unit 1 · Student Book 2","t02.mp3"],["Unit 1 · Student Book 3","t03.mp3"],["Unit 1 · Student Book 4","t04.mp3"],["Unit 1 · Student Book 5","t05.mp3"],["Unit 1 · Workbook 1","t06.mp3"],["Unit 2 · Student Book 1","t07.mp3"],["Unit 2 · Student Book 2","t08.mp3"],["Unit 2 · Student Book 3","t09.mp3"],["Unit 2 · Student Book 4","t10.mp3"],["Unit 2 · Student Book 5","t11.mp3"],["Unit 2 · Workbook 1","t12.mp3"],["Unit 3 · Student Book 1","t13.mp3"],["Unit 3 · Student Book 2","t14.mp3"],["Unit 3 · Student Book 3","t15.mp3"],["Unit 3 · Student Book 4","t16.mp3"],["Unit 3 · Student Book 5","t17.mp3"],["Unit 3 · Workbook 1","t18.mp3"],["Unit 4 · Student Book 1","t19.mp3"],["Unit 4 · Student Book 2","t20.mp3"],["Unit 4 · Student Book 3","t21.mp3"],["Unit 4 · Student Book 4","t22.mp3"],["Unit 4 · Student Book 5","t23.mp3"],["Unit 4 · Workbook 1","t24.mp3"],["Unit 5 · Student Book 1","t25.mp3"],["Unit 5 · Student Book 2","t26.mp3"],["Unit 5 · Student Book 3","t27.mp3"],["Unit 5 · Student Book 4","t28.mp3"],["Unit 5 · Student Book 5","t29.mp3"],["Unit 5 · Workbook 1","t30.mp3"],["Unit 6 · Student Book 1","t31.mp3"],["Unit 6 · Student Book 2","t32.mp3"],["Unit 6 · Student Book 3","t33.mp3"],["Unit 6 · Student Book 4","t34.mp3"],["Unit 6 · Student Book 5","t35.mp3"],["Unit 6 · Workbook 1","t36.mp3"],["Unit 7 · Student Book 1","t37.mp3"],["Unit 7 · Student Book 2","t38.mp3"],["Unit 7 · Student Book 3","t39.mp3"],["Unit 7 · Student Book 4","t40.mp3"],["Unit 7 · Student Book 5","t41.mp3"],["Unit 7 · Workbook 1","t42.mp3"],["Unit 8 · Student Book 1","t43.mp3"],["Unit 8 · Student Book 2","t44.mp3"],["Unit 8 · Student Book 3","t45.mp3"],["Unit 8 · Student Book 4","t46.mp3"],["Unit 8 · Student Book 5","t47.mp3"],["Unit 8 · Workbook 1","t48.mp3"],["Unit 9 · Student Book 1","t49.mp3"],["Unit 9 · Student Book 2","t50.mp3"],["Unit 9 · Student Book 3","t51.mp3"],["Unit 9 · Student Book 4","t52.mp3"],["Unit 9 · Student Book 5","t53.mp3"],["Unit 9 · Workbook 1","t54.mp3"],["Unit 10 · Student Book 1","t55.mp3"],["Unit 10 · Student Book 2","t56.mp3"],["Unit 10 · Student Book 3","t57.mp3"],["Unit 10 · Student Book 4","t58.mp3"],["Unit 10 · Student Book 5","t59.mp3"],["Unit 10 · Workbook 1","t60.mp3"],["Unit 11 · Student Book 1","t61.mp3"],["Unit 11 · Student Book 2","t62.mp3"],["Unit 11 · Student Book 3","t63.mp3"],["Unit 11 · Student Book 4","t64.mp3"],["Unit 11 · Student Book 5","t65.mp3"],["Unit 11 · Workbook 1","t66.mp3"],["Unit 12 · Student Book 1","t67.mp3"],["Unit 12 · Student Book 2","t68.mp3"],["Unit 12 · Student Book 3","t69.mp3"],["Unit 12 · Student Book 4","t70.mp3"],["Unit 12 · Student Book 5","t71.mp3"],["Unit 12 · Workbook 1","t72.mp3"]]}
    ],
    /* 성인: 메인교재 20분 말하기 */
    '메인교재 20분 말하기':[
      ...[['','momentum-b'],[' 2','momentum-b2'],[' 3','momentum-b3']].map(a=>({name:'Momentum B'+(a[0]||' 1'),dir:'audio/'+a[1]+'/',items:seq(20,u=>MM.map((n,k)=>['Unit '+u+' · '+n,'u'+pad(u)+'-'+MF[k]+'.mp3'])).flat()})),
      {name:'ICanTalk (아이캠톡) 5회 쉐도잉',dir:'audio/icantalk/',items:seq(20,u=>['Unit '+u+' · 문장마다 5번 반복','u'+pad(u)+'.mp3'])},
      {name:'Toeic Speaking Beginner',dir:'audio/toeic-sb/',items:seq(40,u=>['Unit '+u+' · Reading Practice','u'+pad(u)+'.mp3'])},
      ...[3,4,5,6,7,8].map(l=>({name:'Topic Talk Level '+l,dir:'audio/topic-'+l+'/',items:seq(60,u=>['Unit '+u,'u'+pad(u)+'.mp3'])}))
    ]
  };

  /* 녹음을 시작하면 음원도 같이 재생, 음원이 끝나면 녹음도 종료 */
  function syncPlayback(audio,btns,next){
    const start=btns[0],stop=btns[1];
    if(!start||!stop)return;
    start.addEventListener('click',()=>{
      let tries=0;
      const wait=setInterval(()=>{
        if(!stop.disabled){clearInterval(wait);audio.currentTime=0;audio.play().catch(()=>{})}
        else if(++tries>50)clearInterval(wait);
      },100);
    });
    audio.addEventListener('ended',()=>{if(next&&!stop.disabled&&next()){audio.play().catch(()=>{});return}setTimeout(()=>{if(!stop.disabled)stop.click()},1200)});
    stop.addEventListener('click',()=>audio.pause());
  }

  /* 시리즈별 색: 같은 시리즈는 같은 색 */
  function bookColor(n){
    if(/^Super Easy/.test(n))return '#2f6fdb';
    if(/^Very Easy/.test(n))return '#1f9d68';
    if(/^School Subject/.test(n))return '#e08a1e';
    if(/^Reading Shelf/.test(n))return '#8a4fd0';
    if(/^Talking Time/.test(n))return '#d6455d';
    if(/^Momentum/.test(n))return '#0f8f9e';
    if(/^ICanTalk/.test(n))return '#be185d';
    if(/^Toeic/.test(n))return '#c2410c';
    if(/^Topic Talk/.test(n))return '#4f46e5';
    return '#0c1b33';
  }

  function opt(list,sel){return list.map((t,i)=>'<option value="'+i+'">'+t+'</option>').join('')}

  /* 원서: 웅진 빅박스(앤보임 플레이그라운드)를 새 창으로 열어 주는 버튼 */
  /* 아이폰·아이패드: 앱스토어의 웅진빅박스(설치되어 있으면 '열기'), 안드로이드: 앱 바로 실행(없으면 스토어), 그 외: 앤보임 빅박스 페이지 */
  const isIos=()=>{const ua=navigator.userAgent||'';return /iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)};
  const isAndroid=()=>/Android/.test(navigator.userAgent||'');
  const appUrl=(ios,pkg,web)=>isIos()?ios:isAndroid()?'intent://#Intent;package='+pkg+';S.browser_fallback_url='+encodeURIComponent('https://play.google.com/store/apps/details?id='+pkg)+';end':web;
  const BIGBOX=appUrl('https://apps.apple.com/kr/app/id1195456423','woongjin.co.kr.bigbox','https://www.nvoim.com/NP/nvecacademy/Playground/bigbox.asp');
  const TALKIT=appUrl('https://apps.apple.com/app/id1538128263','woongjin.co.kr.studybooster','https://play.google.com/store/apps/details?id=woongjin.co.kr.studybooster');
  const LINKS={
    '어휘녹음 + 원서듣기':{url:BIGBOX,label:'📚 웅진 빅박스 앱 열기',note:'빅박스 앱에서 원서를 들은 뒤, 이 화면으로 돌아와 책 제목을 쓰고 어휘를 녹음해요.',title:'📖 오늘 읽은 책 제목을 써 주세요'},
    '웅진빅박스 리딩오션 원서책 3번 녹음':{url:BIGBOX,label:'📚 웅진 빅박스 앱 열기',note:'빅박스 앱에서 리딩오션 원서를 듣고 읽은 뒤, 이 화면으로 돌아와 3번 녹음하고 책 제목을 채워 주세요.',title:'📖 오늘 읽은 책 제목을 써 주세요'},
    '메인교재 20분 말하기':{url:TALKIT,label:'🎧 Talkit 앱 열기 (EEA)',note:'Talkit 앱에서 들어도 되고, 녹음은 이 화면에서 해요.'}
  };

  function addLink(article,info){
    if(article.dataset.link)return;
    const tools=article.querySelector('.record-tools');if(!tools)return;
    article.dataset.link='1';
    const box=document.createElement('div');box.className='textbook-pick';
    box.innerHTML='<p class="pick-note">'+info.note+'</p><a class="open-link" href="'+info.url+'" target="_blank" rel="noopener">'+info.label+'</a>';
    if(info.title){const ti=document.createElement('input');ti.type='text';ti.className='book-title-input';ti.maxLength=100;ti.placeholder=info.title;ti.autocomplete='off';box.appendChild(ti)}
    const h=article.querySelector('h3');h?h.after(box):tools.parentNode.insertBefore(box,tools);
  }

  /* 눈에 띄는 녹음 규칙 안내 상자 */
  const RULES={
    '메인교재 20번 녹음':'<b>📌 오늘의 녹음 방법</b>'
      +'<div class="rule-row"><em>1</em><span><strong>Unit 1부터 배운 과</strong>는 <u>1번씩만</u><br>직청직독 (듣으면서 동시에 녹음)</span></div>'
      +'<div class="rule-row hot"><em>3</em><span><strong>지금 배우는 마지막 Unit 2개</strong>는 <u>각각 3번씩</u><br>직청직독 (듣으면서 동시에 녹음)</span></div>',
    '메인교재 20분 말하기':'<b>📌 오늘의 녹음 방법</b>'
      +'<div class="rule-row hot"><em class="wide">20분</em><span><strong>메인교재 문장 30번 녹음하기</strong><br>총 <u>20분</u></span></div>'
      +'<div class="rule-row"><em>🎧</em><span><strong>직청직독</strong><br>녹음을 누르고 들으면서 <u>동시에 녹음</u>합니다.</span></div>',
    '메인교재 단어 녹음':'<b>📌 오늘의 녹음 방법</b>'
      +'<div class="rule-row hot"><em class="wide">3~5</em><span><strong>Unit 1 단어부터 배운 Unit까지</strong><br>단어노트를 보고 <u>3~5번씩</u> 소리 내어 녹음</span></div>'
  };
  function ruleBox(article){
    const t=article.querySelector('h3');
    const html=t&&RULES[t.textContent.trim()];
    if(!html||article.dataset.rule)return;
    article.dataset.rule='1';
    const p=article.querySelector('p');
    const goal=article.querySelector('.rec-goal');if(goal)goal.remove();
    const box=document.createElement('div');box.className='rule-box';box.innerHTML=html;
    if(p)p.replaceWith(box);else article.insertBefore(box,article.querySelector('.mission-progress'));
  }

  function decorate(article){
    ruleBox(article);
    const gt=article.querySelector('h3');
    if(gt&&gt.textContent.trim()==='웅진빅박스 리딩오션 원서책 3번 녹음'){const g=article.querySelector('.rec-goal');if(g)g.textContent='원서책 한 문장 × 3번씩 녹음합니다.'}
    if(gt&&gt.textContent.trim()==='NVOCA 3번 녹음'){const g=article.querySelector('.rec-goal');if(g)g.textContent='한 단어 영어 + 뜻 동시에 3번씩 녹음합니다.'}
    const t=article.querySelector('h3');
    if(t&&LINKS[t.textContent.trim()])addLink(article,LINKS[t.textContent.trim()]);
    if(article.dataset.picker)return;
    const title=article.querySelector('h3');
    const books=title&&CATALOG[title.textContent.trim()];
    if(!books)return;
    const tools=article.querySelector('.record-tools');if(!tools)return;
    article.dataset.picker='1';
    const box=document.createElement('div');box.className='textbook-pick';
    box.innerHTML='<p class="pick-note">🎧 이어폰을 끼고, 책을 펴서 음원을 들으며 따라 읽어요.</p>'
      +'<select class="pick-book">'+opt(books.map(b=>b.name))+'</select>'
      +'<select class="pick-track"></select>'
      +'<audio controls preload="none" class="recording-player"></audio>';
    tools.parentNode.insertBefore(box,tools);
    const sBook=box.querySelector('.pick-book'),sTrack=box.querySelector('.pick-track'),audio=box.querySelector('audio');
    const apply=()=>{const b=books[sBook.value],it=b.items[sTrack.value];audio.pause();audio.src=b.dir+it[1]};
    const fillTracks=()=>{sTrack.innerHTML=opt(books[sBook.value].items.map(i=>i[0]));apply()};
    /* 교재를 색깔 버튼으로 고르기 (갤럭시탭에서도 색이 보이도록 메뉴 대신 버튼) */
    const chips=document.createElement('div');chips.className='book-chips';
    books.forEach((bk,i)=>{
      const c=document.createElement('button');c.type='button';c.className='book-chip';c.textContent=bk.name;
      c.style.setProperty('--bk',bookColor(bk.name));
      if(i===0||(!(/^Toeic/.test(bk.name)&&/^ICanTalk/.test(books[i-1].name))&&bk.name.replace(/\s*\d+$/,'')!==books[i-1].name.replace(/\s*\d+$/,'')))c.classList.add('first');
      c.onclick=()=>{sBook.value=i;fillTracks();sync()};chips.appendChild(c);
    });
    const sync=()=>chips.querySelectorAll('.book-chip').forEach((c,i)=>c.classList.toggle('on',String(i)===sBook.value));
    sBook.style.display='none';box.insertBefore(chips,sBook);
    sBook.onchange=()=>{fillTracks();sync()};sTrack.onchange=apply;fillTracks();sync();
    const longRec=title.textContent.trim()==='메인교재 20분 말하기';
    syncPlayback(audio,tools.querySelectorAll('button'),longRec?()=>{const n=Number(sTrack.value)+1;if(n>=sTrack.options.length)return false;sTrack.value=n;apply();return true}:null);
  }

  function scan(){document.querySelectorAll('#missions .mission').forEach(decorate)}
  const mo=new MutationObserver(scan);
  const box=document.querySelector('#missions');if(box)mo.observe(box,{childList:true});
})();
