import render from '../index.js';
import createElement from '../utils/createElement.js';
import { db } from '../utils/firebase.js';
import route from '../utils/route.js';
import Nav from './nav.js';

let uuid = await db.collection('votes').doc();

const Add = async () => {
  
  const domStr = () =>
    createElement(`
    ${Nav()}
    <div id="add">
      <form class="add-form">
      <h1 class="add-title">투표 만들기 <a href="/" class="close">X</a></h1>
      <input type="text" class="vote-title" placeholder="투표 이름을 작성해주세요" />
      <input type="date" class="deadline"/>
      <div class="class-toggle">
      <input type="radio" id="single-vote" class="vote-type" name="vote-type" hidden/>
      <label for="single-vote">단일투표</label>
      <input type="radio" id="multi-vote" class="vote-type" name="vote-type" hidden/>
      <label for="multi-vote">다중투표</label>
      </div>
      <a class="btn-add" href="/makeVoteList/:${uuid.id}">추가하기</a>
      <div class="warning-message">입력되지 않은 항목이 있습니다.</div>
      </form>
    </div>`);

  return domStr();
};

const $root = document.getElementById('root');

$root.addEventListener('click', async e => {
  if (!e.target.matches('.btn-add')) return;

  e.preventDefault();

  const voteId = [...$root.querySelectorAll('.vote-type')].find(type => type.checked)?.id;
  const title = $root.querySelector('.vote-title').value;
  const deadline = $root.querySelector('.deadline').value;
  const voteType = document.querySelector(`label[for=${voteId}]`)?.textContent;

  if (!title || !deadline || !voteId) {
    document.querySelector('.warning-message').style.display = 'block';
    return;
  }

  document.querySelector('.warning-message').style.display = 'none';

  const user = localStorage.getItem('username');

  const data = {
    title,
    deadline,
    voteType,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    stores: [],
  };

  uuid.set({
    owner: user,
    id: uuid.id,
    ...data,
  });

  db.collection('users').doc(user).collection('voteList').doc(uuid.id).set({});
  uuid = await db.collection('votes').doc();

  render(route(e));
});

$root.addEventListener('click', e => {
  if (!e.target.matches('.close')) return;

  render(route(e));
});

export default Add;
