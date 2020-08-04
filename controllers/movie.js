const connection = require("../mysql_connection");

// @desc 영화 데이터 불러오기
// @url  GET api/v1/movie
// @request    offset , limit
// @response  title , genre , attendance , year
exports.AllMovie = async function (req, res, next) {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let query = `select m.* , count(r.coment) as count_coment\
  , ifnull(round(avg(r.coment), 2) , "없음") as avg_coment\
  from movie as m left join reply as  r\
  on m.id = r.movie_id\
  group by m.id\
  order by m.id limit ${offset},${limit} `;

  if (!offset || !limit) {
    res.status(400).json({ success: false, msg: "잘못된 입력입니다" });
    return;
  }

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, msg: rows });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

// @desc 영화명 검색해서 가져오기
// @url  GET api/v1/movie
// @request   title , limit
// @response  title , genre , attendance , year

exports.searchMovie = async function (req, res, next) {
  let limit = req.query.limit;
  let title = req.query.keyword;
  let query = `select * from movie where title like "%${title}%" limit ${limit}`;

  if (!limit || !title) {
    res.status(400).json({ success: false, msg: "잘못된 입력입니다" });
    return;
  }
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, msg: rows });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

// @desc   연도 내림차순으로 가져오기
// @url  GET api/v1/movie/desc
// @request
// @response  title , genre , attendance , year
exports.yeardownMovie = async function (req, res, next) {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let query = `select * from movie order by year desc limit ${offset},${limit} `;
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, msg: rows });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};
// @desc   연도 올림차순으로 가져오기
// @url  GET api/v1/movie/asc
// @request
// @response  title , genre , attendance , year
exports.yearupMovie = async function (req, res, next) {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let query = `select * from movie order by year asc limit ${offset},${limit}`;
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, msg: rows });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};
// @desc   관객수 내림차순으로 가져오기
// @url  GET api/v1/movie/descper
// @request
// @response  title , genre , attendance , year
exports.attdownMovie = async function (req, res, next) {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let query = `select * from movie order by attendance desc limit ${offset},${limit}`;
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, msg: rows });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};
// @desc   관객수 올림차순으로 가져오기
// @url  GET api/v1/movie/ascper
// @request
// @response  title , genre , attendance , year
exports.attupMovie = async function (req, res, next) {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let query = `select * from movie order by attendance asc limit ${offset},${limit} `;
  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, msg: rows });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};
