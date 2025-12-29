const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// GET ALL PACKAGES
exports.getAllPackages = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(
      `SELECT * FROM PACKAGE ORDER BY PACKAGE_ID`
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// GET PACKAGE BY ID
exports.getPackageById = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    const r = await conn.execute(
      `SELECT * FROM PACKAGE WHERE PACKAGE_ID = :id`,
      { id: req.params.id }
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json(e);
  } finally {
    if (conn) await conn.close();
  }
};

// ADD PACKAGE
exports.addPackage = async (req, res) => {
  const clean = v => v === "" ? null : v;
  const { name, fee, duration, subjects } = req.body;

  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `
      INSERT INTO PACKAGE (
        PACKAGE_ID,
        PACKAGE_NAME,
        PACKAGE_FEE,
        DURATION,
        SUBJECTS
      )
      VALUES (
        package_seq.NEXTVAL,
        :name, :fee, :duration, :subjects
      )
      `,
      {
        name: clean(name),
        fee: clean(fee),
        duration: clean(duration),
        subjects: clean(subjects)
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

// UPDATE PACKAGE
exports.updatePackage = async (req, res) => {
  const id = req.params.id;
  const clean = v => v === "" ? null : v;
  const { name, fee, duration, subjects } = req.body;

  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `
      UPDATE PACKAGE SET
        PACKAGE_NAME = COALESCE(:name, PACKAGE_NAME),
        PACKAGE_FEE = COALESCE(:fee, PACKAGE_FEE),
        DURATION = COALESCE(:duration, DURATION),
        SUBJECTS = COALESCE(:subjects, SUBJECTS)
      WHERE PACKAGE_ID = :id
      `,
      {
        id,
        name: clean(name),
        fee: clean(fee),
        duration: clean(duration),
        subjects: clean(subjects)
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

// DELETE PACKAGE
exports.deletePackage = async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection(db);
    await conn.execute(
      `DELETE FROM PACKAGE WHERE PACKAGE_ID = :id`,
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