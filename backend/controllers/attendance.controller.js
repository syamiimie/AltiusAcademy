const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// ================= GET ALL =================
exports.getAllAttendance = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(`
      SELECT 
        attend_id,
        TO_CHAR(attend_date,'YYYY-MM-DD') AS attend_date,
        attend_status,
        student_id,
        class_id
      FROM attendance
      ORDER BY attend_id
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
