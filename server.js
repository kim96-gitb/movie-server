const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const movie = require("./routes/movie");
const users = require("./routes/users");
const bookmark = require("./routes/bookmark");
const reply = require("./routes/reply");
const path = require("path");
const reservation = require("./routes/reservation");

// 파일처리를 위한 라이브러리 임포트
const fileupload = require("express-fileupload");
const { nextTick } = require("process");
//제이슨 연결
const app = express();

app.use(express.json());
app.use(fileupload());
// 이미지 불러 올 수 있도록 해주는 코드
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/movie", movie);
app.use("/api/v1/users", users);
app.use("/api/v1/bookmark", bookmark);
app.use("/api/v1/reply", reply);
app.use("/api/v1/reservation", reservation);
app.get("/", (req, res, next) => {
  res.json({ success: true });
});

const PORT = process.env.PORT || 5600;

app.listen(PORT, console.log("서버개발 시작 포트번호 : ", PORT));
