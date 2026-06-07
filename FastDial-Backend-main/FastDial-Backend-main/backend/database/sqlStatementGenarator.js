const db = require("./db");

async function generateInsertStatement(tableName, req) {
  const columns = Object.keys(req.body);
  const values = Object.values(req.body);

  const columnList = columns.map((column) => `\`${column}\``).join(", ");
  const placeholders = columns.map(() => "?").join(", ");

  const sql = `INSERT INTO \`${tableName}\` (${columnList}) VALUES (${placeholders});`;

  try {
    const result = await db(sql, values);
    console.log(result);

    return { insertId: result.insertId, ...result };
  } catch (error) {
    console.error("Error inserting data:", error);
    throw error;
  }
}

// async function generateUpdateStatement(tableName, req, whereCondition) {
//   if (!req.body || Object.keys(req.body).length === 0) {
//     throw new Error("No fields provided for update.");
//   }

//   if (!req.body[whereCondition]) {
//     throw new Error(`Missing whereCondition: ${whereCondition}`);
//   }

//   // Extract columns excluding whereCondition
//   const updateColumns = Object.keys(req.body).filter(
//     (key) => key !== whereCondition
//   );
//   const updateValues = updateColumns.map((key) => req.body[key]);
//   const whereConditionValue = req.body[whereCondition];

//   if (updateColumns.length === 0) {
//     throw new Error("No fields to update.");
//   }

//   // Generate SET clause
//   const setClause = updateColumns
//     .map((column) => `\`${column}\` = ?`)
//     .join(", ");
//   const sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE \`${whereCondition}\` = ?;`;

//   const finalValues = [...updateValues, whereConditionValue];

//   console.log("Final Query:", sql);
//   console.log("Values:", finalValues);

//   // Execute update query
//   const result = await db(sql, finalValues);

//   return result; // Returning the result for checking affected rows
// }

async function generateUpdateStatement(tableName, req, whereCondition) {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new Error("No fields provided for update.");
  }

  // Ensure `whereCondition` value is present (check `req.body` and `req.params`)
  const whereConditionValue =
    req.body[whereCondition] || req.params[whereCondition];
  if (!whereConditionValue) {
    throw new Error(`Missing whereCondition: ${whereCondition}`);
  }

  // Extract columns excluding whereCondition
  const updateColumns = Object.keys(req.body).filter(
    (key) => key !== whereCondition
  );
  if (updateColumns.length === 0) {
    throw new Error("No fields to update.");
  }

  let updateValues = [];
  let setClauses = [];

  for (let column of updateColumns) {
    let value = req.body[column];

    // Check if the column should be treated as JSON
    if (typeof value === "object" && value !== null) {
      value = JSON.stringify(value);
    }

    setClauses.push(`\`${column}\` = ?`);
    updateValues.push(value);
  }

  // Finalize query
  const sql = `UPDATE \`${tableName}\` SET ${setClauses.join(
    ", "
  )} WHERE \`${whereCondition}\` = ?;`;
  updateValues.push(whereConditionValue);

  console.log("Final Query:", sql);
  console.log("Values:", updateValues);

  // Execute update query
  const result = await db(sql, updateValues);
  return result; // Returning the result for checking affected rows
}

module.exports = { generateInsertStatement, generateUpdateStatement };
