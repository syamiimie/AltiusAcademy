const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

exports.attendanceReport = async (req, res) => {
  const { month } = req.query; // YYYY-MM
  let conn;

  try {
    conn = await oracledb.getConnection(db);

    const result = await conn.execute(
      `
      SELECT
        s.STUDENT_NAME,
        c.CLASS_NAME,
        TO_CHAR(a.ATTEND_DATE, 'YYYY-MM-DD') AS ATTEND_DATE,
        a.ATTEND_STATUS AS STATUS
      FROM ATTENDANCE a
      JOIN STUDENT s ON a.STUDENT_ID = s.STUDENT_ID
      JOIN CLASS c ON a.CLASS_ID = c.CLASS_ID
      WHERE TO_CHAR(a.ATTEND_DATE, 'YYYY-MM') = :month
      ORDER BY a.ATTEND_DATE
      `,
      { month }
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
};
