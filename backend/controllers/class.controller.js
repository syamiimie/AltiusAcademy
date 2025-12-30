const oracledb = require("oracledb");
const db = require("../db/db");

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// ===============================
// ClASS
// ===============================

// 1️⃣ GET all classes
exports.getAllClasses = (req, res) => {
    const sql = "SELECT * FROM class";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

// 2️⃣ GET class by ID
exports.getClassById = (req, res) => {
    const sql = "SELECT * FROM class WHERE class_id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result[0]);
    });
};

// 3️⃣ ADD class
exports.addClass = (req, res) => {
    const { name, time, day, subject_id, teacher_id } = req.body;

    const sql = `
        INSERT INTO class (class_name, class_time, class_day, subject_id, teacher_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, time, day, subject_id, teacher_id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Class added successfully" });
    });
};

// 4️⃣ UPDATE class
exports.updateClass = (req, res) => {
    const sql = `
        UPDATE class
        SET class_name=?, class_time=?, class_day=?, subject_id=?, teacher_id=?
        WHERE class_id=?
    `;

    const { name, time, day, subject_id, teacher_id } = req.body;

    db.query(
        sql,
        [name, time, day, subject_id, teacher_id, req.params.id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Class updated" });
        }
    );
};

// 5️⃣ DELETE class
exports.deleteClass = (req, res) => {
    db.query(
        "DELETE FROM class WHERE class_id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Class deleted" });
        }
    );
};

// ===============================
// 🔁 PREREQUISITE (RECURSIVE LOGIC)
// ===============================

// 6️⃣ GET class + prerequisites
exports.getClassListWithPrereq = (req, res) => {
    const sql = `
        SELECT 
            c.class_id,
            c.class_name,
            p.prerequisite_class_id,
            pc.class_name AS prerequisite_name
        FROM class c
        LEFT JOIN class_prerequisite p 
            ON c.class_id = p.class_id
        LEFT JOIN class pc
            ON p.prerequisite_class_id = pc.class_id
        ORDER BY c.class_id
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

// 7️⃣ GET prerequisites of a class
exports.getPrerequisites = (req, res) => {
    const sql = `
        SELECT cp.prereq_id, c.class_id, c.class_name
        FROM class_prerequisite cp
        JOIN class c ON cp.prerequisite_class_id = c.class_id
        WHERE cp.class_id = ?
    `;

    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
};

// 8️⃣ ADD prerequisite
exports.addPrerequisite = (req, res) => {
    const { prerequisite_class_id } = req.body;

    const sql = `
        INSERT INTO class_prerequisite (class_id, prerequisite_class_id)
        VALUES (?, ?)
    `;

    db.query(sql, [req.params.id, prerequisite_class_id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Prerequisite added" });
    });
};

// 9️⃣ DELETE prerequisite
exports.deletePrerequisite = (req, res) => {
    db.query(
        "DELETE FROM class_prerequisite WHERE prereq_id = ?",
        [req.params.pid],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Prerequisite removed" });
        }
    );
};
