const query = require("../config/connection");

const postJobs = async (req, res) => {
  try {
    const {
      jobName,
      jobCategory,
      description,
      location,
      salaryRange,
      last_submission,
      status,
      requirement,
      responsibility,
    } = req.body;
    if (!jobName) {
      res.status(400).send({
        success: false,
        message: "Nama Pekerjaan tidak boleh kosong",
      });
    } else if (!jobCategory) {
      res.status(400).send({
        success: false,
        message: "Kategori Pekerjaan tidak boleh kosong",
      });
    } else if (!description) {
      res.status(400).send({
        success: false,
        message: "Deskripsi tidak boleh kosong",
      });
    } else if (!salaryRange) {
      res.status(400).send({
        success: false,
        message: "Range gaji tidak boleh kosong",
      });
    } else if (!last_submission) {
      res.status(400).send({
        success: false,
        message: "Tanggal terakhir penyerahan tidak boleh kosong",
      });
    } else if (!status) {
      res.status(400).send({
        success: false,
        message: "Status tidak boleh kosong",
      });
    } else if (!requirement || requirement.length === 0) {
      res.status(400).send({
        success: false,
        message: "Persyaratan lowongan pekerjaan tidak boleh kosong",
      });
    } else if (!responsibility || responsibility.length === 0) {
      res.status(400).send({
        success: false,
        message: "Tanggung jawab pekerjaan tidak boleh kosong",
      });
    } else {
      const statusId = await query(
        "select id from status where status_name = ?",
        status
      );
      const insertFile = await query(
        "INSERT into files (file_url) VALUES (?)",
        [req.imagePath[0].path]
      );

      const jobCategoryId = await query(
        `select id from job_category where category_name like '${jobCategory}' `
      );

      let insertJobCategory;

      if (jobCategoryId.length === 0) {
        insertJobCategory = await query(
          "INSERT into job_category (category_name) VALUES (?)",
          [jobCategory]
        );
      }

      const insertJob = await query(
        "INSERT INTO jobs (name, description, location,salary_range,last_submission,files_id,status_id,job_category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          jobName,
          description,
          location,
          salaryRange,
          last_submission,
          insertFile.insertId,
          statusId[0].id,
          jobCategoryId.length > 0
            ? jobCategoryId[0].id
            : insertJobCategory.insertId,
        ]
      );
      const requirementValues = requirement.map((v) => [v, insertJob.insertId]);
      const responsibilityValues = responsibility.map((v) => [
        v,
        insertJob.insertId,
      ]);

      await query(
        "INSERT INTO job_requirements (requirement_name,jobs_id) VALUES ?",
        [requirementValues]
      );
      await query(
        "INSERT INTO job_responsibilities (responsibility_name,jobs_id) VALUES ?",
        [responsibilityValues]
      );

      res.status(201).send({
        success: true,
        message: "Lowongan Pekerjaan baru berhasil dibuat",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat Pembuatan Lowongan Pekerjaan Baru ",
    });
  }
};

module.exports = {
  postJobs,
};
