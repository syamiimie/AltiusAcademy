const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

exports.getDashboardStats = async (req, res) => {
  let conn;

  try {
    conn = await oracledb.getConnection(db);

    // TOTAL STUDENTS
    const totalStudents = await conn.execute(`
      SELECT COUNT(*) AS TOTAL FROM STUDENT
    `);

    // TOTAL TEACHERS
    const totalTeachers = await conn.execute(`
      SELECT COUNT(*) AS TOTAL FROM TEACHER
    `);

    // MOST COMMON STUDENT TYPE (Primary / Secondary)
    const studentType = await conn.execute(`
      SELECT STUDENT_TYPE
      FROM (
        SELECT STUDENT_TYPE, COUNT(*) CNT
        FROM STUDENT
        GROUP BY STUDENT_TYPE
        ORDER BY CNT DESC
      )
      WHERE ROWNUM = 1
    `);

    // AVERAGE ATTENDANCE RATE
    const attendanceRate = await conn.execute(`
      SELECT ROUND(
        (SUM(CASE WHEN ATTEND_STATUS = 'Present' THEN 1 ELSE 0 END)
        / COUNT(*)) * 100, 2
      ) AS AVG_ATTENDANCE
      FROM ATTENDANCE
    `);

    res.json({
      totalStudents: totalStudents.rows[0].TOTAL,
      totalTeachers: totalTeachers.rows[0].TOTAL,
      highestGrade: studentType.rows[0].STUDENT_TYPE,
      avgAttendance: attendanceRate.rows[0].AVG_ATTENDANCE + "%",
      avgStudentsPerTeacher: "N/A",
      highestPassingRate: "100%"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};
