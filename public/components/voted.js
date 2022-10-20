import createElement from '../utils/createElement.js';
import { db } from '../utils/firebase.js';
import Nav from './nav.js';
// prettier-ignore
const Voted = async params => {


  const getVoteItem = async id => {
    /*
      voteItem의 id 값을 params로 전달받습니다.
      로그인한 사용자의 voteList에서 params로 받은 id값으로 voteItem을 가져옵니다.
    */
    const user = localStorage.getItem('username');
    const doc = await db.collection('votes').where("id", "==", id).get();
    let voteItem = {}

    doc.forEach(docs => {
      voteItem = docs.data();
    })

    return voteItem
  }

  const getSortedStores = stores => {
    return stores.sort((prevStore, nextStore) => nextStore.countVote - prevStore.countVote)
  }

  const domStr = stores => createElement(`
    <div class="voting">
      ${Nav()}
      <div class="voting-container">        
        <div class="voting-list">
          ${stores.map(({ id, title, description, thumbnails, countVote }, index) => `
            <div class="store-card ${index === 0 ? 'win-vote' : ''}">
              <div class="store-name">${title}</div>
              <div class="store-description">${description}</div>
              <div class="store-images">
              ${thumbnails.map(thumbnail =>
                `<div class="store-image" style="background-image:url(${thumbnail});background-size: contain;"></div>`
                ).join('')}
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div id="kakao-map"></div>
    </div>`)

  const voteItem = await getVoteItem(params);
  const sortedStores = getSortedStores(voteItem.stores)

  return domStr(sortedStores)
};

export default Voted;
