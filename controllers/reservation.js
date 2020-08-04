const connection = require("../mysql_connection");
const moment = require("moment");

// @ 영화 예매하기
// @route POST api/v1/reservation
// @reqest showtime , user_id(auth) , movie_id , seat_no_arr
exports.reservationMovie = async (req, res, next) => {
  let user_id = req.user.id;
  let show_time = req.body.show_time;
  let movie_id = req.body.movie_id;
  let seat_no_arr = req.body.seat_no_arr;

  let query =
    "insert into reservation(show_time,seat_no,user_id,movie_id)\
     values ? ";
  let data = [];
  for (let i = 0; i < seat_no_arr.length; i++) {
    data.push([show_time, seat_no_arr[i], user_id, movie_id]);
  }

  if (seat_no_arr > 10) {
    res.status(500).json({ success: false, msg: "좌석은 10자리가 최대입니다" });
    return;
  }

  if (!movie_id || !show_time || !user_id || !seat_no_arr) {
    res.status(500).json({ success: false, msg: "입력된 정보가 잘못됐습니다" });
    return;
  }

  // 중복처리
  // 첫번째방법 : select 해서 해당 좌석 정보가 있는지 확인 => rows.length ==1
  // 두번째방법 : 테이블에서 movie_id , show_time , seat_no 를 유니크로 설정

  try {
    [result] = await connection.query(query, [data]);
    res.status(200).json({ success: true, msg: result });
  } catch (e) {
    if (e.errno == 1062) {
      res.status(500).json({ success: false, msg: "이미 예약한 자리입니다" });
      return;
    } else {
      res.status(400).json({ success: false, error: e });
    }
  }
};

//@desc 상영시간의 해당영화 좌석 정보 불러오기(모든좌석정보)
// @route GET api/v1/reservation
// @reqest   show_time , movie_id
// @response  success
exports.selectReservation = async (req, res, next) => {
  let show_time = req.query.show_time;
  let movie_id = req.query.movie_id;

  let query = `select id , movie_id , count(seat_no) from reservation where
  show_time ="${show_time}"and movie_id =${movie_id}`;

  if (!movie_id || !show_time) {
    res.status(500).json({ success: false, msg: "입력된 정보가 잘못됐습니다" });
    return;
  }

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, msg: rows });
    return;
  } catch (e) {
    res.status(400).json({ success: false, error: e });
    console.log(e);
    return;
  }
};

//@desc 내가 예약한 정보 확인하기
// @route GET api/v1/reservation/my
// @reqest user_id
exports.myReservation = async (req, res, next) => {
  let user_id = req.user.id;
  // 현재 시간을 밀리세컨즈 1970년1월1일 이후의 시간 => 숫자 1596164911601
  let currenttime = Date.now();
  //  위의 현재시간 숫자를 => YYYY-MM-DD HH:mm:ss 로 바꿔줌
  let compareTime = moment(currenttime).format("YYYY-MM-DD HH:mm:ss");
  console.log(currenttime);
  console.log(compareTime);

  if (!user_id) {
    res.status(500).json({ success: false, msg: "아이디값이 없습니다" });
    return;
  }

  // 지금 현재 시간보다, 상영시간이 지난 시간의 예약은 안가져온다

  let query = `select   mu.email ,  m.title , m.year ,r.show_time\ 
    , r.seat_no , r.created_at as reservation_created_at\
    from movie_user as mu join reservation as r\
    on mu.id = r.user_id join movie as m\
    on r.movie_id = m.id where mu.id = ${user_id} and r.show_time > ${currenttime}`;

  try {
    [rows] = await connection.query(query);
    res.status(200).json({ success: true, msg: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e });
  }
};

// @desc 예약취소
// @route DELETE api/v1/reservation/delete
// @reqest user_id
exports.deleteReservation = async (req, res, next) => {
  let user_id = req.user.id;
  let reservation_id = req.params.reservation_id;
  let canceltime = Date.now();
  let compareTime = canceltime + 10000 * 60 * 30;
  compareTime = moment(canceltime).format("YYYY-MM-DD HH:mm:ss");
  console.log(compareTime);

  let query = `select * from reservation where id = ${reservation_id} `;

  try {
    [rows] = await connection.query(query);
    let show_time = rows[0].show_time;
    let mili_show_time = new Date(show_time).getTime();

    if (mili_show_time < compareTime) {
      res
        .status(500)
        .json({ success: false, msg: "영화시작 30분전에는 취소 안됩니다" });
      return;
    }

    query = `delete from reservation where id =${reservation_id}`;

    try {
      [result] = await connection.query(query);
      res.status(200).json({ success: true, msg: result });
    } catch (e) {
      res.status(400).json({ success: false, error: e });
    }
  } catch (e) {
    res.status(400).json({ success: false, error: e });
  }
};
