const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// helper
const clean = v => (v === "" || v === undefined ? null : v);

// ================= GET ALL =================
exports.getAllClasses = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(`
      SELECT 
        c.CLASS_ID,
        c.CLASS_NAME,
        c.CLASS_TIME,
        c.CLASS_DAY,
        s.SUBJECT_NAME,
        t.TEACHER_NAME,
        c.SUBJECT_ID,
        c.TEACHER_ID
      FROM CLASS c
      JOIN SUBJECT s ON c.SUBJECT_ID = s.SUBJECT_ID
      JOIN TEACHER t ON c.TEACHER_ID = t.TEACHER_ID
      ORDER BY c.CLASS_ID
    `);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ================= GET BY ID =================
exports.getClassById = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(
      `SELECT * FROM CLASS WHERE CLASS_ID = :id`,
      { id: req.params.id }
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ================= ADD =================
exports.addClass = async (req, res) => {
  const { name, time, day, subject_id, teacher_id } = req.body;

  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `
      INSERT INTO CLASS (
        CLASS_ID, CLASS_NAME, CLASS_TIME, CLASS_DAY,
        SUBJECT_ID, TEACHER_ID
      )
      VALUES (
        class_seq.NEXTVAL,
        :name, :time, :day, :subject_id, :teacher_id
      )
      `,
      {
        name: clean(name),
        time: clean(time),
        day: clean(day),
        subject_id: clean(subject_id),
        teacher_id: clean(teacher_id)
      },
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ================= UPDATE =================
exports.updateClass = async (req, res) => {
  const id = req.params.id;
  const { name, time, day, subject_id, teacher_id } = req.body;

  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `
      UPDATE CLASS SET
        CLASS_NAME  = COALESCE(:name, CLASS_NAME),
        CLASS_TIME  = COALESCE(:time, CLASS_TIME),
        CLASS_DAY   = COALESCE(:day, CLASS_DAY),
        SUBJECT_ID  = COALESCE(:subject_id, SUBJECT_ID),
        TEACHER_ID  = COALESCE(:teacher_id, TEACHER_ID)
      WHERE CLASS_ID = :id
      `,
      {
        id,
        name: clean(name),
        time: clean(time),
        day: clean(day),
        subject_id: clean(subject_id),
        teacher_id: clean(teacher_id)
      },
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ================= DELETE =================
exports.deleteClass = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `DELETE FROM CLASS WHERE CLASS_ID = :id`,
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
