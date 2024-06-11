// 서버 포트, 랜더링 설정 
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const dbPool = require('./db/db-pool-creator');
const app = express();
const port = 3000;

// 데이터 베이스 
const UserDao = require('./db/dao/user-dao');
const ReviewDAO = require('./db/dao/review-dao');
const ReviewRecommendDao = require('./db/dao/review-recommend-dao');
const RestaurantDAO = require('./db/dao/restaurant-dao');
const RestaurantTypeDao = require('./db/dao/restaurant-type-dao');
const PhotoDao = require('./db/dao/photo-dao');
const PhotoMetaDataDao = require('./db/dao/photo-meta-data-dao');
const RestaurantPhotoDao = require('./db/dao/restaurant-photo-dao');

const userDao = new UserDao();
const reviewDao = new ReviewDAO();
const reviewRecommendDao = new ReviewRecommendDao();
const restaurantDAO = new RestaurantDAO();
const restaurantTypeDao = new RestaurantTypeDao();
const photoDao = new PhotoDao();
const photoMetaDataDao = new PhotoMetaDataDao();
const restaurantPhotoDao = new RestaurantPhotoDao();

// 사진 저장 스토리지 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const category = req.query.category;
    let uploadPath = path.join(__dirname, 'public', 'img');
    if (category === 'restaurant') uploadPath += '/restaurant';
    else if (category === 'food') uploadPath += '/food';
    else if (category === 'review') uploadPath += '/review';
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = file.originalname.replace(ext, "")
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\-]/g, '')
      .replace(/\s+/g, '-');
    const filename = `${baseName}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });


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
    res.locals.userId = req.session.member.user_id;
    res.locals.userNickName = req.session.member.user_nick_name;
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

app.get('/restaurant/main', async (req, res) => {
  const types = await restaurantTypeDao.getAllRestaurantTypes();

  const restaurantTypes = types.map(type => ({
    restaurantTypeId: type.restaurant_type_id, 
    restaurantType: type.restaurant_type
  }));

  res.render('restaurant/main', { restaurantTypes: restaurantTypes });
});
app.get('/map', (req, res) => {
  res.render('map');
});
app.get('/main', (req, res) => {
  res.render('main');
});
app.get('/review', (req, res) => {
  res.render('review');
});
app.get('/user_review', (req, res) => {
  res.render('user_review');
});
app.get('/signup', ensureNotLoggedIn, (req, res) => {
    res.render('signup'); 
});

//음식점 등록 
app.get('/restaurant/regist', ensureLoggedIn, async (req, res) => {
  const types = await restaurantTypeDao.getAllRestaurantTypes();
  const restaurantTypes = types.map(type => ({
    restaurantTypeId: type.restaurant_type_id,
    restaurantType: type.restaurant_type
  }));

  res.render('restaurant/regist', { restaurantTypes: restaurantTypes });
});

// 음식점 검색 
app.post('/restaurant/search', upload.none(), async (req, res, next) => {
  const {
    restaurantRating,
    restaurantTakeout,
    restaurantTable,
    restaurantCity,
    restaurantType,
    restaurantOpenHour
  } = req.body;

  try {
    const results = await restaurantDAO.searchRestaurants({
      rating: restaurantRating,
      takeout: restaurantTakeout,
      table: restaurantTable,
      city: restaurantCity,
      type: restaurantType,
      openHour: restaurantOpenHour
    });

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// 음식점 상세 정보 보기 
app.post('/restaurant/main/restaurant-information', upload.none(), async (req, res) => {
  const { restaurantId } = req.body;
  try {
    const restaurant = await restaurantDAO.findRestaurantById(restaurantId);
    const photos = await restaurantPhotoDao.getPhotosByRestaurantId(restaurantId);
    const photoPaths = [];

    for (const photo of photos) {
      const photoInfo = await photoDao.getPhotoById(photo.photo_id);
      if (photoInfo) {
        // 절대 주소를 상대 주소로 변환 시켜서 클라이언트에서 사용할 수 있도록 만듭니다. 
        const relativePath = path.relative(path.join(__dirname, 'public'), photoInfo.photo_path);
        photoPaths.push(relativePath);
      }
    }
    res.render('restaurant/main/restaurant-information', {
      restaurant,
      photos: photoPaths
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 음식점 등록
app.post('/restaurant/regist', ensureLoggedIn, upload.single('restaurantPhoto'), async (req, res, next) => {
  const restaurantInfo = {
    name: req.body.restaurantName,
    type: req.body.restaurantType,
    startHours: req.body.restaurantStartHours,
    endHours: req.body.restaurantEndHours,
    startBreakHours: req.body.restaurantStartBreakHours,
    endBreakHours: req.body.restaurantEndBreakHours,
    hasTable: req.body.restaurantHasTable === 'on',
    hasTakeout: req.body.restaurantHasTakeout === 'on',
    city: req.body.restaurantCity,
    district: req.body.restaurantDistrict,
    town: req.body.restaurantTown,
    street: req.body.restaurantStreet,
    detailAddress: req.body.restaurantDetailAddress,
    telephone: req.body.restaurantTelephone
  };

  const photoInfo = {
    path: req.file.path,
    name: req.file.filename,
    type: req.file.mimetype
  };

  try {
    const restaurantId = await restaurantDAO.addRestaurant(restaurantInfo);
    const photoId = await photoDao.addPhoto(photoInfo);
    await photoMetaDataDao.addPhotoMetaData(photoId, 1); // 1번은 음식점 사진 카테고리 고유 넘버입니다. 

    const result = await restaurantPhotoDao.addRestaurantPhoto(photoId, restaurantId, 1);

    if (result) {
      showRequestPage(res, "음식점 등록 성공! 메인으로 돌아가기", "/restaurant/main");
    } else {
      showRequestPage(res, "음식점 등록 실패! 메인으로 돌아가기", "/restaurant/main");
    }
  } catch (error) {
    next(error);
  }
});

// 음식점 삭제
app.post('/test', async (req, res) => {
  const { restaurantId } = req.body;

  try {
    const photos = await restaurantPhotoDao.getPhotosByRestaurantId(restaurantId);
    // 관련된 photo_id에 대해 photo를 삭제
    for (const photo of photos) {
      const photoId = photo.photo_id;
      const photoInfo = await photoDao.getPhotoById(photoId)

      // 파일 시스템에서 파일 삭제
      if (fs.existsSync(photoInfo.photo_path)) {
        fs.unlinkSync(photoInfo.photo_path);
      }

      await photoDao.deletePhoto(photoId);
    }

    await restaurantDAO.deleteRestaurant(restaurantId);
    res.status(200).json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 리뷰 등록 요청
app.post('/restaurant/main/restaurant-review-regist', ensureLoggedIn, upload.single('reviewPhoto'), async (req, res) => {
  const { restaurantId, userId, reviewText, reviewScore } = req.body;
  const photo = req.file;

  try {
    // 사진이 있는 경우 처리
    if (photo) {
      const photoInfo = {
        path: photo.path,
        name: photo.filename,
        type: photo.mimetype
      };
      const photoId = await photoDao.addPhoto(photoInfo);  
      await photoMetaDataDao.addPhotoMetaData(photoId, 3); // 3은 리뷰 사진 카테고리 ID

      const reviewData = {
        userId: userId,
        restaurantId: restaurantId,
        photoId: photoId,
        photoCategoryId: 3,
        score: reviewScore,
        reviewText: reviewText,
        recommended: 0,
        createdAt: new Date().toISOString().slice(0, 10)
      };

      await reviewDao.addReview(reviewData);
    }

    // 평균 평점 업데이트는 트리거로 실행합니다. // 안된다면 구현합니다.
    // await reviewDao.updateRestaurantAverageRating(restaurantId);

    res.json({ success: '리뷰 등록 성공' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// 리뷰 삭제 요청
app.post('/restaurant/main/review-my-delete/:reviewId', ensureLoggedIn, async (req, res) => {
  const reviewId = req.params.reviewId;
  console.log(req.params.reviewId);
  console.log(`Deleting review with ID: ${reviewId}`);

  try {
      const review = await reviewDao.getReviewById(reviewId);
      console.log(`Review Data: ${JSON.stringify(review)}`);

      if (!review) {
          return res.status(404).json({ message: 'Review not found' });
      }

      await reviewRecommendDao.deleteRecommendationsByReviewId(review.review_id);

      if (review.photo_id) {
          const photoInfo = await photoDao.getPhotoById(review.photo_id);
          if (fs.existsSync(photoInfo.photo_path)) {
              fs.unlinkSync(photoInfo.photo_path);
              console.log('Photo file deleted');
          }
          // 리뷰 삭제 왜래키 참조 조건으로 먼저 제거
          await reviewDao.deleteReview(reviewId);
          await photoDao.deletePhoto(review.photo_id);
      }

      res.status(500).json({ message: '리뷰 삭제 성공' });
  } catch (error) {
      console.error(`Error deleting review: ${error.message}`);
      res.status(500).json({ message: error.message });
  }
});

// 리뷰 조회 요청
app.get('/restaurant/main/review-my', ensureLoggedIn, async (req, res, next) => {
  const userId = req.session.member.user_id;

  try {
    const reviews = await reviewDao.getReviewsByUserIdWithRestaurant(userId);
    res.render('restaurant/main/review-my', { reviews: reviews });
  } catch (error) {
    next(error);
  }
});

// 리뷰 상세 조회
app.get('/restaurant/main/review-my/:reviewId', ensureLoggedIn, async (req, res) => {
  const reviewId = req.params.reviewId;
  try {
      const reviewData = await reviewDao.getReviewById(reviewId);
      const restaurantData = await restaurantDAO.findRestaurantById(reviewData.restaurant_id);
      let photoPath = null;
      if (reviewData.photo_id) {
          const photo = await photoDao.getPhotoById(reviewData.photo_id);
          if (photo) {
              photoPath = path.relative(path.join(__dirname, 'public'), photo.photo_path);
          }
      }

      const reviewDtails = {
          review_id: reviewData.review_id,
          review_score: reviewData.review_score,
          review_text: reviewData.review_text,
          review_recommend: reviewData.review_recommend,
          review_created_at: reviewData.review_created_at,
          restaurant_name: restaurantData.restaurant_name,
          restaurant_city: restaurantData.restaurant_city,
          restaurant_district: restaurantData.restaurant_district,
          photo_path: photoPath
      };
      res.json(reviewDtails);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.get('/login', ensureNotLoggedIn, (req, res) => {
  res.render('login');
});

app.get('/restaurant/main', async (req, res) => {
  const types = await restaurantTypeDao.getAllRestaurantTypes();

  const restaurantTypes = types.map(type => ({
    restaurantTypeId: type.restaurant_type_id,
    restaurantType: type.restaurant_type
  }));

  res.render('restaurant/main', { restaurantTypes: restaurantTypes });
});

// 리뷰 페이지
app.get('/restaurant/main/review-list/:restaurantId', ensureLoggedIn, async (req, res) => {
  const restaurantId = req.params.restaurantId;
  const page = parseInt(req.query.page) || 1; 
  const limit = parseInt(req.query.limit) || 5; 
  const offset = (page - 1) * limit; 

  console.log(`Fetching reviews for restaurantId: ${restaurantId}, page: ${page}`);

  try {
      const [reviews] = await dbPool.query(
          `SELECT r.*, res.restaurant_name, res.restaurant_city, res.restaurant_district
           FROM review r
           JOIN restaurant res ON r.restaurant_id = res.restaurant_id
           WHERE r.restaurant_id = ?
           LIMIT ? OFFSET ?`, [restaurantId, limit, offset]
      );

      const [[countResult]] = await dbPool.query(
          `SELECT COUNT(*) as total FROM review WHERE restaurant_id = ?`, [restaurantId]
      );

      const totalReviews = countResult.total;
      const totalPage = Math.ceil(totalReviews / limit);

      console.log(`Page info: page: ${page}, totalPage: ${totalPage}`);

      const result = {
          reviews,
          pagination: {
              page,
              limit,
              totalPage
          }
      };
      res.json(result);
  } catch (error) {
      console.error(`Error fetching reviews: ${error.message}`);
      res.status(500).json({ message: error.message });
  }
});


app.get('/signup', ensureNotLoggedIn, (req, res) => {
  res.render('signup');
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
      const types = await restaurantTypeDao.getAllRestaurantTypes();
      const restaurantTypes = types.map(type => ({
        restaurantTypeId: type.restaurant_type_id,
        restaurantType: type.restaurant_type
      }));
      res.render('restaurant/main', { restaurantTypes: restaurantTypes });
    } else {
      showRequestPage(res, "로그인에 실패하셨습니다. 이전 화면으로 돌아갑니다.", "/login");
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
    showRequestPage(res, "이미 로그인 되었습니다. 메인 화면으로 돌아 갑니다.", '/restaurant/main');
  } else {
    next();
  }
}

// 요청 처리 함수 
function showRequestPage(res, message, redirectUrl) {
  res.render('response', { message: message, redirectUrl: redirectUrl });
}