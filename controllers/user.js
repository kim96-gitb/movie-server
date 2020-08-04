const connection = require("../mysql_connection");
const validator = require("validator");
const bcrypt = require("bcrypt");
const path = require("path");
const jwt = require("jsonwebtoken");

// @desc    회원가입
// @route   POST /api/v1/users/signup
// @parameters  {"email" : "hello@gmail.com" , "passwd":"1234"}

exports.signupMovie = async function (req, res, next) {
  let email = req.body.email;
  let passwd = req.body.passwd;

  const hashedPasswd = await bcrypt.hash(passwd, 8);

  if (!validator.isEmail(email)) {
    res.status(500).json({ success: false, msg: "아이디가 형식이 이상합니다" });
    return;
  }

  let query = `insert into movie_user(email,passwd) values("${email}","${hashedPasswd}") `;
  let user_id;
  try {
    [result] = await connection.query(query);
    user_id = result.insertId;
  } catch (e) {
    if (e.errno == 1062) {
      res.status(400).json({ success: false, msg: "이메일중복" });
    } else {
      res.status(500).json({ success: false, error: e });
      return;
    }
  }

  let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);

  query = `insert into movie_token(token,user_id) values ("${token}",${user_id})`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};

// @desc    로그인
// @route   POST /api/v1/users/login
// @parameters  {"email" : "hello@gmail.com" , "passwd":"1234"}
exports.loginMovie = async function (req, res, next) {
  let email = req.body.email;
  let passwd = req.body.passwd;

  let query = `select * from contact_user where email = ${email}`;

  try {
    [rows] = await connection.query(query);
    let savedPasswd = rows[0].passwd;
    let isMatch = await bcrypt.compare(passwd, savedPasswd);
    if (isMatch == false) {
      res.status(200).json({ success: false, result: isMatch });
      return;
    }
    let user_id = rows[0].id;
    let token = jwt.sign({ user_id: user_id }, process.env.ACCESS_TOKEN_SECRET);
    query = `insert into contact_token(token,user_id)values ("${token}",${user_id})`;
    try {
      [result] = await connection.query(query);
      res.status(200).json({ success: true, result: isMatch, token: token });
      return;
    } catch (e) {
      res.status(500).json({ success: false, error: e });
      return;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e });
    return;
  }
};

// @desc    내정보 조회
// @route   GET /api/v1/users/me
exports.Myinfo = async function (req, res, next) {
  console.log("내정보 가져오는 api", req.user);

  res.status(200).json({ success: true, result: req.user });
};

// @desc    로그아웃
// @route   POST /api/v1/users/logout
exports.logout = async (req, res, next) => {
  let user_id = req.user.id;
  let token = req.user.token;
  let query = `delete from movie_token where user_id = ${user_id} and token = "${token}"`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc    모든 기기 로그아웃
// @route   POST /api/v1/users/logoutall
exports.logoutAll = async (req, res, next) => {
  let user_id = req.user.id;

  let query = `delete from token where user_id = ${user_id} `;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
    return;
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};
// @desc    유저의 프로필 사진 설정하는 api
// @route   POST /api/v1/users/me/photo
// @request photo(body) , user_id
// @response success

// 클라이언트가 사진을 보낸다 => 서버가 이 사진을 받는다 =>
// 서버가 이사진을 디랙토리에 저장한다 => 이 사진의 파일명을 디비에 저장한다
exports.userPhotoUpload = async (req, res, next) => {
  let user_id = req.user.id;

  if (!user_id || !req.files) {
    res.status(500).json({ success: false, msg: "정보없음" });
    return;
  }
  console.log(req.files);

  const photo = req.files.photo;
  // 지금 받은 팡리이 이미지파일이 맞는지 체크
  if (photo.mimetype.startsWith("image") == false) {
    res.status(500).json({ success: false, msg: "이미지 파일이 아닙니다" });
    return;
  }
  if (photo.size > process.env.MAX_FILE_SIZE) {
    res
      .status(500)
      .json({ success: false, msg: "파일의 크기가 큽니다(1mb 밑으로)" });
    return;
  }
  //  fall.jpg =. photo_3.jpg   ext가 확장자명
  photo.name = `photo_${user_id}${path.parse(photo.name).ext}`;
  //     저장할 경로 세팅   :  ./public/uplaods/photo_3.jpg
  let fileUploadPath = `${process.env.FILE_UPLOAD_PATH}/${photo.name}`;
  // 저장하는 코드
  photo.mv(fileUploadPath, async (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  // db에 이 파일을 업데이트 한다.
  let query = `update movie_user set photo_url = ${photo.name} where id = ${user_id}`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, error: e });
  }
};
