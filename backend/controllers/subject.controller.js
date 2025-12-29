const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// GET ALL SUBJECTS (ORDERED FOR GROUPING)
exports.getAllSubjects = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);

    const r = await conn.execute(`
      SELECT
        s.SUBJECT_ID,
        s.SUBJECT_NAME,
        s.PACKAGE_ID,
        p.PACKAGE_NAME
      FROM SUBJECT s
      LEFT JOIN PACKAGE p
        ON s.PACKAGE_ID = p.PACKAGE_ID
      ORDER BY p.PACKAGE_NAME, s.SUBJECT_NAME
    `);

    res.json(r.rows);

  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// GET SUBJECT BY ID
exports.getSubjectById = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(
      `SELECT * FROM SUBJECT WHERE SUBJECT_ID = :id`,
      { id: req.params.id }
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ADD SUBJECT
exports.addSubject = async (req, res) => {
  const clean = v => (v === "" ? null : v);
  const { subject_name, package_id } = req.body;

  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `
      INSERT INTO SUBJECT (
        SUBJECT_ID,
        SUBJECT_NAME,
        PACKAGE_ID
      ) VALUES (
        subject_seq.NEXTVAL,
        :subject_name,
        :package_id
      )
      `,
      {
        subject_name: clean(subject_name),
        package_id: clean(package_id)
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

// UPDATE SUBJECT
exports.updateSubject = async (req, res) => {
  const id = req.params.id;
  const clean = v => (v === "" ? null : v);
  const { subject_name, package_id } = req.body;

  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `
      UPDATE SUBJECT SET
        SUBJECT_NAME = COALESCE(:subject_name, SUBJECT_NAME),
        PACKAGE_ID = COALESCE(:package_id, PACKAGE_ID)
      WHERE SUBJECT_ID = :id
      `,
      {
        id,
        subject_name: clean(subject_name),
        package_id: clean(package_id)
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

// DELETE SUBJECT
exports.deleteSubject = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `DELETE FROM SUBJECT WHERE SUBJECT_ID = :id`,
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
