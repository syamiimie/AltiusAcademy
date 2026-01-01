const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/* ================= GET STUDENT INFO + TOTAL PAID ================= */
exports.getStudentPaymentSummary = async (req, res) => {
  const { studentId } = req.query;
  let conn;

  try {
    conn = await oracledb.getConnection(db);

    // 1️⃣ Get student info
    const studentResult = await conn.execute(`
      SELECT Student_Name
      FROM ALTIUS_DB.Student
      WHERE Student_ID = :studentId
    `, [studentId]);

    if (studentResult.rows.length === 0) {
      return res.status(404).send("Student not found");
    }

    // 2️⃣ Total paid
    const totalResult = await conn.execute(`
      SELECT NVL(SUM(p.Total_Fees), 0) AS Total_Paid
      FROM ALTIUS_DB.Enrollment e
      LEFT JOIN ALTIUS_DB.Payment p
        ON e.Payment_ID = p.Payment_ID
      WHERE e.Student_ID = :studentId
    `, [studentId]);

    res.json({
      studentName: studentResult.rows[0].STUDENT_NAME,
      totalPaid: totalResult.rows[0].TOTAL_PAID
    });

  } catch (err) {
    console.error("ORACLE ERROR:", err);
    res.status(500).send("Error fetching student payment summary");
  } finally {
    if (conn) await conn.close();
  }
};

/* ================= GET ENROLLMENTS BY STUDENT ================= */
exports.getEnrollmentsByStudent = async (req, res) => {
  const { studentId } = req.query;
  let conn;

  try {
    conn = await oracledb.getConnection(db);

    const result = await conn.execute(`
      SELECT 
        e.Enroll_ID,
        pkg.Package_Name,
        pkg.Package_Fee,
        CASE WHEN e.Payment_ID IS NULL THEN 'Unpaid' ELSE 'Paid' END AS PaymentStatus
      FROM ALTIUS_DB.Enrollment e
      JOIN ALTIUS_DB.Package pkg
        ON e.Package_ID = pkg.Package_ID
      WHERE e.Student_ID = :studentId
      ORDER BY e.Enroll_ID
    `, [studentId]);

    res.json(result.rows);

  } catch (err) {
    console.error("ORACLE ERROR:", err);
    res.status(500).send("Error fetching enrollments");
  } finally {
    if (conn) await conn.close();
  }
};

/* ================= ADD PAYMENT FOR SPECIFIC ENROLLMENT ================= */
exports.addPaymentForEnrollment = async (req, res) => {
  const { enrollmentId, paymentDate, totalFees } = req.body;
  let conn;

  try {
    conn = await oracledb.getConnection(db);

    // 1️⃣ Create payment
    const paymentResult = await conn.execute(
      `INSERT INTO ALTIUS_DB.Payment
       (Payment_ID, Payment_Date, Total_Fees)
       VALUES
       (ALTIUS_DB.Payment_SEQ.NEXTVAL, :paymentDate, :totalFees)
       RETURNING Payment_ID INTO :paymentId`,
      {
        paymentDate,
        totalFees,
        paymentId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const paymentId = paymentResult.outBinds.paymentId[0];

    // 2️⃣ Attach payment to enrollment
    const updateResult = await conn.execute(
      `UPDATE ALTIUS_DB.Enrollment
       SET Payment_ID = :paymentId
       WHERE Enroll_ID = :enrollmentId
         AND Payment_ID IS NULL`,
      { paymentId, enrollmentId }
    );

    if (updateResult.rowsAffected === 0) {
      throw new Error("Enrollment already has a payment or not found");
    }

    await conn.commit();
    res.status(201).send("Payment added successfully");

  } catch (err) {
    console.error("ORACLE ERROR:", err);
    res.status(500).send("Error adding payment");
  } finally {
    if (conn) await conn.close();
  }
};
