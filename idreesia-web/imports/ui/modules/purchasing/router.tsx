import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import Landing from './landing';
import { AuditLogsPage } from './audit-logs';
import { PermissionsPage } from './permissions';
import {
  Dashboard,
  OpenOrdersReport,
  PayablesAgingReport,
  SpendingByMonthReport,
  SpendingByVendorReport,
  VendorLedgerReport,
} from './reports';
import { RequisitionsList, RequisitionPage } from './requisitions';
import { QuotesList, QuotePage } from './quotes';
import { OrdersList, OrderPage, OrderPrint } from './orders';
import { ReceiptsList, NewReceipt, ReceiptPage } from './receipts';
import { InvoicesList, NewInvoice, InvoicePage } from './invoices';
import { PaymentsList, NewPayment, PaymentPage } from './payments';
import { PettyCashExpenseHeadsList } from './petty-cash/expense-heads';
import { PettyCashFundsList } from './petty-cash/funds';
import { PettyCashLedger } from './petty-cash/ledger';
import { PettyCashVouchersList, PettyCashVoucherForm, PettyCashVoucherPage } from './petty-cash/vouchers';
import { PettyCashReplenishmentsList, PettyCashReplenishmentPage } from './petty-cash/replenishments';
import { VendorsList, VendorsEditForm } from './vendors';
import { CatalogList, CatalogEditForm } from './catalog';

// Within a feature the more specific paths come first: /new and /:id/print
// before /:id, and /:id before the list.
const Router = () => (
  <Switch>
    <Route path={paths.dashboardPath} component={Dashboard} />

    <Route path={paths.requisitionNewPath} component={RequisitionPage} />
    <Route path={paths.requisitionEditPath()} component={RequisitionPage} />
    <Route path={paths.requisitionsPath} component={RequisitionsList} />

    <Route path={paths.quoteNewPath} component={QuotePage} />
    <Route path={paths.quoteEditPath()} component={QuotePage} />
    <Route path={paths.quotesPath} component={QuotesList} />

    <Route path={paths.orderPrintPath()} component={OrderPrint} />
    <Route path={paths.orderEditPath()} component={OrderPage} />
    <Route path={paths.ordersPath} component={OrdersList} />

    <Route path={paths.receiptNewPath} component={NewReceipt} />
    <Route path={paths.receiptViewPath()} component={ReceiptPage} />
    <Route path={paths.receiptsPath} component={ReceiptsList} />

    <Route path={paths.invoiceNewPath} component={NewInvoice} />
    <Route path={paths.invoiceViewPath()} component={InvoicePage} />
    <Route path={paths.invoicesPath} component={InvoicesList} />

    <Route path={paths.paymentNewPath} component={NewPayment} />
    <Route path={paths.paymentViewPath()} component={PaymentPage} />
    <Route path={paths.paymentsPath} component={PaymentsList} />

    <Route path={paths.pettyCashVoucherNewPath} component={PettyCashVoucherForm} />
    <Route path={paths.pettyCashVoucherEditPath()} component={PettyCashVoucherForm} />
    <Route path={paths.pettyCashVoucherViewPath()} component={PettyCashVoucherPage} />
    <Route path={paths.pettyCashVouchersPath} component={PettyCashVouchersList} />

    <Route path={paths.pettyCashReplenishmentViewPath()} component={PettyCashReplenishmentPage} />
    <Route path={paths.pettyCashReplenishmentsPath} component={PettyCashReplenishmentsList} />
    <Route path={paths.pettyCashLedgerPath} component={PettyCashLedger} />
    <Route path={paths.pettyCashFundsPath} component={PettyCashFundsList} />
    <Route path={paths.pettyCashExpenseHeadsPath} component={PettyCashExpenseHeadsList} />

    <Route path={paths.vendorEditPath()} component={VendorsEditForm} />
    <Route path={paths.vendorsPath} component={VendorsList} />
    <Route path={paths.catalogItemEditPath()} component={CatalogEditForm} />
    <Route path={paths.catalogPath} component={CatalogList} />

    <Route path={paths.reportSpendingByVendorPath} component={SpendingByVendorReport} />
    <Route path={paths.reportSpendingByMonthPath} component={SpendingByMonthReport} />
    <Route path={paths.reportOpenOrdersPath} component={OpenOrdersReport} />
    <Route path={paths.reportPayablesAgingPath} component={PayablesAgingReport} />
    <Route path={paths.reportVendorLedgerPath} component={VendorLedgerReport} />

    <Route path={paths.auditLogsPath} component={AuditLogsPage} />
    <Route path={paths.permissionsPath} component={PermissionsPage} />

    {/* The module root: go to the first section the user can open. */}
    <Route component={Landing} />
  </Switch>
);

export default Router;
