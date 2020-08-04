const connection = require("../mysql_connection");

// @desc 영화마다 유저가 댓글 달기
// @GET  api/v1/reply
// @request user_id , movie_id , reply
// @response
exports.userReply = async (req, res, next) => {
  let user_id = req.user.id;
  let movie_id = req.body.movie_id;
  let coment = req.body.coment;
  let asterion = req.body.asterion;

  let query = `insert into reply(coment,asterion,movie_id,user_id)\ 
     values ("${coment}",${asterion},${movie_id},${user_id})`;

  if (asterion > 5 || asterion <= 0) {
    res.status(400).json({ success: false, msg: "별점은 1점 ~ 5점까지입니다" });
    return;
  }
  try {
    [result] = await connection.query(query);

    res.status(200).json({ success: true, result });
  } catch (e) {
    res.status(400).json({ success: false, error: e });
  }
};

// @desc 영화마다 남들이 남긴 댓글 확인 (25개씩)
// @GET  api/v1/reply
// @request user_id , movie_id , reply
// @response
exports.getReply = async (req, res, next) => {
  let movie = req.body.movie;
  let offset = req.body.offset;
  let limit = req.body.limit;
  let query = `select m.id , m.title , mu.email ,  r.coment , r.created_at\
    from movie as m join reply as r \
    on m.id = r.user_id join movie_user as mu\
    on r.user_id = mu.id where m.title like "%${movie}%" limit ${offset} , ${limit} `;

  if (movie.length == 0) {
    res.status(400).json({ success: false, msg: "영화제목을 입력하세요" });
    return;
  }

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, msg: rows });
  } catch (e) {
    res.status(400).json({ success: false, error: e });
  }
};

// @desc 내가 쓴 댓글은 나만 수정
// @PUT  api/v1/reply/update
// @request user_id ,coment
// @response coment
exports.updateReply = async (req, res, next) => {
  let user_id = req.user.id;
  let coment = req.body.coment;
  let movie_id = req.body.movie_id;

  let query = `update reply set coment = "${coment}" where user_id = ${user_id} and movie_id = ${movie_id} `;

  try {
    [result] = await connection.query(query);

    if (rows[0].user_id != user_id) {
      res.status(401).json({ success: false, msg: "댓글 수정 권한 없음" });
      return;
    }

    let savedmovie_id = rows[0].movie_id;
    if (movie_id != savedmovie_id) {
      res.status(500).json({ success: false, msg: "이영화에는 댓글이 없어요" });
    }
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(400).json({ success: false, error: e });
    return;
  }
};

// @desc 내가 쓴 댓글은 나만 삭제
// @DELETE  api/v1/reply/delete
// @request user_id
// @response
exports.deleteReply = async (req, res, next) => {
  let user_id = req.user.id;
  let movie_id = req.body.movie_id;

  let query = `delete from reply where user_id = ${user_id} and movie_id = ${movie_id}`;

  try {
    [result] = await connection.query(query);
    res.status(200).json({ success: true, result: result });
  } catch (e) {
    res.status(400).json({ success: false, error: e });
  }
};
