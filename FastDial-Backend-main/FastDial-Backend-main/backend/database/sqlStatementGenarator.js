const db = require("./db");

function normalizePayload(input) {
  if (!input) return {};
  if (input.body) return input.body;
  return input;
}

function normalizeValue(value) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }

  return value;
}

function buildWhereClause(where, source = {}) {
  if (!where) {
    throw new Error("Where clause is required for update/delete operations.");
  }

  if (typeof where === "string") {
    const rawValue = source[where] ?? source.body?.[where] ?? source.params?.[where];

    if (rawValue === undefined || rawValue === null || rawValue === "") {
      throw new Error(`Missing where clause value for: ${where}`);
    }

    return {
      sql: `\`${where}\` = ?`,
      values: [normalizeValue(rawValue)],
    };
  }

  if (Array.isArray(where)) {
    const [column, rawValue] = where;
    return {
      sql: `\`${column}\` = ?`,
      values: [normalizeValue(rawValue)],
    };
  }

  if (typeof where === "object") {
    const conditions = Object.entries(where)
      .filter(([, value]) => value !== undefined)
      .map(([column, value]) => `\`${column}\` = ?`);

    const values = Object.entries(where)
      .filter(([, value]) => value !== undefined)
      .map(([, value]) => normalizeValue(value));

    if (conditions.length === 0) {
      throw new Error("Where object is empty.");
    }

    return {
      sql: conditions.join(" AND "),
      values,
    };
  }

  throw new Error("Unsupported where clause format.");
}

async function generateInsertStatement(tableName, input) {
  const payload = normalizePayload(input);
  const columns = Object.keys(payload).filter((key) => payload[key] !== undefined);

  if (columns.length === 0) {
    throw new Error("No fields provided for insert.");
  }

  const columnList = columns.map((column) => `\`${column}\``).join(", ");
  const placeholders = columns.map(() => "?").join(", ");
  const values = columns.map((column) => normalizeValue(payload[column]));

  const sql = `INSERT INTO \`${tableName}\` (${columnList}) VALUES (${placeholders});`;

  try {
    const result = await db(sql, values);
    return { insertId: result.insertId, ...result };
  } catch (error) {
    console.error("Error inserting data:", error);
    throw error;
  }
}

async function generateUpdateStatement(tableName, input, where = null, options = {}) {
  const payload = normalizePayload(input);
  const source = input && input.body ? input : { body: payload, params: options.params || {} };

  if (!payload || Object.keys(payload).length === 0) {
    throw new Error("No fields provided for update.");
  }

  const whereClause = buildWhereClause(where || options.where || options.id || options.whereCondition, source);
  const updateColumns = Object.keys(payload).filter((key) => {
    if (where && typeof where === "string" && key === where) return false;
    if (where && Array.isArray(where) && key === where[0]) return false;
    if (where && typeof where === "object" && Object.prototype.hasOwnProperty.call(where, key)) return false;
    return true;
  });

  if (updateColumns.length === 0) {
    throw new Error("No fields to update.");
  }

  const setClause = updateColumns.map((column) => `\`${column}\` = ?`).join(", ");
  const values = updateColumns.map((column) => normalizeValue(payload[column]));
  const sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE ${whereClause.sql};`;

  const result = await db(sql, [...values, ...whereClause.values]);
  return result;
}

async function generateDeleteStatement(tableName, input, where = null, options = {}) {
  const payload = normalizePayload(input);
  const source = input && input.body ? input : { body: payload, params: options.params || {} };

  const whereClause = buildWhereClause(where || options.where || options.id || options.whereCondition, source);
  const sql = `DELETE FROM \`${tableName}\` WHERE ${whereClause.sql};`;

  const result = await db(sql, whereClause.values);
  return result;
}

const sql = {
  create(tableName, data) {
    return generateInsertStatement(tableName, data);
  },

  update(tableName, data, where = null) {
    return generateUpdateStatement(tableName, data, where || data?.where || null);
  },

  delete(tableName, data = {}, where = null) {
    if (data && typeof data === "object" && !Array.isArray(data) && Object.prototype.hasOwnProperty.call(data, "body")) {
      return generateDeleteStatement(tableName, data, where || data.params || data.body || null);
    }

    return generateDeleteStatement(tableName, { body: data }, where || data || null);
  },
};

module.exports = Object.assign(sql, {
  generateInsertStatement,
  generateUpdateStatement,
  generateDeleteStatement,
  buildWhereClause,
});
