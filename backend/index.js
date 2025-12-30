const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/student.routes");
const staffRoutes = require("./routes/staff.routes");
const reportRoutes = require("./routes/report.routes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());                 // 🔥 WAJIB
app.use(express.urlencoded({ extended:true }));

app.use("/students", studentRoutes);
app.use("/staff", staffRoutes);
app.use("/auth", require("./routes/auth.routes"));
app.use("/teachers", require("./routes/teacher.routes"));
app.use("/packages", require("./routes/package.routes"));
app.use("/classes", require("./routes/class.routes"));
app.use("/subjects", require("./routes/subject.routes"));
app.use("/reports", reportRoutes);


app.listen(PORT, () => {
  console.log(`🚀 API running at http://localhost:${PORT}`);
});
