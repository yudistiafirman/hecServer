const query = require("../config/connection");

const postPartnerShipGallery = async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name) {
      res.status(400).send({
        success: false,
        message: "Nama tidak boleh kosong",
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

      await query(
        "INSERT INTO partnership_gallery (name, files_id , status_id) VALUES (?, ?, ?)",
        [name, insertFile.insertId, statusId[0].id]
      );
      res.status(201).send({
        success: true,
        message: "Galeri partnership baru berhasil dibuat",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat partnership Galeri ",
    });
  }
};

const getAllPartnerShipGallery = async (req, res) => {
  try {
    const search = req.query.search || "";
    const filterBy = req.query.filterBy || "";
    const page = parseInt(req.query.page) || 1; // Get the requested page from query parameters
    const limit = parseInt(req.query.limit) || 10; // Set the number of items to display per page
    const offset = (page - 1) * limit;

    let baseQuery = `SELECT partnership_gallery.id, partnership_gallery.name , partnership_gallery.created_at, files.file_url, status.status_name from partnership_gallery 
    join files on partnership_gallery.files_id = files.id
    join status on partnership_gallery.status_id = status.id  
    where status.status_name != 'DELETED' and partnership_gallery.name like '%${search}%' `;
    const values = [];

    baseQuery += `LIMIT ${limit} OFFSET ${offset}`;
    const partnerShipGalleryData = await query(baseQuery, values);
    const totalData = await query(
      `SELECT COUNT(*) AS total FROM partnership_gallery where status_id != (select id from status where status_name = 'DELETED')`
    );
    const total = totalData[0].total;
    const totalPages = Math.ceil(total / limit);
    res.status(200).send({
      page,
      limit,
      totalPages,
      totalItems: total,
      data: partnerShipGalleryData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat Pengambilan data partnership Gallery  ",
    });
  }
};

const getOnePartnerShipGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const partnershipGalleryDetail = await query(
      `SELECT partnership_gallery.id, partnership_gallery.name , partnership_gallery.created_at, files.file_url, status.status_name from partnership_gallery 
    join files on partnership_gallery.files_id = files.id
    join status on partnership_gallery.status_id = status.id  where partnership_gallery.id = ?`,
      id
    );

    res.status(200).send({
      success: true,
      data: partnershipGalleryDetail[0],
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat pengambilan data detail Partnership Gallery",
    });
  }
};

const deletePartnerShipGallery = async (req, res) => {
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
      UPDATE partnership_gallery
      SET status_id =
        (CASE id ${updateValues} END)
      WHERE id IN (${updateIds});
    `);
    }
    res.status(200).send({
      success: true,
      message: "Berhasil menghapus Training Gallery",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat menghapus Partnership Gallery",
    });
  }
};

const updatePartnerShipGalleryStatus = async (req, res) => {
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
      await query("update partnership_gallery SET status_id = ? where id = ?", [
        statusId[0].id,
        id,
      ]);

      res.status(200).send({
        success: true,
        message: "Berhasil update status Partnership Gallery",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Terjadi Error Saat update status Partnership Galleri ",
    });
  }
};

module.exports = {
  postPartnerShipGallery,
  getAllPartnerShipGallery,
  getOnePartnerShipGallery,
  deletePartnerShipGallery,
  updatePartnerShipGalleryStatus,
};
