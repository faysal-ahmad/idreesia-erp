import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, List, Popup, TextArea } from 'antd-mobile';
import { CheckOutline, CloseOutline, FolderOutline } from 'antd-mobile-icons';
import { useQuery } from '@apollo/client/react';

import { PageError, PageLoading, showError } from '../../layout';
import { MOBILE_WORKSPACE_DOCUMENT_FOLDERS } from './gql';
import { type DocumentFolder, type DocumentItem, hasId } from './use-documents';

const useSaving = () => {
  const [saving, setSaving] = useState(false);
  // Rejecting keeps the popup open and shows the error.
  const save = async (action: () => Promise<void>, failure: string) => {
    setSaving(true);
    try {
      await action();
    } catch (error) {
      showError(error, failure);
    } finally {
      setSaving(false);
    }
  };
  return { saving, save };
};

// ---------------------------------------------------------------------------

interface NamePopupProps {
  visible: boolean;
  title: string;
  submitText: string;
  initialName?: string | null;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

/** Asks for a name: new folder, rename folder, restore under a new name. */
export const NamePopup = ({ visible, title, submitText, initialName, onClose, onSubmit }: NamePopupProps) => {
  const [form] = Form.useForm<{ name: string }>();
  const { saving, save } = useSaving();

  useEffect(() => {
    if (visible) form.setFieldsValue({ name: initialName ?? '' });
  }, [visible, initialName, form]);

  return (
    <Popup
      bodyClassName="documents-form-popup"
      destroyOnClose
      position="bottom"
      visible={visible}
      onMaskClick={onClose}
    >
      <Form
        form={form}
        layout="vertical"
        mode="card"
        onFinish={({ name }) => save(() => onSubmit(name.trim()), 'Could not save.')}
        footer={
          <Button block color="primary" loading={saving} size="large" type="submit">
            {submitText}
          </Button>
        }
      >
        <Form.Header>{title}</Form.Header>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, whitespace: true, message: 'Please enter a name.' }]}
        >
          <Input autoCapitalize="sentences" clearable maxLength={255} placeholder="Name" />
        </Form.Item>
      </Form>
    </Popup>
  );
};

// ---------------------------------------------------------------------------

interface EditValues {
  name: string;
  description?: string;
  tags?: string;
}

export interface DocumentChanges {
  name: string;
  description: string | null;
  tags: string[];
}

interface EditPopupProps {
  document: DocumentItem | null;
  onClose: () => void;
  onSubmit: (changes: DocumentChanges) => Promise<void>;
}

/** Edits a document's name, description and tags (as on the web). */
export const DocumentEditPopup = ({ document, onClose, onSubmit }: EditPopupProps) => {
  const [form] = Form.useForm<EditValues>();
  const { saving, save } = useSaving();

  useEffect(() => {
    if (!document) return;
    form.setFieldsValue({
      name: document.name ?? '',
      description: document.description ?? '',
      tags: (document.tags ?? []).filter(Boolean).join(', '),
    });
  }, [document, form]);

  const submit = (values: EditValues) =>
    save(
      () =>
        onSubmit({
          name: values.name.trim(),
          description: values.description?.trim() || null,
          tags: Array.from(
            new Set(
              (values.tags ?? '')
                .split(',')
                .map(tag => tag.trim())
                .filter(Boolean),
            ),
          ),
        }),
      'Could not save the document.',
    );

  return (
    <Popup
      bodyClassName="documents-form-popup"
      destroyOnClose
      position="bottom"
      visible={!!document}
      onMaskClick={onClose}
    >
      <Form
        form={form}
        layout="vertical"
        mode="card"
        onFinish={submit}
        footer={
          <Button block color="primary" loading={saving} size="large" type="submit">
            Save changes
          </Button>
        }
      >
        <Form.Header>Edit document</Form.Header>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, whitespace: true, message: 'Please enter a name.' }]}
        >
          <Input autoCapitalize="sentences" clearable maxLength={255} placeholder="Name" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <TextArea autoSize={{ minRows: 2, maxRows: 5 }} maxLength={10000} placeholder="Description" />
        </Form.Item>
        <Form.Item help="Separate tags with commas." label="Tags" name="tags">
          <Input autoCapitalize="none" clearable placeholder="e.g. budget, 2026" />
        </Form.Item>
      </Form>
    </Popup>
  );
};

// ---------------------------------------------------------------------------

interface PickerRow {
  id: string | null;
  name: string;
  depth: number;
}

/** The folders as an indented tree under the top level; `excludeId` and everything in it left out. */
const toRows = (folders: DocumentFolder[], rootName: string, excludeId?: string | null): PickerRow[] => {
  const children = new Map<string | null, DocumentFolder[]>();
  folders.forEach(folder => {
    const parent = folder.parentId ?? null;
    children.set(parent, [...(children.get(parent) ?? []), folder]);
  });
  const rows: PickerRow[] = [{ id: null, name: rootName, depth: 0 }];
  const walk = (parentId: string | null, depth: number) => {
    (children.get(parentId) ?? [])
      .slice()
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
      .forEach(folder => {
        if (folder._id === excludeId) return;
        rows.push({ id: folder._id, name: folder.name ?? '', depth });
        walk(folder._id, depth + 1);
      });
  };
  walk(null, 1);
  return rows;
};

export interface MoveTarget {
  kind: 'folder' | 'document';
  id: string;
  name: string;
  currentFolderId: string | null;
}

interface FolderPickerProps {
  committeeId: string;
  item: MoveTarget | null;
  rootName: string;
  onClose: () => void;
  onSubmit: (folderId: string | null) => Promise<void>;
}

/** Picks the folder to move a folder or document into. */
export const FolderPickerPopup = ({ committeeId, item, rootName, onClose, onSubmit }: FolderPickerProps) => {
  const { saving, save } = useSaving();
  const [selected, setSelected] = useState<string | null>(null);
  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_DOCUMENT_FOLDERS, {
    variables: { committeeId },
    fetchPolicy: 'network-only',
    skip: !item,
  });

  useEffect(() => {
    if (item) setSelected(item.currentFolderId);
  }, [item]);

  const rows = useMemo(
    () =>
      toRows(
        (data?.workspaceDocumentFolders ?? []).filter(hasId),
        rootName,
        item?.kind === 'folder' ? item.id : null,
      ),
    [data, rootName, item],
  );

  let body;
  if (loading && !data) body = <PageLoading />;
  else if (error && !data) body = <PageError error={error} onRetry={() => refetch()} />;
  else {
    body = (
      <List>
        {rows.map(row => (
          <List.Item
            key={row.id ?? 'root'}
            arrowIcon={false}
            extra={selected === row.id ? <CheckOutline className="documents-picker-check" /> : undefined}
            prefix={
              <span className="list-icon" style={{ marginLeft: row.depth * 16 }}>
                <FolderOutline />
              </span>
            }
            onClick={() => setSelected(row.id)}
          >
            {row.name}
          </List.Item>
        ))}
      </List>
    );
  }

  return (
    <Popup
      bodyClassName="documents-picker"
      destroyOnClose
      position="bottom"
      visible={!!item}
      onMaskClick={onClose}
    >
      <div className="documents-picker-header">
        <span className="documents-picker-title">Move &quot;{item?.name}&quot; to</span>
        <CloseOutline aria-label="Close" className="page-nav-action" onClick={onClose} />
      </div>
      <div className="documents-picker-list">{body}</div>
      <div className="documents-picker-footer">
        <Button
          block
          color="primary"
          disabled={!item || selected === item.currentFolderId}
          loading={saving}
          size="large"
          onClick={() => save(() => onSubmit(selected), 'Could not move it.')}
        >
          Move here
        </Button>
      </div>
    </Popup>
  );
};
