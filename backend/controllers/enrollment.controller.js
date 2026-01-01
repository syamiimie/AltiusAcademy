const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/* ================= GET ALL ENROLLMENTS ================= */
exports.getAllEnrollments = async (req, res) => {
  let conn;

  try {
    conn = await oracledb.getConnection(db);

    const result = await conn.execute(`
      SELECT
        e.Enroll_ID,
        e.Student_ID,
        e.Package_ID,
        e.Enroll_Date,
        e.Enroll_Status,

        s.Student_Name,

        p.Package_Name,

        sub.Subject_Name,

        c.Class_ID,
        c.Class_Name,
        c.Class_Day,
        c.Class_Time,

        t.Teacher_Name,

        NVL(pay.Total_Fees, 0) AS Total_Fees_Paid
      FROM ALTIUS_DB.Enrollment e
      JOIN ALTIUS_DB.Student s ON e.Student_ID = s.Student_ID
      JOIN ALTIUS_DB.Package p ON e.Package_ID = p.Package_ID
      JOIN ALTIUS_DB.Subject sub ON p.Package_ID = sub.Package_ID
      JOIN ALTIUS_DB.Class c ON sub.Subject_ID = c.Subject_ID
      LEFT JOIN ALTIUS_DB.Teacher t ON c.Teacher_ID = t.Teacher_ID
      LEFT JOIN ALTIUS_DB.Payment pay ON e.Payment_ID = pay.Payment_ID
      ORDER BY e.Enroll_ID DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching enrollments");
  } finally {
    if (conn) await conn.close();
  }
};

/* ================= ADD ENROLLMENT ================= */
exports.addEnrollment = async (req, res) => {
  const { Student_ID, Package_ID, Enroll_Status } = req.body;
  let conn;

  try {
    conn = await oracledb.getConnection(db);

    await conn.execute(
      `
      INSERT INTO ALTIUS_DB.Enrollment
        (Enroll_ID, Student_ID, Package_ID, Enroll_Status)
      VALUES
        (ALTIUS_DB.Enroll_SEQ.NEXTVAL, :Student_ID, :Package_ID, :Enroll_Status)
      `,
      [Student_ID, Package_ID, Enroll_Status],
      { autoCommit: true }
    );

    res.status(201).send("Enrollment added successfully");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding enrollment");
  } finally {
    if (conn) await conn.close();
  }
};

/* ================= UPDATE ENROLLMENT ================= */
exports.updateEnrollment = async (req, res) => {
  const { id } = req.params;
  const { Package_ID, Enroll_Status } = req.body;
  let conn;

  try {
    conn = await oracledb.getConnection(db);

    const result = await conn.execute(
      `
      UPDATE ALTIUS_DB.Enrollment
      SET
        Package_ID = :Package_ID,
        Enroll_Status = :Enroll_Status
      WHERE Enroll_ID = :id
      `,
      [Package_ID, Enroll_Status, id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).send("Enrollment not found");
    }

    res.send("Enrollment updated successfully");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating enrollment");
  } finally {
    if (conn) await conn.close();
  }
};

/* ================= DELETE ENROLLMENT ================= */
exports.deleteEnrollment = async (req, res) => {
  const { id } = req.params;
  let conn;

  try {
    conn = await oracledb.getConnection(db);

    const result = await conn.execute(
      `DELETE FROM ALTIUS_DB.Enrollment WHERE Enroll_ID = :id`,
      [id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).send("Enrollment not found");
    }

    res.send("Enrollment deleted successfully");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting enrollment");
  } finally {
    if (conn) await conn.close();
  }
};
