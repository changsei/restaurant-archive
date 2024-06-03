const express = require('express');
const ejs = require('ejs');
const app = express();
const port = 3000;

// 뷰 엔진 처리 
app.set('view engine', 'ejs');
app.set('views', './views')

// 폼 데이터 처리 
app.use(express.urlencoded({ extended: true }));

// 라우팅 
app.get('/', (req, res) => {
  res.render('main');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup'); 
});

app.get('/search_results', (req, res) => {
  res.render('search_results');
});

app.get('/search', (res, req) => {
  res.render('search');
});

// 회원 가입 처리 
app.post('/signup', (req, res) => {
  const { user_id, user_nick_name, user_email, user_password_hash } = req.body;
  console.log('회원 가입 요청 받음:');
  console.log(`아이디: ${user_id}`);
  console.log(`닉네임: ${user_nick_name}`);
  console.log(`이메일: ${user_email}`);
  console.log(`비밀번호: ${user_password_hash}`);

  res.render('signup_success');
});

// 로그인 예시 

app.post('/login', (req, res) => {
  const { user_id, user_password } = req.body;

  // 아이디와 비밀번호 검증 로직 (이 예제에서는 단순화)
  if (user_id === 'admin' && user_password === 'admin123') {
    // 로그인 성공
    res.render('search');
  } else {
    // 로그인 실패
    res.send('<h1>로그인 실패</h1><p>아이디 또는 비밀번호가 잘못되었습니다.<br></p><a href="/">홈으로 돌아가기</a>');
  }
});

app.listen(port, () => {
  console.log(`서버가 ${port} 포트에서 실행중입니다.`);
});