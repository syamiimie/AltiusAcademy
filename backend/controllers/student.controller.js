const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const clean = v =>
  v === undefined || v === null || v === "" ? null : v;

// GET ALL
exports.getAllStudents = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(
      "SELECT * FROM STUDENT ORDER BY STUDENT_ID ASC"
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// GET BY ID
exports.getStudentById = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(
      "SELECT * FROM STUDENT WHERE STUDENT_ID = :id",
      { id: req.params.id }
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ADD
exports.addStudent = async (req, res) => {
  console.log("ADD BODY =", req.body);

  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `
      INSERT INTO STUDENT (
        STUDENT_ID,
        STUDENT_NAME,
        STUDENT_IC,
        STUDENT_ADDRESS,
        STUDENT_EMAIL,
        STUDENT_PHONENUM,
        STUDENT_TYPE
      )
      VALUES (
        student_seq.NEXTVAL,
        :name,
        :ic,
        :address,
        :email,
        :phone,
        :type
      )
      `,
      {
        name: clean(req.body.name),
        ic: clean(req.body.ic),
        address: clean(req.body.address),
        email: clean(req.body.email),
        phone: clean(req.body.phone),
        type: clean(req.body.type)
      },
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

// UPDATE
exports.updateStudent = async (req, res) => {
  console.log("UPDATE BODY =", req.body);

  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `
      UPDATE STUDENT SET
        STUDENT_NAME = COALESCE(:name, STUDENT_NAME),
        STUDENT_IC = COALESCE(:ic, STUDENT_IC),
        STUDENT_ADDRESS = COALESCE(:address, STUDENT_ADDRESS),
        STUDENT_EMAIL = COALESCE(:email, STUDENT_EMAIL),
        STUDENT_PHONENUM = COALESCE(:phone, STUDENT_PHONENUM),
        STUDENT_TYPE = COALESCE(:type, STUDENT_TYPE)
      WHERE STUDENT_ID = :id
      `,
      {
        id: req.params.id,
        name: clean(req.body.name),
        ic: clean(req.body.ic),
        address: clean(req.body.address),
        email: clean(req.body.email),
        phone: clean(req.body.phone),
        type: clean(req.body.type)
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

// DELETE
exports.deleteStudent = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      "DELETE FROM STUDENT WHERE STUDENT_ID = :id",
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
