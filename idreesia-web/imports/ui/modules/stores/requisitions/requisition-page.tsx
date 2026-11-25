import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import type { Dayjs } from 'dayjs';
import { type RouteComponentProps } from 'react-router';
import { useParams } from 'react-router-dom';
import { Alert, Button, Collapse, Empty, Form, Popconfirm, Space, Spin } from 'antd';

import { Permissions, ModuleNames } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { message } from '/imports/ui/antd-feedback';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';
import {
  DateField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  InputTextField,
} from '/imports/ui/modules/helpers/fields';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import {
  usePhysicalStore,
  useStorePermissions,
} from '/imports/ui/modules/stores/common/hooks';
import LinesEditor, {
  type RequisitionLineValue,
} from '../common/purchasing/lines-editor';
import StatusTag from '../common/purchasing/status-tag';
import { toDateInput, toDayjs } from '../common/purchasing/format';
import {
  CANCEL_STORE_REQUISITION,
  CREATE_STORE_REQUISITION,
  DELETE_STORE_REQUISITION,
  REOPEN_STORE_REQUISITION,
  STORE_REQUISITION_BY_ID,
  SUBMIT_STORE_REQUISITION,
  UPDATE_STORE_REQUISITION,
} from './gql';

const REFETCH = ['pagedStoreRequisitions', 'storeRequisitionById'];
const FORM_WIDTH = 900;

interface FormValues {
  title: string;
  purpose?: string;
  neededBy?: Dayjs | null;
  requestedBy?: { _id?: string } | null;
  lines: RequisitionLineValue[];
}

type RouteParams = { physicalStoreId: string; requisitionId?: string };

/**
 * A store's requisition: new, or an existing one. Only a draft can be edited;
 * after that it is read-only and Purchasing takes it from there.
 */
const RequisitionPage = ({ history }: RouteComponentProps<RouteParams>) => {
  const { physicalStoreId, requisitionId } = useParams<RouteParams>();
  const isNew = !requisitionId;
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { can } = useStorePermissions(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

  const { data, loading } = useQuery(STORE_REQUISITION_BY_ID, {
    variables: { physicalStoreId, _id: requisitionId ?? '' },
    skip: isNew,
    fetchPolicy: 'cache-and-network',
  });
  const requisition = data?.storeRequisitionById;

  const [createRequisition] = useMutation(CREATE_STORE_REQUISITION, { refetchQueries: REFETCH });
  const [updateRequisition] = useMutation(UPDATE_STORE_REQUISITION, { refetchQueries: REFETCH });
  const [submitRequisition] = useMutation(SUBMIT_STORE_REQUISITION, { refetchQueries: REFETCH });
  const [reopenRequisition] = useMutation(REOPEN_STORE_REQUISITION, { refetchQueries: REFETCH });
  const [cancelRequisition] = useMutation(CANCEL_STORE_REQUISITION, { refetchQueries: REFETCH });
  const [deleteRequisition] = useMutation(DELETE_STORE_REQUISITION, { refetchQueries: REFETCH });

  useDynamicBreadcrumbs([
    ModuleNames.stores,
    physicalStore?.name ?? '',
    'Requisitions',
    isNew ? 'New' : requisition?.number ?? '',
  ]);

  if (!isNew && loading && !requisition) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!isNew && !requisition?._id) {
    return <Empty description="Requisition not found" style={{ padding: '80px 0' }} />;
  }

  const status = requisition?.status ?? 'draft';
  const canManage = can(Permissions.IN_MANAGE_REQUISITIONS);
  const editable = canManage && (isNew || status === 'draft');
  const goToList = () => history.push(paths.requisitionsPath(physicalStoreId));

  const run = async (action: Promise<unknown>, success: string) => {
    try {
      await action;
      message.success(success, 5);
      return true;
    } catch (error) {
      message.error((error as Error).message, 5);
      return false;
    }
  };

  const handleFinish = async (values: FormValues) => {
    const common = {
      physicalStoreId,
      title: values.title,
      purpose: values.purpose,
      neededBy: toDateInput(values.neededBy),
      requestedBy: values.requestedBy?._id,
      lines: (values.lines ?? []).map(line => ({
        _id: line._id,
        externalCatalogId: line.externalCatalogId,
        quantity: line.quantity,
      })),
    };
    if (isNew) {
      try {
        const result = await createRequisition({ variables: common });
        message.success('Requisition saved', 5);
        const newId = result.data?.createStoreRequisition?._id;
        if (newId) history.replace(paths.requisitionsEditFormPath(physicalStoreId, newId));
      } catch (error) {
        message.error((error as Error).message, 5);
      }
      return;
    }
    const ok = await run(
      updateRequisition({
        variables: { ...common, _id: requisition!._id!, version: requisition!.version! },
      }),
      'Requisition saved'
    );
    if (ok) setIsFieldsTouched(false);
  };

  const initialLines: RequisitionLineValue[] = (requisition?.lines ?? [])
    .filter((line): line is NonNullable<typeof line> => line != null)
    .map(line => ({
      _id: line._id ?? undefined,
      externalCatalogId: line.externalCatalogId ?? '',
      description: line.description ?? '',
      unit: line.unit ?? '',
      quantity: line.quantity ?? 0,
    }));

  const actions = isNew ? null : (
    <Space style={{ marginBottom: 12 }} wrap>
      <StatusTag status={status} />
      {canManage && status === 'draft' ? (
        <>
          <Popconfirm
            title="Submit this requisition to Purchasing?"
            description="It can't be edited after that."
            disabled={isFieldsTouched}
            onConfirm={() =>
              run(
                submitRequisition({ variables: { physicalStoreId, _id: requisition!._id! } }),
                'Requisition submitted'
              )
            }
          >
            <Button type="primary" disabled={isFieldsTouched} title={isFieldsTouched ? 'Save your changes first' : undefined}>
              Submit
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Delete this requisition?"
            onConfirm={async () => {
              const ok = await run(
                deleteRequisition({ variables: { physicalStoreId, _id: requisition!._id! } }),
                'Requisition deleted'
              );
              if (ok) goToList();
            }}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </>
      ) : null}
      {canManage && status === 'rejected' ? (
        <Button
          type="primary"
          onClick={() =>
            run(
              reopenRequisition({ variables: { physicalStoreId, _id: requisition!._id! } }),
              'Requisition reopened as a draft'
            )
          }
        >
          Reopen as Draft
        </Button>
      ) : null}
      {canManage && (status === 'submitted' || status === 'approved') ? (
        <Popconfirm
          title="Cancel this requisition?"
          onConfirm={() =>
            run(
              cancelRequisition({ variables: { physicalStoreId, _id: requisition!._id! } }),
              'Requisition cancelled'
            )
          }
        >
          <Button danger>Cancel Requisition</Button>
        </Popconfirm>
      ) : null}
    </Space>
  );

  const form = (
    <Form
      key={`${requisitionId ?? 'new'}-${requisition?.version ?? 0}`}
      layout="horizontal"
      initialValues={{ lines: initialLines }}
      onFinish={handleFinish}
      onFieldsChange={() => setIsFieldsTouched(true)}
      disabled={!editable}
    >
      <Collapse
        className="visitor-form-sections"
        defaultActiveKey={['general', 'items']}
        items={[
          {
            key: 'general',
            label: 'General',
            forceRender: true,
            children: (
              <>
                <InputTextField
                  fieldName="title"
                  fieldLabel="Title"
                  initialValue={requisition?.title}
                  required
                  requiredMessage="Please enter a title."
                />
                <InputTextAreaField
                  fieldName="purpose"
                  fieldLabel="Purpose"
                  initialValue={requisition?.purpose}
                />
                <DateField
                  fieldName="neededBy"
                  fieldLabel="Needed By"
                  initialValue={toDayjs(requisition?.neededBy)}
                />
                <KarkunField
                  fieldName="requestedBy"
                  fieldLabel="Raised By"
                  placeholder="Raised By"
                  initialValue={requisition?.requestedByPerson ?? undefined}
                />
              </>
            ),
          },
          {
            key: 'items',
            label: 'Items',
            forceRender: true,
            children: (
              <Form.Item
                name="lines"
                wrapperCol={{ span: 24 }}
                rules={[
                  {
                    validator: async (_rule, lines: RequisitionLineValue[] | undefined) => {
                      if (!lines || lines.length === 0) {
                        throw new Error('Please add at least one item.');
                      }
                    },
                  },
                ]}
              >
                <LinesEditor physicalStoreId={physicalStoreId} readOnly={!editable} />
              </Form.Item>
            ),
          },
        ]}
      />
      {editable ? (
        <FormButtonsSaveCancel
          fullWidth
          handleCancel={goToList}
          isFieldsTouched={isFieldsTouched}
        />
      ) : null}
    </Form>
  );

  return (
    <div style={{ maxWidth: FORM_WIDTH }}>
      {actions}
      {status === 'rejected' && requisition?.rejectionReason ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 12 }}
          message="Rejected by Purchasing"
          description={requisition.rejectionReason}
        />
      ) : null}
      {form}
      {!editable ? (
        <Button style={{ marginTop: 12 }} onClick={goToList}>
          Back to List
        </Button>
      ) : null}
      {requisition ? <AuditInfo record={requisition} /> : null}
    </div>
  );
};

export default RequisitionPage;
