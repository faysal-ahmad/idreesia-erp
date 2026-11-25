# Purchasing: User Manual

This manual explains how to use **Purchasing**, found under **381-A Operations** in the top menu. Purchasing helps you ask for something, get it approved, order it, check what arrived, record the vendor's bill, and pay it, all with a record of who did what.

## Contents

1. [Before you start](#1-before-you-start)
2. [The big picture](#2-the-big-picture)
3. [Finding your way around](#3-finding-your-way-around)
4. [Vendors](#4-vendors)
5. [The item catalog](#5-the-item-catalog)
6. [Entering items on a document](#6-entering-items-on-a-document)
7. [Requisitions](#7-requisitions)
8. [Quotes](#8-quotes)
9. [Purchase orders](#9-purchase-orders)
10. [Goods receipts](#10-goods-receipts)
11. [Vendor invoices](#11-vendor-invoices)
12. [Payments](#12-payments)
13. [Attachments](#13-attachments)
14. [History](#14-history)
15. [Dashboard and reports](#15-dashboard-and-reports)
16. [Using Purchasing on the mobile app](#16-using-purchasing-on-the-mobile-app)
17. [Who can do what](#17-who-can-do-what)
18. [Common questions](#18-common-questions)

## 1. Before you start

You see **Purchasing** in the 381-A Operations menu only if an administrator has given you at least one Purchasing permission. Inside Purchasing, you see only the pages and buttons your permissions allow. If something is missing, ask your administrator (see [Who can do what](#17-who-can-do-what)).

## 2. The big picture

```
Requisition → (Quotes) → Purchase Order → Goods Receipt → Invoice → Payment
```

1. **Requisition**: someone asks for items. A person with approval rights approves or rejects it.
2. **Quotes** (optional): record vendors' price offers and pick one.
3. **Purchase order (PO)**: the formal order to a vendor. It is approved, then sent.
4. **Goods receipt**: when the delivery arrives, record what you actually got. Partial deliveries are fine.
5. **Invoice**: record the vendor's bill.
6. **Payment**: pay one or more invoices.

**Everything starts with a requisition.** A purchase order can only be made from a requisition (or from a quote for one). A store can raise its own requisitions for its own stock items; see [Requisitions from stores](#requisitions-from-stores).

Each document gets a number automatically, such as `PR-2026-0001` (requisition), `PO-2026-0001` (order), `GRN-…` (receipt), `INV-…` (invoice) and `PAY-…` (payment). Numbers start again each year.

## 3. Finding your way around

The menu on the left lists: **Dashboard, Requisitions, Quotes, Purchase Orders, Goods Receipts, Invoices, Payments**, then a **Setup** group (**Vendors**, **Catalog**) and an **Administration** group (**Reports**, **Audit Logs**, **Permissions**). Groups open and close when clicked.

- **Lists** show every document with its status. Click **Filter** to search by number and narrow by status, vendor and dates, then click **Search**. Active filters appear as tags above the table; click the x on a tag to remove it, or **Clear all**. The circular arrow button reloads the data. Click a row to open it.
- **A document page** shows the details at the top, the items below, and tabs for related documents, attachments and history. The buttons across the top are the actions you can take right now. They change as the document moves along.
- **Status tags** show where a document stands, for example Draft, Submitted, Approved.
- Only a **draft** can be edited. Once a document moves on, its details are locked.
- If someone else changes a document while you are editing, your save is refused with a message. Reload the page and apply your changes again.

## 4. Vendors

**Setup > Vendors** is the list of businesses you buy from.

To add a vendor, click the new button, fill in at least the name, and save. You can also store a contact person, phone, email, address, tax number, payment terms (days until an invoice is due), bank details and notes.

- **Payment terms** are used to work out the due date of invoices from this vendor.
- To stop using a vendor, mark it **inactive**. Inactive vendors cannot be picked on new documents but stay on old ones.
- A vendor already used on any document cannot be deleted, only made inactive.

## 5. The item catalog

**Setup > Catalog** is an optional list of things you buy often. It saves typing and keeps names and units consistent. You never have to use it, and it starts empty. It grows as you work.

Each item has a name, a unit (such as kg or piece), an optional category and an optional default price. After a purchase order is approved, the catalog also remembers the **last price** and **last vendor** for that item.

Each item can also have a **Company** (the brand or maker, optional) and a **picture**. The list shows a small picture beside each name, and you can search by company as well as by name and category.

To add or change a picture, open the item and use the **Picture** section: **Upload Picture** to choose a file from your computer, **Take Picture** to use a camera, and **Remove Picture** to take it away. The picture is saved straight away; you don't need to click Save. Company is saved with the rest of the form.

Names must be unique (capital letters don't matter). An item used on documents can be made inactive but not deleted. Changing a catalog item never changes documents already created.

## 6. Entering items on a document

Requisitions, quotes, purchase orders and invoices all use the same item table.

1. Click to add a line.
2. In the item box, either **pick a catalog item** or **just type** what you want. Typing free text is always allowed.
3. Picking a catalog item fills in the unit and the last or default price. You can change any of it on the line.
4. Enter the quantity, and the price if the document has one.
5. Totals update as you type.

To save a typed line into the catalog for next time, click **Add to catalog** on that line.

Use the remove button on a line to delete it. A document can have up to 200 lines.

## 7. Requisitions

A requisition is an internal request: what you need, why, and by when.

**Create one**
1. Go to **Requisitions** and click the new button.
2. Enter a title, the purpose, who it is for and the date it is needed by.
3. Add the items and estimated prices.
4. Save. It is a **Draft**; nothing happens until you submit it.

**Move it along**

| Button | Who | What it does |
|---|---|---|
| Submit for Approval | Requester | Sends it to the approvers. It is locked from now on. |
| Approve | Approver | Approves it. |
| Reject | Approver | Rejects it. You are asked for a reason. |
| Reopen as Draft | Requester | Turns a rejected requisition back into a draft so you can fix it and submit again. |
| Add Quote | Order staff | Records a vendor's quote against an approved requisition. |
| Create Purchase Order | Order staff | Pick a vendor; a PO is created with the requisition's lines copied in. |
| Cancel Requisition | Requester | Cancels it. |
| Delete | Requester | Removes a draft completely. |

Once a purchase order has been made from it, the requisition shows as **Ordered**. When every order made from it has been received (or closed) it becomes **Closed** by itself. If a receipt is voided, or another order is made from it, it goes back to Ordered. If the rest of it will never be bought, an order person can click **Close Requisition**.

### Requisitions from stores

A store can raise a requisition for its own stock items (the store's own screens, under **Stores > Purchasing**). Its lines are always the store's items. Purchasing sees these in the Requisitions list with the store's name in the **Source** column, and approves or rejects them like any other; only the store can edit, submit or delete its own draft. Purchasing makes the order. The **store** then records the goods when they arrive (**Stores > Purchasing > Goods Receipts**), and its stock goes up by the accepted quantity. Purchasing can't receive goods for a store.

## 8. Quotes

A quote records a price offer from a vendor. Quotes are optional but handy for comparing vendors.

1. Open an approved requisition and click **Add Quote**. A quote is always for a requisition.
2. Choose the vendor, enter the quote date, how long it is valid and the vendor's reference. The requisition's items are listed; give each its price (and a smaller quantity if the vendor offers less). You can drop items the vendor didn't quote. Attach the vendor's document if you have it.
3. Add one quote per vendor.

On a quote page, **Select This Quote** picks the winner. The other open quotes for the same requisition are rejected automatically. **Reject** turns one down. From the selected quote, **Create Purchase Order** creates an order with that vendor's prices.

## 9. Purchase orders

**Create one** from a requisition (**Create Purchase Order**) or from a quote. The requisition's items are copied in. In the draft, enter the order date, expected delivery date, delivery address and payment terms, give each item its price and tax, and optionally a discount and shipping. You can't add or remove items or change which item a line is; the quantity can only go down, never above what was requested. The total is calculated for you.

**Move it along**

| Button | What it does |
|---|---|
| Submit for Approval | Sends the draft to an approver. |
| Approve | Approves the order. Its items are now locked. |
| Return to Draft | An approver sends it back to the creator, with a reason, for changes. |
| Mark as Sent | Records that the order has been sent to the vendor. |
| Receive Goods | Opens a new goods receipt for this order. |
| Record Invoice | Opens a new invoice for this order. |
| Print | Opens a printable copy of the order to give or send to the vendor. |
| Close Order | Finishes an order that has been received, even if not everything arrived. |
| Cancel Order | Cancels it. Not possible once goods or invoices are recorded; void those first. |
| Delete | Removes a draft. |

Statuses in order: Draft, Pending Approval, Approved, Sent, Partially Received, Received, Closed (or Cancelled). Receiving goods moves the status along on its own.

**Need to change an approved order?** Its items are locked. Cancel it and make a new one from the requisition. Orders for a store are received by the store, so **Receive Goods** isn't offered on them.

## 10. Goods receipts

Record a goods receipt every time a delivery arrives, so you know what was actually received.

1. On the purchase order, click **Receive Goods** (or use **Goods Receipts > new** and choose the order).
2. Enter the received date, who received it, and the vendor's delivery note number.
3. For each line, enter how many you are **Receiving Now**. The page shows what was ordered and what has been received so far. Enter anything that was damaged or refused under **Rejected**, and add remarks if needed.
4. Save. The receipt is posted and the order updates.

Things to know:
- You cannot receive more than was ordered.
- Partial deliveries are normal. Make one receipt per delivery; the order becomes **Partially Received**, then **Received**.
- A mistake? Open the receipt and click **Void Receipt**. The quantities go back onto the order. This is not allowed if an invoice already bills those items.

## 11. Vendor invoices

Record the bill you get from a vendor.

1. On the purchase order click **Record Invoice**, or use **Invoices > new**.
2. Enter the vendor's **invoice number** exactly as printed, the invoice date and due date. Choose the order (or several orders, if one invoice from the vendor covers more than one); each order's items are filled in with what has been received and not yet invoiced. Every invoice line bills an order line.
3. Save. The invoice starts as **Unpaid**.

Things to know:
- A vendor's invoice number can be entered only once per vendor, which catches duplicates.
- An invoice line can bill only what has been **received and not yet invoiced**. If the vendor billed for more, you get a warning titled "Billed for more than was received". You can still save it if you confirm; the invoice is then marked **Disputed**.
- **Mark as Disputed** / **Clear Dispute** flags an invoice that you are querying with the vendor. It is a flag; the invoice stays payable.
- **Edit Invoice Details** changes details of an unpaid invoice.
- **Void Invoice** cancels a wrong invoice (not possible if payments are recorded against it; void those first).
- **New Payment** appears on unpaid and part-paid invoices and starts a payment.

Statuses: Unpaid, Partially Paid, Paid, Voided.

## 12. Payments

A payment records money you paid to one vendor, covering one or more of their invoices.

1. Click **New Payment** on an invoice, or go to **Payments > new** and choose the vendor.
2. Enter the payment date, the method (**cash**, **bank transfer** or **cheque**), and a reference such as the cheque or transfer number.
3. The page lists that vendor's invoices that still have a balance ("Invoices to Pay", with the amount owed). In **Pay Now**, enter how much of each invoice you are paying.
4. Save.

Things to know:
- You cannot pay more than an invoice's remaining balance.
- Invoices change to **Partially Paid** or **Paid** automatically.
- Advance payments (paying before there is an invoice) are not supported.
- A mistake? Open the payment and click **Void Payment**. The amounts become owed again.

## 13. Attachments

Quotes, orders, receipts, invoices, payments and requisitions each have an **Attachments** tab. Use it to keep the vendor's quote, the delivery note, a scan of the invoice or a payment slip with the document.

- Allowed: PDF, images, Office documents and text files, up to **10 MB** each.
- Upload by choosing a file; it goes straight to secure storage. Click a file to download it.
- You need permission for that kind of document to add or see its files. Deleting a document deletes its files.

## 14. History

The **History** tab on each document lists every change: who did it, when, and what. It shows only if you have the audit log permission.

To review changes across all documents, open **Administration > Audit Logs**. It lists every change, newest first. Use the filters to show only certain document types (for example Invoices and Payments) or a date range, and click the document name to open it.

## 15. Dashboard and reports

**Dashboard** shows counters at a glance: requisitions awaiting approval, orders awaiting approval, open orders, overdue invoices, total payable and the overdue amount.

**Administration > Reports** (needs the reports permission) has five tabs. Each has an **Excel** download button.

| Report | Answers |
|---|---|
| Spending by Vendor | How much each vendor has billed, how much has been paid, and what is outstanding. |
| Spending by Month | Total billed each month. |
| Open Orders | Orders still waiting for goods, how much is still due, and whether delivery is late (use **Overdue only** to see just the late ones). |
| Payables Aging | What you owe each vendor, grouped as Not Yet Due, 1-30, 31-60 and 61+ days overdue. |
| Vendor Ledger | One vendor's invoices and payments in date order with a running balance. |

Use the filters on each tab (vendor, dates) and the results update.

## 16. Using Purchasing on the mobile app

Purchasing is also available in the mobile app, under the same Purchasing entry. It is meant for people on the move: approving, receiving deliveries, requesting items and looking things up. It is not a full replacement for the web version. Which tiles you see depends on your permissions, exactly as on the web.

**What you can do on mobile**

| Area | What you can do |
|---|---|
| Home / Dashboard | See counters (requisitions and orders awaiting approval, open orders, overdue invoices, total payable, overdue amount) and payables aging. Needs the reports permission. Tapping a counter opens the matching list. |
| Approvals | One place listing requisitions and orders waiting for your decision. Open one and **Approve** or **Reject** a requisition, or **Approve** or **Return to draft** an order. A reason is asked for when rejecting or returning. Tabs appear only for the approval permissions you hold. |
| Receiving | Lists orders that are approved, sent or partly received. Open one and record a delivery: received date, delivery note number, notes, and for each line the quantity **received now**, **rejected** and remarks. Take photos of the delivery note and goods with the camera; they are attached to the receipt once it is saved. |
| Requisitions | Create a requisition (title, purpose, needed-by date, items typed freely or picked from the catalog). Edit a draft, **Submit for approval**, **Reopen as draft** after a rejection, and **Cancel**. Approvers can also approve or reject here. |
| Purchase orders | View orders, their items, totals and the vendor's phone number. Approvers can approve or return an order; people who can receive goods can start **Receive goods**. |
| Goods receipts, Invoices, Payments | View lists and details, search and filter by status. Read only. |
| Vendors | Look up a vendor and call or email them with one tap. Read only. |
| Catalog | Browse items and view their pictures. People who manage the catalog can **take, replace or remove** an item's picture with the camera. |
| Attachments | On requisitions, orders, receipts, invoices and payments you can open attached files. People who manage that kind of document can add a photo (camera) or a file, and delete files. |

**What you cannot do on mobile**

- Create or edit purchase orders, or create orders from requisitions or quotes. Orders can only be viewed, approved, returned to draft, and received against.
- Work with quotes at all (they do not appear on mobile).
- Submit, mark as sent, close, cancel or delete purchase orders.
- Void a goods receipt.
- Record, edit, dispute or void invoices.
- Record or void payments.
- Add, edit or deactivate vendors, or add or edit catalog items (only their pictures can be changed).
- Print purchase orders.
- Use the Reports and their Excel downloads, the Audit Logs, the History tab, or the Permissions and User Groups pages.

**Good to know**

- Mobile needs an internet connection for anything that changes data. When you are offline, the action buttons are disabled.
- The same permissions and the same rules apply as on the web. If a button is missing on mobile, check the web version and your permissions first.
- Use the web version for everything in the "cannot do" list above.

## 17. Who can do what

Purchasing has no fixed roles. What you can do depends only on the **permissions** your administrator gives you or your group. This lets each organization split duties as it likes, for example one group that creates orders and a different one that approves them.

| Permission | Lets you |
|---|---|
| View vendors / Manage vendors | See / add, edit and deactivate vendors |
| Manage catalog | Add, edit and deactivate catalog items |
| View / Manage / Approve requisitions | See / create, edit, submit and cancel / approve and reject |
| View / Manage / Approve orders | See / create and edit orders and quotes, send, cancel and close / approve and return to draft |
| View / Manage receipts | See / record and void goods receipts |
| View / Manage invoices | See / enter, edit, dispute and void invoices |
| View / Manage payments | See / record and void payments |
| View reports | Dashboard figures, reports and Excel downloads |
| View audit logs | The Audit Logs page and the History tab |
| Manage Purchasing permissions | The Permissions page (see below) |

**Giving people access.** Users with the *Manage Purchasing permissions* permission see **Administration > Permissions**. The page lists every Purchasing permission with the people who hold it:

- Click the add-user icon at the end of a row. A panel slides in listing the karkuns of Multan who have a user account; search by name, CNIC or phone number and click **Add**. Karkuns who already hold the permission show as **Added**. A karkun with no user account does not appear; an account must be created for them in Admin first.
- Click the group icon next to it to give the permission to a user group instead. A panel lists your Purchasing user groups; click **Add**. Groups show as blue tags in the **Users & Groups** column.
- Click the **x** on a person's or group's tag and confirm to take the permission away.

The same permission is needed to see the page and to make changes. Permissions can also still be set in Admin on a user.

**User Groups.** The page has a second tab, **User Groups**, for keeping Purchasing people organised, for example "Buyers" and "Approvers":

- **New Group** creates a group with a name and an optional description. Use the pencil icon to rename it and the bin icon to delete it. A group that still has people in it cannot be deleted; remove them first.
- Click the add-user icon on a group. The same panel of Multan karkuns opens; search and click **Add**. Karkuns already in the group show as **Member**. Click the **x** on a person's tag and confirm to take them out.

Groups grant access. Anyone in a group has every permission that group holds, in addition to any permissions given to them directly. Under a permission on the **Permissions** tab, a person is listed whether they hold it directly or through a group. Removing someone's tag removes only a permission given to them directly; to take away a group's permission, remove the group's tag, or take the person out of the group.

Important: the system does **not** stop someone who holds the approve permission from approving a document they created themselves. If your organization wants separation, the administrator should give create and approve permissions to different people.

## 18. Common questions

**I don't see Purchasing in the menu.** You have no Purchasing permission. Ask your administrator.

**A button I expect is missing.** Either the document is in a status where that action does not apply (for example you cannot edit an approved order), or you lack the permission.

**I need to change an approved order.** Cancel it (if nothing has been received or invoiced) and create a new one.

**I sent a requisition for approval by mistake.** Ask an approver to **Reject** it; you can then **Reopen as Draft**.

**I received the wrong quantity.** Void the receipt and record a new one.

**The system says I can't receive that much.** A receipt cannot exceed what was ordered. Check the quantities already received on earlier receipts.

**It says the invoice number already exists.** That vendor's invoice number was entered before. Search the invoices list; it may be a duplicate.

**I can't cancel an order.** It has receipts or invoices. Void those first.

**I can't delete a vendor or catalog item.** It is used on documents. Mark it inactive instead.

**My save was refused because someone else changed the document.** Reload the page and make your change again.
