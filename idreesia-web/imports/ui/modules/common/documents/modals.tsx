import React, { useEffect, useMemo, useState } from 'react';
import {
  Form,
  Input,
  Modal,
  Progress,
  Select,
  TreeSelect,
  Typography,
  Upload,
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import {
  DMS_DEFAULT_LOCK_MINUTES,
  DMS_LOCK_DURATION_OPTIONS,
} from 'meteor/idreesia-common/constants/dms';

import { message } from '/imports/ui/antd-feedback';

import { formatSize } from './format';
import type { DocumentChanges, DocumentFolder, DocumentItem } from './types';

const showError = (error: unknown) => {
  message.error(error instanceof Error ? error.message : String(error));
};

// ---------------------------------------------------------------------------

interface NameModalProps {
  open: boolean;
  title: string;
  okText: string;
  initialName?: string;
  onCancel: () => void;
  /** Rejecting keeps the modal open and shows the error. */
  onSubmit: (name: string) => Promise<void>;
}

/** Asks for a name: new folder, rename folder, restore under a new name. */
export const NameModal = ({
  open,
  title,
  okText,
  initialName,
  onCancel,
  onSubmit,
}: NameModalProps) => {
  const [form] = Form.useForm<{ name: string }>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) form.setFieldsValue({ name: initialName ?? '' });
  }, [open, initialName, form]);

  const handleOk = async () => {
    const { name } = await form.validateFields();
    setSaving(true);
    try {
      await onSubmit(name.trim());
      form.resetFields();
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      okText={okText}
      confirmLoading={saving}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleOk}>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Please enter a name.',
            },
          ]}
        >
          <Input autoFocus maxLength={255} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ---------------------------------------------------------------------------

interface CheckOutModalProps {
  /** The document to check out; the modal is open while it is set. */
  document: DocumentItem | null;
  onCancel: () => void;
  /** Rejecting keeps the modal open and shows the error. */
  onSubmit: (durationMinutes: number) => Promise<void>;
}

/** Asks how long to check a document out for (at most 7 days). */
export const CheckOutModal = ({
  document,
  onCancel,
  onSubmit,
}: CheckOutModalProps) => {
  const [form] = Form.useForm<{ minutes: number }>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (document) form.setFieldsValue({ minutes: DMS_DEFAULT_LOCK_MINUTES });
  }, [document, form]);

  const handleOk = async () => {
    const { minutes } = await form.validateFields();
    setSaving(true);
    try {
      await onSubmit(minutes);
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!document}
      title={document ? `Check out "${document.name}"` : 'Check out'}
      okText="Check Out"
      confirmLoading={saving}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleOk}>
        <Form.Item
          name="minutes"
          label="Keep it checked out for"
          extra="No one else can change the document until you check it in or this time is up."
          rules={[{ required: true, message: 'Please choose a duration.' }]}
        >
          <Select
            options={DMS_LOCK_DURATION_OPTIONS.map(option => ({
              value: option.minutes,
              label: option.label,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ---------------------------------------------------------------------------

interface DocumentEditModalProps {
  document: DocumentItem | null;
  onCancel: () => void;
  onSubmit: (changes: DocumentChanges) => Promise<void>;
}

/** Edits a document's name, description and tags. */
export const DocumentEditModal = ({
  document,
  onCancel,
  onSubmit,
}: DocumentEditModalProps) => {
  const [form] = Form.useForm<DocumentChanges>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (document) {
      form.setFieldsValue({
        name: document.name,
        description: document.description ?? '',
        tags: document.tags,
      });
    }
  }, [document, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description?.trim() || null,
        tags: values.tags ?? [],
      });
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!document}
      title="Edit Document"
      okText="Save"
      confirmLoading={saving}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Please enter a name.',
            },
          ]}
        >
          <Input maxLength={255} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="tags" label="Tags">
          <Select
            mode="tags"
            placeholder="Type a tag and press Enter"
            open={false}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

// ---------------------------------------------------------------------------

const ROOT = '__root__';

interface TreeNode {
  value: string;
  title: string;
  children: TreeNode[];
  disabled?: boolean;
}

/** The folders as a tree under a root node; `excludeId`'s subtree left out. */
const buildFolderTree = (
  folders: DocumentFolder[],
  rootName: string,
  excludeId?: string
): TreeNode[] => {
  const nodes = new Map<string, TreeNode>();
  folders.forEach(folder => {
    nodes.set(folder._id, {
      value: folder._id,
      title: folder.name,
      children: [],
    });
  });
  const root: TreeNode = { value: ROOT, title: rootName, children: [] };
  folders.forEach(folder => {
    if (folder._id === excludeId) return;
    const parent = folder.parentId ? nodes.get(folder.parentId) : root;
    (parent ?? root).children.push(nodes.get(folder._id)!);
  });
  return [root];
};

interface MoveModalProps {
  /** What is being moved; null when the modal is closed. */
  item: { kind: 'folder' | 'document'; id: string; name: string } | null;
  /** Where it is now (null = root). */
  currentFolderId: string | null;
  rootName: string;
  loadFolders: () => Promise<DocumentFolder[]>;
  onCancel: () => void;
  onSubmit: (folderId: string | null) => Promise<void>;
}

/** Picks the folder to move a folder or document into. */
export const MoveModal = ({
  item,
  currentFolderId,
  rootName,
  loadFolders,
  onCancel,
  onSubmit,
}: MoveModalProps) => {
  const [folders, setFolders] = useState<DocumentFolder[] | null>(null);
  const [target, setTarget] = useState<string>(ROOT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!item) return;
    setFolders(null);
    setTarget(currentFolderId ?? ROOT);
    loadFolders()
      .then(setFolders)
      .catch(error => {
        showError(error);
        onCancel();
      });
  }, [item, currentFolderId, loadFolders, onCancel]);

  const treeData = useMemo(
    () =>
      buildFolderTree(
        folders ?? [],
        rootName,
        item?.kind === 'folder' ? item.id : undefined
      ),
    [folders, rootName, item]
  );

  const handleOk = async () => {
    setSaving(true);
    try {
      await onSubmit(target === ROOT ? null : target);
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!item}
      title={item ? `Move "${item.name}"` : 'Move'}
      okText="Move"
      okButtonProps={{
        disabled: !folders || target === (currentFolderId ?? ROOT),
      }}
      confirmLoading={saving}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Typography.Paragraph type="secondary">
        Move to folder:
      </Typography.Paragraph>
      <TreeSelect
        style={{ width: '100%' }}
        loading={!folders}
        treeData={treeData}
        value={target}
        onChange={value => setTarget(value)}
        treeDefaultExpandAll
        showSearch
        treeNodeFilterProp="title"
      />
    </Modal>
  );
};

// ---------------------------------------------------------------------------

interface NewVersionModalProps {
  document: DocumentItem | null;
  maxFileSize: number;
  onCancel: () => void;
  onSubmit: (
    file: File,
    comment: string,
    onProgress: (fraction: number) => void
  ) => Promise<void>;
}

/** Uploads a file as the document's next version. */
export const NewVersionModal = ({
  document,
  maxFileSize,
  onCancel,
  onSubmit,
}: NewVersionModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (document) {
      setFile(null);
      setComment('');
      setProgress(null);
    }
  }, [document]);

  const handleOk = async () => {
    if (!file) return;
    setProgress(0);
    try {
      await onSubmit(file, comment.trim(), fraction =>
        setProgress(Math.round(fraction * 100))
      );
    } catch (error) {
      showError(error);
      setProgress(null);
    }
  };

  const uploading = progress !== null;

  return (
    <Modal
      open={!!document}
      title={document ? `Upload New Version of "${document.name}"` : 'Upload'}
      okText="Upload"
      okButtonProps={{ disabled: !file }}
      confirmLoading={uploading}
      onOk={handleOk}
      onCancel={uploading ? undefined : onCancel}
      closable={!uploading}
      destroyOnHidden
    >
      <Upload.Dragger
        multiple={false}
        showUploadList={false}
        disabled={uploading}
        beforeUpload={selected => {
          if (selected.size > maxFileSize) {
            message.error(`Files can be at most ${formatSize(maxFileSize)}.`);
          } else {
            setFile(selected);
          }
          return false;
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {file ? file.name : 'Click or drag a file here'}
        </p>
        <p className="ant-upload-hint">
          {file ? formatSize(file.size) : `At most ${formatSize(maxFileSize)}`}
        </p>
      </Upload.Dragger>
      <Input.TextArea
        style={{ marginTop: 16 }}
        rows={2}
        placeholder="What changed? (optional)"
        value={comment}
        disabled={uploading}
        onChange={event => setComment(event.target.value)}
      />
      {uploading ? <Progress percent={progress ?? 0} size="small" /> : null}
    </Modal>
  );
};
