const query = require("../config/connection");

const getAllJobs = async (req, res) => {
  try {
    const search = req.query.search || "";
    const filterBy = req.query.filterBy || "";
    const page = parseInt(req.query.page) || 1; // Get the requested page from query parameters
    const limit = parseInt(req.query.limit) || 10; // Set the number of items to display per page
    const offset = (page - 1) * limit;

    let baseQuery = `SELECT jobs.id, jobs.name , jobs.last_submission, job_category.category_name, status.status_name, job_type.type_name from jobs 
    join job_category on jobs.job_category_id = job_category.id 
    join status on jobs.status_id = status.id  
    join job_type on jobs.job_type_id = job_type.id
    where status.status_name != 'DELETED' and name like '%${search}%' `;

    const values = [];

    if (filterBy) {
      baseQuery += `and job_category_id = ?`;
      values.push(filterBy);
    }

    baseQuery += `LIMIT ${limit} OFFSET ${offset}`;

    const jobsData = await query(baseQuery, values);
    const totalData = await query(
      `SELECT COUNT(*) AS total FROM jobs where status_id != (select id from status where status_name = 'DELETED')`
    );
    const total = totalData[0].total;
    const totalPages = Math.ceil(total / limit);
    res.status(200).send({
      page,
      limit,
      totalPages,
      totalItems: total,
      data: jobsData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat Pengambilan data Lowongan Pekerjaan  ",
    });
  }
};

const getAllJobCategories = async (req, res) => {
  try {
    const categoryData = await query("select * from job_category");
    res.status(200).send({
      success: true,
      data: categoryData,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat Pengambilan data Kategori Pekerjaan  ",
    });
  }
};

const getOneJob = async (req, res) => {
  try {
    const { id } = req.params;
    const jobDetail = await query(
      `SELECT jobs.id, jobs.name, jobs.description, jobs.location, 
    jobs.salary_range,jobs.created_at, jobs.last_submission,
    job_category.category_name, status.status_name,job_type.type_name , files.file_url from jobs 
    join job_category on jobs.job_category_id = job_category.id 
    join status on jobs.status_id = status.id 
    join files on jobs.files_id = files.id 
    join job_type on jobs.job_type_id = job_type.id
    where jobs.id = ?`,
      id
    );

    const requirementsData = await query(
      `select requirement_name from job_requirements where jobs_id = ?`,
      id
    );
    const responsibilityData = await query(
      `select responsibility_name from job_responsibilities where jobs_id = ?`,
      id
    );
    jobDetail[0].responsibilities = responsibilityData.map(
      (v) => v.responsibility_name
    );
    jobDetail[0].requirements = requirementsData.map((v) => v.requirement_name);

    res.status(200).send({
      success: true,
      data: jobDetail[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat pengambilan data detail Lowongan Pekerjaan",
    });
  }
};

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
      jobType,
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
    } else if (!jobType) {
      res.status(400).send({
        success: false,
        message: "Tipe  pekerjaan tidak boleh kosong",
      });
    } else {
      const statusId = await query(
        "select id from status where status_name = ?",
        status
      );
      const jobTypeId = await query(
        `select id from job_type where type_name = ?`,
        jobType
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
        "INSERT INTO jobs (name, description, location,salary_range,last_submission,files_id,status_id,job_category_id,job_type_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
          jobTypeId[0].id,
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

const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!status) {
      res.status(400).send({
        success: false,
        message: "Status tidak boleh kosong",
      });
    } else {
      const statusId = await query(
        "select id from status where status_name = ?",
        status
      );
      await query("update jobs SET status_id = ? where id = ?", [
        statusId[0].id,
        id,
      ]);

      res.status(200).send({
        success: true,
        message: "Berhasil update status pekerjaan",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat update status lowongan pekerjaan ",
    });
  }
};

module.exports = {
  postJobs,
  getAllJobs,
  getOneJob,
  getAllJobCategories,
  updateJobStatus,
};
