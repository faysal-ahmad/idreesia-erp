import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { Button, Drawer, Form, Input, Modal, Pagination, Table } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type {
  LinkableUsersQuery,
  LinkableUsersQueryVariables,
  LinkOrgLocationUserMutation,
  LinkOrgLocationUserMutationVariables,
  LocationKarkunsQuery,
  LocationKarkunsQueryVariables,
  UserAccountAvailabilityQuery,
  UserAccountAvailabilityQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';
import {
  KarkunSelectionList,
  type KarkunSelectionFilter,
  type KarkunSelectionItem,
  type KarkunSelectionPageParams,
} from '/imports/ui/modules/helpers/controls';
import { CREATE_USER } from '../users/gql';

const LOCATION_KARKUNS: TypedDocumentNode<
  LocationKarkunsQuery,
  LocationKarkunsQueryVariables
> = gql`
  query locationKarkuns(
    $locationId: String!
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedOrgLocationKarkuns(
      locationId: $locationId
      name: $name
      cnicNumber: $cnicNumber
      phoneNumber: $phoneNumber
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        name
        parentName
        cnicNumber
        contactNumber1
        imageUrl
        imageThumbnailUrl
        hasUserAccount
      }
    }
  }
`;

const USER_ACCOUNT_AVAILABILITY: TypedDocumentNode<
  UserAccountAvailabilityQuery,
  UserAccountAvailabilityQueryVariables
> = gql`
  query userAccountAvailability($userName: String, $email: String) {
    userAccountAvailability(userName: $userName, email: $email) {
      userNameMessage
      emailMessage
    }
  }
`;

const LINKABLE_USERS: TypedDocumentNode<
  LinkableUsersQuery,
  LinkableUsersQueryVariables
> = gql`
  query linkableUsers($search: String, $pageIndex: String, $pageSize: String) {
    pagedLinkableUsers(
      search: $search
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        username
        email
        displayName
      }
    }
  }
`;

const LINK_ORG_LOCATION_USER: TypedDocumentNode<
  LinkOrgLocationUserMutation,
  LinkOrgLocationUserMutationVariables
> = gql`
  mutation linkOrgLocationUser(
    $locationId: String!
    $karkunId: String!
    $userId: String!
  ) {
    linkOrgLocationUser(
      locationId: $locationId
      karkunId: $karkunId
      userId: $userId
    ) {
      _id
    }
  }
`;

const LINK_PAGE_SIZE = 10;
const DEFAULT_PAGE_SIZE = 20;
const FIELD_LAYOUT = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const ACCOUNT_REQUIRED =
  'Either user name and password, or email is required to create an account.';

interface AccountFormValues {
  userName?: string;
  password?: string;
  email?: string;
}

interface Props {
  open: boolean;
  locationId: string;
  onClose(): void;
}

// The mehfil's karkuns, to create a user account for those without one.
const LocationAddUserDrawer = ({ open, locationId, onClose }: Props) => {
  const [filter, setFilter] = useState<KarkunSelectionFilter>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  // The karkun a user account is being created for.
  const [creatingFor, setCreatingFor] = useState<KarkunSelectionItem | null>(null);
  // The karkun an existing user account is being linked to.
  const [linkingFor, setLinkingFor] = useState<KarkunSelectionItem | null>(null);
  const [linkSearch, setLinkSearch] = useState('');
  const [linkPageIndex, setLinkPageIndex] = useState(0);
  const [form] = Form.useForm<AccountFormValues>();
  const client = useApolloClient();

  const { data, loading, refetch } = useQuery(LOCATION_KARKUNS, {
    variables: {
      locationId,
      name: filter.name || undefined,
      cnicNumber: filter.cnicNumber || undefined,
      phoneNumber: filter.phoneNumber || undefined,
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
    },
    skip: !open,
    fetchPolicy: 'network-only',
  });
  const [createUser, { loading: creating }] = useMutation(CREATE_USER, {
    // Reload the users list behind the drawer, and this list.
    refetchQueries: ['locationUsers', 'locationKarkuns'],
  });

  const { data: linkableData, loading: loadingLinkable } = useQuery(
    LINKABLE_USERS,
    {
      variables: {
        search: linkSearch.trim() || undefined,
        pageIndex: String(linkPageIndex),
        pageSize: String(LINK_PAGE_SIZE),
      },
      skip: !open || linkingFor == null,
      fetchPolicy: 'network-only',
    }
  );
  const [linkUser, { loading: linking }] = useMutation(
    LINK_ORG_LOCATION_USER,
    { refetchQueries: ['locationUsers', 'locationKarkuns'] }
  );

  const rows = (data?.pagedOrgLocationKarkuns?.data ?? []).filter(
    (row): row is NonNullable<typeof row> => row != null
  );
  const karkuns: KarkunSelectionItem[] = rows.map(row => ({
    _id: row._id,
    name: row.name,
    parentName: row.parentName,
    cnicNumber: row.cnicNumber,
    contactNumber1: row.contactNumber1,
    imageUrl: row.imageUrl,
    imageThumbnailUrl: row.imageThumbnailUrl,
  }));

  const setPageParams = ({
    pageIndex: nextPageIndex,
    pageSize: nextPageSize,
    ...filterChanges
  }: KarkunSelectionPageParams) => {
    if (nextPageIndex != null) setPageIndex(Number(nextPageIndex));
    if (nextPageSize != null) setPageSize(Number(nextPageSize));
    if (Object.keys(filterChanges).length > 0) {
      setFilter(prev => ({ ...prev, ...filterChanges }));
    }
  };

  // Fails with the server's reason when another user has the user name or the
  // email. Runs when the field is left, and again on Create.
  const validateAvailable =
    (field: 'userName' | 'email') => async (_rule: unknown, value?: string) => {
      const text = (value ?? '').trim();
      if (!text) return;
      const { data: result } = await client.query({
        query: USER_ACCOUNT_AVAILABILITY,
        variables: { [field]: text },
        fetchPolicy: 'network-only',
      });
      const availability = result?.userAccountAvailability;
      const message =
        field === 'userName'
          ? availability?.userNameMessage
          : availability?.emailMessage;
      if (message) throw new Error(message);
    };

  const handleClose = () => {
    setFilter({});
    setPageIndex(0);
    onClose();
  };

  const handleCreateFor = (karkun: KarkunSelectionItem) => {
    form.resetFields();
    setCreatingFor(karkun);
  };

  const handleLinkFor = (karkun: KarkunSelectionItem) => {
    setLinkSearch('');
    setLinkPageIndex(0);
    setLinkingFor(karkun);
  };

  const handleLink = (userId: string) => {
    if (!linkingFor) return;
    linkUser({ variables: { locationId, karkunId: linkingFor._id, userId } })
      .then(() => {
        message.success(`User linked to ${linkingFor.name}.`, 3);
        setLinkingFor(null);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleCreate = ({ userName, password, email }: AccountFormValues) => {
    if (!creatingFor) return;
    if (!((userName && password) || email)) {
      const errors = [ACCOUNT_REQUIRED];
      form.setFields([
        { name: 'userName', errors },
        { name: 'password', errors },
        { name: 'email', errors },
      ]);
      return;
    }
    createUser({
      variables: {
        personId: creatingFor._id,
        userName,
        password,
        email,
        // The account is named after the karkun.
        displayName: creatingFor.name,
      },
    })
      .then(() => {
        message.success(`User created for ${creatingFor.name}.`, 3);
        setCreatingFor(null);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <>
      <Drawer
        title="Add User"
        width={720}
        open={open}
        onClose={handleClose}
        destroyOnHidden
      >
        <KarkunSelectionList
          karkuns={karkuns}
          totalResults={data?.pagedOrgLocationKarkuns?.totalResults ?? 0}
          loading={loading}
          pageIndex={pageIndex}
          pageSize={pageSize}
          filter={filter}
          selectedIds={rows.filter(row => row.hasUserAccount).map(row => row._id)}
          selectedLabel="Has User"
          addLabel="Create User"
          showParentName={false}
          setPageParams={setPageParams}
          refreshData={refetch}
          onAdd={handleCreateFor}
          linkLabel="Link User"
          onLink={handleLinkFor}
        />
      </Drawer>
      <Modal
        title={`Link User to ${linkingFor?.name ?? ''}`}
        open={linkingFor != null}
        onCancel={() => setLinkingFor(null)}
        footer={null}
        width={640}
        // Above the drawer, like the create modal.
        zIndex={1100}
        destroyOnHidden
      >
        <Input.Search
          placeholder="Search by user name, name or email"
          allowClear
          onSearch={value => {
            setLinkSearch(value);
            setLinkPageIndex(0);
          }}
          style={{ marginBottom: 12 }}
        />
        <Table
          rowKey="_id"
          size="small"
          bordered
          pagination={false}
          loading={loadingLinkable}
          dataSource={(linkableData?.pagedLinkableUsers?.data ?? []).filter(
            (row): row is NonNullable<typeof row> => row != null
          )}
          columns={[
            { title: 'User Name', dataIndex: 'username', key: 'username' },
            { title: 'Name', dataIndex: 'displayName', key: 'displayName' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            {
              key: 'action',
              width: 80,
              render: (_text: unknown, record: { _id: string }) => (
                <Button
                  size="small"
                  type="primary"
                  loading={linking}
                  onClick={() => handleLink(record._id)}
                >
                  Link
                </Button>
              ),
            },
          ]}
        />
        <Pagination
          style={{ marginTop: 12 }}
          current={linkPageIndex + 1}
          pageSize={LINK_PAGE_SIZE}
          total={linkableData?.pagedLinkableUsers?.totalResults ?? 0}
          showSizeChanger={false}
          onChange={page => setLinkPageIndex(page - 1)}
        />
      </Modal>
      <Modal
        title={`Create User for ${creatingFor?.name ?? ''}`}
        open={creatingFor != null}
        onCancel={() => setCreatingFor(null)}
        onOk={() => form.submit()}
        okText="Create"
        // Above the drawer: the modal mounts first, so it would otherwise sit
        // behind it.
        zIndex={1100}
        confirmLoading={creating}
        destroyOnHidden
        forceRender
      >
        {/* The global form width is 600px; fit the modal instead. */}
        <Form
          form={form}
          layout="horizontal"
          style={{ width: '100%' }}
          onFinish={handleCreate}
        >
          <Form.Item
            name="userName"
            label="User name"
            {...FIELD_LAYOUT}
            validateTrigger="onBlur"
            rules={[{ validator: validateAvailable('userName') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" {...FIELD_LAYOUT}>
            <Input type="password" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            {...FIELD_LAYOUT}
            validateTrigger="onBlur"
            rules={[{ validator: validateAvailable('email') }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default LocationAddUserDrawer;
