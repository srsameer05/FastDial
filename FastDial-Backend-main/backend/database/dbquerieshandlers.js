const db = require("./db");

async function getData(req, res, viewName) {
  try {
    const queryParams = req.query || {};
    const inputParameters = [];
    const whereConditions = [];

    // Construct query conditions and parameters
    function isDate(value) {
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    }

    // Construct query conditions and parameters
    Object.entries(queryParams).forEach(([key, value], index) => {
      const paramName = `param${index + 1}`;
      if (isDate(value)) {
        // Use DATE() for date values
        whereConditions.push(`DATE(\`${key}\`) = ?`);
      } else {
        whereConditions.push(`\`${key}\` = ?`);
      }
      inputParameters.push(value);
    });

    // Construct the SQL query
    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";
    const orderByClause = req.query.orderby
      ? `ORDER BY \`${req.query.orderby}\` DESC`
      : "";
    // const sqlQuery = `SELECT * FROM \`${viewName}\` ${whereClause} ${orderByClause}`;
    const sqlQuery = `SELECT * FROM ${viewName}  ${whereClause} ${orderByClause}`;

    console.log(sqlQuery); // For debugging

    // Execute query
    const result = await db(sqlQuery, inputParameters);
    res.status(200).send(result);
  } catch (err) {
    res.status(500).send({ message: "Internal server error!" });
    console.error(err);
  }
}

module.exports = getData;
