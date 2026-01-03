const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// ================= GET ALL =================
// ================= GET ALL =================
exports.getAllAttendance = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);

    const r = await conn.execute(`
      SELECT
        a.attend_id,
        TO_CHAR(a.attend_date,'YYYY-MM-DD') AS attend_date,
        a.attend_status,

        s.student_id,
        s.student_name,

        c.class_id,
        c.class_name

      FROM attendance a
      JOIN student s ON a.student_id = s.student_id
      JOIN class c ON a.class_id = c.class_id
      ORDER BY a.attend_id
    `);

    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ================= GET BY ID =================
exports.getAttendanceById = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(
      `
      SELECT 
        attend_id,
        TO_CHAR(attend_date,'YYYY-MM-DD') AS attend_date,
        attend_status,
        student_id,
        class_id
      FROM attendance
      WHERE attend_id = :id
      `,
      { id: req.params.id }
    );
    res.json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ================= ADD =================
exports.addAttendance = async (req, res) => {
  const { attend_date, attend_status, student_id, class_id } = req.body;

  if (!["Present", "Absent"].includes(attend_status)) {
    return res.status(400).json({ message: "Invalid attendance status" });
  }

  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `
      INSERT INTO attendance (
        attend_date,
        attend_status,
        student_id,
        class_id
      )
      VALUES (
        TO_DATE(:attend_date,'YYYY-MM-DD'),
        :attend_status,
        :student_id,
        :class_id
      )
      `,
      { attend_date, attend_status, student_id, class_id },
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ================= UPDATE =================
exports.updateAttendance = async (req, res) => {
  const id = req.params.id;
  const { attend_date, attend_status, student_id, class_id } = req.body;

  if (!["Present", "Absent"].includes(attend_status)) {
    return res.status(400).json({ message: "Invalid attendance status" });
  }

  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `
      UPDATE attendance SET
        attend_date = TO_DATE(:attend_date,'YYYY-MM-DD'),
        attend_status = :attend_status,
        student_id = :student_id,
        class_id = :class_id
      WHERE attend_id = :id
      `,
      { id, attend_date, attend_status, student_id, class_id },
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ================= DELETE =================
exports.deleteAttendance = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `DELETE FROM attendance WHERE attend_id = :id`,
      { id: req.params.id },
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ================= GET STUDENTS BY CLASS =================
exports.getStudentsByClass = async (req, res) => {
  const { class_id } = req.params;
  let conn;
  try {
    conn = await oracledb.getConnection(db);

    const r = await conn.execute(`
      SELECT DISTINCT
        s.student_id,
        s.student_name
      FROM enrollment e
      JOIN student s ON e.student_id = s.student_id
      JOIN class c ON c.subject_id = e.package_id
      WHERE c.class_id = :class_id
      ORDER BY s.student_name
    `, { class_id });

    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

