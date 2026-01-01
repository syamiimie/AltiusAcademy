const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

exports.getAttendanceReport = async (req, res) => {
  const { month } = req.query;

  let conn;
  try {
    conn = await oracledb.getConnection(db);

    const result = await conn.execute(
      `
      SELECT
        s.STUDENT_NAME        AS STUDENT_NAME,
        a.CLASS_ID            AS CLASS_ID,
        c.CLASS_NAME          AS CLASS_NAME,
        TO_CHAR(a.ATTEND_DATE,'YYYY-MM-DD') AS ATTEND_DATE,
        a.ATTEND_STATUS       AS ATTEND_STATUS
      FROM ATTENDANCE a
      JOIN STUDENT s ON a.STUDENT_ID = s.STUDENT_ID
      JOIN CLASS c ON a.CLASS_ID = c.CLASS_ID
      WHERE TO_CHAR(a.ATTEND_DATE,'YYYY-MM') = :month
      ORDER BY a.ATTEND_DATE, s.STUDENT_NAME
      `,
      { month }
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  } finally {
    if (conn) await conn.close();
  }
};
