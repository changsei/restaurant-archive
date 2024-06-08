// 서버 포트, 랜더링 설정 
const express = require('express');
const session = require('express-session');
const ejs = require('ejs');
const app = express();
const port = 3000;

// 데이터 베이스 
const UserDao = require('./db/dao/user-dao');
const ReviewDAO = require('./db/dao/review-dao');
const RestaurantDAO = require('./db/dao/restaurant-dao');
const userDao = new UserDao();
const reviewDAO = new ReviewDAO();
const restaurantDAO = new RestaurantDAO();

// 뷰 엔진 처리 
app.set('view engine', 'ejs');
app.set('views', './views');
app.set('trust proxy', 1);

// 서버 세팅 
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 오류 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);  
  res.status(500).render('error', { error: err });  
});

// 세션 처리 미들 웨어
app.use(session({
  secret: 'changsei',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false } // https: true, http: false
}))

app.use((req, res, next) => {
  res.locals.userId = "";
  res.locals.userNickName = "";

  if (req.session.member) {
    res.locals.userId = req.session.member.userId;
    res.locals.userNickName = req.session.member.userNickName;
  }
  next();
})

// 라우팅 
app.get('/', (req, res) => {
  res.render('front');
});

app.get('/login', ensureNotLoggedIn, (req, res) => {
    res.render('login');
});

app.get('/main', ensureLoggedIn, (req, res) => {
  res.render('main');
});

app.get('/signup', ensureNotLoggedIn, (req, res) => {
    res.render('signup'); 
});

//음식점 등록 테스트
app.get('/restaurant/add', ensureLoggedIn, (req, res) => {
  res.render('restaurant_regist');
});

// 회원 가입 처리 
app.post('/signup', ensureNotLoggedIn, async (req, res, next) => {
  const { userId, userNickName, userEmail, userPasswordHash } = req.body;
  try {
    await userDao.addUser({
      userId: userId,
      nickName: userNickName,
      passwordHash: userPasswordHash,
      email: userEmail,
      createdAt: new Date().toISOString().slice(0, 10)
    });
    
    showRequestPage(res, "회원 가입 성공! 홈 화면으로 돌아가기", "/");
  } catch (error) {
    next(error);
  }
});

// 로그인 처리
app.post('/login', ensureNotLoggedIn, async (req, res, next) => {
  const { 
    userId, 
    userPasswordHash  
  } = req.body; 

  try {
    const result = await userDao.findUserById(userId);
    if (result && userPasswordHash == result.user_password_hash) {
      req.session.member = result;
      res.render('main');
    } else {
      showRequestPage(res, "로그인 실패! 홈 화면으로 돌아가기", "/");
    }
  } catch (error) {
    next(error);
  }
}); 

// 음식점 등록
app.post('/restaurant/add', ensureLoggedIn, async (req, res, next) => {
  const {
    restaurantName,
    restaurantStartHours,
    restaurantEndHours,
    restaurantStartBreakHours,
    restaurantEndBreakHours,
    restaurantHasTable,
    restaurantHasTakeout,
    restaurantCity,
    restaurantDistrict,
    restaurantTown,
    restaurantStreet,
    restaurantDetailAddress,
    restaurantTelephone
  } = req.body;

  try {
    const result = await restaurantDAO.addRestaurant({
      name: restaurantName,
      startHours: restaurantStartHours,
      endHours: restaurantEndHours,
      startBreakHours: restaurantStartBreakHours,
      endBreakHours: restaurantEndBreakHours,
      hasTable: restaurantHasTable === 'on',
      hasTakeout: restaurantHasTakeout === 'on',
      city: restaurantCity,
      district: restaurantDistrict,
      town: restaurantTown,
      street: restaurantStreet,
      detailAddress: restaurantDetailAddress,
      telephone: restaurantTelephone
    });

    if (result) {
      showRequestPage(res, "음식점 등록 성공! 메인으로 돌아가기", "/main");
    } else {
      showRequestPage(res, "음식점 등록 실패! 메인으로 돌아가기", "/main");
    }
  } catch (error) {
    next(error);
  }
});


app.listen(port, () => {
  console.log(`서버가 ${port} 포트에서 실행중입니다.`);
});


// 로그인 예외 처리 함수
function ensureLoggedIn(req, res, next) {
  if (!req.session.member) {
    showRequestPage(res, "로그인이 필요합니다. 로그인 화면으로 돌아 갑니다.", '/login');
  } else {
    next();
  }
}

function ensureNotLoggedIn(req, res, next) {
  if (req.session.member) {
    showRequestPage(res, "이미 로그인 되었습니다. 메인 화면으로 돌아 갑니다.", '/main');
  } else {
    next(); 
  }
}

// 요청 처리 함수 
function showRequestPage(res, message, redirectUrl) {
  res.render('response', { message: message, redirectUrl: redirectUrl });
}