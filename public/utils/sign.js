import { auth, db } from './firebase.js';
import route from './route.js';
import render from '../index.js';

// signin, signup에서 공통으로 사용하는 로직
const signinState = {
  userid: {
    value: '',
    get valid() {
      return (
        this.value &&
        /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/.test(this.value)
      );
    },
    error: '이메일 형식에 맞게 입력해 주세요.',
  },
  password: {
    value: '',
    get valid() {
      return /^[A-Za-z0-9]{6,12}$/.test(this.value);
    },
    error: '영문 또는 숫자를 6~12자 입력하세요.',
  },
  get valid() {
    return this.userid.valid && this.password.valid;
  },
  error: '이메일과 비밀번호가 일치하지 않습니다. 다시 입력해주세요.',
};

const signupState = {
  ...signinState,
  'confirm-password': {
    value: '',
    get valid() {
      return signupState.password.valid && signinState.password.value === this.value;
    },
    error: '패스워드가 일치하지 않습니다.',
  },
  get valid() {
    return this.userid.valid && this.password.valid && signupState['confirm-password'].valid;
  },
  error: '유효하지 않은 정보입니다. 다시 입력해주세요.',
};

let currentPage = 'signin';
let currentState = signinState;

const setCurrentPage = page => {
  if (currentPage === page) return;

  currentPage = page;
  currentState = page === 'signin' ? signinState : signupState;
};

const toggleNav = e => {
  if (!e.target.closest(`.class-toggle > .signin`) && !e.target.closest(`.class-toggle > .signup`)) return;

  e.preventDefault();

  const isSigninPage = e.target.closest('li').classList.contains('signin');
  setCurrentPage(isSigninPage ? 'signin' : 'signup');

  [...document.querySelectorAll('.class-toggle > li')].forEach($li => $li.classList.toggle('active'));

  render(route(e));
};

const activateButton = () => {
  document.querySelector(`.${currentPage}-btn`).classList.toggle('active', currentState.valid);
};

const validate = _.debounce(e => {
  if (!e.target.matches(`.signin-form > input`) && !e.target.matches(`.signup-form > input`)) return;

  setCurrentPage(e.target.closest('form').id);

  const { name, value } = e.target;
  currentState[name].value = value.trim();

  document.querySelector(`.error-${name}`).textContent =
    currentState[name].value && !currentState[name].valid ? currentState[name].error : '';

  if (name === 'password' && currentState['confirm-password']?.value) {
    document.querySelector(`.error-confirm-password`).textContent =
      currentState['confirm-password'].value && !currentState['confirm-password']?.valid
        ? currentState['confirm-password'].error
        : '';
  }
  activateButton();
}, 300);

/* 로그인해야 접근할 수 있는 페이지에서 사용할 request */
const authRequest = async () => {
  const firebaseUserIdToken = await auth.currentUser?.getIdToken(true);

  /**
   * getIdToken(true): 사용자의 토큰을 refresh 해준다.
   * 기본적으로, 1시간이 지나면 토큰은 만료된다.
   * */

  const response = await fetch('/api/hello', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + firebaseUserIdToken,
    },
  });
};

const submit = async e => {
  if (!e.target.matches('.signin-btn') && !e.target.matches('.signup-btn')) return;

  e.preventDefault();

  try {
    if (currentPage === 'signin') {
      const res = await auth.signInWithEmailAndPassword(signinState.userid.value, signinState.password.value);
      localStorage.setItem('username', signinState.userid.value);
      render(route(e));
    }

    if (currentPage === 'signup') {
      const res = await auth.createUserWithEmailAndPassword(signupState.userid.value, signupState.password.value);
      db.collection('users').doc(`${signupState.userid.value}`).set({});
      render(route(e));
    }
  } catch (err) {
    console.error(err);
    document.querySelector(`.${currentPage}-form .error-message`).textContent = currentState.error;
    document.querySelector(`.${currentPage}-btn`).classList.remove('active');
  }
};

/* express를 사용해서 구현한 방법 */
const submitExpress = async e => {
  if (!e.target.matches('.signin-btn') && !e.target.matches('.signup-btn')) return;

  e.preventDefault();

  try {
    const payload = {};
    Object.keys(currentState)
      .filter(name => name !== 'valid')
      .forEach(key => {
        payload[key] = currentState[key].value;
      });

    const res = await axios.post(`/api/${currentPage}`, payload);
    if (res.status === 200) {
      console.log(`${res.data.userid} 성공~!`);
      render(route(e));
    }
  } catch (err) {
    const { response } = err;
    if (response.status === 400) {
      console.log(response.data);
    }
    console.error(err);
  }
};

const logout = async e => {
  if (!e.target.closest('.logout')) return;

  try {
    await auth.signOut();
    localStorage.removeItem('username');
    render(route(e));
  } catch (err) {
    console.error(err);
  }
};

const logoutExpress = async e => {
  if (!e.target.closest('.logout')) return;

  try {
    const res = await axios.post(`/api/logout`);
    localStorage.removeItem('username');
    render(route(e));
  } catch (err) {
    console.log(err);
  }
};

export { toggleNav, validate, submit, submitExpress, logout, logoutExpress };
