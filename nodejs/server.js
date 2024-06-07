// 서버 포트, 랜더링 설정 
const express = require('express');
const session = require('express-session');
const ejs = require('ejs');
const app = express();
const port = 3000;

// 데이터 베이스 
const UserDao = require('./db/dao/user-dao');
const userDao = new UserDao();

// 뷰 엔진 처리 
app.set('view engine', 'ejs');
app.set('views', './views');
app.set('trust proxy', 1);

// 서버 세팅 
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 세션 
app.use(session({
  secret: 'changsei',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false } // https: true, http: false
}))

app.use((req, res, next) => {
  res.locals.user_id = "";
  res.locals.name_nick_name = "";

  if (req.session.member) {
    res.locals.user_id = req.session.member.user_id;
    res.locals.user_nick_name = req.session.member.user_nick_name;
  }
  next();
})

// 라우팅 
app.get('/', (req, res) => {
  res.render('front');
});

app.get('/login', (req, res) => {
  if (req.session.member) {
    res.send('<h1>이미 로그인 되었습니다.</h1><br></p><a href="/main">메인 화면으로 돌아가기</a>');
  } else {
    res.render('login');
  }
});

app.get('/main', (req, res) => {
  res.render('main');
});

app.get('/signup', (req, res) => {
  if (req.session.member) {
    res.send('<h1>이미 로그인 되었습니다.</h1><br></p><a href="/main">메인 화면으로 돌아가기</a>');
  } else {
    res.render('signup'); 
  }
});

app.get('/search_results', (req, res) => {
  res.render('search_results');
});

// 회원 가입 처리 
app.post('/signup', async (req, res) => {
  const { user_id, user_nick_name, user_email, user_password_hash } = req.body;
  console.log('회원 가입 요청 받음:');
  console.log(`아이디: ${user_id}`);
  console.log(`닉네임: ${user_nick_name}`);
  console.log(`이메일: ${user_email}`);
  console.log(`비밀번호: ${user_password_hash}`);
  
  try {
    await userDao.insertUser({
      userId: user_id,
      nickName: user_nick_name,
      passwordHash: user_password_hash,
      email: user_email,
      createdAt: new Date().toISOString().slice(0, 10)
    });
    
    res.render('signup_success');
  } catch (error) {
    console.error('회원 가입 오류:', error);
    res.send('signup_failure');
  }
});

// 로그인 처리
app.post('/login', async (req, res) => {
  const { user_id, user_password } = req.body;
  try {
    const result = await userDao.findUserByIdAndPassword(user_id, user_password);
    if (result) {
      req.session.member = result;
      res.render('main');
    } else {
      res.send('<h1>로그인 실패</h1><p>아이디 또는 비밀번호가 잘못되었습니다.<br></p><a href="/">홈으로 돌아가기</a>');
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});

app.listen(port, () => {
  console.log(`서버가 ${port} 포트에서 실행중입니다.`);
});