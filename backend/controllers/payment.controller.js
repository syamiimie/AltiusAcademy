const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/* ================= GET PAYMENTS BY STUDENT ================= */
/* Used by: StudentPayment.html */
exports.getPaymentsByStudent = async (req, res) => {
  const { studentId } = req.query;
  let conn;

  try {
    conn = await oracledb.getConnection(db);

    /* 1️⃣ Student info */
    const studentResult = await conn.execute(`
      SELECT Student_Name
      FROM ALTIUS_DB.Student
      WHERE Student_ID = :studentId
    `, [studentId]);

    if (studentResult.rows.length === 0) {
      return res.status(404).send("Student not found");
    }

    /* 2️⃣ Payment history (Package name as payment name) */
    const paymentResult = await conn.execute(`
      SELECT
        p.Payment_ID,
        pkg.Package_Name AS Payment_Name,
        p.Payment_Date,
        p.Total_Fees
      FROM ALTIUS_DB.Enrollment e
      LEFT JOIN ALTIUS_DB.Payment p
        ON e.Payment_ID = p.Payment_ID
      JOIN ALTIUS_DB.Package pkg
        ON e.Package_ID = pkg.Package_ID
      WHERE e.Student_ID = :studentId
        AND p.Payment_ID IS NOT NULL
      ORDER BY p.Payment_Date DESC
    `, [studentId]);

    /* 3️⃣ Total paid */
    const totalResult = await conn.execute(`
      SELECT NVL(SUM(p.Total_Fees), 0) AS Total_Paid
      FROM ALTIUS_DB.Enrollment e
      LEFT JOIN ALTIUS_DB.Payment p
        ON e.Payment_ID = p.Payment_ID
      WHERE e.Student_ID = :studentId
    `, [studentId]);

    res.json({
      studentName: studentResult.rows[0].STUDENT_NAME,
      totalPaid: totalResult.rows[0].TOTAL_PAID,
      payments: paymentResult.rows
    });

  } catch (err) {
    console.error("ORACLE ERROR:", err);
    res.status(500).send("Error fetching payment records");
  } finally {
    if (conn) {
      try { await conn.close(); } catch (err) { console.error(err); }
    }
  }
};




/* ================= GET PAYMENT BY ID (RECEIPT) ================= */
exports.getPaymentById = async (req, res) => {
  const { id } = req.params;
  let conn;

  try {
    conn = await oracledb.getConnection(db);

    const result = await conn.execute(`
      SELECT
        pay.Payment_ID,
        pay.Payment_Name,
        pay.Payment_Date,
        pay.Total_Fees,

        s.Student_Name,
        s.Student_Email,
        s.Student_PhoneNum,

        p.Package_Name,
        p.Package_Fee

      FROM ALTIUS_DB.Payment pay
      JOIN ALTIUS_DB.Enrollment e
        ON pay.Payment_ID = e.Payment_ID
      JOIN ALTIUS_DB.Student s
        ON e.Student_ID = s.Student_ID
      JOIN ALTIUS_DB.Package p
        ON e.Package_ID = p.Package_ID

      WHERE pay.Payment_ID = :id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).send("Payment not found");
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching payment");
  } finally {
    if (conn) {
      try { await conn.close(); } catch (err) { console.error(err); }
    }
  }
};


/* ================= ADD NEW PAYMENT ================= */
exports.addPayment = async (req, res) => {
  const { Payment_Name, Payment_Date, Total_Fees } = req.body;
  let conn;

  try {
    conn = await oracledb.getConnection(db);

    await conn.execute(
      `INSERT INTO ALTIUS_DB.Payment
       (Payment_ID, Payment_Name, Payment_Date, Total_Fees)
       VALUES
       (ALTIUS_DB.Payment_SEQ.NEXTVAL, :Payment_Name, :Payment_Date, :Total_Fees)`,
      [Payment_Name, Payment_Date, Total_Fees],
      { autoCommit: true }
    );

    res.status(201).send("Payment added successfully");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding payment");
  } finally {
    if (conn) {
      try { await conn.close(); } catch (err) { console.error(err); }
    }
  }
};


/* ================= DELETE PAYMENT ================= */
exports.deletePayment = async (req, res) => {
  const { id } = req.params;
  let conn;

  try {
    conn = await oracledb.getConnection(db);

    const result = await conn.execute(
      `DELETE FROM ALTIUS_DB.Payment WHERE Payment_ID = :id`,
      [id],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).send("Payment not found");
    }

    res.send("Payment deleted successfully");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting payment");
  } finally {
    if (conn) {
      try { await conn.close(); } catch (err) { console.error(err); }
    }
  }
};
