const util = require("util");
const mysql = require("mysql2");
const { Client } = require("ssh2");
require("dotenv").config();
var sshClient = new Client();

const dbServer = {
	host: "verona.sg.domainesia.com",
	port: 3306, // port lokal yang di-forward ke port MySQL di server,
	user: "heccoid1_root",
	password: "Haloaulia15",
	database: "heccoid1_hec_database",
};

const tunnelConfig = {
	host: "verona.sg.domainesia.com",
	port: 64000,
	username: "heccoid1",
	password: "Haloaulia15",
};

const forwardConfig = {
	srcHost: "127.0.0.1",
	srcPort: 3306,
	dstHost: dbServer.host,
	dstPort: dbServer.port,
};

const db = new Promise((resolve, reject) => {
	sshClient
		.on("ready", () => {
			sshClient.forwardOut(
				forwardConfig.srcHost,
				forwardConfig.srcPort,
				forwardConfig.dstHost,
				forwardConfig.dstPort,
				(err, stream) => {
					if (err) reject(err);
					const updatedDbServer = {
						...dbServer,
						stream,
					};
					const connection = mysql.createConnection(updatedDbServer);
					connection.connect((error) => {
						if (error) {
							reject(error);
						} else {
							resolve(connection); // Resolve with the connection object
						}
					});
				}
			);
		})
		.connect(tunnelConfig);
});

// Use the connection from the resolved promise for queries
const query = async (sql, params) => {
	const connection = await db;
	return util.promisify(connection.query).bind(connection)(sql, params);
};

module.exports = query;
