import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  applicationId: text('application_id').notNull(),
  details: text('details'),
  state: text('state'),
  largeImageKey: text('large_image_key'),
  largeImageText: text('large_image_text'),
  smallImageKey: text('small_image_key'),
  smallImageText: text('small_image_text'),
  button1Label: text('button1_label'),
  button1Url: text('button1_url'),
  button2Label: text('button2_label'),
  button2Url: text('button2_url'),
  partySize: integer('party_size'),
  partyMax: integer('party_max'),
  showElapsedTime: integer('show_elapsed_time', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})
