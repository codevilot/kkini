import { Home, Login, Voting, Voted, Add, Register, Welcome, MakeVoteList } from '../components/index.js';
import { auth } from './firebase.js';

const $root = document.getElementById('root');
const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/home', component: Home },
  { path: '/voting', component: Voting },
  { path: '/voted', component: Voted },
  { path: '/add', component: Add },
  { path: '/welcome', component: Welcome },
  { path: '/makeVoteList', component: MakeVoteList },
];

const authPath = ['/', '/home', '/add'];

const render = async url => {
  /*
    투표 목록에서 더보기 버튼을 누르면 route parameter로 해당 투표의 아이디를 전달합니다.
    path는 /voting/:id -> 다른 방법이 없는지 생각해보겠습니다..
    component의 인수로 params를 전달합니다.
  */
  let _path = url?.path ?? window.location.pathname;
  const params = url?.params;

  const user = localStorage.getItem('username');
  try {
    if (!user && authPath.includes(_path)) {
      _path = '/login';
      window.history.pushState(null, null, _path);
    }
    const component = routes.find(route => route.path === _path)?.component || NotFound;
    $root.replaceChildren(await component(params));

    if (window.kakao && document.querySelector('#root .map_wrap #kakao-map')) {
      kakao.setMap.insert(document.querySelector('#root #kakao-map'));
      kakao.setMap.search('강남역 맛집');
    } else if (window.kakao && document.querySelector('#root .voting #kakao-map')) {
      kakao.setMap.insert(document.querySelector('#root #kakao-map'));
    }
  } catch (err) {
    console.error(err);
  }
};

export default render;
