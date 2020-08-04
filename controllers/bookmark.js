const connection = require("../mysql_connection");

// @desc 좋아하는 영화 추가
// @route POST api/v1/bookmark
// @parameters movie_id , user_id

exports.addFavorite = async (req, res, next) => {
  let movie_id = req.body.movie_id;
  let user_id = req.user.id;

  let query = `insert into favorite_movie (movie_id , user_id)values (${movie_id} , ${user_id})`;
  try {
    [result] = await connection.query(query);
    if (!result.affectedRows == 1) {
      res.status(400).json({ success: false, e });
      return;
    }
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    if (e.errno == 1062) {
      res.status(500).json({ success: false, msg: "이미 목록에 있습니다" });
    }
    reset.status(400).json({ success: false });
  }
};

// @desc 즐겨찾기한 영화 조회
// @route GET api/v1/bookmark
// @request   offset ,  limit
// @response  cnt , items: title genre attendance year
exports.selectFavorite = async (req, res, next) => {
  let offset = req.query.offset;
  let limit = req.query.limit;
  let user_id = req.user.id;
  let query = `select m.title , m.genre , m.attendance , m.year  from movie_user as mu\
   join favorite_movie as f on mu.id = f.user_id\
    join movie as m on f.movie_id = m.id where mu.id = ${user_id} limit ${offset}, ${limit} `;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, msg: rows });
  } catch (e) {
    res.status(400).json({ success: false });
    console.log(e);
  }
};

// @desc 즐겨찾기 삭제
// @route  DELETE api/v1/bookmark
// @request favorite_id
exports.deleteFavorite = async (req, res, next) => {
  let favorite_id = req.body.favorite_id;
  let user_id = req.user.id;

  if (!favorite_id) {
    res.status(400).json({ success: false, msg: "아이디값이 읎다" });
  }

  let query = `delete from favorite_movie where id = ${favorite_id} and user_id= ${user_id}`;
  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, msg: result });
  } catch (e) {
    res.status(400).json({ success: false });
    return;
  }
};
