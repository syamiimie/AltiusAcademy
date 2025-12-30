const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const clean = v => (v === undefined || v === null || v === "" ? null : v);

/* ================= GET ALL CLASSES ================= */
exports.getAllClasses = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(`
      SELECT * FROM CLASS ORDER BY CLASS_ID
    `);
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

/* ================= GET CLASS BY ID ================= */
exports.getClassById = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(
      `SELECT * FROM CLASS WHERE CLASS_ID = :id`,
      [req.params.id]
    );
    res.json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

/* ================= ADD CLASS ================= */
exports.addClass = async (req, res) => {
  let conn;
  const { id, name, time, day, subject_id, teacher_id } = req.body;

  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `INSERT INTO CLASS 
      (CLASS_ID, CLASS_NAME, CLASS_TIME, CLASS_DAY, SUBJECT_ID, TEACHER_ID)
      VALUES (:1, :2, :3, :4, :5, :6)`,
      [id, name, time, day, subject_id, teacher_id],
      { autoCommit: true }
    );
    res.json({ message: "Class added" });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

/* ================= UPDATE CLASS ================= */
exports.updateClass = async (req, res) => {
  let conn;
  const { name, time, day, subject_id, teacher_id } = req.body;

  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `UPDATE CLASS SET
        CLASS_NAME=:1,
        CLASS_TIME=:2,
        CLASS_DAY=:3,
        SUBJECT_ID=:4,
        TEACHER_ID=:5
      WHERE CLASS_ID=:6`,
      [name, time, day, subject_id, teacher_id, req.params.id],
      { autoCommit: true }
    );
    res.json({ message: "Class updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

/* ================= DELETE CLASS ================= */
exports.deleteClass = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `DELETE FROM CLASS WHERE CLASS_ID = :id`,
      [req.params.id],
      { autoCommit: true }
    );
    res.json({ message: "Class deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

/* ================= PREREQUISITES ================= */
exports.getPrerequisites = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(
      `SELECT * FROM CLASS_PREREQUISITE WHERE CLASS_ID=:id`,
      [req.params.id]
    );
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

exports.addPrerequisite = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `INSERT INTO CLASS_PREREQUISITE (CLASS_ID, PREREQUISITE_CLASS_ID)
       VALUES (:1, :2)`,
      [req.params.id, req.body.prerequisite_class_id],
      { autoCommit: true }
    );
    res.json({ message: "Prerequisite added" });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

exports.deletePrerequisite = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `DELETE FROM CLASS_PREREQUISITE WHERE ID=:id`,
      [req.params.pid],
      { autoCommit: true }
    );
    res.json({ message: "Prerequisite deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

/* ================= CLASS + PREREQ ================= */
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
          WITHIN GROUP (ORDER BY cp.PREREQUISITE_CLASS_ID) AS PREREQUISITES
      FROM CLASS c
      JOIN SUBJECT s ON c.SUBJECT_ID = s.SUBJECT_ID
      JOIN TEACHER t ON c.TEACHER_ID = t.TEACHER_ID
      LEFT JOIN CLASS_PREREQUISITE cp ON c.CLASS_ID = cp.CLASS_ID
      GROUP BY
        c.CLASS_ID, c.CLASS_NAME, c.CLASS_TIME, c.CLASS_DAY,
        s.SUBJECT_NAME, t.TEACHER_NAME
      ORDER BY c.CLASS_ID
    `);
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};
