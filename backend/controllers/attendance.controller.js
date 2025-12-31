const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/* =========================
   GET ALL ATTENDANCE
========================= */
exports.getAllAttendance = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);

    const r = await conn.execute(`
      SELECT 
        a.ATTEND_ID,
        a.ATTEND_DATE,
        a.ATTEND_STATUS,
        s.STUDENT_NAME,
        c.CLASS_NAME
      FROM ATTENDANCE a
      JOIN STUDENT s ON a.STUDENT_ID = s.STUDENT_ID
      JOIN CLASS c ON a.CLASS_ID = c.CLASS_ID
      ORDER BY a.ATTEND_ID
    `);

    res.json(r.rows);
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

/* =========================
   GET ATTENDANCE BY ID
========================= */
exports.getAttendanceById = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);

    const r = await conn.execute(
      `SELECT * FROM ATTENDANCE WHERE ATTEND_ID = :id`,
      { id: req.params.id }
    );

    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

/* =========================
   ADD ATTENDANCE
========================= */
exports.addAttendance = async (req, res) => {
  const { attend_date, attend_status, student_id, class_id } = req.body;

  let conn;
  try {
    conn = await oracledb.getConnection(db);

    await conn.execute(`
      INSERT INTO ATTENDANCE (
        ATTEND_ID,
        ATTEND_DATE,
        ATTEND_STATUS,
        STUDENT_ID,
        CLASS_ID
      )
      VALUES (
        attendance_seq.NEXTVAL,
        TO_DATE(:attend_date,'YYYY-MM-DD'),
        :attend_status,
        :student_id,
        :class_id
      )
    `, { attend_date, attend_status, student_id, class_id },
    { autoCommit: true });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

/* =========================
   UPDATE ATTENDANCE
========================= */
exports.updateAttendance = async (req, res) => {
  const id = req.params.id;
  const { attend_date, attend_status, student_id, class_id } = req.body;

  let conn;
  try {
    conn = await oracledb.getConnection(db);

    await conn.execute(`
      UPDATE ATTENDANCE SET
        ATTEND_DATE = TO_DATE(:attend_date,'YYYY-MM-DD'),
        ATTEND_STATUS = :attend_status,
        STUDENT_ID = :student_id,
        CLASS_ID = :class_id
      WHERE ATTEND_ID = :id
    `, { id, attend_date, attend_status, student_id, class_id },
    { autoCommit: true });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

/* =========================
   DELETE ATTENDANCE
========================= */
exports.deleteAttendance = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `DELETE FROM ATTENDANCE WHERE ATTEND_ID = :id`,
      { id: req.params.id },
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};
