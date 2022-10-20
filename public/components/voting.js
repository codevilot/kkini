import createElement from '../utils/createElement.js';
import { db } from '../utils/firebase.js';
import render from '../utils/render.js';
import Nav from './nav.js';

const Voting = async params => {
  const isOwner = owner => owner === window.localStorage.getItem('username');

  const isVoted = voteId => {
    const voteList = JSON.parse(window.localStorage.getItem('voteList')) ?? [];
    return voteList.includes(voteId);
  };

  const getVoteItem = async id => {
    const doc = await db.collection('votes').where('id', '==', id).get();
    let voteItem = {};
    doc.forEach(docs => {
      voteItem = docs.data();
    });
    kakao.setMap.marker(voteItem.stores);

    return voteItem;
  };

  const addVoteList = newVote => {
    const voteList = JSON.parse(window.localStorage.getItem('voteList')) ?? [];
    window.localStorage.setItem('voteList', JSON.stringify([...voteList, newVote]));
  };

  const updateSelectedStoreVoteCount = async voteId => {
    const selectedStoreList = [...document.querySelectorAll('.voting-btn')]
      .filter($checkbox => $checkbox.checked)
      .map($checkbox => $checkbox.id);
    const newStoreList = voteItem.stores.map(store =>
      selectedStoreList.includes(store.id) ? { ...store, countVote: store.countVote + 1 } : store
    );
    await db.collection('votes').doc(voteId).update({ stores: newStoreList });
  };

  const routeHome = () => {
    const HOME_PATH = '/';
    render({ path: HOME_PATH });
    window.history.pushState(null, null, HOME_PATH);
  };

  const handleCompleteVote = async e => {
    if (!e.target.matches('.end-voting')) return;

    const selectedStoreList = [...document.querySelectorAll('.voting-btn')].filter($checkbox => $checkbox.checked);
    if (selectedStoreList.length === 0) {
      alert('투표한 목록이 없습니다');
      return;
    }

    addVoteList(params);
    await updateSelectedStoreVoteCount(params);

    alert('투표가 완료되었습니다!');

    routeHome();
  };

  const selectOnlyOne = $input => {
    [...document.querySelectorAll('.voting-btn')].forEach(checkbox => {
      checkbox.checked = checkbox === $input;
    });
  };
  // prettier-ignore
  const domStr = voteItem =>
    createElement(`
      ${Nav()}
      <div class="voting">
        <div class="voting-container">
          <div class="vote-information">
            <span class="vote-name">${voteItem.title}</span>
            <span href="/" class="voting-link">공유링크</span>
            <div class="voting-deadline">마감일 : ${voteItem.deadline}</div>
            <div class="voting-type">투표 방식 : ${voteItem.voteType}</div>
            ${isOwner(voteItem.owner) && isVoted(voteItem.id) ? '' : '<button class="end-voting">투표 완료</button>'}
          </div>
          
          <div class="voting-list">
            ${voteItem.stores
              .map(({ id, title, description, thumbnails }) => `
              <div class="store-card">
              ${
                isOwner(voteItem.owner) && isVoted(voteItem.id)
                  ? ''
                  : '<input type="checkbox" id="${id}" class="voting-btn" name="voting"/>'
              }
              <div class="store-name">${title}</div>
              <div class="store-description">${description}</div>
              <div class="store-images">
              ${thumbnails.map(thumbnail => `
                <div class="store-image" style="background-image:url(${thumbnail});background-size: contain;"></div>
                `
                ).join('')}
              </div>
            </div>
            `
              ).join('')}
          </div>
        </div>
        <div id="kakao-map"></div>
      </div>
    </div>
  `);

  const endVote = () =>
    createElement(`
    ${Nav()}
    <div class="vote-complete">
      <div class="vote-complete-message">투표를 완료했습니다</div>
    </div>
  `);

  const voteItem = await getVoteItem(params);

  window.addEventListener('click', handleCompleteVote);

  window.addEventListener('click', e => {
    if (!e.target.matches('.voting-btn')) return;

    if (voteItem.voteType === '단일투표') selectOnlyOne(e.target);

    [...document.querySelectorAll('.voting-btn')].forEach(checkbox => {
      checkbox.closest('.store-card').classList.toggle('selected-vote', checkbox.checked);
    });
  });

  return !isVoted(params) || isOwner(voteItem.owner) ? domStr(voteItem) : endVote();
};

export default Voting;
