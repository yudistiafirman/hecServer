const util = require("util");
const mysql = require("mysql2");
const { Client } = require("ssh2");
require("dotenv").config();
var sshClient = new Client();

const dbServer = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT, // port lokal yang di-forward ke port MySQL di server,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
};

const tunnelConfig = {
	host: process.env.TUNNEL_HOST,
	port: process.env.TUNNEL_PORT,
	username: process.env.TUNNEL_USERNAME,
	password: process.env.TUNNEL_PASSWORD,
};

const forwardConfig = {
	srcHost: process.env.FORWARD_HOST,
	srcPort: process.env.FORWARD_PORT,
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
