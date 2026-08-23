import React, { useState, useMemo, useRef } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as stylex from '@stylexjs/stylex';
import { z } from 'zod';
import {
  PlusIcon,
  TrashIcon,
  PencilSimpleIcon,
  DatabaseIcon,
  CaretLeftIcon,
  CaretRightIcon,
  FileIcon,
  ArrowSquareOutIcon,
  CloudArrowUpIcon,
  UploadSimpleIcon,
  LinkIcon,
} from '@phosphor-icons/react';
import {
  Table,
  TableHeader,
  Column,
  TableBody,
  Row,
  Cell,
  Badge,
  Button,
  Card,
  CardBody,
  SearchField,
  TextField,
  TextArea,
  Select,
  SelectItem,
  Checkbox,
  Spinner,
  DrawerOverlay,
  Drawer,
  DrawerDialog,
  DrawerHeader,
  DrawerTitle,
  DrawerCloseButton,
  DrawerBody,
  DrawerFooter,
  toastQueue,
} from '@moul-dev/ui';
import { tokens } from '@moul-dev/ui/tokens.stylex';
import { api } from '../../../api/client';

const recordsSearchSchema = z.object({
  page: z.number().optional().default(1),
  perPage: z.number().optional().default(30),
  sort: z.string().optional(),
  filter: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute('/_auth/records/$moulName')({
  validateSearch: (search) => recordsSearchSchema.parse(search),
  component: RecordsPage,
});

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing4,
    maxWidth: '1200px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: tokens.colorFg,
    fontFamily: tokens.fontFamilyBase,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  searchBox: {
    width: '360px',
  },
  drawerForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
    paddingInline: tokens.spacing1,
  },
  emptyState: {
    padding: tokens.spacing8,
    textAlign: 'center',
    color: tokens.colorFgSubtle,
    backgroundColor: tokens.colorBgSubtle,
    borderRadius: tokens.radiusMd,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorder,
    fontFamily: tokens.fontFamilyBase,
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: tokens.spacing2,
    fontSize: '0.875rem',
    color: tokens.colorFgSubtle,
    fontFamily: tokens.fontFamilyBase,
  },
  paginationButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
  },
  fileInputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing1,
    fontFamily: tokens.fontFamilyBase,
  },
  fileLabel: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 500,
    color: tokens.colorFg,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing1,
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: tokens.colorBorder,
    borderRadius: tokens.radiusMd,
    backgroundColor: tokens.colorBgSubtle,
    cursor: 'pointer',
    gap: tokens.spacing2,
    textAlign: 'center',
    transition: 'all 0.15s ease',
  },
  dropzoneDragging: {
    borderColor: tokens.colorPrimary500,
    backgroundColor: tokens.colorBgElevated,
  },
  dropzoneText: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
  },
  attachedCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: tokens.spacing2,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    borderRadius: tokens.radiusMd,
    backgroundColor: tokens.colorBgElevated,
    gap: tokens.spacing3,
  },
  attachedLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing3,
    minWidth: 0,
    flex: 1,
  },
  attachedThumb: {
    width: '44px',
    height: '44px',
    borderRadius: tokens.radiusSm,
    objectFit: 'cover',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    flexShrink: 0,
  },
  attachedIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: tokens.radiusSm,
    backgroundColor: tokens.colorBgSubtle,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.colorBorderSubtle,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  attachedInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
    flex: 1,
  },
  attachedName: {
    fontSize: tokens.fontSizeSm,
    fontWeight: 500,
    color: tokens.colorFg,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  attachedMeta: {
    fontSize: tokens.fontSizeXs,
    color: tokens.colorFgSubtle,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing2,
  },
  attachedActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexShrink: 0,
  },
});

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileUrl(fileData: any): string {
  if (!fileData) return '';
  if (typeof fileData === 'string') return fileData;
  return fileData.url || '';
}

function getFileName(fileData: any): string {
  if (!fileData) return '';
  if (typeof fileData === 'string') {
    const parts = fileData.split('/');
    return parts[parts.length - 1] || fileData;
  }
  return fileData.filename || fileData.name || 'file';
}

function isImageFile(fileData: any): boolean {
  if (!fileData) return false;
  const url = typeof fileData === 'string' ? fileData : fileData.url || '';
  const filename = typeof fileData === 'string' ? fileData : fileData.filename || fileData.name || '';
  const isImgExt = /\.(jpg|jpeg|png|webp|gif|svg|avif|ico|bmp)$/i.test(url || filename);
  const hasThumb = Boolean(fileData.thumbhash || (fileData.thumbs && Object.keys(fileData.thumbs).length > 0));
  return isImgExt || hasThumb;
}

function getRecordDisplayLabel(rec: any): string {
  if (!rec) return '';
  if (typeof rec === 'string') return rec;
  if (rec.name) return String(rec.name);
  if (rec.title) return String(rec.title);
  if (rec.username) return String(rec.username);
  if (rec.email) return String(rec.email);
  if (rec.label) return String(rec.label);
  if (rec.slug) return String(rec.slug);
  if (rec.id) return String(rec.id);
  return JSON.stringify(rec);
}

interface FileFieldInputProps {
  label: string;
  required?: boolean;
  value: any;
  onChange: (val: any) => void;
}

function FileFieldInput({ label, required, value, onChange }: FileFieldInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await api.uploadFile(file);
      if (Array.isArray(result) && result.length > 0) {
        onChange(result[0]);
      } else if (result && typeof result === 'object') {
        onChange(result);
      }
      toastQueue.add({
        title: 'File Uploaded',
        description: `${file.name} uploaded successfully.`,
        variant: 'success',
      });
    } catch (err: any) {
      toastQueue.add({
        title: 'Upload Failed',
        description: err.message || 'Failed to upload file.',
        variant: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const fileUrl = getFileUrl(value);
  const fileName = getFileName(value);
  const isImage = isImageFile(value);
  const fileSize = typeof value === 'object' && value?.size ? formatFileSize(value.size) : '';

  return (
    <div {...stylex.props(styles.fileInputWrapper)}>
      <label {...stylex.props(styles.fileLabel)}>
        <span>{label}</span>
        {required && <span style={{ color: tokens.colorError500 }}>*</span>}
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {value ? (
        <div {...stylex.props(styles.attachedCard)}>
          <div {...stylex.props(styles.attachedLeft)}>
            {isImage && fileUrl ? (
              <img
                src={fileUrl}
                alt={fileName}
                {...stylex.props(styles.attachedThumb)}
              />
            ) : (
              <div {...stylex.props(styles.attachedIconBox)}>
                <FileIcon size={22} color={tokens.colorPrimary500} />
              </div>
            )}
            <div {...stylex.props(styles.attachedInfo)}>
              <span {...stylex.props(styles.attachedName)} title={fileName}>
                {fileName}
              </span>
              <div {...stylex.props(styles.attachedMeta)}>
                {fileSize && <span>{fileSize}</span>}
                {value.created_at && (
                  <span>{new Date(value.created_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
          <div {...stylex.props(styles.attachedActions)}>
            {fileUrl && (
              <Button
                size="sm"
                variant="ghost"
                aria-label="View file"
                onPress={() => window.open(fileUrl, '_blank')}
              >
                <ArrowSquareOutIcon size={14} />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              aria-label="Replace file"
              isDisabled={isUploading}
              onPress={() => fileInputRef.current?.click()}
            >
              <UploadSimpleIcon size={14} />
              <span>Replace</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Remove file"
              isDisabled={isUploading}
              onPress={() => onChange(null)}
            >
              <TrashIcon size={14} color={tokens.colorError500} />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...stylex.props(styles.dropzone, isDragging && styles.dropzoneDragging)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!isUploading) fileInputRef.current?.click();
          }}
        >
          {isUploading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing2, padding: tokens.spacing2 }}>
              <Spinner size="sm" />
              <span style={{ fontSize: tokens.fontSizeSm, color: tokens.colorFgSubtle }}>
                Uploading file to storage...
              </span>
            </div>
          ) : (
            <>
              <CloudArrowUpIcon size={28} color={tokens.colorPrimary500} />
              <div {...stylex.props(styles.dropzoneText)}>
                <span>Drag & drop a file here, or </span>
                <span style={{ color: tokens.colorPrimary500, fontWeight: 500 }}>browse</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface RelationFieldInputProps {
  label: string;
  required?: boolean;
  relationConfig?: {
    targetMoul: string;
    cardinality: string;
    onDelete?: string;
  };
  value: any;
  onChange: (val: any) => void;
}

function RelationFieldInput({ label, required, relationConfig, value, onChange }: RelationFieldInputProps) {
  const targetMoul = relationConfig?.targetMoul || '';
  const card = relationConfig?.cardinality || '1:N';

  // Query records from target collection
  const { data: targetData, isLoading } = useQuery({
    queryKey: ['records', targetMoul, 1, 100],
    queryFn: () => api.listRecords(targetMoul, { perPage: 100 }),
    enabled: Boolean(targetMoul),
  });

  const targetRecords = useMemo(() => {
    if (Array.isArray(targetData)) return targetData;
    if (targetData && Array.isArray(targetData.items)) return targetData.items;
    return [];
  }, [targetData]);

  if (card === 'M:N') {
    // Value is array of IDs
    const selectedIds: string[] = Array.isArray(value) ? value : value ? [String(value)] : [];

    const handleToggle = (id: string) => {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter((i) => i !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    };

    const handleRemove = (id: string) => {
      onChange(selectedIds.filter((i) => i !== id));
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label
            style={{
              fontSize: tokens.fontSizeSm,
              fontWeight: 500,
              color: tokens.colorFg,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <LinkIcon size={14} color={tokens.colorPrimary500} />
            <span>{label}</span>
            <Badge size="sm" variant="primary">
              M:N ➔ {targetMoul}
            </Badge>
            {required && <span style={{ color: tokens.colorError500 }}>*</span>}
          </label>
        </div>

        {/* Selected Badges */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: tokens.spacing1,
            minHeight: '36px',
            padding: '6px',
            backgroundColor: tokens.colorBgSubtle,
            borderRadius: tokens.radiusSm,
            border: `1px solid ${tokens.colorBorderSubtle}`,
            alignItems: 'center',
          }}
        >
          {selectedIds.length === 0 ? (
            <span style={{ fontSize: tokens.fontSizeXs, color: tokens.colorFgSubtle, padding: '2px 4px' }}>
              No records selected. Select records from the dropdown below to link.
            </span>
          ) : (
            selectedIds.map((id) => {
              const rec = targetRecords.find((r) => String(r.id) === String(id));
              const display = rec ? getRecordDisplayLabel(rec) : id;
              return (
                <span
                  key={id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: tokens.colorBgElevated,
                    border: `1px solid ${tokens.colorPrimary500}`,
                    borderRadius: tokens.radiusSm,
                    padding: '2px 8px',
                    fontSize: tokens.fontSizeXs,
                    color: tokens.colorFg,
                  }}
                >
                  <LinkIcon size={12} color={tokens.colorPrimary500} />
                  <span>{display}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: tokens.colorFgSubtle,
                      fontSize: '14px',
                      lineHeight: 1,
                      marginLeft: '2px',
                    }}
                    aria-label={`Remove ${display}`}
                  >
                    &times;
                  </button>
                </span>
              );
            })
          )}
        </div>

        {/* Add Record Dropdown */}
        <Select
          aria-label={`Add ${label} record`}
          placeholder={isLoading ? 'Loading records...' : `Select record to add to ${label}...`}
          selectedKey=""
          onSelectionChange={(key) => {
            if (key && String(key) !== '' && String(key) !== '__placeholder__') {
              handleToggle(String(key));
            }
          }}
        >
          <SelectItem id="__placeholder__" textValue="Select record to link...">
            <em>Select record to link...</em>
          </SelectItem>
          {targetRecords
            .filter((r) => !selectedIds.includes(String(r.id)))
            .map((rec) => (
              <SelectItem key={rec.id} id={rec.id} textValue={getRecordDisplayLabel(rec)}>
                {getRecordDisplayLabel(rec)} ({rec.id})
              </SelectItem>
            ))}
        </Select>
      </div>
    );
  }

  // 1:1 or 1:N
  const currentVal = value ? String(value) : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label
          style={{
            fontSize: tokens.fontSizeSm,
            fontWeight: 500,
            color: tokens.colorFg,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <LinkIcon size={14} color={tokens.colorPrimary500} />
          <span>{label}</span>
          <Badge size="sm" variant="primary">
            {card} ➔ {targetMoul}
          </Badge>
          {required && <span style={{ color: tokens.colorError500 }}>*</span>}
        </label>
      </div>
      <Select
        aria-label={`${label} (${card} ➔ ${targetMoul})`}
        placeholder={isLoading ? 'Loading target records...' : `Select ${targetMoul} record...`}
        selectedKey={currentVal}
        onSelectionChange={(key) => onChange(key === '__none__' ? '' : String(key))}
        isRequired={required}
      >
        <SelectItem id="__none__" textValue="(None / Clear)">
          <em>(None / Clear)</em>
        </SelectItem>
        {targetRecords.map((rec) => (
          <SelectItem key={rec.id} id={rec.id} textValue={getRecordDisplayLabel(rec)}>
            {getRecordDisplayLabel(rec)} ({rec.id})
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}

function RecordsPage() {
  const { moulName } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();

  const [activeRecord, setActiveRecord] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [searchVal, setSearchVal] = useState(search.search || '');

  React.useEffect(() => {
    setSearchVal(search.search || '');
  }, [search.search]);

  // 1. Fetch collection schema to get field definitions
  const { data: moul } = useQuery({
    queryKey: ['moul', moulName],
    queryFn: () => api.getMoul(moulName),
  });

  // Collect all relation field names to pass as expand query param
  const relationExpandQuery = useMemo(() => {
    if (!moul?.fields) return undefined;
    const relFields = moul.fields
      .filter((f: any) => f.type === 'relation' && f.name)
      .map((f: any) => f.name);
    return relFields.length > 0 ? relFields.join(',') : undefined;
  }, [moul]);

  // 2. Fetch records list with relation expansions
  const { data: recordsData, isLoading } = useQuery({
    queryKey: [
      'records',
      moulName,
      search.page,
      search.perPage,
      search.sort,
      search.filter,
      search.search,
      relationExpandQuery,
    ],
    queryFn: () =>
      api.listRecords(moulName, {
        page: search.page,
        perPage: search.perPage,
        sort: search.sort,
        filter: search.filter,
        search: search.search,
        expand: relationExpandQuery,
      }),
  });

  const records = useMemo(() => {
    if (Array.isArray(recordsData)) return recordsData;
    if (recordsData && Array.isArray(recordsData.items)) return recordsData.items;
    return [];
  }, [recordsData]);

  const totalItems =
    recordsData && !Array.isArray(recordsData) && typeof recordsData.totalItems === 'number'
      ? recordsData.totalItems
      : records.length;

  const totalPages =
    recordsData && !Array.isArray(recordsData) && typeof (recordsData as any).totalPages === 'number'
      ? Math.max(1, (recordsData as any).totalPages)
      : 1;
  const currentPage = search.page || 1;

  // Schema field keys with filtering and inference
  const displayFields = useMemo(() => {
    const isAuth = moul?.type === 'auth';
    const isWorker = moul?.type === 'worker';

    if (moul?.fields && moul.fields.length > 0) {
      return moul.fields.filter((f: any) => {
        if (isAuth && (f.name === 'username' || f.name === 'email')) return false;
        if (isWorker && (f.name === 'worker' || f.name === 'state' || f.name === 'queue' || f.name === 'attempt')) return false;
        return true;
      });
    }

    if (records.length > 0) {
      const ignoredKeys = new Set([
        'id',
        'created_at',
        'updated_at',
        'username',
        'email',
        'passwordHash',
        'otpCode',
        'otpExpiresAt',
        'passkeys',
        'resetToken',
        'resetTokenExpiresAt',
        'oauthProviders',
        'worker',
        'state',
        'queue',
        'attempt',
        'max_attempts',
        'priority',
        'inserted_at',
        'scheduled_at',
        'attempted_at',
        'attempted_by',
        'errors',
        'tags',
        'meta',
        'args',
        'expand',
      ]);

      const inferredKeys = new Set<string>();
      for (const rec of records) {
        Object.keys(rec).forEach((k) => {
          if (!ignoredKeys.has(k)) {
            inferredKeys.add(k);
          }
        });
      }

      return Array.from(inferredKeys).map((name) => ({ name, type: 'text' }));
    }

    return [];
  }, [moul, records]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.createRecord(moulName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
      setIsDrawerOpen(false);
      toastQueue.add({
        title: 'Record Created',
        description: 'New record created successfully.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Creation Failed',
        description: err.message || 'Failed to create record.',
        variant: 'error',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateRecord(moulName, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
      setIsDrawerOpen(false);
      toastQueue.add({
        title: 'Record Updated',
        description: 'Record updated successfully.',
        variant: 'success',
      });
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Update Failed',
        description: err.message || 'Failed to update record.',
        variant: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteRecord(moulName, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records', moulName] });
      toastQueue.add({
        title: 'Record Deleted',
        description: 'Record was deleted.',
        variant: 'info',
      });
    },
    onError: (err: any) => {
      toastQueue.add({
        title: 'Delete Failed',
        description: err.message || 'Failed to delete record.',
        variant: 'error',
      });
    },
  });

  const handleOpenCreate = () => {
    setFormData({});
    setIsCreating(true);
    setActiveRecord(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (rec: any) => {
    setFormData({ ...rec });
    setIsCreating(false);
    setActiveRecord(rec);
    setIsDrawerOpen(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) {
      createMutation.mutate(formData);
    } else if (activeRecord) {
      updateMutation.mutate({ id: activeRecord.id, data: formData });
    }
  };

  const handleSearchSubmit = (query: string) => {
    navigate({
      search: (prev: any) => ({
        ...prev,
        page: 1,
        search: query.trim() || undefined,
      }),
    });
  };

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.header)}>
        <div>
          <h1 {...stylex.props(styles.title)}>
            <DatabaseIcon size={24} color={tokens.colorPrimary500} />
            <span>{moulName} Records</span>
            <Badge variant="primary">{moul?.type || 'base'}</Badge>
          </h1>
          <span style={{ color: tokens.colorFgSubtle, fontSize: tokens.fontSizeSm }}>
            Explore records data grid, filter relational associations, and manage collection entries.
          </span>
        </div>
        <Button variant="primary" onPress={handleOpenCreate}>
          <PlusIcon size={16} />
          <span>New Record</span>
        </Button>
      </div>

      {/* Toolbar */}
      <Card variant="glass">
        <CardBody>
          <div {...stylex.props(styles.toolbar)}>
            <div {...stylex.props(styles.searchBox)}>
              <SearchField
                aria-label="Search records"
                placeholder="Search records..."
                value={searchVal}
                onChange={setSearchVal}
                onSubmit={handleSearchSubmit}
              />
            </div>
            <span style={{ fontSize: tokens.fontSizeSm, color: tokens.colorFgSubtle }}>
              Showing {records.length} of {totalItems} record{totalItems !== 1 ? 's' : ''}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* Moul UI Table */}
      {isLoading ? (
        <div {...stylex.props(styles.emptyState)}>Loading records...</div>
      ) : records.length === 0 ? (
        <div {...stylex.props(styles.emptyState)}>
          No records found. Click "New Record" to insert a record.
        </div>
      ) : (
        <Table aria-label={`${moulName} records table`}>
          <TableHeader>
            <Column isRowHeader>ID</Column>
            {moul?.type === 'auth' && (
              <>
                <Column>Username</Column>
                <Column>Email</Column>
              </>
            )}
            {moul?.type === 'worker' && (
              <>
                <Column>Worker</Column>
                <Column>State</Column>
                <Column>Queue</Column>
                <Column>Attempt</Column>
              </>
            )}
            {displayFields.map((f: any) => (
              <Column key={f.name}>{f.name}</Column>
            ))}
            <Column>Created At</Column>
            <Column>Actions</Column>
          </TableHeader>
          <TableBody>
            {records.map((rec: any) => (
              <Row key={rec.id} id={rec.id}>
                <Cell>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: tokens.fontSizeXs, color: tokens.colorPrimary400 }}>
                    {String(rec.id)}
                  </span>
                </Cell>
                {moul?.type === 'auth' && (
                  <>
                    <Cell>{rec.username || '-'}</Cell>
                    <Cell>{rec.email || '-'}</Cell>
                  </>
                )}
                {moul?.type === 'worker' && (
                  <>
                    <Cell>{rec.worker || '-'}</Cell>
                    <Cell>
                      <Badge
                        variant={
                          rec.state === 'completed'
                            ? 'success'
                            : rec.state === 'failed'
                            ? 'error'
                            : rec.state === 'processing'
                            ? 'warning'
                            : 'primary'
                        }
                      >
                        {rec.state || 'available'}
                      </Badge>
                    </Cell>
                    <Cell>{rec.queue || 'default'}</Cell>
                    <Cell>{rec.attempt ?? 0}</Cell>
                  </>
                )}
                {displayFields.map((f: any) => {
                  const val = rec[f.name];

                  // 1. File Field Rendering
                  if (f.type === 'file') {
                    if (!val) {
                      return (
                        <Cell key={f.name}>
                          <span style={{ color: tokens.colorFgSubtle }}>-</span>
                        </Cell>
                      );
                    }
                    const url = getFileUrl(val);
                    const filename = getFileName(val);
                    const isImg = isImageFile(val);

                    return (
                      <Cell key={f.name}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isImg && url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer noopener"
                              style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
                              title={`View ${filename}`}
                            >
                              <img
                                src={url}
                                alt={filename}
                                style={{
                                  width: 28,
                                  height: 28,
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  border: `1px solid ${tokens.colorBorderSubtle}`,
                                  boxShadow: tokens.shadowSm,
                                }}
                              />
                            </a>
                          ) : (
                            <FileIcon size={18} color={tokens.colorPrimary500} />
                          )}
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer noopener"
                              style={{
                                color: tokens.colorPrimary500,
                                textDecoration: 'none',
                                fontSize: tokens.fontSizeXs,
                                maxWidth: '140px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                              title={filename}
                            >
                              <span>{filename}</span>
                              <ArrowSquareOutIcon size={11} />
                            </a>
                          ) : (
                            <span style={{ fontSize: tokens.fontSizeXs }}>{filename}</span>
                          )}
                        </div>
                      </Cell>
                    );
                  }

                  // 2. Relation Field Rendering
                  if (f.type === 'relation') {
                    const targetMoul = f.relationConfig?.targetMoul || '';
                    const card = f.relationConfig?.cardinality || '1:N';
                    const expanded = rec.expand?.[f.name];

                    if (!val || (Array.isArray(val) && val.length === 0)) {
                      return (
                        <Cell key={f.name}>
                          <span style={{ color: tokens.colorFgSubtle }}>-</span>
                        </Cell>
                      );
                    }

                    if (card === 'M:N') {
                      const ids: string[] = Array.isArray(val) ? val : [String(val)];
                      const expandedList: any[] = Array.isArray(expanded) ? expanded : [];

                      return (
                        <Cell key={f.name}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                            {ids.map((id, i) => {
                              const expItem = expandedList.find((e) => String(e.id) === String(id)) || expandedList[i];
                              const label = expItem ? getRecordDisplayLabel(expItem) : id;
                              return (
                                <span
                                  key={id || i}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    backgroundColor: tokens.colorBgElevated,
                                    border: `1px solid ${tokens.colorPrimary500}`,
                                    borderRadius: tokens.radiusSm,
                                    padding: '2px 6px',
                                    fontSize: tokens.fontSizeXs,
                                    color: tokens.colorFg,
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => {
                                    window.open(`/records/${targetMoul}?search=${encodeURIComponent(id)}`, '_blank');
                                  }}
                                  title={`Target: ${targetMoul} · ID: ${id}`}
                                >
                                  <LinkIcon size={12} color={tokens.colorPrimary500} />
                                  <span>{label}</span>
                                </span>
                              );
                            })}
                          </div>
                        </Cell>
                      );
                    }

                    // 1:1 or 1:N
                    const id = String(val);
                    const label = expanded ? getRecordDisplayLabel(expanded) : id;

                    return (
                      <Cell key={f.name}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: tokens.colorBgElevated,
                            border: `1px solid ${tokens.colorPrimary500}`,
                            borderRadius: tokens.radiusSm,
                            padding: '2px 6px',
                            fontSize: tokens.fontSizeXs,
                            color: tokens.colorFg,
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            window.open(`/records/${targetMoul}?search=${encodeURIComponent(id)}`, '_blank');
                          }}
                          title={`Target: ${targetMoul} · ID: ${id}`}
                        >
                          <LinkIcon size={12} color={tokens.colorPrimary500} />
                          <span>{label}</span>
                        </span>
                      </Cell>
                    );
                  }

                  // 3. Default Cell Rendering
                  return (
                    <Cell key={f.name}>
                      {val === null || val === undefined ? (
                        <span style={{ color: tokens.colorFgSubtle }}>-</span>
                      ) : typeof val === 'boolean' ? (
                        <Badge variant={val ? 'success' : 'error'}>{val ? 'true' : 'false'}</Badge>
                      ) : typeof val === 'object' ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: tokens.fontSizeXs }}>
                          {JSON.stringify(val)}
                        </span>
                      ) : (
                        String(val)
                      )}
                    </Cell>
                  );
                })}
                <Cell>
                  <span style={{ fontSize: tokens.fontSizeXs, color: tokens.colorFgSubtle }}>
                    {rec.created_at || rec.inserted_at ? new Date(String(rec.created_at || rec.inserted_at)).toLocaleString() : '-'}
                  </span>
                </Cell>
                <Cell>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Edit record ${rec.id}`}
                      onPress={() => handleOpenEdit(rec)}
                    >
                      <PencilSimpleIcon size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Delete record ${rec.id}`}
                      onPress={() => {
                        if (confirm(`Delete record ${rec.id}?`)) {
                          deleteMutation.mutate(rec.id);
                        }
                      }}
                    >
                      <TrashIcon size={14} color={tokens.colorError500} />
                    </Button>
                  </div>
                </Cell>
              </Row>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination Controls */}
      <div {...stylex.props(styles.pagination)}>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div {...stylex.props(styles.paginationButtons)}>
          <Button
            size="sm"
            variant="secondary"
            isDisabled={currentPage <= 1}
            onPress={() =>
              navigate({
                search: (prev: any) => ({
                  ...prev,
                  page: Math.max(1, currentPage - 1),
                }),
              })
            }
          >
            <CaretLeftIcon size={14} />
            <span>Previous</span>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            isDisabled={currentPage >= totalPages}
            onPress={() =>
              navigate({
                search: (prev: any) => ({
                  ...prev,
                  page: currentPage + 1,
                }),
              })
            }
          >
            <span>Next</span>
            <CaretRightIcon size={14} />
          </Button>
        </div>
      </div>

      {/* Record Edit/Create Drawer */}
      <DrawerOverlay isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} isDismissable>
        <Drawer placement="right" size="lg">
          <DrawerDialog>
            <form
              onSubmit={handleSaveRecord}
              style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
            >
              <DrawerHeader>
                <DrawerTitle>
                  {isCreating ? `Create ${moulName} Record` : `Edit Record #${activeRecord?.id}`}
                </DrawerTitle>
                <DrawerCloseButton />
              </DrawerHeader>
              <DrawerBody>
                <div {...stylex.props(styles.drawerForm)}>
                  {moul?.type === 'auth' && (
                    <>
                      <TextField
                        label="Username"
                        value={formData.username || ''}
                        onChange={(val) => setFormData({ ...formData, username: val })}
                        isRequired={isCreating}
                      />
                      <TextField
                        label="Email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(val) => setFormData({ ...formData, email: val })}
                        isRequired={isCreating}
                      />
                      {isCreating && (
                        <>
                          <TextField
                            label="Password"
                            type="password"
                            value={formData.password || ''}
                            onChange={(val) => setFormData({ ...formData, password: val })}
                            isRequired
                          />
                          <TextField
                            label="Confirm Password"
                            type="password"
                            value={formData.passwordConfirm || ''}
                            onChange={(val) => setFormData({ ...formData, passwordConfirm: val })}
                            isRequired
                          />
                        </>
                      )}
                    </>
                  )}

                  {displayFields.map((f: any) => (
                    <div key={f.name}>
                      {f.type === 'bool' ? (
                        <Checkbox
                          isSelected={Boolean(formData[f.name])}
                          onChange={(checked) => setFormData({ ...formData, [f.name]: checked })}
                        >
                          {f.name}
                        </Checkbox>
                      ) : f.type === 'file' ? (
                        <FileFieldInput
                          label={f.name}
                          required={Boolean(f.required)}
                          value={formData[f.name]}
                          onChange={(val) => setFormData({ ...formData, [f.name]: val })}
                        />
                      ) : f.type === 'relation' ? (
                        <RelationFieldInput
                          label={f.name}
                          required={Boolean(f.required)}
                          relationConfig={f.relationConfig}
                          value={formData[f.name]}
                          onChange={(val) => setFormData({ ...formData, [f.name]: val })}
                        />
                      ) : f.type === 'select' && f.options && f.options.length > 0 ? (
                        <Select
                          label={f.name}
                          placeholder={`Select ${f.name}`}
                          selectedKey={formData[f.name] || ''}
                          onSelectionChange={(key) => setFormData({ ...formData, [f.name]: String(key) })}
                          isRequired={Boolean(f.required)}
                        >
                          {f.options.map((opt: string) => (
                            <SelectItem key={opt} id={opt} textValue={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </Select>
                      ) : f.type === 'json' ? (
                        <TextArea
                          label={f.name}
                          placeholder='{"key": "value"}'
                          value={
                            typeof formData[f.name] === 'object' && formData[f.name] !== null
                              ? JSON.stringify(formData[f.name], null, 2)
                              : String(formData[f.name] ?? '')
                          }
                          onChange={(val) => {
                            try {
                              const parsed = JSON.parse(val);
                              setFormData({ ...formData, [f.name]: parsed });
                            } catch {
                              setFormData({ ...formData, [f.name]: val });
                            }
                          }}
                          rows={4}
                          isRequired={Boolean(f.required)}
                        />
                      ) : (
                        <TextField
                          label={f.name}
                          type={
                            f.type === 'number'
                              ? 'number'
                              : f.type === 'date'
                              ? 'date'
                              : f.type === 'datetime'
                              ? 'datetime-local'
                              : f.type === 'url'
                              ? 'url'
                              : 'text'
                          }
                          value={String(formData[f.name] ?? '')}
                          onChange={(val) =>
                            setFormData({
                              ...formData,
                              [f.name]: f.type === 'number' ? Number(val) : val,
                            })
                          }
                          isRequired={Boolean(f.required)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </DrawerBody>
              <DrawerFooter>
                <Button type="button" variant="ghost" onPress={() => setIsDrawerOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isDisabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Record'}
                </Button>
              </DrawerFooter>
            </form>
          </DrawerDialog>
        </Drawer>
      </DrawerOverlay>
    </div>
  );
}
