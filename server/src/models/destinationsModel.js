import { pool } from "../config/db.js";

/** List/search for cards */
export async function searchDestinationsModel({
  tagIds,
  countryId,
  international,
  months,
  q,
  limit = 20,
  offset = 0,
}) {
  const hasMonthFilter = Array.isArray(months) && months.length > 0;
  const params = [];
  let i = 1;

  let sql = `
    SELECT d.id, d.name, d.short_description, d.safety_score, d.visa_type,
           c.name AS country,
           (SELECT di.image_url FROM destination_images di
              WHERE di.destination_id = d.id
              ORDER BY is_cover DESC, id ASC
              LIMIT 1) AS cover_image,
           ROUND(AVG(s.suitability)::numeric, 2) AS season_score
    FROM destinations d
    JOIN countries c ON c.id = d.country_id
    LEFT JOIN seasonality s ON s.destination_id = d.id
  `;

  const where = [];

  if (Array.isArray(tagIds) && tagIds.length) {
    sql += ` JOIN destination_tags dt ON dt.destination_id = d.id `;
    where.push(`dt.tag_id = ANY($${i}::int[])`);
    params.push(tagIds);
    i++;
  }

  if (countryId) {
    where.push(`d.country_id = $${i}`);
    params.push(Number(countryId));
    i++;
  }

  if (international && countryId) {
    where.push(`d.country_id <> $${i}`);
    params.push(Number(countryId));
    i++;
  }

  if (Array.isArray(months) && months.length) {
    where.push(`s.month = ANY($${i}::int[])`);
    params.push(months);
    i++;
  }

  if (q) {
    where.push(`(
      d.name ILIKE $${i}
      OR c.name ILIKE $${i}
      OR COALESCE(d.short_description, '') ILIKE $${i}
      OR COALESCE(d.about, '') ILIKE $${i}
    )`);
    params.push(`%${q}%`);
    i++;
  }

  if (where.length) sql += ` WHERE ` + where.join(" AND ") + ` `;

  const orderBy = hasMonthFilter
    ? `
      ORDER BY
        COALESCE(AVG(s.suitability), 0) DESC,
        d.safety_score DESC NULLS LAST,
        CASE
          WHEN LOWER(COALESCE(d.visa_type, '')) LIKE '%visa-free%' THEN 1
          WHEN LOWER(COALESCE(d.visa_type, '')) LIKE '%visa free%' THEN 1
          WHEN LOWER(COALESCE(d.visa_type, '')) LIKE '%visa-on-arrival%' THEN 2
          WHEN LOWER(COALESCE(d.visa_type, '')) LIKE '%visa on arrival%' THEN 2
          ELSE 3
        END ASC,
        d.name ASC
    `
    : `
      ORDER BY d.name ASC
    `;

  sql += `
    GROUP BY d.id, c.name
    ${orderBy}
    LIMIT $${i} OFFSET $${i + 1}
  `;
  params.push(Number(limit), Number(offset));

  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function getDestinationById(id) {
  const base = await pool.query(
    `
    SELECT d.*, c.name AS country
    FROM destinations d
    JOIN countries c ON c.id = d.country_id
    WHERE d.id = $1
  `,
    [id]
  );
  if (!base.rows[0]) return null;

  const tags = await pool.query(
    `
    SELECT t.id, t.name
    FROM destination_tags dt
    JOIN tags t ON t.id = dt.tag_id
    WHERE dt.destination_id = $1
    ORDER BY t.name
  `,
    [id]
  );

  const images = await pool.query(
    `
    SELECT image_url, is_cover
    FROM destination_images
    WHERE destination_id = $1
    ORDER BY is_cover DESC, id ASC
  `,
    [id]
  );

  const seasonality = await pool.query(
    `
    SELECT month, suitability
    FROM seasonality
    WHERE destination_id = $1
    ORDER BY month
  `,
    [id]
  );

  return {
    ...base.rows[0],
    tags: tags.rows,
    images: images.rows,
    seasonality: seasonality.rows,
  };
}
