const express = require("express");
const cors = require("cors");

const studentRoutes = require("./routes/student.routes");
const staffRoutes = require("./routes/staff.routes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());                 // 🔥 WAJIB
app.use(express.urlencoded({ extended:true }));

app.use("/students", studentRoutes);
app.use("/staff", staffRoutes);
app.use("/auth", require("./routes/auth.routes"));

app.listen(PORT, () => {
  console.log(`🚀 API running at http://localhost:${PORT}`);
});
