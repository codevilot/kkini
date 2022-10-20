import createElement from '../utils/createElement.js';
import route from '../utils/route.js';
import render from '../utils/render.js';
import { db } from '../utils/firebase.js';
import Nav from './nav.js';

const Home = async () => {
  const homeBody = createElement(`
    ${Nav()}
    <div id="home"></div>
  `);

  const loginedEmail = localStorage.getItem('username');
  const username = loginedEmail.split('@')[0];

  const getUserVoteList = async () => {
    const docs = await db.collection('votes').orderBy('timestamp', 'desc').where('owner', '==', loginedEmail).get();

    let vote = [];
    docs.forEach(doc => {
      vote = [...vote, doc.data()];
    });
    return vote;
  };

  const isVoting = deadline => {
    const date = new Date().getTime();
    const voteDate = new Date(deadline).getTime();

    return voteDate > date;
  };

  // prettier-ignore
  const fetchUserVoteList = voteItems => `
    <div class="member-title">${username}님의 투표 목록
     <a href="/add" class="add-vote"><img src="../src/plus.png"/></a>
   </div>
    <div class="vote-list-container">
       ${
        voteItems.length<1? 
        `<div class="empty">투표 목록을 추가해주세요</div>`
        :
        voteItems.map(({ id, title, deadline, stores }) => {
          if(stores.length<1){
            db.collection('votes').doc(id).delete(); 
            return ``}
          else return `
        <div class="card" id="${id}">
          <button class ="delete-vote">⨉</button>
          <div class="vote-name">
            ${title}
            <input class="copy-value" value="${window.location.origin}${isVoting(deadline) ? `/voting/:${id}` : `/voted/:${id}`}"/>
            <button class="vote-link">링크공유</button>
          </div>
          <div class="vote-date">${deadline}</div>
          <div class="stores">
            ${stores ? stores.map(({ title }, index) => (index < 3 ? `<span>${title}</span>` : '')).join(' ') : ''}
          </div>
          <div class="card-status">
            <div class="${isVoting(deadline) ? 'is-voting' : 'voted'}">${isVoting(deadline) ? '투표중' : '투표 완료'}</div>
            <a href="${isVoting(deadline) ? `/voting/:${id}` : `/voted/:${id}`}" class="more-vote">더보기</a>
          </div>
        </div> 
      `}).join('')}
    </div>
    </div>
    `;

  const voteItems = await getUserVoteList();
  const voteList = fetchUserVoteList(voteItems);
  const voteListElement = createElement(voteList);

  homeBody.getElementById('home').append(voteListElement);
  return homeBody;
};

const $root = document.getElementById('root');
// 투표 목록 추가 버튼

$root.addEventListener('click', async e => {
  if (e.target.closest('.add-vote')) render(route(e));
  if (e.target.matches('.more-vote')) render(route(e));
  if (e.target.closest('.vote-link')) {
    try {
      const $input = e.target.closest('.vote-name').querySelector('.copy-value');
      await navigator.clipboard.writeText($input.value);
      alert('링크 복사가 완료되었습니다!');
    } catch (err) {
      console.error(err);
    }
  }
});

// 투표 삭제
$root.addEventListener('click', async e => {
  if (!e.target.matches('.delete-vote')) return;

  const loginedEmail = localStorage.getItem('username');
  const targetId = e.target.closest('.card').id;

  db.collection('votes').doc(targetId).delete();
  db.collection('users').doc(loginedEmail).collection('voteList').doc(targetId).delete();

  render();
});

export default Home;
