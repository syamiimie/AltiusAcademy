const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const clean = v => v === "" || v === undefined ? null : v;

// LOGIN
exports.login = async (req, res) => {
  const { username, password } = req.body;
  let conn;

  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(
      `SELECT STAFF_ID, STAFF_NAME, STAFF_EMAIL
       FROM STAFF
       WHERE STAFF_USERNAME = :u AND STAFF_PASSWORD = :p`,
      { u: username, p: password }
    );

    if (r.rows.length === 0) {
      return res.status(401).json({ message: "Invalid login" });
    }

    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// GET BY ID
exports.getStaffById = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(
      `SELECT * FROM STAFF WHERE STAFF_ID = :id`,
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
exports.addStaff = async (req, res) => {
  const { name, email, phone, username, password } = req.body;
  let conn;

  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `
      INSERT INTO STAFF (
        STAFF_ID, STAFF_NAME, STAFF_EMAIL,
        STAFF_PHONE, STAFF_USERNAME, STAFF_PASSWORD
      )
      VALUES (
        staff_seq.NEXTVAL,
        :name, :email, :phone, :username, :password
      )
      `,
      {
        name: clean(name),
        email: clean(email),
        phone: clean(phone),
        username: clean(username),
        password: clean(password)
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

// UPDATE
exports.updateStaff = async (req, res) => {
  const { name, email, phone } = req.body;
  let conn;

  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `
      UPDATE STAFF SET
        STAFF_NAME = COALESCE(:name, STAFF_NAME),
        STAFF_EMAIL = COALESCE(:email, STAFF_EMAIL),
        STAFF_PHONE = COALESCE(:phone, STAFF_PHONE)
      WHERE STAFF_ID = :id
      `,
      {
        id: req.params.id,
        name: clean(name),
        email: clean(email),
        phone: clean(phone)
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
