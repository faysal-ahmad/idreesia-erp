#!/usr/bin/env node
/*
 * Creates a new store and fills it with sample data, so every screen and
 * report of the Stores module has something to show.
 *
 * It assumes the rest of the system already has data: users (who created and
 * approved the forms) and people (who purchased, received, issued and took
 * the goods). The people named on other stores' forms are used when there
 * are any. Nothing outside the new store is created or changed.
 *
 * What it makes, over the last ~6 months:
 *   - The store, with every user or user group that has access to an
 *     existing store given the same permissions on it.
 *   - Item categories, a tree of locations, and vendors.
 *   - ~55 stock items in all units of measurement, with minimum stock
 *     levels; some verified, some below their minimum and some out of stock.
 *   - Purchase forms every few days (some with returned items), issuance
 *     forms on most days (some with items returned to the store), and stock
 *     adjustments in and out. Forms older than 10 days are approved, the
 *     newer ones are waiting for approval.
 *
 * Each item's current stock level is its starting level plus the purchase
 * forms, issuance forms and adjustments, as the module's own recalculation
 * gives it. No images or attachments are made.
 *
 * Every run makes a new store: `--name "Some Store"` names it (default
 * "Sample Store"; a number is added if the name is taken).
 *
 * It refuses to run against a database that isn't local (localhost or the
 * docker-compose `mongo` host) unless --allow-remote is passed.
 *
 * Run it from the repository root, inside the local idreesia-web container
 * (where the docker-compose host name `mongo` resolves). It reads MONGO_URL
 * from idreesia-web/.env:
 *
 *   docker compose exec idreesia-web meteor yarn sample-data:stores
 *   docker compose exec idreesia-web meteor yarn sample-data:stores --name "Langar Store"
 *
 * Outside the container, set MONGO_URL to a localhost address (a variable
 * already set in the environment wins over the file):
 *
 *   MONGO_URL='mongodb://localhost:27017/idreesia-erp?directConnection=true' yarn sample-data:stores
 */
import { MongoClient } from 'mongodb';

import {
  addDays,
  argValue,
  between,
  daysAgo,
  docId,
  mongoUrlFromSettings,
  pickOne,
  pickSome,
  random,
  roundQuantity,
  withoutUndefined,
} from './common.mjs';

const mongoUrl = mongoUrlFromSettings();

const COLLECTIONS = {
  stores: 'inventory-physical-stores',
  access: 'inventory-physical-store-access',
  categories: 'inventory-item-categories',
  locations: 'inventory-locations',
  vendors: 'inventory-vendors',
  stockItems: 'inventory-stock-items',
  purchaseForms: 'inventory-purchase-forms',
  issuanceForms: 'inventory-issuance-forms',
  stockAdjustments: 'inventory-stock-adjustments',
  users: 'users',
  people: 'common-people',
};

/** How many days of history to make. */
const HISTORY_DAYS = 180;
/** Forms older than this are approved; newer ones wait for approval. */
const APPROVED_AFTER_DAYS = 10;

// ---------------------------------------------------------------------------
// The items of the store
// ---------------------------------------------------------------------------

/*
 * [name, company, unit, unit price, starting level, minimum level,
 *  most issued at once, usual purchase quantity, details]
 */
const ITEMS = {
  Groceries: [
    ['Basmati Rice', 'Guard', 'kg', 320, 400, 100, 40, 300],
    ['Sugar', undefined, 'kg', 165, 250, 80, 25, 200],
    ['Masoor Daal', undefined, 'kg', 290, 120, 40, 15, 100],
    ['Chana Daal', undefined, 'kg', 260, 100, 40, 15, 100],
    ['Flour (Atta)', 'Sunridge', 'kg', 120, 500, 150, 50, 400],
    ['Cooking Oil', 'Dalda', 'l', 540, 150, 50, 20, 120],
    ['Ghee', 'Dalda', 'kg', 560, 80, 30, 10, 60],
    ['Tea Leaves', 'Tapal Danedar', 'kg', 1650, 30, 10, 3, 25],
    ['Salt', 'National', 'kg', 60, 60, 20, 5, 50],
    ['Milk Powder', 'Nido', 'lbs', 1100, 40, 15, 5, 40],
  ],
  Spices: [
    ['Red Chilli Powder', 'Shan', 'kg', 900, 20, 5, 2, 15],
    ['Turmeric Powder', 'National', 'kg', 700, 15, 5, 2, 10],
    ['Coriander Powder', undefined, 'kg', 600, 15, 5, 2, 10],
    ['Garam Masala', 'National', 'kg', 1800, 8, 3, 1, 6],
    ['Cumin Seeds', undefined, 'kg', 1600, 10, 3, 1, 8],
  ],
  Utensils: [
    ['Steel Cooking Pot 40L', undefined, 'quantity', 9500, 6, 2, 2, 2, 'Heavy base, with lid'],
    ['Copper Deg (100 kg)', undefined, 'quantity', 45000, 3, 1, 1, 1],
    ['Steel Ladle', undefined, 'quantity', 450, 25, 10, 5, 15],
    ['Steel Plate', undefined, 'quantity', 220, 400, 150, 60, 200],
    ['Steel Glass', undefined, 'quantity', 150, 400, 150, 60, 200],
    ['Water Jug', undefined, 'quantity', 600, 40, 15, 8, 20],
    ['Serving Tray', undefined, 'quantity', 650, 60, 20, 10, 30],
    ['Kitchen Knife Set', 'Kiam', 'quantity', 1200, 8, 3, 2, 4],
  ],
  Crockery: [
    ['Ceramic Tea Cup', undefined, 'quantity', 180, 200, 60, 30, 100],
    ['Tea Saucer', undefined, 'quantity', 120, 200, 60, 30, 100],
    ['Dinner Plate', 'Sonex', 'quantity', 350, 150, 50, 25, 80],
    ['Thermos Flask', undefined, 'quantity', 2200, 12, 4, 3, 6],
  ],
  Cleaning: [
    ['Floor Cleaner 5L', 'Finis', 'quantity', 1350, 20, 8, 4, 15],
    ['Phenyl', undefined, 'l', 220, 60, 20, 8, 40],
    ['Dishwashing Liquid', 'Lemon Max', 'l', 480, 40, 15, 6, 30],
    ['Washing Powder', 'Surf Excel', 'kg', 650, 30, 10, 4, 25],
    ['Mop with Stick', undefined, 'quantity', 750, 15, 5, 3, 10],
    ['Broom', undefined, 'quantity', 250, 25, 10, 4, 15],
    ['Garbage Bags (pack)', undefined, 'quantity', 420, 40, 15, 6, 30],
    ['Toilet Brush', undefined, 'quantity', 300, 15, 5, 3, 10],
    ['Tissue Roll', 'Rose Petal', 'quantity', 90, 120, 40, 20, 100],
  ],
  Electrical: [
    ['LED Bulb 18W', 'Philips', 'quantity', 450, 60, 20, 10, 40],
    ['LED Tube Light 20W', 'Philips', 'quantity', 900, 30, 10, 5, 20],
    ['Electric Wire 7/29', 'Fast Cables', 'm', 160, 300, 100, 40, 270, 'Sold by the metre'],
    ['Switch', 'Clipsal', 'quantity', 120, 80, 25, 10, 50],
    ['Socket', 'Clipsal', 'quantity', 150, 60, 20, 8, 40],
    ['Extension Cable 5m', undefined, 'quantity', 900, 15, 5, 3, 10],
    ['Ceiling Fan 56"', 'Pak Fan', 'quantity', 9800, 6, 2, 2, 4],
    ['Battery AA', 'Duracell', 'quantity', 120, 80, 30, 12, 60],
  ],
  Stationery: [
    ['A4 Paper (ream)', 'Double A', 'quantity', 1450, 40, 15, 5, 30],
    ['Ballpoint Pens (box)', 'Dollar', 'quantity', 600, 20, 8, 3, 15],
    ['Register (Large)', undefined, 'quantity', 350, 40, 15, 6, 30],
    ['Stapler', 'Kangaro', 'quantity', 650, 10, 4, 2, 6],
    ['Permanent Marker', 'Dollar', 'quantity', 120, 50, 20, 8, 40],
    ['File Folder', undefined, 'quantity', 80, 100, 30, 15, 80],
  ],
  Hardware: [
    ['PVC Pipe 1"', undefined, 'ft', 45, 400, 100, 60, 300],
    ['Water Tap', 'Master', 'quantity', 1200, 12, 4, 2, 8],
    ['Nails (assorted)', undefined, 'kg', 400, 20, 5, 2, 15],
    ['Paint Brush 4"', undefined, 'quantity', 250, 20, 6, 4, 15],
    ['Nylon Rope', undefined, 'm', 35, 300, 100, 30, 200],
    ['Padlock', 'Union', 'quantity', 850, 15, 5, 2, 10],
  ],
};

/** Where goods are issued to: [name, description, children]. */
const LOCATIONS = [
  ['Langar Hall', 'Kitchen and dining for the langar', [['Kitchen'], ['Serving Area'], ['Dish Washing']]],
  ['Main Office', undefined, [['Accounts'], ['Reception'], ['Record Room']]],
  ['Guest House', undefined, [['Guest Rooms'], ['Washrooms']]],
  ['Mosque', undefined, []],
  ['Library', undefined, []],
  ['Maintenance Workshop', 'Electrical and plumbing repairs', []],
];

const VENDORS = [
  ['Al-Madina Traders', 'Haji Abdul Rasheed', '0300-6301122', 'Ghalla Mandi, Multan', 'Groceries and spices in bulk'],
  ['Rehman Kitchen Equipment', 'Abdul Rehman', '0313-6550909', 'Chowk Shaheedan, Multan', undefined],
  ['Multan Electric House', 'Muhammad Imran', '0301-7445566', 'Hussain Agahi Bazaar, Multan', undefined],
  ['Crescent Cleaning Supplies', 'Asif Mehmood', '0321-6987001', 'Bosan Road, Multan', 'Delivers on Mondays'],
  ['Shah Stationers', 'Syed Kashif Shah', '0345-7012233', 'Kutchery Road, Multan', 'Cash only'],
  ['Pak Hardware & Sanitary', 'Rana Shahid', '0333-6123987', 'Vehari Road, Multan', undefined],
];

/** Which vendor usually supplies each category. */
const CATEGORY_VENDOR = {
  Groceries: 'Al-Madina Traders',
  Spices: 'Al-Madina Traders',
  Utensils: 'Rehman Kitchen Equipment',
  Crockery: 'Rehman Kitchen Equipment',
  Cleaning: 'Crescent Cleaning Supplies',
  Electrical: 'Multan Electric House',
  Stationery: 'Shah Stationers',
  Hardware: 'Pak Hardware & Sanitary',
};

/** Which locations each category is usually issued to. */
const CATEGORY_LOCATIONS = {
  Groceries: ['Kitchen'],
  Spices: ['Kitchen'],
  Utensils: ['Kitchen', 'Serving Area'],
  Crockery: ['Serving Area', 'Guest Rooms', 'Main Office'],
  Cleaning: ['Dish Washing', 'Washrooms', 'Mosque', 'Guest House', 'Main Office'],
  Electrical: ['Maintenance Workshop', 'Library', 'Mosque', 'Guest Rooms'],
  Stationery: ['Accounts', 'Reception', 'Record Room', 'Library'],
  Hardware: ['Maintenance Workshop', 'Washrooms'],
};

const ADJUSTMENT_OUT_REASONS = [
  'Damaged in storage',
  'Expired',
  'Count was lower than the books at verification',
  'Broken while unloading',
];
const ADJUSTMENT_IN_REASONS = ['Found during the stock count', 'Count was higher than the books at verification'];

// ---------------------------------------------------------------------------
// Supporting data already in the system
// ---------------------------------------------------------------------------

async function loadSupportingData(db) {
  const users = await db
    .collection(COLLECTIONS.users)
    .find({ locked: { $ne: true } }, { projection: { username: 1, displayName: 1, personId: 1 } })
    .sort({ lastActiveAt: -1, createdAt: 1 })
    .limit(5)
    .toArray();
  if (users.length === 0) throw new Error('No users found. The sample data needs at least one user.');

  // The people other stores name on their forms, then the users' own.
  const candidates = new Set();
  const recent = await db
    .collection(COLLECTIONS.issuanceForms)
    .find({}, { projection: { issuedBy: 1, issuedTo: 1 } })
    .sort({ createdAt: -1 })
    .limit(300)
    .toArray();
  recent.forEach((f) => [f.issuedTo, f.issuedBy].forEach((id) => id && candidates.add(id)));
  users.forEach((u) => u.personId && candidates.add(u.personId));
  let people = await db
    .collection(COLLECTIONS.people)
    .find({ _id: { $in: [...candidates] } }, { projection: { _id: 1 } })
    .limit(12)
    .toArray();
  if (people.length < 4) {
    people = people.concat(
      await db
        .collection(COLLECTIONS.people)
        .find({ _id: { $nin: people.map((p) => p._id) }, isKarkun: true }, { projection: { _id: 1 } })
        .limit(4 - people.length)
        .toArray()
    );
  }
  if (people.length === 0) throw new Error('No people found. The forms need people to name.');

  return { users, people: people.map((p) => p._id) };
}

async function storeName(db) {
  const base = argValue('--name')?.trim() || 'Sample Store';
  const taken = new Set(
    (await db.collection(COLLECTIONS.stores).find({}, { projection: { name: 1 } }).toArray()).map((s) => s.name)
  );
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base} ${n}`)) n += 1;
  return `${base} ${n}`;
}

// ---------------------------------------------------------------------------
// Building the store
// ---------------------------------------------------------------------------

const stamped = (doc, by, at, updatedAt = at) => ({ ...doc, createdAt: at, createdBy: by, updatedAt, updatedBy: by });

function buildStore({ name, users, people, accessEntries }) {
  const [admin, keeper = admin, approver = admin] = users.map((u) => u._id);
  const storeKeeperPerson = people[0];
  const otherPeople = people.length > 1 ? people.slice(1) : people;
  const createdAt = daysAgo(HISTORY_DAYS + 5, 9);
  const data = {
    stores: [],
    access: [],
    categories: [],
    locations: [],
    vendors: [],
    stockItems: [],
    purchaseForms: [],
    issuanceForms: [],
    stockAdjustments: [],
  };

  const store = stamped({ _id: docId(), name, address: 'Dar-ul-Ehsan, Multan' }, admin, createdAt);
  data.stores.push(store);
  const physicalStoreId = store._id;

  // The same people that work in the other stores can work in this one.
  const bySubject = new Map();
  accessEntries.forEach(({ subjectType, subjectId, permissions }) => {
    const key = `${subjectType}:${subjectId}`;
    const entry = bySubject.get(key) ?? { subjectType, subjectId, permissions: new Set() };
    permissions.forEach((p) => entry.permissions.add(p));
    bySubject.set(key, entry);
  });
  bySubject.forEach(({ subjectType, subjectId, permissions }) =>
    data.access.push(stamped({ _id: docId(), physicalStoreId, subjectType, subjectId, permissions: [...permissions] }, admin, createdAt))
  );

  // Setup data.
  const categoryIds = {};
  Object.keys(ITEMS).forEach((category) => {
    const doc = stamped({ _id: docId(), name: category, physicalStoreId }, admin, createdAt);
    data.categories.push(doc);
    categoryIds[category] = doc._id;
  });

  const locationIds = {};
  const addLocation = ([locationName, description, children = []], parentId) => {
    const doc = stamped(withoutUndefined({ _id: docId(), name: locationName, parentId, physicalStoreId, description }), admin, createdAt);
    data.locations.push(doc);
    locationIds[locationName] = doc._id;
    children.forEach((child) => addLocation(child, doc._id));
  };
  LOCATIONS.forEach((location) => addLocation(location));

  const vendorIds = {};
  VENDORS.forEach(([vendorName, contactPerson, contactNumber, address, notes]) => {
    const doc = stamped(withoutUndefined({ _id: docId(), name: vendorName, physicalStoreId, contactPerson, contactNumber, address, notes }), admin, createdAt);
    data.vendors.push(doc);
    vendorIds[vendorName] = doc._id;
  });

  // Stock items, with the stock level kept as the forms move it.
  const items = [];
  Object.entries(ITEMS).forEach(([category, rows]) =>
    rows.forEach(([itemName, company, unit, price, start, min, issueMax, buyQuantity, details]) => {
      const doc = stamped(
        withoutUndefined({
          _id: docId(),
          physicalStoreId,
          name: itemName,
          company,
          details,
          categoryId: categoryIds[category],
          unitOfMeasurement: unit,
          startingStockLevel: start,
          minStockLevel: min,
          currentStockLevel: start,
        }),
        admin,
        createdAt
      );
      data.stockItems.push(doc);
      items.push({ doc, category, price, min, issueMax, buyQuantity, fractional: unit !== 'quantity' });
    })
  );

  const quantityOf = (item, max) => {
    const value = item.fractional && max > 4 && random() < 0.3 ? between(1, max * 2) / 2 : between(1, max);
    return roundQuantity(value);
  };
  const move = (item, quantity, isInflow) => {
    item.doc.currentStockLevel = roundQuantity(item.doc.currentStockLevel + (isInflow ? quantity : -quantity));
    if (item.doc.currentStockLevel < 0) throw new Error(`Sample data is inconsistent: ${item.doc.name} went below zero.`);
  };

  /** Approved a day or two later; the recent ones are still waiting. */
  const approval = (date, daysBack) =>
    daysBack > APPROVED_AFTER_DAYS ? { approvedOn: addDays(date, between(1, 2)), approvedBy: approver } : {};
  const formDates = (daysBack) => {
    const date = daysAgo(daysBack, 0);
    const at = daysAgo(daysBack, between(10, 17), between(0, 59));
    return { date, at };
  };

  for (let daysBack = HISTORY_DAYS; daysBack >= 1; daysBack -= 1) {
    // A purchase every few days: what is running low, plus a few more items.
    if (daysBack % 4 === 0 || random() < 0.08) {
      const { date, at } = formDates(daysBack);
      const low = items.filter((i) => i.doc.currentStockLevel < i.min * 1.5);
      const chosen = [...new Set([...pickSome(low, 5), ...pickSome(items, between(1, 3))])];
      const lines = chosen.map((item) => {
        const quantity = roundQuantity(Math.max(1, Math.round(item.buyQuantity * (0.6 + random() * 0.8))));
        move(item, quantity, true);
        const price = Math.round((quantity * item.price * (0.95 + random() * 0.15)) / 10) * 10;
        return { stockItemId: item.doc._id, quantity, isInflow: true, price };
      });
      // Now and then something faulty goes back to the vendor.
      if (random() < 0.15) {
        const item = pickOne(chosen);
        const quantity = Math.min(item.doc.currentStockLevel, between(1, 3));
        if (quantity > 0) {
          move(item, quantity, false);
          lines.push({ stockItemId: item.doc._id, quantity, isInflow: false, price: quantity * item.price });
        }
      }
      const mainCategory = pickOne(chosen).category;
      const notes = random() < 0.25 ? pickOne(['Delivered by the vendor', 'Bought from the market', 'Paid in cash', 'Rest of the order to come next week']) : undefined;
      data.purchaseForms.push(
        stamped(
          withoutUndefined({
            _id: docId(),
            purchaseDate: date,
            receivedBy: storeKeeperPerson,
            purchasedBy: pickOne(otherPeople),
            locationId: random() < 0.6 ? locationIds[pickOne(CATEGORY_LOCATIONS[mainCategory])] : undefined,
            physicalStoreId,
            vendorId: random() < 0.8 ? vendorIds[CATEGORY_VENDOR[mainCategory]] : undefined,
            items: lines,
            notes,
            ...approval(date, daysBack),
          }),
          keeper,
          at
        )
      );
    }

    // Issuances on most days.
    const issuances = random() < 0.7 ? between(1, 2) : 0;
    for (let n = 0; n < issuances; n += 1) {
      const { date, at } = formDates(daysBack);
      const category = pickOne(Object.keys(ITEMS));
      const pool = items.filter((i) => i.category === category && i.doc.currentStockLevel > 0);
      const lines = pickSome(pool, between(1, 5)).map((item) => {
        const quantity = Math.min(item.doc.currentStockLevel, quantityOf(item, item.issueMax));
        move(item, quantity, false);
        return { stockItemId: item.doc._id, quantity, isInflow: false };
      });
      // Utensils and crockery lent out sometimes come back.
      if (['Utensils', 'Crockery'].includes(category) && random() < 0.25) {
        const item = pickOne(items.filter((i) => i.category === category));
        const quantity = between(1, Math.max(1, Math.floor(item.issueMax / 2)));
        move(item, quantity, true);
        lines.push({ stockItemId: item.doc._id, quantity, isInflow: true });
      }
      if (lines.length === 0) continue;
      data.issuanceForms.push(
        stamped(
          withoutUndefined({
            _id: docId(),
            issueDate: date,
            issuedBy: storeKeeperPerson,
            issuedTo: pickOne(otherPeople),
            locationId: locationIds[pickOne(CATEGORY_LOCATIONS[category])],
            physicalStoreId,
            items: lines,
            notes: random() < 0.15 ? pickOne(['For the Thursday langar', 'For the monthly gathering', 'Replacement for broken items', 'Urgent']) : undefined,
            ...approval(date, daysBack),
          }),
          keeper,
          at
        )
      );
    }

    // A stock count correction now and then.
    if (daysBack % 11 === 0 || daysBack === 3) {
      const { date, at } = formDates(daysBack);
      const item = pickOne(items.filter((i) => i.doc.currentStockLevel > 0));
      const isInflow = random() < 0.3;
      const quantity = isInflow ? between(1, 3) : Math.min(item.doc.currentStockLevel, between(1, Math.max(1, Math.floor(item.issueMax / 2))));
      move(item, quantity, isInflow);
      data.stockAdjustments.push(
        stamped(
          {
            _id: docId(),
            physicalStoreId,
            stockItemId: item.doc._id,
            adjustmentDate: date,
            adjustedBy: storeKeeperPerson,
            quantity,
            isInflow,
            adjustmentReason: pickOne(isInflow ? ADJUSTMENT_IN_REASONS : ADJUSTMENT_OUT_REASONS),
            ...approval(date, daysBack),
          },
          keeper,
          at
        )
      );
    }
  }

  // A big issuance yesterday leaves a few items below their minimum and two
  // out of stock, so the low stock views have something to show.
  const { date, at } = formDates(1);
  const lines = [];
  pickSome(items.filter((i) => i.doc.currentStockLevel >= i.min), 5).forEach((item, index) => {
    const target = index < 2 ? 0 : Math.max(0, Math.floor(item.min / 2));
    const quantity = roundQuantity(item.doc.currentStockLevel - target);
    if (quantity <= 0) return;
    move(item, quantity, false);
    lines.push({ stockItemId: item.doc._id, quantity, isInflow: false });
  });
  if (lines.length) {
    data.issuanceForms.push(
      stamped(
        { _id: docId(), issueDate: date, issuedBy: storeKeeperPerson, issuedTo: pickOne(otherPeople), locationId: locationIds['Langar Hall'], physicalStoreId, items: lines, notes: 'For the annual gathering' },
        keeper,
        at
      )
    );
  }

  // About half the items were counted lately.
  items.forEach((item) => {
    if (random() < 0.5) item.doc.verifiedOn = daysAgo(between(1, 90), 0);
    item.doc.updatedAt = daysAgo(1, 18);
  });

  return { data, store };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 10_000 });
try {
  await client.connect();
  const db = client.db();
  console.log(`Database: ${db.databaseName}`);

  const { users, people } = await loadSupportingData(db);
  const accessEntries = await db.collection(COLLECTIONS.access).find({}, { projection: { subjectType: 1, subjectId: 1, permissions: 1 } }).toArray();
  const name = await storeName(db);

  const { data, store } = buildStore({ name, users, people, accessEntries });
  for (const [kind, docs] of Object.entries(data)) {
    if (docs.length) await db.collection(COLLECTIONS[kind]).insertMany(docs);
  }

  const low = data.stockItems.filter((i) => i.currentStockLevel < i.minStockLevel);
  console.log(`Created store "${store.name}" (${store._id}):`, Object.fromEntries(Object.entries(data).map(([kind, docs]) => [kind, docs.length])));
  console.log(`${low.length} items are below their minimum, ${low.filter((i) => i.currentStockLevel === 0).length} out of stock.`);
  if (data.access.length === 0) {
    console.log('No user has access to another store, so nobody was given access to this one (super-admins see every store).');
  }
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.close();
}
