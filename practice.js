/* 메인교재 미션 안에 교재 음원 고르기 + 듣기와 녹음 동시 진행 */
(function(){
  const pad=n=>String(n).padStart(2,'0');
  const seq=(n,fn)=>Array.from({length:n},(_,i)=>fn(i+1));
  const tracks=(n,w)=>seq(n,i=>[(w||'Track')+' '+i,'t'+pad(i)+'.mp3']);
  const MM=['Reading','Picture Description','Solution · Opinion'],MF=['reading','picture','opinion'];
  const CATALOG={
    /* 아이들: 메인교재 3번 녹음 */
    '메인교재 3번 녹음':[
      ...[1,2,3].map(k=>({name:'Super Easy Reading '+k,dir:'audio/ser-'+k+'/',items:tracks(49)})),
      ...[1,2,3,4].map(k=>({name:'Very Easy Reading '+k,dir:'audio/ver-'+k+'/',items:tracks(49)})),
      ...[1,2,3].map(k=>({name:'School Subject Reading '+k,dir:'audio/ssr-'+k+'/',items:tracks(16)})),
      ...[1,2,3].map(k=>({name:'Reading Shelf '+k,dir:'audio/rs-'+k+'/',items:tracks(40)}))
    ],
    '메인교재 단어 3번 녹음':[
      ...[1,2,3].map(k=>({name:'Reading Shelf '+k+' 단어',dir:'audio/rsw-'+k+'/',items:tracks(20,'Unit')}))
    ],
    /* 성인: 메인교재 30번 말하기 */
    '메인교재 30번 말하기':[
      {name:'Momentum B',dir:'audio/momentum-b/',items:seq(20,u=>MM.map((n,k)=>['Unit '+u+' · '+n,'u'+pad(u)+'-'+MF[k]+'.mp3'])).flat()}
    ]
  };

  /* 녹음을 시작하면 음원도 같이 재생, 음원이 끝나면 녹음도 종료 */
  function syncPlayback(audio,btns){
    const start=btns[0],stop=btns[1];
    if(!start||!stop)return;
    start.addEventListener('click',()=>{
      let tries=0;
      const wait=setInterval(()=>{
        if(!stop.disabled){clearInterval(wait);audio.currentTime=0;audio.play().catch(()=>{})}
        else if(++tries>50)clearInterval(wait);
      },100);
    });
    audio.addEventListener('ended',()=>{setTimeout(()=>{if(!stop.disabled)stop.click()},1200)});
    stop.addEventListener('click',()=>audio.pause());
  }

  function opt(list,sel){return list.map((t,i)=>'<option value="'+i+'">'+t+'</option>').join('')}

  /* 원서: 웅진 빅박스(앤보임 플레이그라운드)를 새 창으로 열어 주는 버튼 */
  /* 아이폰·아이패드: 앱스토어의 웅진빅박스(설치되어 있으면 '열기'), 안드로이드: 앱 바로 실행(없으면 스토어), 그 외: 앤보임 빅박스 페이지 */
  const BIGBOX_WEB='https://www.nvoim.com/NP/nvecacademy/Playground/bigbox.asp';
  const BIGBOX_IOS='https://apps.apple.com/kr/app/id1195456423';
  const BIGBOX_ANDROID='intent://#Intent;package=woongjin.co.kr.bigbox;S.browser_fallback_url='+encodeURIComponent('https://play.google.com/store/apps/details?id=woongjin.co.kr.bigbox')+';end';
  function bigboxUrl(){
    const ua=navigator.userAgent||'';
    if(/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1))return BIGBOX_IOS;
    if(/Android/.test(ua))return BIGBOX_ANDROID;
    return BIGBOX_WEB;
  }
  const LINKS={'원서 3번 녹음':{url:bigboxUrl(),label:'📚 웅진 빅박스 앱 열기',note:'빅박스 앱에서 원서(Reading Oceans)를 들은 뒤, 이 화면으로 돌아와 녹음해요.'}};

  function addLink(article,info){
    if(article.dataset.link)return;
    const tools=article.querySelector('.record-tools');if(!tools)return;
    article.dataset.link='1';
    const box=document.createElement('div');box.className='textbook-pick';
    box.innerHTML='<p class="pick-note">'+info.note+'</p><a class="open-link" href="'+info.url+'" target="_blank" rel="noopener">'+info.label+'</a>';
    tools.parentNode.insertBefore(box,tools);
  }

  function decorate(article){
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
    sBook.onchange=fillTracks;sTrack.onchange=apply;fillTracks();
    syncPlayback(audio,tools.querySelectorAll('button'));
  }

  function scan(){document.querySelectorAll('#missions .mission').forEach(decorate)}
  const mo=new MutationObserver(scan);
  const box=document.querySelector('#missions');if(box)mo.observe(box,{childList:true});
})();
