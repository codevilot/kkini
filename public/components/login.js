import createElement from '../utils/createElement.js';
import { toggleNav, validate, submit } from '../utils/sign.js';

const Login = () =>
  createElement(`
    <div class="auth-wrapper">
      <div id="login">
        <ul class="class-toggle">
          <li class="signin active"><a href="/login">로그인</a></li>
          <li class="signup"><a href="/register">회원가입</a></li>
        </ul>
      <form id="signin" class="signin-form">

        <label for="userid">이메일</label>
        <input type="email" name="userid" autocomplete="off" />
        <div class="error-userid"></div>
        <label for="password">비밀번호</label>
        <input type="password" name="password" autocomplete="off" />
        <div class="error-password"></div>
        <div class="error-message"></div>
        <a href="/" class="signin-btn">로그인</a>
      </form>
    </div>
  </div>
`);

window.addEventListener('click', toggleNav);
window.addEventListener('input', validate);
window.addEventListener('click', submit);

export default Login;
