const query = require("../config/connection");

const postTraining = async (req, res) => {
  try {
    const {
      trainingName,
      trainingCategory,
      startDate,
      endDate,
      descriptions,
      status,
      plusValue,
    } = req.body;
    if (!trainingName) {
      res.status(400).send({
        success: false,
        message: "Nama Pelatihan tidak boleh kosong",
      });
    } else if (!trainingCategory) {
      res.status(400).send({
        success: false,
        message: "Kategori Pelatihan tidak boleh kosong",
      });
    } else if (!startDate) {
      res.status(400).send({
        success: false,
        message: "Tanggal Mulai Pelatihan tidak boleh kosong",
      });
    } else if (!endDate) {
      res.status(400).send({
        success: false,
        message: "Tanggal Berakhir Pelatihan tidak boleh kosong",
      });
    } else if (!descriptions) {
      res.status(400).send({
        success: false,
        message: "Deskripsi Pelatihan tidak boleh kosong",
      });
    } else if (!status) {
      res.status(400).send({
        success: false,
        message: "Status tidak boleh kosong",
      });
    } else if (!plusValue || plusValue.length === 0) {
      res.status(400).send({
        success: false,
        message: "Nilai plus pelatihan tidak boleh kosong",
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

      const trainingCategoryId = await query(
        `select id from training_category where category_name like '${trainingCategory}' `
      );

      let insertTrainingCategory;
      if (trainingCategoryId.length === 0) {
        insertTrainingCategory = await query(
          "INSERT into training_category (category_name) VALUES (?)",
          [trainingCategory]
        );
      }

      const insertTraining = await query(
        "INSERT INTO training (name, start_date, end_date,descriptions,status_id,files_id,training_category_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          trainingName,
          startDate,
          endDate,
          descriptions,
          statusId[0].id,
          insertFile.insertId,
          trainingCategoryId.length > 0
            ? trainingCategoryId[0].id
            : insertTrainingCategory.insertId,
        ]
      );
      const plusValues = plusValue.map((v) => [v, insertTraining.insertId]);
      await query(
        "INSERT INTO training_plus_value (value_name,training_id) VALUES ?",
        [plusValues]
      );

      res.status(201).send({
        success: true,
        message: "Pelatihan baru berhasil dibuat",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat Pembuatan Pelatihan Baru ",
    });
  }
};

const getAllTraining = async (req, res) => {
  try {
    const search = req.query.search || "";
    const filterBy = req.query.filterBy || "";
    const page = parseInt(req.query.page) || 1; // Get the requested page from query parameters
    const limit = parseInt(req.query.limit) || 10; // Set the number of items to display per page
    const offset = (page - 1) * limit;
    let baseQuery = `SELECT training.id, training.name , training.start_date, training.end_date ,training_category.category_name, training.isFull ,status.status_name from training 
    join training_category on training.training_category_id = training_category.id 
    join status on training.status_id = status.id  
    where status.status_name != 'DELETED' and name like '%${search}%' `;

    const values = [];

    if (filterBy) {
      baseQuery += `and training_category_id = ?`;
      values.push(filterBy);
    }

    baseQuery += `LIMIT ${limit} OFFSET ${offset}`;

    const trainingData = await query(baseQuery, values);
    const totalData = await query(
      `SELECT COUNT(*) AS total FROM training where status_id != (select id from status where status_name = 'DELETED')`
    );
    const total = totalData[0].total;
    const totalPages = Math.ceil(total / limit);
    res.status(200).send({
      page,
      limit,
      totalPages,
      totalItems: total,
      data: trainingData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat Mengambil semua data training ",
    });
  }
};

const getOneTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const trainingDetail = await query(
      `SELECT training.id, training.name, training.descriptions, training.start_date, 
    training.end_date,training.created_at,
    training_category.category_name, training.isFull, status.status_name , files.file_url from training
    join training_category on training.training_category_id = training_category.id 
    join status on training.status_id = status.id 
    join files on training.files_id = files.id 
    where training.id = ?`,
      id
    );

    const plusValuesData = await query(
      `select value_name from training_plus_value where training_id = ?`,
      id
    );
    trainingDetail[0].plusValues = plusValuesData.map((v) => v.value_name);

    res.status(200).send({
      success: true,
      data: trainingDetail[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat Mengambil detail data training ",
    });
  }
};

const updateTrainingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!status) {
      res.status(400).send({
        success: false,
        message: "Status tidak boleh kosong",
      });
    } else if (!id) {
      res.status(400).send({
        success: false,
        message: "id tidak boleh kosong",
      });
    } else {
      const statusId = await query(
        "select id from status where status_name = ?",
        status
      );
      await query("update training SET status_id = ? where id = ?", [
        statusId[0].id,
        id,
      ]);

      res.status(200).send({
        success: true,
        message: "Berhasil update status training",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat update status training ",
    });
  }
};

const deieteTraining = async (req, res) => {
  try {
    const { idToDelete } = req.body;
    if (!idToDelete || idToDelete.length === 0) {
      res.status(400).send({
        success: false,
        message: "id yang akan dihapus tidak boleh kosong",
      });
    } else {
      const updateValues = idToDelete
        .map(
          (v) =>
            `WHEN ${v} THEN (select id from status where status_name = 'DELETED')`
        )
        .join(" ");
      const updateIds = idToDelete.join(",");
      await query(`
          UPDATE training
          SET status_id =
            (CASE id ${updateValues} END)
          WHERE id IN (${updateIds});
        `);
    }
    res.status(200).send({
      success: true,
      message: "Berhasil menghapus training",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat menghapus pelatihan ",
    });
  }
};

const getTrainingCategories = async (req, res) => {
  try {
    const categoryData = await query("select * from training_category");
    res.status(200).send({
      success: true,
      data: categoryData,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat Pengambilan data Kategori Pelatihan  ",
    });
  }
};

const updatePopularTraining = async (req, res) => {
  try {
    const { isPopular } = req.body;
    const { id } = req.params;
    if (!isPopular) {
      res.status(400).send({
        success: false,
        message: "Status tidak boleh kosong",
      });
    } else if (!id) {
      res.status(400).send({
        success: false,
        message: "id tidak boleh kosong",
      });
    } else {
      await query("update training SET isPopular = ? where id = ?", [
        isPopular,
        id,
      ]);

      res.status(200).send({
        success: true,
        message: "Berhasil update status popular training",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat mungubah data popular training ",
    });
  }
};

const updateFullTraining = async (req, res) => {
  try {
    const { isFull } = req.body;
    const { id } = req.params;
    if (!isFull) {
      res.status(400).send({
        success: false,
        message: "Status tidak boleh kosong",
      });
    } else if (!id) {
      res.status(400).send({
        success: false,
        message: "id tidak boleh kosong",
      });
    } else {
      await query("update training SET isFull = ? where id = ?", [isFull, id]);

      res.status(200).send({
        success: true,
        message: "Berhasil update status full training",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat mungubah data full training ",
    });
  }
};

module.exports = {
  postTraining,
  getAllTraining,
  getOneTraining,
  updateTrainingStatus,
  deieteTraining,
  getTrainingCategories,
  updatePopularTraining,
  updateFullTraining,
};
