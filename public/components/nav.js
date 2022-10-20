import render from '../utils/render.js';
import route from '../utils/route.js';
import { logout, logoutExpress } from '../utils/sign.js';

const Nav = () => {
  return window.localStorage.getItem('username')
    ? `<nav>
      <div class="nav-wrapper">
      <a href="/"><img class="logo-img" src="../src/logo.png"></a>
      <ul>
        <li class="pconly"><a href="/">투표 목록</a></li>
        <li><a href="/add">투표 추가</a></li>
        <li class="user">${localStorage.getItem('username').split('@')[0]}님</li>
        ${
          localStorage.getItem('username')
            ? `<li class="logout">
                <a href="/login">로그아웃</a>
              </li>`
            : ''
        }
      </ul>
      </div>
    </nav>
  `
    : `<nav>
    <div class="nav-wrapper">
    <a href="/"><img class="logo-img" src="../src/logo.png"></a>
    <ul>
      <li><a href="/add">새로운 투표 만들기</a></li>
    </ul>
    </div>
  </nav>`;
};

window.addEventListener('click', e => {
  if (!e.target.matches('nav > ul > li > a')) return;

  render(route(e));
});

window.addEventListener('click', logout);

export default Nav;
