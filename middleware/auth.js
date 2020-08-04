const jwt = require("jsonwebtoken");
const connetion = require("../mysql_connection");

const auth = async (req, res, next) => {
  let token;
  try {
    token = req.header("Authorization");
  } catch (e) {
    res.status(411).json({ error: "Please authenticate!" });
    return;
  }

  token = token.replace("Bearer ", "");
  console.log(token);

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  let user_id = decoded.user_id;
  let query = `select mu.id , mu.email ,mu.created_at from movie_user as mu join movie_token as mt  on mu.id = mt.user_id where mt.user_id = ${user_id} and mt.token = "${token}"`;

  try {
    [rows] = await connetion.query(query);
    if (rows.length == 0) {
      res.status(401).json({ error: "Please authenticate!" });
    } else {
      let user = rows[0]; // req의 유저정보
      req.user = user;
      req.user.token = token;
      delete user.passwd;
      next();
    }
  } catch (e) {
    console.log(e);
    res.status(402).json({ success: false, error: e });
    return;
  }
};

module.exports = auth;
