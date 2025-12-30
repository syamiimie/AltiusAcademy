const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/* ================= GET ALL CLASSES ================= */
exports.getAllClasses = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(
      `SELECT * FROM CLASS ORDER BY CLASS_ID`
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

/* ================= ADD CLASS (WITH / WITHOUT PREREQ) ================= */
exports.addClass = async (req, res) => {
  let conn;
  const { name, time, day, subject_id, teacher_id, prerequisites = [] } = req.body;

  try {
    conn = await oracledb.getConnection(db);

    // Insert class and get generated CLASS_ID
    const r = await conn.execute(
      `INSERT INTO CLASS (
         CLASS_ID, CLASS_NAME, CLASS_TIME, CLASS_DAY, SUBJECT_ID, TEACHER_ID
       )
       VALUES (
         ALTIUS_DB.CLASS_SEQ.NEXTVAL, :name, :time, :day, :subject_id, :teacher_id
       )
       RETURNING CLASS_ID INTO :class_id`,
      {
        name,
        time,
        day,
        subject_id,
        teacher_id,
        class_id: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
      },
      { autoCommit: false }
    );

    const classId = r.outBinds.class_id[0];

    // Insert prerequisites
    for (let prereqId of prerequisites) {
      prereqId = prereqId.trim();
      if (prereqId === classId) throw new Error("Class cannot be its own prerequisite");

      const check = await conn.execute(
        `SELECT COUNT(*) AS CNT FROM CLASS WHERE CLASS_ID = :id`,
        { id: prereqId }
      );
      if (check.rows[0].CNT === 0)
        throw new Error(`Prerequisite class ${prereqId} does not exist`);

      await conn.execute(
        `INSERT INTO CLASS_PREREQUISITE (
           PREREQUISITE_ID, CLASS_ID, PREREQUISITE_CLASS_ID
         )
         VALUES (ALTIUS_DB.PREREQ_SEQ.NEXTVAL, :class_id, :prereq_id)`,
        { class_id: classId, prereq_id: prereqId }
      );
    }

    await conn.commit();
    res.json({ message: "Class and prerequisites added successfully", classId });

  } catch (e) {
    if (conn) await conn.rollback();
    res.status(400).json({ message: e.message });
  } finally {
    if (conn) await conn.close();
  }
};


/* ================= DELETE CLASS ================= */
exports.deleteClass = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);

    // Delete all prerequisites first
    await conn.execute(
      `DELETE FROM CLASS_PREREQUISITE WHERE CLASS_ID = :id`,
      [req.params.id]
    );

    // Delete class
    await conn.execute(
      `DELETE FROM CLASS WHERE CLASS_ID = :id`,
      [req.params.id]
    );

    await conn.commit();
    res.json({ message: "Class deleted successfully" });
  } catch (e) {
    if (conn) await conn.rollback();
    res.status(500).json({ message: e.message });
  } finally {
    if (conn) await conn.close();
  }
};

/* ================= CLASS LIST WITH PREREQS ================= */
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
      LEFT JOIN SUBJECT s
        ON c.SUBJECT_ID = s.SUBJECT_ID
      LEFT JOIN TEACHER t
        ON c.TEACHER_ID = t.TEACHER_ID
      LEFT JOIN CLASS_PREREQUISITE cp
        ON c.CLASS_ID = cp.CLASS_ID
      GROUP BY
        c.CLASS_ID,
        c.CLASS_NAME,
        c.CLASS_TIME,
        c.CLASS_DAY,
        s.SUBJECT_NAME,
        t.TEACHER_NAME
      ORDER BY c.CLASS_ID
    `);

    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  } finally {
    if (conn) await conn.close();
  }
};
