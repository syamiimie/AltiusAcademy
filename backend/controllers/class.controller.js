const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// ================= GET ALL CLASSES =================
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

// ================= GET CLASS BY ID =================
exports.getClassById = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(
      `SELECT * FROM CLASS WHERE CLASS_ID = :id`,
      { id: req.params.id }   // 🔥 STRING
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ================= ADD CLASS =================
exports.addClass = async (req, res) => {
  const { name, time, day, subject_id, teacher_id } = req.body;
  let conn;

  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(`
      INSERT INTO CLASS (
        CLASS_ID, CLASS_NAME, CLASS_TIME, CLASS_DAY,
        SUBJECT_ID, TEACHER_ID
      )
      VALUES (
        :id, :name, :time, :day, :subject_id, :teacher_id
      )
    `, {
      id: req.body.id,               // contoh: C07
      name,
      time,
      day,
      subject_id: Number(subject_id),
      teacher_id: Number(teacher_id)
    }, { autoCommit: true });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ================= UPDATE CLASS =================
exports.updateClass = async (req, res) => {
  const { name, time, day, subject_id, teacher_id } = req.body;
  let conn;

  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(`
      UPDATE CLASS SET
        CLASS_NAME = :name,
        CLASS_TIME = :time,
        CLASS_DAY  = :day,
        SUBJECT_ID = :subject_id,
        TEACHER_ID = :teacher_id
      WHERE CLASS_ID = :id
    `, {
      id: req.params.id,             // 🔥 STRING
      name,
      time,
      day,
      subject_id: Number(subject_id),
      teacher_id: Number(teacher_id)
    }, { autoCommit: true });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ================= DELETE CLASS =================
exports.deleteClass = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `DELETE FROM CLASS WHERE CLASS_ID = :id`,
      { id: req.params.id },   // 🔥 STRING
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ================= PREREQUISITE =================

// GET PREREQUISITE
exports.getPrerequisites = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(`
      SELECT
        cp.PREREQUISITE_ID,
        cp.PREREQUISITE_CLASS_ID,
        c.CLASS_NAME
      FROM CLASS_PREREQUISITE cp
      JOIN CLASS c
        ON cp.PREREQUISITE_CLASS_ID = c.CLASS_ID
      WHERE cp.CLASS_ID = :id
    `, { id: req.params.id });

    res.json(r.rows);
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ADD PREREQUISITE
exports.addPrerequisite = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(`
      INSERT INTO CLASS_PREREQUISITE
      (PREREQUISITE_ID, CLASS_ID, PREREQUISITE_CLASS_ID)
      VALUES (class_prereq_seq.NEXTVAL, :class_id, :pre_id)
    `, {
      class_id: req.params.id,                     // 🔥 STRING
      pre_id: req.body.prerequisite_class_id       // 🔥 STRING
    }, { autoCommit: true });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// DELETE PREREQUISITE
exports.deletePrerequisite = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `DELETE FROM CLASS_PREREQUISITE WHERE PREREQUISITE_ID = :id`,
      { id: req.params.pid },
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ================= CLASS LIST + PREREQUISITE (DISPLAY) =================
exports.getClassListWithPrereq = async (req, res) => {
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
        LISTAGG(cp.PREREQUISITE_CLASS_ID, ', ')
          WITHIN GROUP (ORDER BY cp.PREREQUISITE_CLASS_ID)
          AS PREREQUISITES
      FROM CLASS c
      JOIN SUBJECT s ON c.SUBJECT_ID = s.SUBJECT_ID
      JOIN TEACHER t ON c.TEACHER_ID = t.TEACHER_ID
      LEFT JOIN CLASS_PREREQUISITE cp
        ON c.CLASS_ID = cp.CLASS_ID
      GROUP BY
        c.CLASS_ID, c.CLASS_NAME, c.CLASS_TIME, c.CLASS_DAY,
        s.SUBJECT_NAME, t.TEACHER_NAME
      ORDER BY c.CLASS_ID
    `);

    res.json(r.rows);

  } catch (e) {
    console.error("getClassListWithPrereq:", e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};
