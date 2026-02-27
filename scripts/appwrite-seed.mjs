import * as sdk from "node-appwrite";

const {
  AppwriteException,
  Client,
  ID,
  IndexType,
  OrderBy,
  Permission,
  Role,
  TablesDB,
} = sdk;

const requiredEnv = [
  "VITE_APPWRITE_ENDPOINT",
  "VITE_APPWRITE_PROJECT_ID",
  "VITE_APPWRITE_DATABASE_ID",
  "VITE_APPWRITE_TABLE_ID",
  "APPWRITE_API_KEY",
];

const getEnv = (key) => process.env[key]?.trim() ?? "";

const missingEnv = requiredEnv.filter((key) => !getEnv(key));

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const config = {
  endpoint: getEnv("VITE_APPWRITE_ENDPOINT"),
  projectId: getEnv("VITE_APPWRITE_PROJECT_ID"),
  projectName: getEnv("VITE_APPWRITE_PROJECT_NAME") || "Research Atlas",
  databaseId: getEnv("VITE_APPWRITE_DATABASE_ID"),
  tableId: getEnv("VITE_APPWRITE_TABLE_ID"),
  apiKey: getEnv("APPWRITE_API_KEY"),
};

const withSample = process.argv.includes("--with-sample");

const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const tablesDB = new TablesDB(client);
const adminTablePermissions = [
  Permission.create(Role.label("admin")),
  Permission.read(Role.label("admin")),
  Permission.update(Role.label("admin")),
  Permission.delete(Role.label("admin")),
];

const isAppwriteError = (error) => error instanceof AppwriteException;
const isNotFound = (error) => isAppwriteError(error) && error.code === 404;
const isConflict = (error) => isAppwriteError(error) && error.code === 409;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureDatabase() {
  try {
    await tablesDB.get({ databaseId: config.databaseId });
    console.log(`Database exists: ${config.databaseId}`);
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }

    await tablesDB.create({
      databaseId: config.databaseId,
      name: config.projectName,
    });
    console.log(`Created database: ${config.databaseId}`);
  }
}

async function ensureTable() {
  try {
    const table = await tablesDB.getTable({
      databaseId: config.databaseId,
      tableId: config.tableId,
    });
    console.log(`Table exists: ${config.tableId}`);

    const currentPermissions = [...(table.$permissions ?? [])].sort();
    const expectedPermissions = [...adminTablePermissions].sort();
    const permissionsChanged =
      currentPermissions.length !== expectedPermissions.length ||
      currentPermissions.some((permission, index) => permission !== expectedPermissions[index]);

    if (permissionsChanged || table.rowSecurity !== true || table.enabled !== true) {
      await tablesDB.updateTable({
        databaseId: config.databaseId,
        tableId: config.tableId,
        permissions: adminTablePermissions,
        rowSecurity: true,
        enabled: true,
      });
      console.log(`Updated table permissions: ${config.tableId}`);
    }
  } catch (error) {
    if (!isNotFound(error)) {
      throw error;
    }

    await tablesDB.createTable({
      databaseId: config.databaseId,
      tableId: config.tableId,
      name: "blogposts",
      permissions: adminTablePermissions,
      rowSecurity: true,
      enabled: true,
    });
    console.log(`Created table: ${config.tableId}`);
  }
}

async function listExistingColumnKeys() {
  const response = await tablesDB.listColumns({
    databaseId: config.databaseId,
    tableId: config.tableId,
  });

  return new Map(response.columns.map((column) => [column.key, column]));
}

async function listExistingIndexKeys() {
  const response = await tablesDB.listIndexes({
    databaseId: config.databaseId,
    tableId: config.tableId,
  });

  return new Map(response.indexes.map((index) => [index.key, index]));
}

const postColumns = [
  {
    key: "title",
    create: () =>
      tablesDB.createStringColumn({
        databaseId: config.databaseId,
        tableId: config.tableId,
        key: "title",
        size: 255,
        required: true,
      }),
  },
  {
    key: "slug",
    create: () =>
      tablesDB.createStringColumn({
        databaseId: config.databaseId,
        tableId: config.tableId,
        key: "slug",
        size: 255,
        required: true,
      }),
  },
  {
    key: "excerpt",
    create: () =>
      tablesDB.createStringColumn({
        databaseId: config.databaseId,
        tableId: config.tableId,
        key: "excerpt",
        size: 2000,
        required: true,
      }),
  },
  {
    key: "coverImageUrl",
    create: () =>
      tablesDB.createUrlColumn({
        databaseId: config.databaseId,
        tableId: config.tableId,
        key: "coverImageUrl",
        required: false,
      }),
  },
  {
    key: "status",
    create: () =>
      tablesDB.createEnumColumn({
        databaseId: config.databaseId,
        tableId: config.tableId,
        key: "status",
        elements: ["draft", "published"],
        required: true,
        default: "draft",
      }),
  },
  {
    key: "tags",
    create: () =>
      tablesDB.createStringColumn({
        databaseId: config.databaseId,
        tableId: config.tableId,
        key: "tags",
        size: 64,
        required: true,
        array: true,
      }),
  },
  {
    key: "contentJson",
    create: () =>
      tablesDB.createLongtextColumn({
        databaseId: config.databaseId,
        tableId: config.tableId,
        key: "contentJson",
        required: true,
      }),
  },
  {
    key: "contentHtml",
    create: () =>
      tablesDB.createLongtextColumn({
        databaseId: config.databaseId,
        tableId: config.tableId,
        key: "contentHtml",
        required: true,
      }),
  },
  {
    key: "publishedAt",
    create: () =>
      tablesDB.createDatetimeColumn({
        databaseId: config.databaseId,
        tableId: config.tableId,
        key: "publishedAt",
        required: false,
      }),
  },
];

const postIndexes = [
  {
    key: "idx_slug_unique",
    create: () =>
      tablesDB.createIndex({
        databaseId: config.databaseId,
        tableId: config.tableId,
        key: "idx_slug_unique",
        type: IndexType.Unique,
        columns: ["slug"],
        orders: [OrderBy.Asc],
      }),
  },
  {
    key: "idx_status",
    create: () =>
      tablesDB.createIndex({
        databaseId: config.databaseId,
        tableId: config.tableId,
        key: "idx_status",
        type: IndexType.Key,
        columns: ["status"],
        orders: [OrderBy.Asc],
      }),
  },
  {
    key: "idx_published_at",
    create: () =>
      tablesDB.createIndex({
        databaseId: config.databaseId,
        tableId: config.tableId,
        key: "idx_published_at",
        type: IndexType.Key,
        columns: ["publishedAt"],
        orders: [OrderBy.Desc],
      }),
  },
];

async function ensureColumns() {
  const existingColumns = await listExistingColumnKeys();

  for (const column of postColumns) {
    if (existingColumns.has(column.key)) {
      console.log(`Column exists: ${column.key}`);
      continue;
    }

    try {
      await column.create();
      console.log(`Created column: ${column.key}`);
    } catch (error) {
      if (!isConflict(error)) {
        throw error;
      }

      console.log(`Column already exists after retry race: ${column.key}`);
    }
  }
}

async function waitForColumns() {
  const requiredKeys = new Set(postColumns.map((column) => column.key));
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    const response = await tablesDB.listColumns({
      databaseId: config.databaseId,
      tableId: config.tableId,
    });

    const readyKeys = new Set(
      response.columns
        .filter((column) => requiredKeys.has(column.key))
        .filter((column) => column.status === "available")
        .map((column) => column.key),
    );

    if (readyKeys.size === requiredKeys.size) {
      return;
    }

    await sleep(1_000);
  }

  throw new Error("Timed out waiting for Appwrite columns to become available.");
}

async function ensureIndexes() {
  const existingIndexes = await listExistingIndexKeys();

  for (const index of postIndexes) {
    if (existingIndexes.has(index.key)) {
      console.log(`Index exists: ${index.key}`);
      continue;
    }

    try {
      await index.create();
      console.log(`Created index: ${index.key}`);
    } catch (error) {
      if (!isConflict(error)) {
        throw error;
      }

      console.log(`Index already exists after retry race: ${index.key}`);
    }
  }
}

async function seedSamplePost() {
  const now = new Date().toISOString();
  const rowId = "welcome-post";

  await tablesDB.upsertRow({
    databaseId: config.databaseId,
    tableId: config.tableId,
    rowId,
    data: {
      title: "Welcome to Research Atlas",
      slug: "welcome-to-research-atlas",
      excerpt: "Starter post created by the Appwrite bootstrap script.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      status: "published",
      tags: ["welcome", "setup"],
      contentJson: JSON.stringify([
        {
          id: "intro",
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "This is a starter post created by the Appwrite seed script.",
            },
          ],
        },
      ]),
      contentHtml: "<p>This is a starter post created by the Appwrite seed script.</p>",
      publishedAt: now,
    },
  });

  console.log(`Upserted sample post: ${rowId}`);
}

async function main() {
  await ensureDatabase();
  await ensureTable();
  await ensureColumns();
  await waitForColumns();
  await ensureIndexes();

  if (withSample) {
    await seedSamplePost();
  }
}

main().catch((error) => {
  console.error("Appwrite bootstrap failed.");

  if (isAppwriteError(error)) {
    console.error(`${error.code ?? "Appwrite"}: ${error.message}`);
  } else if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
});
