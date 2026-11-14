import React, { useEffect, useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Alert, Pagination } from 'antd';

import type { CommitteeMemberRole } from 'meteor/idreesia-common/constants/organization';
import type {
  CommitteeMembersQuery,
  CommitteeMembersQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import CommitteeMembersPanel, { type CommitteeMember } from './members-panel';
import { toMemberRole } from './member-roles';

const DEFAULT_PAGE_SIZE = 20;

const COMMITTEE_MEMBERS: TypedDocumentNode<
  CommitteeMembersQuery,
  CommitteeMembersQueryVariables
> = gql`
  query committeeMembers(
    $committeeId: String!
    $roles: [String!]!
    $pageIndex: Int!
    $pageSize: Int!
  ) {
    committeeMembers(
      committeeId: $committeeId
      roles: $roles
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        karkunId
        role
        hasLoginAccount
        hasChatAccount
        hasDiscussionAccess
        karkun {
          _id
          sharedData {
            name
            imageUrl
            imageThumbnailUrl
            contactNumber1
            contactNumber2
          }
        }
      }
    }
  }
`;

interface Props {
  committeeId: string;
  /** The roles shown on this tab. */
  roles: CommitteeMemberRole[];
  /** Members tab only: show role pills and the member/coordinator switcher. */
  allowRoleChange?: boolean;
  emptyText: string;
  /** An explanation shown above the table. */
  note?: string;
}

const Members = ({
  committeeId,
  roles,
  allowRoleChange,
  emptyText,
  note,
}: Props) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, loading } = useQuery(COMMITTEE_MEMBERS, {
    variables: { committeeId, roles, pageIndex, pageSize },
  });
  const totalResults = data?.committeeMembers?.totalResults ?? 0;

  // Removing the last person on a page leaves it empty; go back one.
  useEffect(() => {
    if (!loading && data && pageIndex > 0 && pageIndex * pageSize >= totalResults) {
      setPageIndex(Math.max(0, Math.ceil(totalResults / pageSize) - 1));
    }
  }, [loading, data, pageIndex, pageSize, totalResults]);

  const members: CommitteeMember[] = (
    data?.committeeMembers?.data ?? []
  ).flatMap(member =>
    member?.karkunId
      ? [
          {
            _id: member.karkunId,
            name: member.karkun?.sharedData?.name ?? '',
            imageUrl: member.karkun?.sharedData?.imageUrl,
            imageThumbnailUrl: member.karkun?.sharedData?.imageThumbnailUrl,
            contactNumber1: member.karkun?.sharedData?.contactNumber1,
            contactNumber2: member.karkun?.sharedData?.contactNumber2,
            role: toMemberRole(member.role),
            hasLoginAccount: !!member.hasLoginAccount,
            hasChatAccount: !!member.hasChatAccount,
            hasDiscussionAccess: member.hasDiscussionAccess ?? null,
          },
        ]
      : []
  );

  return (
    <>
      {note ? (
        <Alert
          type="info"
          showIcon
          message={note}
          style={{ marginBottom: 12 }}
        />
      ) : null}
      <CommitteeMembersPanel
        committeeId={committeeId}
        members={members}
        loading={loading}
        allowRoleChange={allowRoleChange}
        emptyText={emptyText}
      />
      <Pagination
        style={{ marginTop: 12, textAlign: 'right' }}
        current={pageIndex + 1}
        pageSize={pageSize}
        total={totalResults}
        showSizeChanger
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
        onChange={(page, nextPageSize) => {
          setPageIndex(page - 1);
          if (nextPageSize != null) setPageSize(nextPageSize);
        }}
      />
    </>
  );
};

export default Members;
